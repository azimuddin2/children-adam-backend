import { Types } from 'mongoose';
import { ObjectId as mongoId } from 'mongodb';

export interface INotification {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  receiverEmail: string;
  receiverRole: string;
  product?: mongoId;
  message: string;
  fcmToken?: string;
  type?: 'text' | 'accept' | 'reject' | 'cancelled' | 'payment' | 'booking';
  title?: string;
  isRead?: boolean;
  link?: string;
}
