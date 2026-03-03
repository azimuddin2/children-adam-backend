import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin Dashboard Stats retrieved successfully',
    data: result,
  });
});

const getEarningsOverview = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query;
  const result = await DashboardService.getEarningsOverviewFromDB(Number(year));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin Dashboard Earnings Overview retrieved successfully',
    data: result,
  });
});

const getUserOverview = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query;
  const result = await DashboardService.getUserOverviewFromDB(Number(year));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin Dashboard User Overview retrieved successfully',
    data: result,
  });
});

const getTrafficByLocation = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getTrafficByLocationFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin Dashboard Traffic By Location retrieved successfully',
    data: result,
  });
});

export const DashboardControllers = {
  getDashboardStats,
  getEarningsOverview,
  getUserOverview,
  getTrafficByLocation,
};
