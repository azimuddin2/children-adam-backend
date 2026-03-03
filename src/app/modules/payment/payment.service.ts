import mongoose, { startSession } from 'mongoose';
import { Payment } from './payment.model';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import config from '../../config';
import StripeService from '../../class/stripe';
import { sendNotification } from '../notification/notification.utils';
import { TPayment } from './payment.interface';
import { generateTrxId } from './payment.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { paymentSearchableFields } from './payment.constant';
import { OrderService } from '../order/order.service';
import { Cart } from '../cart/cart.model';
import { Order } from '../order/order.model';

const createPayment = async (userId: string, payload: any) => {
  // Validate cartId format
  if (!mongoose.Types.ObjectId.isValid(payload.cart)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid cart ID');
  }

  console.log('Creating payment for user:', userId, 'with cart:', payload.cart);

  // Find user for Stripe customer
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    // Step 1: Create order via OrderService
    const { order, cart } = await OrderService.createOrderIntoDB(
      userId,
      { cart: payload.cart },
      session,
    );

    // Step 2: Create or reuse Stripe customer
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

    // Step 3: Create pending payment record
    const trnId = generateTrxId();

    const [payment] = await Payment.create(
      [
        {
          user: new mongoose.Types.ObjectId(userId),
          order: order._id,
          type: 'deposit',
          trnId,
          price: cart.totalPrice,
          status: 'pending',
          isPaid: false,
        },
      ],
      { session },
    );

    if (!payment) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment creation failed');
    }

    // Step 4: Build Stripe line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Donation Payment' },
          unit_amount: Math.round(cart.totalPrice * 100),
        },
        quantity: 1,
      },
    ];

    // Step 5: Success & cancel redirect URLs
    const successUrl = `${config.server_url}/api/v1/payments/confirm?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment._id}`;
    const cancelUrl = `${config.server_url}/api/v1/payments/cancel?paymentId=${payment._id}`;

    // Step 6: Create Stripe checkout session — normal payment
    const checkoutSession = await StripeService.getCheckoutSession(
      lineItems,
      successUrl,
      cancelUrl,
      customerId,
      'usd',
      '',
    );

    // Step 7: Save Stripe session ID to payment record
    payment.stripeSessionId = checkoutSession!.id;
    await payment.save({ session });

    // Step 8: Clear cart after order + payment created
    await Cart.findOneAndUpdate(
      { _id: payload.cart },
      { $set: { items: [], subTotal: 0, totalPrice: 0 } },
      { new: true, session },
    );

    await session.commitTransaction();
    return { url: checkoutSession!.url };
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

  // Validate paymentId format
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment ID');
  }

  // Check Stripe payment success
  const isPaid = await StripeService.isPaymentSuccess(sessionId);
  if (!isPaid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not completed');
  }

  // Get Stripe session details
  const paymentSession = await StripeService.getPaymentSession(sessionId);

  const session = await startSession();
  session.startTransaction();

  try {
    // Update payment — status: paid
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

    // Update order — status: completed
    const order = await Order.findByIdAndUpdate(
      payment.order,
      { status: 'completed', isPaid: true },
      { new: true, session },
    );

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    await session.commitTransaction();
    return { message: 'Payment confirmed successfully', payment, order };
  } catch (error) {
    await session.abortTransaction();

    // Refund if something goes wrong after payment
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

export const PaymentService = {
  createPayment,
  confirmPaymentIntoDB,
  cancelPaymentIntoDB,
  getAllPaymentsFormDB,
  getPaymentByIdFromDB,
  getPaymentStatsFromDB,
  getPaymentsHistoryByUserIdFromDB,
};
