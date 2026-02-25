import { Types } from 'mongoose';
import { TDonationsSubcategory } from '../monthlyDonationSubcategory/monthlyDonationSubcategory.interface';

export type TMonthlyDonations = {
  _id?: string;
  donationsSubcategory: TDonationsSubcategory | Types.ObjectId;

  name: string;
  amount: number;
  donationsType: string;
  image: string | null;

  isDeleted: boolean;
};
