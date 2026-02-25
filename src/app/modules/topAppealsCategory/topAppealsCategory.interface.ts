import { Types } from 'mongoose';
import { TTopAppeals } from '../topAppeals/topAppeals.interface';

export type TTopAppealsCategory = {
  _id?: string;
  name: string;

  topAppeals?: TTopAppeals[] | Types.ObjectId[];

  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
