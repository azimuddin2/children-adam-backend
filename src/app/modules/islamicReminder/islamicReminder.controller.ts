import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IslamicReminderServices } from './islamicReminder.service';

const createIslamicReminder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await IslamicReminderServices.createIslamicReminderIntoDB(
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Islamic reminder added successfully',
      data: result,
    });
  },
);

const getAllIslamicReminders = catchAsync(
  async (req: Request, res: Response) => {
    const result = await IslamicReminderServices.getAllIslamicRemindersFromDB(
      req.query,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Islamic reminders retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getTodayIslamicReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { date } = req.query as { date?: string };

    const result =
      await IslamicReminderServices.getTodayIslamicReminderFromDB(date);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Today's Islamic reminder retrieved successfully",
      data: result,
    });
  },
);

const getIslamicReminderById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await IslamicReminderServices.getIslamicReminderByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Islamic reminder retrieved successfully',
      data: result,
    });
  },
);

const updateIslamicReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await IslamicReminderServices.updateIslamicReminderIntoDB(
      id,
      req.body,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Islamic reminder updated successfully',
      data: result,
    });
  },
);

const deleteIslamicReminder = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await IslamicReminderServices.deleteIslamicReminderFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Islamic reminder deleted successfully',
      data: result,
    });
  },
);

export const IslamicReminderControllers = {
  createIslamicReminder,
  getAllIslamicReminders,
  getTodayIslamicReminder,
  getIslamicReminderById,
  updateIslamicReminder,
  deleteIslamicReminder,
};
