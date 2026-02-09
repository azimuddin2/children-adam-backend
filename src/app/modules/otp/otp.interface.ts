import { ObjectId } from 'mongoose';
import { TUser } from '../user/user.interface';

export type TVerifyOtp = {
  otp: string | number;
};

export type TSendOtp = {
  userId: string | ObjectId | TUser;
  method: 'email' | 'phone';
};
