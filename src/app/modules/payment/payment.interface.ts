import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';
import { TOrder } from '../order/order.interface';

export type TPaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
export type TPaymentType = 'deposit'; // future: 'full', 'withdrawal'

export type TPayment = {
  user: Types.ObjectId | TUser;
  order: Types.ObjectId | TOrder; // reference to Order

  type: TPaymentType; // deposit only (MVP)
  status: TPaymentStatus;
  trnId: string;
  price: number; // total deposit (ex: 10)
  stripeSessionId?: string; // ✅ add
  paymentIntentId?: string;
  isPaid: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
