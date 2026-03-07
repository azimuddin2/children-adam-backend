import mongoose, { startSession, Types } from 'mongoose';
import { Payment } from './payment.model';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import config from '../../config';
import StripeService from '../../class/stripe';
import { sendNotification } from '../notification/notification.utils';
import { generateTrxId } from './payment.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { paymentSearchableFields } from './payment.constant';
import { OrderService } from '../order/order.service';
import { Cart } from '../cart/cart.model';
import { Order } from '../order/order.model';
import { TDonationModel } from '../cart/cart.constant';

const createPayment = async (
  userId: string,
  payload: {
    // Cart payment
    cart?: string;
    // Direct payment
    donationId?: string;
    donationModel?: TDonationModel;
    name?: string;
    image?: string;
    price?: number;
    donationsType?: string;
  },
) => {
  // ─── Determine type ──────────────────────────────────
  const isCartPayment = !!payload.cart;
  const isDirectPayment = !!payload.donationId && !!payload.price;

  if (!isCartPayment && !isDirectPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide cart or donationId + price',
    );
  }

  if (isCartPayment && !mongoose.Types.ObjectId.isValid(payload.cart!)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid cart ID');
  }

  if (
    isDirectPayment &&
    !mongoose.Types.ObjectId.isValid(payload.donationId!)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid donation ID');
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    // ─── ✅Step 1: Order create (condition base) ────────
    const orderPayload = isCartPayment
      ? { type: 'cart' as const, cart: payload.cart! }
      : {
          type: 'direct' as const,
          donationId: payload.donationId!,
          donationModel: payload.donationModel!,
          name: payload.name || 'Donation',
          image: payload.image,
          price: payload.price!,
          donationsType: payload.donationsType || 'Sadaqah',
        };

    const { order, cart, totalPrice } = await OrderService.createOrderIntoDB(
      userId,
      orderPayload,
      session,
    );

    // ─── ✅Step 2: Line items (condition base) ──────────
    const lineItems = isCartPayment
      ? cart!.items.map((item: any) => ({
          price_data: {
            currency: 'gbp',
            product_data: { name: item.name || 'Donation' },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }))
      : [
          {
            price_data: {
              currency: 'gbp',
              product_data: { name: payload.name || 'Donation' },
              unit_amount: Math.round(payload.price! * 100),
            },
            quantity: 1,
          },
        ];

    // ─── ✅ Step 3: Stripe customer ───────────────────────
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const stripeCustomer = await StripeService.createCustomer(
        user.email!,
        user.fullName!,
      );
      customerId = stripeCustomer!.id;
      await User.findByIdAndUpdate(
        userId,
        { stripeCustomerId: customerId },
        { session },
      );
    }

    // ─── ✅ Step 4: Payment record ────────────────────────
    const [payment] = await Payment.create(
      [
        {
          user: new mongoose.Types.ObjectId(userId),
          order: order._id,
          type: 'deposit',
          trnId: generateTrxId(),
          price: totalPrice,
          status: 'pending',
          isPaid: false,
        },
      ],
      { session },
    );

    if (!payment) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment creation failed');
    }

    // ─── ✅ Step 5: Stripe session ────────────────────────
    const successUrl = `${config.server_url}/api/v1/payments/confirm?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment._id}`;
    const cancelUrl = `${config.server_url}/api/v1/payments/cancel?paymentId=${payment._id}`;

    const checkoutSession = await StripeService.getCheckoutSession(
      lineItems,
      successUrl,
      cancelUrl,
      customerId,
      'gbp',
    );

    if (!checkoutSession) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Stripe session failed',
      );
    }

    // ─── ✅ Step 6: Save stripe session ID ───────────────
    payment.stripeSessionId = checkoutSession.id;
    await payment.save({ session });

    await session.commitTransaction();
    return { url: checkoutSession.url };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const confirmPaymentIntoDB = async (query: {
  sessionId: string;
  paymentId: string;
}) => {
  const { sessionId, paymentId } = query;

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment ID');
  }

  const isPaid = await StripeService.isPaymentSuccess(sessionId);
  if (!isPaid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not completed');
  }

  const paymentSession = await StripeService.getPaymentSession(sessionId);

  const session = await startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'paid',
        isPaid: true,
        paymentIntentId: paymentSession!.payment_intent,
      },
      { new: true, session },
    );

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    const order = await Order.findByIdAndUpdate(
      payment.order,
      { status: 'completed', isPaid: true },
      { new: true, session },
    );

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // ✅ Notification
    const user = await User.findById(payment.user);
    if (user?.fcmToken) {
      sendNotification([user.fcmToken], {
        title: 'Donation Payment Successfully 🎉',
        message: `Thank you for your generous donation of £${payment.price.toFixed(2)}! Your support helps make a positive impact. ❤️`,
        receiver: user._id as any,
        receiverEmail: user.email,
        receiverRole: user.role as string,
        sender: user._id as any,
        type: 'payment',
      });
    }

    // ✅ Cart clear — only cart order
    if (order.orderType === 'cart' && order.cart) {
      await Cart.findByIdAndUpdate(
        order.cart,
        { $set: { items: [], subTotal: 0, totalPrice: 0 } },
        { session },
      );
    }

    await session.commitTransaction();

    return { message: 'Payment confirmed successfully', payment, order };
  } catch (error) {
    await session.abortTransaction();

    try {
      await StripeService.refund(sessionId);
    } catch (refundError: any) {
      console.error('Refund failed:', refundError.message);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

const cancelPaymentIntoDB = async (paymentId: string) => {
  // Validate paymentId format
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment ID');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    // Already paid payment cancel করা যাবে না
    if (payment.status === 'paid') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot cancel a paid payment',
      );
    }

    payment.status = 'cancelled';
    await payment.save({ session });

    await session.commitTransaction();
    return { message: 'Payment cancelled successfully', payment };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllPaymentsFormDB = async (query: Record<string, unknown>) => {
  const paymentQuery = new QueryBuilder(
    Payment.find({ isDeleted: false, isPaid: true, status: 'paid' })
      .populate({
        path: 'user',
        select: 'fullName email image',
      })
      .populate({
        path: 'order',
        select: 'items',
      }),
    query,
  )
    .search(paymentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await paymentQuery.countTotal();
  const data = await paymentQuery.modelQuery;

  return { meta, data };
};

const getPaymentByIdFromDB = async (id: string) => {
  const result = await Payment.findById(id)
    .populate({
      path: 'user',
      select: 'fullName email image',
    })
    .populate({
      path: 'order',
      select: 'items',
    });

  if (!result) {
    throw new AppError(404, 'This payment transaction not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This payment transaction has been deleted');
  }

  return result;
};

const getPaymentStatsFromDB = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const stats = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        isPaid: true,
        status: 'paid',
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'order',
      },
    },
    // ✅ সঠিক option
    { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        todayDonate: [
          { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: null, total: { $sum: '$price' } } },
        ],
        sadaqahDonate: [
          { $match: { 'order.items.donationsType': 'Sadaqah' } },
          { $group: { _id: null, total: { $sum: '$price' } } },
        ],
        zakatDonate: [
          { $match: { 'order.items.donationsType': 'Zakat' } },
          { $group: { _id: null, total: { $sum: '$price' } } },
        ],
        totalDonation: [{ $group: { _id: null, total: { $sum: '$price' } } }],
      },
    },
  ]);

  const result = stats[0];

  return {
    todayDonate: result.todayDonate[0]?.total || 0,
    sadaqahDonate: result.sadaqahDonate[0]?.total || 0,
    zakatDonate: result.zakatDonate[0]?.total || 0,
    totalDonation: result.totalDonation[0]?.total || 0,
  };
};

