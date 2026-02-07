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

  password: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;

  gender?: TGender;
  role: TRole;
  status: TStatus;

  image: string | null;
  isDeleted: boolean;

  isVerified: boolean;
  verification: {
    otp: string | number | null;
    expiresAt: Date | null;
    status: boolean;
  };

  loginWith: 'google' | 'apple' | 'credentials';

  isRegistration: boolean;

  fcmToken?: string;
  notifications: boolean;

  // 🔹 Stripe (Customer)
  stripeCustomerId?: string;

  // 🔹 Stripe (Vendor / Connect)
  stripeAccountId?: string;
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
