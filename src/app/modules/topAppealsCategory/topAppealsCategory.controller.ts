import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TopAppealsCategoryServices } from './topAppealsCategory.service';

const createTopAppealsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await TopAppealsCategoryServices.createTopAppealsCategoryIntoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Top appeals category added successfully',
      data: result,
    });
  },
);

const getAllTopAppealsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await TopAppealsCategoryServices.getAllTopAppealsCategoryFromDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals categories retrieved successfully',
      data: result,
    });
  },
);

const getTopAppealsCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsCategoryServices.getTopAppealsCategoryByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals category retrieved successfully',
      data: result,
    });
  },
);

const updateTopAppealsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsCategoryServices.updateTopAppealsCategoryIntoDB(
        id,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals category has been updated successfully.',
      data: result,
    });
  },
);

const deleteTopAppealsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsCategoryServices.deleteTopAppealsCategoryFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals category deleted successfully',
      data: result,
    });
  },
);

export const TopAppealsCategoryControllers = {
  createTopAppealsCategory,
  getAllTopAppealsCategory,
  getTopAppealsCategoryById,
  updateTopAppealsCategory,
  deleteTopAppealsCategory,
};
