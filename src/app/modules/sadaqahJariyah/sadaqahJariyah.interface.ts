import { Types } from 'mongoose';

export type TImage = {
  url: string;
  key: string;
};

export type TSadaqahJariyah = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;

  deleteKey: string[];
  images: TImage[];
  fullDescription: string;

  donations: Types.ObjectId[] | string[];

  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
