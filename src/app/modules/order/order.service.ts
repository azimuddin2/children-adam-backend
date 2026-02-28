import mongoose from 'mongoose';
import { TOrder } from './order.interface';
import AppError from '../../errors/AppError';
import { Cart } from '../cart/cart.model';
import { Order } from './order.model';

const createOrderIntoDB = async (userId: string, payload: TOrder) => {
  if (!mongoose.Types.ObjectId.isValid(payload.cart)) {
    throw new AppError(400, 'Invalid cart ID');
  }

  const cart = await Cart.findOne({
    _id: payload.cart,
    userId,
  });

  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  if (cart.items.length === 0) {
    throw new AppError(400, 'Cart is empty');
  }

  const order = await Order.create({
    user: new mongoose.Types.ObjectId(userId),
    cart: new mongoose.Types.ObjectId(payload.cart),
    totalPrice: cart.totalPrice,
    status: 'pending',
    isPaid: false,
    isDeleted: false,
  });

  if (!order) {
    throw new AppError(500, 'Failed to create order');
  }

  // Step 5: Clear cart after order created successfully
  await Cart.findOneAndUpdate(
    { _id: payload.cart },
    { $set: { items: [], subTotal: 0, totalPrice: 0 } },
    { new: true },
  );

  return order;
};

export const OrderService = {
  createOrderIntoDB,
};
