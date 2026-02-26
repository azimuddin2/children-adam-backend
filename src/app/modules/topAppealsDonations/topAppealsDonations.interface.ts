import { Types } from 'mongoose';
import { TTopAppeals } from '../topAppeals/topAppeals.interface';

export type TTopAppealsDonations = {
  _id?: string;
  topAppeals: TTopAppeals | Types.ObjectId;

  name: string;
  amount: number;
  donationsType: string;
  image: string | null;

  isDeleted: boolean;
};
