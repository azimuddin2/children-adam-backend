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

const getTrafficByLocationFromDB = async () => {
  const result = await User.aggregate([
    // Match active users with country
    {
      $match: {
        isDeleted: false,
        country: { $ne: null, $exists: true },
      },
    },

    // Group by country
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
      },
    },

    { $sort: { count: -1 } },

    {
      $facet: {
        topLocations: [{ $limit: 3 }],
        totalCount: [
          {
            $group: {
              _id: null,
              total: { $sum: '$count' },
            },
          },
        ],
      },
    },
  ]);

  const topLocations = result[0]?.topLocations || [];
  const totalCount = result[0]?.totalCount[0]?.total || 0;

  // Top 3 + Others calculate
  const topTotal = topLocations.reduce(
    (acc: number, item: any) => acc + item.count,
    0,
  );
  const othersCount = totalCount - topTotal;

  const locations = [
    ...topLocations.map((item: any) => ({
      location: item._id,
      count: item.count,
      percentage:
        totalCount > 0
          ? Math.round((item.count / totalCount) * 100 * 10) / 10
          : 0,
    })),
    ...(othersCount > 0
      ? [
          {
            location: 'Other',
            count: othersCount,
            percentage:
              totalCount > 0
                ? Math.round((othersCount / totalCount) * 100 * 10) / 10
                : 0,
          },
        ]
      : []),
  ];

  return {
    totalUsers: totalCount,
    locations,
  };
};

export const DashboardService = {
  getDashboardStatsFromDB,
  getEarningsOverviewFromDB,
  getUserOverviewFromDB,
  getTrafficByLocationFromDB,
};
