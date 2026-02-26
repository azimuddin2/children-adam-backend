import { Types } from 'mongoose';
import { TSadaqahJariyah } from '../sadaqahJariyah/sadaqahJariyah.interface';

export type TSadaqahJariyahDonations = {
  _id?: string;
  sadaqahJariyah: TSadaqahJariyah | Types.ObjectId;

  name: string;
  amount: number;
  donationsType: string;
  image: string | null;

  isDeleted: boolean;
};