const getPaymentsHistoryByUserIdFromDB = async (userId: string) => {
  const payments = await Payment.find({
    user: userId,
    isDeleted: false,
    isPaid: true,
    status: 'paid',
  })
    .populate({ path: 'order', select: 'items' })
    .sort({ createdAt: -1 });

  return payments;
};

const getUserDonationStats = async (userId?: string) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    /**
     * Base Match Filter
     * Removed status = completed because DB contains status = paid
     */
    const baseMatch: Record<string, unknown> = {
      isPaid: true,
      isDeleted: false,
    };

    if (userId) {
      baseMatch.user = new Types.ObjectId(userId);
    }

    const result = await Payment.aggregate([
      {
        $match: baseMatch,
      },

      /**
       * Facet aggregation
       */
      {
        $facet: {
          /**
           * Monthly donation stats
           */
          monthly: [
            {
              $match: {
                createdAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth,
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: '$price',
                },
                count: {
                  $sum: 1,
                },
              },
            },
          ],

          /**
           * All time donation stats
           */
          allTime: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: '$price',
                },
                count: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },

      /**
       * Flatten facet result
       */
      {
        $project: {
          monthlyDonation: {
            $ifNull: [
              {
                $getField: {
                  field: 'total',
                  input: { $arrayElemAt: ['$monthly', 0] },
                },
              },
              0,
            ],
          },

          monthlyCount: {
            $ifNull: [
              {
                $getField: {
                  field: 'count',
                  input: { $arrayElemAt: ['$monthly', 0] },
                },
              },
              0,
            ],
          },

          totalDonations: {
            $ifNull: [
              {
                $getField: {
                  field: 'total',
                  input: { $arrayElemAt: ['$allTime', 0] },
                },
              },
              0,
            ],
          },

          totalCount: {
            $ifNull: [
              {
                $getField: {
                  field: 'count',
                  input: { $arrayElemAt: ['$allTime', 0] },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    return (
      result[0] || {
        monthlyDonation: 0,
        monthlyCount: 0,
        totalDonations: 0,
        totalCount: 0,
      }
    );
  } catch (error) {
    console.error('Donation stats aggregation error:', error);

    return {
      monthlyDonation: 0,
      monthlyCount: 0,
      totalDonations: 0,
      totalCount: 0,
    };
  }
};

export const PaymentService = {
  createPayment,
  confirmPaymentIntoDB,
  cancelPaymentIntoDB,
  getAllPaymentsFormDB,
  getPaymentByIdFromDB,
  getPaymentStatsFromDB,
  getPaymentsHistoryByUserIdFromDB,
  getUserDonationStats,
};
