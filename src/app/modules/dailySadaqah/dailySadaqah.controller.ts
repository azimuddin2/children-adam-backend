import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DailySadaqahServices } from './dailySadaqah.service';

const createDailySadaqah = catchAsync(async (req: Request, res: Response) => {
  const result = await DailySadaqahServices.createDailySadaqahIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Daily sadaqah added successfully',
    data: result,
  });
});

const getAllDailySadaqah = catchAsync(async (req: Request, res: Response) => {
  const result = await DailySadaqahServices.getAllDailySadaqahFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Daily sadaqah retrieved successfully',
    data: result,
  });
});

const getDailySadaqahById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DailySadaqahServices.getDailySadaqahByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Daily sadaqah retrieved successfully',
    data: result,
  });
});

const updateDailySadaqah = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DailySadaqahServices.updateDailySadaqahIntoDB(
    id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Daily sadaqah has been updated successfully.',
    data: result,
  });
});

const deleteDailySadaqah = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DailySadaqahServices.deleteDailySadaqahFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Daily sadaqah deleted successfully',
    data: result,
  });
});

export const DailySadaqahControllers = {
  createDailySadaqah,
  getAllDailySadaqah,
  getDailySadaqahById,
  updateDailySadaqah,
  deleteDailySadaqah,
};
