import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PollServices } from './poll.service';

const createPoll = catchAsync(async (req: Request, res: Response) => {
  const result = await PollServices.createPollIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Poll added successfully',
    data: result,
  });
});

export const PollControllers = {
  createPoll,
};
