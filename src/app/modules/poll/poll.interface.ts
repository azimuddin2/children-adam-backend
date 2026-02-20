import { ObjectId } from 'mongoose';

export type TPollStatus = 'active' | 'closed';

export type TPollOption = {
  _id: ObjectId;
  optionText: string;
  voteCount: number;
};

export type TPollQuestion = {
  _id: string | ObjectId;
  questionText: string;
  options: TPollOption[];
  totalVotesCount: number;
};

export type TPoll = {
  _id: ObjectId;
  title: string;
  startDate: Date;
  endDate: Date;

  status: TPollStatus;
  questions: TPollQuestion[];
  responses: number;

  votedUsers: string[];

  isDeleted: boolean;
};

type TAnswer = {
  questionId: string;
  optionId: string;
};

export type TVotePayload = {
  pollId: string;
  answers: TAnswer[];
};
