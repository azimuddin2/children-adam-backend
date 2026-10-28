import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DailySadaqahCategoryServices } from './dailySadaqahCategory.service';

const createDailySadaqahCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahCategoryServices.createDailySadaqahCategoryIntoDB(
        req.body,
        req.file as any,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Daily sadaqah category added successfully',
      data: result,
    });
  },
);

const getAllDailySadaqahCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahCategoryServices.getAllDailySadaqahCategoryFromDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah retrieved category successfully',
      data: result,
    });
  },
);

const getDailySadaqahCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahCategoryServices.getDailySadaqahCategoryByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah category retrieved successfully',
      data: result,
    });
  },
);

const updateDailySadaqahCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahCategoryServices.updateDailySadaqahCategoryIntoDB(
        id,
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah category has been updated successfully.',
      data: result,
    });
  },
);

const deleteDailySadaqahCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahCategoryServices.deleteDailySadaqahCategoryFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah category deleted successfully',
      data: result,
    });
  },
);

export const DailySadaqahCategoryControllers = {
  createDailySadaqahCategory,
  getAllDailySadaqahCategory,
  getDailySadaqahCategoryById,
  updateDailySadaqahCategory,
  deleteDailySadaqahCategory,
};
