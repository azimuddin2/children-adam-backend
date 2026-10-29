import AppError from '../../errors/AppError';
import { TIslamicReminder } from './islamicReminder.interface';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type TCacheItem = { data: TIslamicReminder; expiresAt: number };
export const reminderCache = new Map<string, TCacheItem>();

export const CACHE_TTL = 10 * 60 * 1000;

export const clearReminderCache = () => reminderCache.clear();

export const resolveTargetDate = (date?: string) => {
  if (date) {
    if (!DATE_REGEX.test(date) || isNaN(Date.parse(date))) {
      throw new AppError(400, 'Invalid date. Use YYYY-MM-DD');
    }
    return date;
  }
  return new Date().toISOString().split('T')[0];
};
