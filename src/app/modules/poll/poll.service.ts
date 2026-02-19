import AppError from '../../errors/AppError';
import { TPoll } from './poll.interface';
import { Poll } from './poll.model';

const createPollIntoDB = async (payload: TPoll) => {
  const isPollExists = await Poll.findOne({
    title: payload.title,
    isDeleted: false,
  });

  if (isPollExists) {
    throw new AppError(400, 'This poll already exists');
  }

  const result = await Poll.create(payload);
  return result;
};

interface Answer {
  questionId: string;
  optionId: string;
}

interface VotePayload {
  pollId: string;
  answers: Answer[];
}

const votePollIntoDB = async (payload: VotePayload) => {
  const { pollId, answers } = payload;

  // ১️⃣ Find poll
  const poll = await Poll.findById(pollId);
  if (!poll) throw new Error('Poll not found');

  const now = new Date();

  // ২️⃣ Check start date
  if (now < poll.startDate) {
    throw new Error('Poll has not started yet');
  }

  // ৩️⃣ Lazy close if end date passed
  if (now > poll.endDate) {
    if (poll.status !== 'closed') {
      poll.status = 'closed';
      await poll.save();
    }
    throw new Error('Poll is closed');
  }

  // ৪️⃣ Validate all answers first
  for (const answer of answers) {
    const question = poll.questions.id(answer.questionId);
    if (!question) {
      throw new Error(`Question ${answer.questionId} not found`);
    }

    const option = question.options.id(answer.optionId);
    if (!option) {
      throw new Error(`Option ${answer.optionId} not found`);
    }
  }

  // ৫️⃣ All valid → now update
  for (const answer of answers) {
    await Poll.updateOne(
      { _id: pollId },
      {
        $inc: {
          'questions.$[q].options.$[o].voteCount': 1,
          'questions.$[q].questionVotesCount': 1,
          responses: 1,
        },
      },
      {
        arrayFilters: [
          { 'q._id': answer.questionId },
          { 'o._id': answer.optionId },
        ],
      },
    );
  }

  return { message: 'Vote submitted successfully' };
};

export const PollServices = {
  createPollIntoDB,
};
