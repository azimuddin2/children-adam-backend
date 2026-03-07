/* Create Payment & Stripe Checkout Session
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

    await session.commitTransaction();
    return { url: checkoutSession!.url };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
*/

/* Confirm Payment in DB after Stripe Checkout Success
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

    const user = await User.findById(payment.user);
    if (user?.fcmToken) {
      sendNotification([user.fcmToken], {
        title: 'Donation Payment Successfully 🎉',
        message: `Thank you for your generous donation! Your payment has been successfully received. Your support helps make a positive impact. ❤️`,
        receiver: user._id as any,
        receiverEmail: user.email,
        receiverRole: user.role as string,
        sender: user._id as any,
        type: 'payment',
      });
    }

    // ✅ Clear cart after successful payment
    await Cart.findByIdAndUpdate(
      order.cart,
      {
        $set: {
          items: [],
          subTotal: 0,
          totalPrice: 0,
        },
      },
      { session },
    );

    await session.commitTransaction();

    return {
      message: 'Payment confirmed successfully',
      payment,
      order,
    };
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
*/
