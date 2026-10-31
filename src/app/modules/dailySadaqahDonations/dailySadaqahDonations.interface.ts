import { Types } from 'mongoose';
import { TDailySadaqahCategory } from '../dailySadaqahCategory/dailySadaqahCategory.interface';

export type TDonationStatus = 'pending' | 'completed' | 'failed';

export type TDailySadaqahDonations = {
  _id?: string;
  user: Types.ObjectId;
  totalAmount: number;
  distribution: {
    category: Types.ObjectId | TDailySadaqahCategory;
    amount: number;
  }[];
  date: string;
  status: TDonationStatus;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
