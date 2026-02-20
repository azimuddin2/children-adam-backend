import { FilterQuery } from 'mongoose';
import AppError from '../../errors/AppError';
import { TPoll, TVotePayload } from './poll.interface';
import { Poll } from './poll.model';

const createPollIntoDB = async (payload: TPoll) => {
  const isPollExists = await Poll.findOne({
    title: payload.title,
    isDeleted: false,
  });

  if (isPollExists) {
    throw new AppError(400, 'This poll already exists');
  }

  if (payload.startDate >= payload.endDate) {
    throw new AppError(400, 'Poll startDate must be before endDate');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(payload.endDate);
  endDate.setHours(0, 0, 0, 0);

  if (endDate < today) {
    throw new AppError(
      400,
      'Cannot create poll! End date is already in the past.',
    );
  }

  const result = await Poll.create(payload);
  return result;
};

const getAllPollFromDB = async (query: Record<string, unknown>) => {
  const { status } = query;
  const filter: FilterQuery<TPoll> = {};
  filter.isDeleted = false;

  if (status) {
    filter.status = status;
  } else {
    filter.status = { $in: ['active', 'closed'] };
  }

  const result = await Poll.find(filter).sort({ createdAt: -1 });
  const totalDoc = await Poll.countDocuments(filter);

  return {
    totalDoc,
    data: result,
  };
};

const getPollByIdFromDB = async (id: string) => {
  const result = await Poll.findById(id).lean();

  if (!result) {
    throw new AppError(404, 'This poll not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This poll has been deleted');
  }

  const questionsWithPercentage = result.questions.map((question) => {
    const totalVotes = question.options.reduce(
      (sum, opt) => sum + opt.voteCount,
      0,
    );

    const optionsWithPercentage = question.options.map((option) => ({
      ...option,
      percentage:
        totalVotes > 0
          ? parseFloat(((option.voteCount / totalVotes) * 100).toFixed(2))
          : 0,
    }));

    return {
      ...question,
      options: optionsWithPercentage,
    };
  });

  return {
    ...result,
    questions: questionsWithPercentage,
  };
};

const votePollIntoDB = async (payload: TVotePayload, userId: string) => {
  const { pollId, answers } = payload;

  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new AppError(404, 'Poll not found');
  }

  const now = new Date();
  if (now < poll.startDate) {
    throw new AppError(400, 'Poll has not started yet');
  }

  // Lazy close poll if endDate passed
  if (now > poll.endDate) {
    if (poll.status !== 'closed') {
      poll.status = 'closed';
      await poll.save();
    }
    throw new AppError(400, 'Poll is closed');
  }

  // ✅ Check if user voted in this poll already
  const isFirstVote = !poll.votedUsers.includes(userId);

  // Loop through each answer
  answers.forEach((answer) => {
    const question = poll.questions.find(
      (q) => q._id.toString() === answer.questionId,
    );
    if (!question) {
      throw new AppError(404, `Question not found: ${answer.questionId}`);
    }

    const newOption = question.options.find(
      (o) => o._id.toString() === answer.optionId,
    );
    if (!newOption) {
      throw new AppError(404, `Option not found: ${answer.optionId}`);
    }

    if (isFirstVote) {
      // First vote → increment vote count
      newOption.voteCount += 1;
      question.totalVotesCount += 1;
    } else {
      // User changing vote per question
      // Find previously voted option by comparing with current vote
      const prevOption = question.options.find(
        (o) => o._id.toString() !== answer.optionId && o.voteCount > 0,
      );
      if (prevOption) {
        prevOption.voteCount -= 1;
        newOption.voteCount += 1;
      }
    }
  });

  // Only first-time poll voter → increase responses + record user
  if (isFirstVote) {
    poll.responses += 1;
    poll.votedUsers.push(userId);
  }

  await poll.save();

  return { message: 'Vote submitted successfully' };
};

const deletePollFromDB = async (id: string) => {
  const isPollExists = await Poll.findById(id);

  if (!isPollExists) {
    throw new AppError(404, 'Poll not found');
  }

  if (isPollExists.isDeleted) {
    throw new AppError(400, 'Poll is already deleted');
  }

  const result = await Poll.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete poll');
  }

  return result;
};

export const PollServices = {
  createPollIntoDB,
  getAllPollFromDB,
  getPollByIdFromDB,
  votePollIntoDB,
  deletePollFromDB,
};
