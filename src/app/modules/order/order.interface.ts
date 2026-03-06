import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';
import { TCartItem } from '../cart/cart.interface';

export type TOrderType = 'direct' | 'cart';

export type TOrder = {
  user: TUser | Types.ObjectId;

  orderType: TOrderType;

  cart?: Types.ObjectId | string;

  items: TCartItem[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  isPaid: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
