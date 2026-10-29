import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { islamicReminderSearchableFields } from './islamicReminder.constant';
import { TIslamicReminder } from './islamicReminder.interface';
import { IslamicReminder } from './islamicReminder.model';
import {
  CACHE_TTL,
  clearReminderCache,
  reminderCache,
  resolveTargetDate,
} from './islamicReminder.utils';

const createIslamicReminderIntoDB = async (payload: TIslamicReminder) => {
  const isExists = await IslamicReminder.findOne({
    date: payload.date,
    isDeleted: false,
  });

  if (isExists) {
    throw new AppError(409, `A reminder already exists for ${payload.date}`);
  }

  const result = await IslamicReminder.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create Islamic reminder');
  }

  clearReminderCache();
  return result;
};

const getAllIslamicRemindersFromDB = async (query: Record<string, unknown>) => {
  const islamicReminderQuery = new QueryBuilder(
    IslamicReminder.find({ isDeleted: false }),
    query,
  )
    .search(islamicReminderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await islamicReminderQuery.countTotal();
  const result = await islamicReminderQuery.modelQuery;

  return { meta, result };
};

const getTodayIslamicReminderFromDB = async (dateQuery?: string) => {
  const targetDate = resolveTargetDate(dateQuery);

  const cached = reminderCache.get(targetDate);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let result = await IslamicReminder.findOne({
    date: targetDate,
    isDeleted: false,
  }).lean<TIslamicReminder>();

  // Fallback: oi date-e na thakle sabcheye kachher ager reminder
  if (!result) {
    result = await IslamicReminder.findOne({
      date: { $lte: targetDate },
      isDeleted: false,
    })
      .sort({ date: -1 })
      .lean<TIslamicReminder>();
  }

  if (!result) {
    throw new AppError(404, 'No Islamic reminder found');
  }

  reminderCache.set(targetDate, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return result;
};

const getIslamicReminderByIdFromDB = async (id: string) => {
  const result = await IslamicReminder.findById(id);

  if (!result) {
    throw new AppError(404, 'Islamic reminder not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This Islamic reminder has been deleted');
  }

  return result;
};

const updateIslamicReminderIntoDB = async (
  id: string,
  payload: Partial<TIslamicReminder>,
) => {
  const reminder = await IslamicReminder.findById(id);

  if (!reminder) {
    throw new AppError(404, 'Islamic reminder does not exist');
  }

  if (reminder.isDeleted) {
    throw new AppError(400, 'This Islamic reminder has been deleted');
  }

  // Date change hole duplicate check
  if (payload.date && payload.date !== reminder.date) {
    const duplicate = await IslamicReminder.findOne({
      date: payload.date,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new AppError(409, `A reminder already exists for ${payload.date}`);
    }
  }

  const updatedReminder = await IslamicReminder.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedReminder) {
    throw new AppError(400, 'Islamic reminder update failed');
  }

  clearReminderCache();
  return updatedReminder;
};

const deleteIslamicReminderFromDB = async (id: string) => {
  const reminder = await IslamicReminder.findById(id);

  if (!reminder) {
    throw new AppError(404, 'Islamic reminder not found');
  }

  if (reminder.isDeleted) {
    throw new AppError(400, 'Islamic reminder is already deleted');
  }

  const result = await IslamicReminder.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete Islamic reminder');
  }

  clearReminderCache();
  return result;
};

export const IslamicReminderServices = {
  createIslamicReminderIntoDB,
  getAllIslamicRemindersFromDB,
  getTodayIslamicReminderFromDB,
  getIslamicReminderByIdFromDB,
  updateIslamicReminderIntoDB,
  deleteIslamicReminderFromDB,
};
