import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DailySadaqahDonationsServices } from './dailySadaqahDonations.service';

const createDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahDonationsServices.createDailySadaqahDonationsIntoDB(
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Daily sadaqah donations added successfully',
      data: result,
    });
  },
);

const getAllDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahDonationsServices.getAllDailySadaqahDonationsFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah donations retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getDailySadaqahDonationsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahDonationsServices.getDailySadaqahDonationsByIdFromDB(
        id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah donations retrieved successfully',
      data: result,
    });
  },
);

const updateDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahDonationsServices.updateDailySadaqahDonationsIntoDB(
        id,
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah donations has been updated successfully.',
      data: result,
    });
  },
);

const deleteDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await DailySadaqahDonationsServices.deleteDailySadaqahDonationsFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah donations deleted successfully',
      data: result,
    });
  },
);

export const DailySadaqahDonationsControllers = {
  createDailySadaqahDonations,
  getAllDailySadaqahDonations,
  getDailySadaqahDonationsById,
  updateDailySadaqahDonations,
  deleteDailySadaqahDonations,
};
