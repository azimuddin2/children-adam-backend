import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { TDailySadaqahDonations } from './dailySadaqahDonations.interface';
import { DailySadaqahCategory } from '../dailySadaqahCategory/dailySadaqahCategory.model';
import { DailySadaqahDonations } from './dailySadaqahDonations.model';
import { PaymentServices } from '../payment/payment.service';
import {
  formatDonation,
  getCurrentMonth,
  getToday,
  toPounds,
} from './dailySadaqahDonations.utils';

const createDailySadaqahDonationsIntoDB = async (
  userId: string,
  payload: Pick<TDailySadaqahDonations, 'totalAmount'>,
) => {
  const date = getToday();

  const totalPence = Math.round(payload.totalAmount * 100);

  const categories = await DailySadaqahCategory.find({
    isDeleted: false,
  }).sort({ createdAt: 1 });
  if (!categories.length) {
    throw new AppError(400, 'No daily sadaqah category found');
  }

  const base = Math.floor(totalPence / categories.length);
  const remainder = totalPence % categories.length;
  const distribution = categories.map((category, index) => ({
    category: category._id,
    amount: base + (index < remainder ? 1 : 0),
  }));

  await DailySadaqahDonations.updateMany(
    { user: userId, date, status: 'pending' },
    { status: 'failed' },
  );

  const donation = await DailySadaqahDonations.create({
    user: userId,
    totalAmount: totalPence,
    distribution,
    date,
    status: 'pending',
  });

  try {
    return await PaymentServices.createPayment(userId, {
      donationId: donation._id.toString(),
      donationModel: 'DailySadaqahDonation',
      name: 'Daily Sadaqah',
      price: totalPence / 100,
      donationsType: 'Daily Sadaqah',
    });
  } catch (error) {
    await DailySadaqahDonations.findByIdAndUpdate(donation._id, {
      status: 'failed',
    });
    throw error;
  }
};

const getMyDailySadaqahDonationsFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const donationsQuery = new QueryBuilder(
    DailySadaqahDonations.find({
      user: userId,
      status: 'completed',
      isDeleted: false,
    }).populate('distribution.category', 'name icon'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await donationsQuery.countTotal();
  const result = await donationsQuery.modelQuery;

  return { meta, result: result.map(formatDonation) };
};

const getDailySadaqahDonationsByIdFromDB = async (
  id: string,
  userId: string,
) => {
  const result = await DailySadaqahDonations.findOne({
    _id: id,
    user: userId,
  }).populate('distribution.category', 'name icon');

  if (!result) {
    throw new AppError(404, 'This daily sadaqah donation not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This daily sadaqah donation has been deleted');
  }

  return formatDonation(result);
};

const getGivingSummaryFromDB = async (userId: string) => {
  const currentMonth = getCurrentMonth();

  const [totals] = await DailySadaqahDonations.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        status: 'completed',
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$date',
        dayTotal: { $sum: '$totalAmount' },
      },
    },
    {
      $group: {
        _id: null,
        totalGivingDays: { $sum: 1 },
        totalDonated: { $sum: '$dayTotal' },
        daysGivenThisMonth: {
          $sum: {
            $cond: [
              { $eq: [{ $substrBytes: ['$_id', 0, 7] }, currentMonth] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    daysGivenThisMonth: totals?.daysGivenThisMonth ?? 0,
    totalGivingDays: totals?.totalGivingDays ?? 0,
    totalDonated: toPounds(totals?.totalDonated ?? 0),
  };
};

const getGivingJourneyFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const month = (query.month as string) || getCurrentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new AppError(400, 'Month must be in YYYY-MM format');
  }

  const summary = await getGivingSummaryFromDB(userId);

  const givenDates = (
    await DailySadaqahDonations.distinct('date', {
      user: userId,
      status: 'completed',
      isDeleted: false,
      date: { $gte: `${month}-01`, $lte: `${month}-31` },
    })
  ).sort();

  return {
    month,
    summary,
    givenDates,
  };
};

const getGivingDayDetailFromDB = async (userId: string, date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError(400, 'Date must be in YYYY-MM-DD format');
  }

  const donations = await DailySadaqahDonations.find({
    user: userId,
    date,
    status: 'completed',
    isDeleted: false,
  })
    .populate('distribution.category', 'name icon')
    .sort({ createdAt: 1 })
    .lean();

  if (!donations.length) return null;

  const merged = new Map<string, { category: any; amount: number }>();
  let total = 0;

  for (const donation of donations) {
    total += donation.totalAmount;

    for (const item of donation.distribution as any[]) {
      const key = String(item.category?._id ?? item.category);
      const existing = merged.get(key);
      if (existing) existing.amount += item.amount;
      else merged.set(key, { category: item.category, amount: item.amount });
    }
  }

  return {
    date,
    status: 'completed',
    totalAmount: toPounds(total),
    distribution: [...merged.values()].map((d) => ({
      category: d.category,
      amount: toPounds(d.amount),
    })),
  };
};

const getRecentGivingActivityFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const limit = Math.min(Number(query.limit) || 10, 50);

  const donations = await DailySadaqahDonations.find({
    user: userId,
    status: 'completed',
    isDeleted: false,
  })
    .populate('distribution.category', 'name')
    .sort({ date: -1 })
    .limit(limit)
    .lean();

  return donations.map((item) => ({
    _id: item._id,
    date: item.date,
    totalAmount: toPounds(item.totalAmount),
    status: item.status,
    categories: (item.distribution as any[]).map((d) => d.category?.name),
  }));
};

export const DailySadaqahDonationsServices = {
  createDailySadaqahDonationsIntoDB,
  getMyDailySadaqahDonationsFromDB,
  getDailySadaqahDonationsByIdFromDB,
  getGivingSummaryFromDB,
  getGivingJourneyFromDB,
  getGivingDayDetailFromDB,
  getRecentGivingActivityFromDB,
};
