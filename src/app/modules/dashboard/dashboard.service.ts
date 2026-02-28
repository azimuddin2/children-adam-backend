import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';

const getDashboardStatsFromDB = async () => {
  const [totalUsers, activeUsers, totalDonationsResult] = await Promise.all([
    // Total registered users
    User.countDocuments({ isDeleted: false }),

    // Active users
    User.countDocuments({
      isDeleted: false,
      status: 'confirmed',
    }),

    // Total donations — all paid payments
    Payment.aggregate([
      {
        $match: {
          isDeleted: false,
          isPaid: true,
          status: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' },
        },
      },
    ]),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalDonations: totalDonationsResult[0]?.total || 0,
  };
};

const getEarningsOverviewFromDB = async (year?: number) => {
  // Use provided year or default to current year
  const targetYear = year || new Date().getFullYear();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const earningsResult = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        isPaid: true,
        status: 'paid',
        createdAt: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$price' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthlyEarnings = monthNames.map((month, index) => {
    const found = earningsResult.find((item) => item._id === index + 1);
    return {
      month,
      total: found?.total || 0,
    };
  });

  const yearlyTotal = monthlyEarnings.reduce(
    (acc, item) => acc + item.total,
    0,
  );

  return {
    year: targetYear,
    yearlyTotal,
    monthlyEarnings,
  };
};

const getUserOverviewFromDB = async (year?: number) => {
  const targetYear = year || new Date().getFullYear();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const usersResult = await User.aggregate([
    // Match users for target year
    {
      $match: {
        isDeleted: false,
        createdAt: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },

    // Group by month
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: 1 },
      },
    },

    // Sort by month
    { $sort: { _id: 1 } },
  ]);

  // Fill missing months with 0
  const monthlyUsers = monthNames.map((month, index) => {
    const found = usersResult.find((item) => item._id === index + 1);
    return {
      month,
      total: found?.total || 0,
    };
  });

  // Yearly total
  const yearlyTotal = monthlyUsers.reduce((acc, item) => acc + item.total, 0);

  return {
    year: targetYear,
    yearlyTotal,
    monthlyUsers,
  };
};

export const DashboardService = {
  getDashboardStatsFromDB,
  getEarningsOverviewFromDB,
  getUserOverviewFromDB,
};
