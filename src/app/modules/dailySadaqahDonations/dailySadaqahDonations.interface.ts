import { Types } from 'mongoose';
import { TDailySadaqah } from '../dailySadaqahCategory/dailySadaqahCategory.interface';

export type TTDailySadaqahDonations = {
  _id?: string;
  dailySadaqah: TDailySadaqah | Types.ObjectId;

  name: string;
  amount: number;
  donationsType: string;
  image: string | null;

  isDeleted: boolean;
};
