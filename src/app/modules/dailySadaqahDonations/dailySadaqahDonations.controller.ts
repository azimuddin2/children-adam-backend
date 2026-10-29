import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DailySadaqahDonationsServices } from './dailySadaqahDonations.service';

const createDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahDonationsServices.createDailySadaqahDonationsIntoDB(
        req.user.userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Today's sadaqah given successfully",
      data: result,
    });
  },
);

const getMyDailySadaqahDonations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahDonationsServices.getMyDailySadaqahDonationsFromDB(
        req.user.userId,
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
        req.user.userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Daily sadaqah donation retrieved successfully',
      data: result,
    });
  },
);

const getGivingSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await DailySadaqahDonationsServices.getGivingSummaryFromDB(
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Giving summary retrieved successfully',
    data: result,
  });
});

const getGivingJourney = catchAsync(async (req: Request, res: Response) => {
  const result = await DailySadaqahDonationsServices.getGivingJourneyFromDB(
    req.user.userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Giving journey retrieved successfully',
    data: result,
  });
});

const getGivingDayDetail = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.params;
  const result = await DailySadaqahDonationsServices.getGivingDayDetailFromDB(
    req.user.userId,
    date,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result
      ? 'Giving day detail retrieved successfully'
      : 'No donation found for this day',
    data: result,
  });
});

const getRecentGivingActivity = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DailySadaqahDonationsServices.getRecentGivingActivityFromDB(
        req.user.userId,
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Recent giving activity retrieved successfully',
      data: result,
    });
  },
);

export const DailySadaqahDonationsControllers = {
  createDailySadaqahDonations,
  getMyDailySadaqahDonations,
  getDailySadaqahDonationsById,
  getGivingSummary,
  getGivingJourney,
  getGivingDayDetail,
  getRecentGivingActivity,
};
