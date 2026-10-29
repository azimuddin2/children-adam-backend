import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { TDailySadaqahDonations } from './dailySadaqahDonations.interface';
import { DailySadaqahCategory } from '../dailySadaqahCategory/dailySadaqahCategory.model';
import { DailySadaqahDonations } from './dailySadaqahDonations.model';
import { DEFAULT_TIMEZONE } from './dailySadaqahDonations.constant';
import { PaymentServices } from '../payment/payment.service';

// ---------- Helpers ----------

const getToday = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: DEFAULT_TIMEZONE }); // "2026-10-28"

const getCurrentMonth = () => getToday().slice(0, 7); // "2026-10"

// ---------- Create ----------

const createDailySadaqahDonationsIntoDB = async (
  userId: string,
  payload: Pick<TDailySadaqahDonations, 'totalAmount' | 'isCustomAmount'>,
) => {
  const date = getToday();

  // আজ আগেই দান হয়ে থাকলে আটকাও
  const isExists = await DailySadaqahDonations.findOne({
    user: userId,
    date,
    status: 'completed',
    isDeleted: false,
  });
  if (isExists) {
    throw new AppError(409, "You have already given today's sadaqah");
  }

  // ক্যাটাগরিতে সমান ভাগ
  const categories = await DailySadaqahCategory.find({
    isDeleted: false,
  }).sort({ createdAt: 1 });
  if (!categories.length) {
    throw new AppError(400, 'No daily sadaqah category found');
  }

  const base = Math.floor(payload.totalAmount / categories.length);
  const remainder = payload.totalAmount % categories.length;
  const distribution = categories.map((category, index) => ({
    category: category._id,
    amount: base + (index < remainder ? 1 : 0),
  }));

  // আজকের পুরনো অসম্পূর্ণ দান বাতিল
  await DailySadaqahDonations.updateMany(
    { user: userId, date, status: 'pending' },
    { status: 'failed' },
  );

  // নতুন দান তৈরি (এখনো টাকা আসেনি, তাই pending)
  const donation = await DailySadaqahDonations.create({
    user: userId,
    totalAmount: payload.totalAmount,
    isCustomAmount: payload.isCustomAmount ?? false,
    distribution,
    date,
    status: 'pending',
  });

  // তোমার আগের পেমেন্ট ফাংশন কল
  try {
    return await PaymentServices.createPayment(userId, {
      donationId: donation._id.toString(),
      donationModel: 'DailySadaqahDonations',
      name: 'Daily Sadaqah',
      price: payload.totalAmount / 100, // পাউন্ডে
      donationsType: 'Daily Sadaqah',
    });
  } catch (error) {
    await DailySadaqahDonations.findByIdAndUpdate(donation._id, {
      status: 'failed',
    });
    throw error;
  }
};

// ---------- Read (my donations) ----------

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
    .filter() // ?date=2026-10-20
    .sort()
    .paginate()
    .fields();

  const meta = await donationsQuery.countTotal();
  const result = await donationsQuery.modelQuery;

  return { meta, result };
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

  return result;
};

// ---------- Giving Journey ----------

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
        _id: null,
        totalGivingDays: { $sum: 1 },
        totalDonated: { $sum: '$totalAmount' },
        daysGivenThisMonth: {
          $sum: {
            $cond: [
              { $eq: [{ $substrBytes: ['$date', 0, 7] }, currentMonth] },
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
    totalDonated: totals?.totalDonated ?? 0, // সেন্টে
  };
};

const getGivingJourneyFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  // 1️⃣ Get month (default: current month)
  const month = (query.month as string) || getCurrentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new AppError(400, 'Month must be in YYYY-MM format');
  }

  // 2️⃣ Summary (3 cards)
  const summary = await getGivingSummaryFromDB(userId);

  // 3️⃣ This month's given dates (calendar)
  const monthDonations = await DailySadaqahDonations.find({
    user: userId,
    status: 'completed',
    isDeleted: false,
    date: { $gte: `${month}-01`, $lte: `${month}-31` },
  })
    .select('date -_id')
    .sort({ date: 1 })
    .lean();

  const givenDates = monthDonations.map((item) => item.date);

  // ✅ 4️⃣ Return
  return {
    month,
    summary,
    givenDates, // ["2026-10-02", "2026-10-04", ...]
  };
};

const getGivingDayDetailFromDB = async (userId: string, date: string) => {
  // 1️⃣ Validate date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError(400, 'Date must be in YYYY-MM-DD format');
  }

  // 2️⃣ Find that day's donation
  const result = await DailySadaqahDonations.findOne({
    user: userId,
    date,
    status: 'completed',
    isDeleted: false,
  }).populate('distribution.category', 'name icon');

  // দান না থাকলে এরর না, null ফেরত (ফ্রন্টএন্ড "No donation" দেখাবে)
  return result;
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

  // "Food · Water · Orphans · Emergency" দেখানোর জন্য
  return donations.map((item) => ({
    _id: item._id,
    date: item.date,
    totalAmount: item.totalAmount,
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
