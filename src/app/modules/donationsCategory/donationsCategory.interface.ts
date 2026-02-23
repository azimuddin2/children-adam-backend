import { Types } from 'mongoose';
import { TDonationsSubcategory } from '../donationsSubcategory/donationsSubcategory.interface';

export type TDonationsCategory = {
  _id?: string;
  name: string;
  slug: string;
  hadithNarrator: string;
  hadith: string;
  description: string;
  image: string | null;

  donationsSubcategory?: TDonationsSubcategory[] | Types.ObjectId[] | string[];

  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
