import { ObjectId } from 'mongoose';
import { TUser } from '../user/user.interface';

export type TImage = {
  url: string;
  key: string;
};

export type TServiceStatus = 'available' | 'unavailable';

export type TOwnerService = {
  _id?: string;
  owner: ObjectId | TUser;
  deleteKey: string[];
  images: TImage[];
  name: string;
  category: string;
  subcategory: string;
  time: string;
  price: number;
  about: string;
  status: TServiceStatus;

  isDeleted: boolean;
};
