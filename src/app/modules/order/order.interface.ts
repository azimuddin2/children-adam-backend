import { ObjectId } from 'mongoose';
import { TCart } from '../cart/cart.interface';
import { TUser } from '../user/user.interface';

export type TOrder = {
  user: TUser | ObjectId;
  cart: TCart | ObjectId;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  isPaid: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
