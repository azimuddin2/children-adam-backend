import mongoose, { model, Schema } from 'mongoose';
import { TPoll, TPollOption, TPollQuestion } from './poll.interface';
import { PollStatus } from './poll.constant';

const PollOptionSchema = new Schema<TPollOption>({
  optionText: {
    type: String,
    required: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const PollQuestionSchema = new Schema<TPollQuestion>({
  questionText: {
    type: String,
    required: true,
  },
  options: [PollOptionSchema],
  questionVotesCount: {
    type: Number,
    default: 0,
  },
});

const PollSchema = new Schema<TPoll>(
  {
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: PollStatus,
        message: '{VALUE} is not valid',
      },
      default: 'active',
    },
    questions: [PollQuestionSchema],
    responses: {
      type: Number,
      default: 0,
    },

    // Track users who voted in this poll
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Poll = model<TPoll>('Poll', PollSchema);
