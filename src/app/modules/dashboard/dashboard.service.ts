// import { Payment } from '../payment/payment.model';
// import { User } from '../user/user.model';
// import { TEarningRange } from './dashboard.interface';
// import { getDateRange } from './dashboard.utils';

// const getOverviewStatsFromDB = async (
//   earningRange: TEarningRange = 'weekly',
// ) => {
//   // 🔹 Today range
//   const now = new Date();
//   const startOfDay = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     0,
//     0,
//     0,
//     0,
//   );
//   const endOfDay = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     23,
//     59,
//     59,
//     999,
//   );

//   // 🔹 Earnings range (weekly / monthly / yearly)
//   const { start, end } = getDateRange(earningRange);

//   const [
//     totalUsers,
//     todayBookings,
//     earningsResult,
//     ownerRequests,
//     freelancerRequests,
//   ] = await Promise.all([
//     // Total Users
//     User.countDocuments({ isDeleted: false }),

//     // Today Bookings
//     Booking.countDocuments({
//       isDeleted: false,
//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//     }),

//     // Earnings (Admin revenue only)
//     Payment.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//           isPaid: true,
//           createdAt: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalEarnings: { $sum: '$adminAmount' },
//         },
//       },
//     ]),

//     // Registration Requests
//     OwnerRegistration.countDocuments({ status: 'pending' }),
//     FreelancerRegistration.countDocuments({ status: 'pending' }),
//   ]);

//   return {
//     totalUsers,
//     todayBookings,
//     totalEarnings: earningsResult[0]?.totalEarnings || 0,
//     registrationRequests: {
//       owner: ownerRequests,
//       freelancer: freelancerRequests,
//       total: ownerRequests + freelancerRequests,
//     },
//   };
// };

// const getRequestStatsFromDB = async () => {
//   // 1. Define Date Ranges
//   const now = new Date();
//   const todayStart = new Date(now.setHours(0, 0, 0, 0));
//   const todayEnd = new Date(now.setHours(23, 59, 59, 999));

//   const yesterdayStart = new Date(new Date().setDate(now.getDate() - 1));
//   yesterdayStart.setHours(0, 0, 0, 0);
//   const yesterdayEnd = new Date(new Date().setDate(now.getDate() - 1));
//   yesterdayEnd.setHours(23, 59, 59, 999);

//   // 🔹 Helper function to calculate percentage change
//   const calculatePercentage = (current: number, previous: number) => {
//     if (previous === 0) return current > 0 ? 100 : 0;
//     const percent = ((current - previous) / previous) * 100;
//     return Number(percent.toFixed(2)); // Returns 15.03 format
//   };

//   // 🔹 Helper to get counts for both collections (Owner + Freelancer)
//   const getCombinedCounts = async (filter: any) => {
//     const ownerCount = await OwnerRegistration.countDocuments({
//       isDeleted: false,
//       ...filter,
//     });
//     const freelancerCount = await FreelancerRegistration.countDocuments({
//       isDeleted: false,
//       ...filter,
//     });
//     return ownerCount + freelancerCount;
//   };

//   // ==========================================
//   // 1. TOTAL REQUESTS (All Time)
//   // ==========================================
//   const totalRequestsCount = await getCombinedCounts({});

//   // To get growth for Total, we compare with Total count 30 days ago (or yesterday)
//   // Here assuming growth compared to previous month for "Total"
//   const lastMonthDate = new Date();
//   lastMonthDate.setDate(lastMonthDate.getDate() - 30);
//   const totalRequestsLastMonth = await getCombinedCounts({
//     createdAt: { $lte: lastMonthDate },
//   });

//   const totalRequestsGrowth = calculatePercentage(
//     totalRequestsCount,
//     totalRequestsLastMonth,
//   );

//   // ==========================================
//   // 2. PENDING REQUESTS
//   // ==========================================
//   const pendingRequestsCount = await getCombinedCounts({
//     approvalStatus: 'pending',
//   });

//   // For Pending Growth, we compare "New Pending Requests Today" vs "Yesterday"
//   // (Because we don't track historical status snapshots easily)
//   const pendingToday = await getCombinedCounts({
//     approvalStatus: 'pending',
//     createdAt: { $gte: todayStart, $lte: todayEnd },
//   });
//   const pendingYesterday = await getCombinedCounts({
//     approvalStatus: 'pending',
//     createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
//   });

//   const pendingRequestsGrowth = calculatePercentage(
//     pendingToday,
//     pendingYesterday,
//   );

//   // ==========================================
//   // 3. TODAY REQUESTS
//   // ==========================================
//   const todayRequestsCount = await getCombinedCounts({
//     createdAt: { $gte: todayStart, $lte: todayEnd },
//   });

//   const yesterdayRequestsCount = await getCombinedCounts({
//     createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
//   });

//   const todayRequestsGrowth = calculatePercentage(
//     todayRequestsCount,
//     yesterdayRequestsCount,
//   );

//   // 🔹 FINAL RETURN
//   return {
//     stats: {
//       totalRequest: {
//         count: totalRequestsCount,
//         growth: totalRequestsGrowth, // e.g., 15.03
//       },
//       pendingRequest: {
//         count: pendingRequestsCount,
//         growth: pendingRequestsGrowth, // e.g., 15.03
//       },
//       todayRequest: {
//         count: todayRequestsCount,
//         growth: todayRequestsGrowth, // e.g., 15.03
//       },
//     },
//   };
// };

// const getEarningsStatsFromDB = async () => {
//   const start = new Date();
//   start.setHours(0, 0, 0, 0);
//   const end = new Date();
//   end.setHours(23, 59, 59, 999);

//   const result = await Payment.aggregate([
//     {
//       $match: {
//         isDeleted: false,
//         isPaid: true,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalAdmin: { $sum: '$adminAmount' },
//         todayAdmin: {
//           $sum: {
//             $cond: [
//               {
//                 $and: [
//                   { $gte: ['$createdAt', start] },
//                   { $lte: ['$createdAt', end] },
//                 ],
//               },
//               '$adminAmount',
//               0,
//             ],
//           },
//         },
//       },
//     },
//   ]);

//   const totalEarning = result[0]?.totalAdmin || 0;
//   const todayEarning = result[0]?.todayAdmin || 0;

//   return { totalEarning, todayEarning };
// };

// export const DashboardService = {
//   getOverviewStatsFromDB,
//   getRequestStatsFromDB,
//   getEarningsStatsFromDB,
// };
