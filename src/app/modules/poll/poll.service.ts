import { TPoll } from './poll.interface';
import { Poll } from './poll.model';

const createPollIntoDB = async (payload: TPoll) => {
  const result = await Poll.create(payload);
  return result;
};

export const PollServices = {
  createPollIntoDB,
};
