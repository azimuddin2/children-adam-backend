import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Cart } from '../cart/cart.model';
import { Order } from './order.model';
import { TCreateOrderPayload } from './order.interface';

const createOrderIntoDB = async (
  userId: string,
  payload: TCreateOrderPayload,
  session?: mongoose.ClientSession,
) => {
  // ─── Cart Order ──────────────────────────────────────
  if (payload.type === 'cart') {
    if (!mongoose.Types.ObjectId.isValid(payload.cart)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid cart ID');
    }

    const cart = await Cart.findOne({
      _id: payload.cart,
      userId,
    }).session(session || null);

    if (!cart) {
      throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    if (cart.items.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty');
    }

    const [order] = await Order.create(
      [
        {
          user: new mongoose.Types.ObjectId(userId),
          cart: new mongoose.Types.ObjectId(payload.cart),
          orderType: 'cart',
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

    return { order, cart, totalPrice: cart.totalPrice };
  }

  // ─── Direct Order ────────────────────────────────────
  if (payload.type === 'direct') {
    if (!mongoose.Types.ObjectId.isValid(payload.donationId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid donation ID');
    }

    if (!payload.price || payload.price <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid price');
    }

    const [order] = await Order.create(
      [
        {
          user: new mongoose.Types.ObjectId(userId),
          orderType: 'direct',
          cart: null,
          items: [
            {
              donationId: new mongoose.Types.ObjectId(payload.donationId),
              donationModel: payload.donationModel,
              name: payload.name,
              image: payload.image || null,
              price: payload.price,
              donationsType: payload.donationsType,
              quantity: 1,
              subtotal: payload.price,
            },
          ],
          totalPrice: payload.price,
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

    return { order, cart: null, totalPrice: payload.price };
  }

  throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order type');
};

export const OrderService = {
  createOrderIntoDB,
};
