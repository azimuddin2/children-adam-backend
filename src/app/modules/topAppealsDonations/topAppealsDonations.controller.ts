import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TopAppealsDonationsServices } from './topAppealsDonations.service';

const createTopAppealsDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await TopAppealsDonationsServices.createTopAppealsDonationsIntoDB(
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Top appeals donations added successfully',
      data: result,
    });
  },
);

const getAllTopAppealsDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await TopAppealsDonationsServices.getAllTopAppealsDonationsFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals donations retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getTopAppealsDonationsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsDonationsServices.getTopAppealsDonationsByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals donations retrieved successfully',
      data: result,
    });
  },
);

const updateTopAppealsDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsDonationsServices.updateTopAppealsDonationsIntoDB(
        id,
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals donations has been updated successfully.',
      data: result,
    });
  },
);

const deleteTopAppealsDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await TopAppealsDonationsServices.deleteTopAppealsDonationsFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Top appeals donations deleted successfully',
      data: result,
    });
  },
);

export const TopAppealsDonationsControllers = {
  createTopAppealsDonations,
  getAllTopAppealsDonations,
  getTopAppealsDonationsById,
  updateTopAppealsDonations,
  deleteTopAppealsDonations,
};
