import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';

export type TOrder = {
  user: TUser | Types.ObjectId;
  cart: Types.ObjectId;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  isPaid: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
