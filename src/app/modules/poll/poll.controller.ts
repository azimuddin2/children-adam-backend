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

const getAllPoll = catchAsync(async (req: Request, res: Response) => {
  const result = await PollServices.getAllPollFromDB(req.query);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Polls retrieved successfully',
    data: result,
  });
});

const getPollById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PollServices.getPollByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Poll retrieved successfully',
    data: result,
  });
});

const votePoll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await PollServices.votePollIntoDB(req.body, userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: result.message,
    data: result.selectedOptions,
  });
});

const deletePoll = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PollServices.deletePollFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Poll deleted successfully',
    data: result,
  });
});

export const PollControllers = {
  createPoll,
  getAllPoll,
  getPollById,
  votePoll,
  deletePoll,
};
