import { Types } from 'mongoose';
import { TDonationsCategory } from '../donationsCategory/donationsCategory.interface';

export type TImage = {
  url: string;
  key: string;
};

export type TDonationsSubcategory = {
  _id?: string;
  donationsCategory: TDonationsCategory | Types.ObjectId;

  name: string;
  slug: string;
  description: string;
  image: string | null;

  deleteKey: string[];
  images: TImage[];
  fullDescription: string;

  donations: Types.ObjectId[] | string[];

  isDeleted: boolean;
};
