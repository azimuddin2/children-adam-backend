import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { TOrder } from './order.interface';
import AppError from '../../errors/AppError';
import { Cart } from '../cart/cart.model';
import { Order } from './order.model';

const createOrderIntoDB = async (
  userId: string,
  payload: Pick<TOrder, 'cart'>,
  session?: mongoose.ClientSession,
) => {
  // Validate cart ID format
  if (!mongoose.Types.ObjectId.isValid(payload.cart)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid cart ID');
  }

  // Find cart by cartId and userId — ownership confirm
  const cart = await Cart.findOne({
    _id: payload.cart,
    userId,
  }).session(session || null);

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  // Prevent order creation if cart is empty
  if (cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  // Create order from cart data + cart snapshot copy
  const [order] = await Order.create(
    [
      {
        user: new mongoose.Types.ObjectId(userId),
        cart: new mongoose.Types.ObjectId(payload.cart),

        // ✅ Cart snapshot — cart clear হলেও order এ থাকবে
        items: cart.items,

        totalPrice: cart.totalPrice,
        status: 'pending',
        isPaid: false,
        isDeleted: false,
      },
    ],
    session ? { session } : {},
  );

  if (!order) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create order');
  }

  // Return both order and cart — payment service needs both
  return { order, cart };
};

export const OrderService = {
  createOrderIntoDB,
};
