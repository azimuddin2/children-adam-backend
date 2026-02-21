import { Types } from 'mongoose';
import { TDonationsCategory } from '../donationsCategory/donationsCategory.interface';

export type TDonationsSubcategory = {
  _id?: string;
  donationsCategory: TDonationsCategory | Types.ObjectId;
  name: string;
  slug: string;
  image: string | null;

  // donation:

  isDeleted: boolean;
};
