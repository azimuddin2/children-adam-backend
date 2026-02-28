import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';
import { TOrder } from '../order/order.interface';

export type TPaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
export type TPaymentType = 'deposit'; // future: 'full', 'withdrawal'

export type TPayment = {
  user: Types.ObjectId | TUser;
  order: Types.ObjectId | TOrder;

  type: TPaymentType;
  status: TPaymentStatus;
  trnId: string;
  price: number;
  stripeSessionId?: string;
  paymentIntentId?: string;
  isPaid: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
