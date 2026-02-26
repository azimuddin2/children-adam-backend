import { Types } from 'mongoose';
import { TTopAppealsCategory } from '../topAppealsCategory/topAppealsCategory.interface';
import { TTopAppealsDonations } from '../topAppealsDonations/topAppealsDonations.interface';

export type TImage = {
  url: string;
  key: string;
};

export type TTopAppeals = {
  _id?: string;
  topAppealsCategory: TTopAppealsCategory | Types.ObjectId;

  name: string;
  description: string;
  image: string | null;

  deleteKey: string[];
  images: TImage[];
  fullDescription: string;

  donations: TTopAppealsDonations[] | Types.ObjectId[] | string[];

  isDeleted: boolean;
};
