import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SadaqahJariyahDonationsService } from './sadaqahJariyahDonations.service';

const createSadaqahJariyahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SadaqahJariyahDonationsService.createSadaqahJariyahDonationsIntoDB(
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Sadaqah Jariyah donations added successfully',
      data: result,
    });
  },
);

const getAllSadaqahJariyahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SadaqahJariyahDonationsService.getAllSadaqahJariyahDonationsFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Sadaqah Jariyah donations retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getSadaqahJariyahDonationsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await SadaqahJariyahDonationsService.getSadaqahJariyahDonationsByIdFromDB(
        id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Sadaqah Jariyah donations retrieved successfully',
      data: result,
    });
  },
);

const updateSadaqahJariyahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await SadaqahJariyahDonationsService.updateSadaqahJariyahDonationsIntoDB(
        id,
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Sadaqah Jariyah donations has been updated successfully.',
      data: result,
    });
  },
);

const deleteSadaqahJariyahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await SadaqahJariyahDonationsService.deleteSadaqahJariyahDonationsFromDB(
        id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Sadaqah Jariyah donations deleted successfully',
      data: result,
    });
  },
);

export const SadaqahJariyahDonationsController = {
  createSadaqahJariyahDonations,
  getAllSadaqahJariyahDonations,
  getSadaqahJariyahDonationsById,
  updateSadaqahJariyahDonations,
  deleteSadaqahJariyahDonations,
};
