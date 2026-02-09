import { Model, ObjectId } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TRole = 'user' | 'admin';

export type TStatus = 'ongoing' | 'confirmed' | 'blocked';

export type TGender = 'male' | 'female' | 'other';

export type TUser = {
  _id: ObjectId;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  image: string | null;
  gender: TGender;

  password: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;

  role: TRole;
  status: TStatus;

  isVerified: boolean;
  verification: {
    otp: string | number | null;
    expiresAt: Date;
    status: boolean;
  };

  loginWith: 'google' | 'apple' | 'credentials';

  fcmToken?: string;
  notifications: boolean;
  isDeleted: boolean;

  stripeCustomerId?: string;
};

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string,
  ): Promise<boolean>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
