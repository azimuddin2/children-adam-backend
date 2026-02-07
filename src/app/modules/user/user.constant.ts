import { TGender, TRole, TStatus } from './user.interface';

export const USER_ROLE = {
  user: 'user',
  admin: 'admin',
} as const;

export const UserRole: TRole[] = ['user', 'admin'];

export enum Login_With {
  google = 'google',
  apple = 'apple',
  credentials = 'credentials',
}

export const UserStatus: TStatus[] = ['ongoing', 'confirmed', 'blocked'];
export const Gender: TGender[] = ['male', 'female', 'other'];

export const userSearchableFields = ['fullName', 'email', 'phone', 'address'];
