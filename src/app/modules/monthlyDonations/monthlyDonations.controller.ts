import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MonthlyDonationsServices } from './monthlyDonations.service';

const createMonthlyDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MonthlyDonationsServices.createMonthlyDonationsIntoDB(
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Monthly donations added successfully',
      data: result,
    });
  },
);

const getAllMonthlyDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MonthlyDonationsServices.getAllMonthlyDonationsFromDB(
      req.query,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getMonthlyDonationsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MonthlyDonationsServices.getMonthlyDonationsByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations retrieved successfully',
      data: result,
    });
  },
);

const updateMonthlyDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await MonthlyDonationsServices.updateMonthlyDonationsIntoDB(
      id,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations has been updated successfully.',
      data: result,
    });
  },
);

const deleteMonthlyDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MonthlyDonationsServices.deleteMonthlyDonationsFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly donations deleted successfully',
      data: result,
    });
  },
);

export const MonthlyDonationsControllers = {
  createMonthlyDonations,
  getAllMonthlyDonations,
  getMonthlyDonationsById,
  updateMonthlyDonations,
  deleteMonthlyDonations,
};
