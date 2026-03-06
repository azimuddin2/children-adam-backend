import { Types } from 'mongoose';
import { TTDailySadaqahDonations } from '../dailySadaqahDonations/dailySadaqahDonations.interface';

export type TDailySadaqah = {
  _id?: string;
  name: string;

  donations?: TTDailySadaqahDonations[] | Types.ObjectId[];

  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
