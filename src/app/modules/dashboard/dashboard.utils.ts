import { TEarningRange } from './dashboard.interface';

export const getDateRange = (range: TEarningRange) => {
  const now = new Date();
  let start: Date;

  switch (range) {
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;

    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;

    case 'weekly':
    default:
      start = new Date(now);
      start.setDate(now.getDate() - 6); // last 7 days
      start.setHours(0, 0, 0, 0);
      break;
  }

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
