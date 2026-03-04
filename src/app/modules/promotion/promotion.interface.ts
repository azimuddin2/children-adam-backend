import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';

export type TPromotion = {
  title: string;
  message: string;
  recipients: Types.ObjectId[] | TUser[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
