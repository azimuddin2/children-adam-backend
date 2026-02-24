import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DonationsCategoryServices } from './monthlyDonationCategory.service';

const createDonationsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DonationsCategoryServices.createDonationsCategoryIntoDB(
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Monthly donations category added successfully',
      data: result,
    });
  },
);

const getAllDonationsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DonationsCategoryServices.getAllDonationsCategoryFromDB(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations categories retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getDonationsCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DonationsCategoryServices.getDonationsCategoryByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations Category retrieved successfully',
      data: result,
    });
  },
);

const updateDonationsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DonationsCategoryServices.updateDonationsCategoryIntoDB(
        id,
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations category has been updated successfully.',
      data: result,
    });
  },
);

const deleteDonationsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DonationsCategoryServices.deleteDonationsCategoryFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations category deleted successfully',
      data: result,
    });
  },
);

export const DonationsCategoryControllers = {
  createDonationsCategory,
  getAllDonationsCategory,
  getDonationsCategoryById,
  updateDonationsCategory,
  deleteDonationsCategory,
};
