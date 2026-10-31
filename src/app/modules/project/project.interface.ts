import { TDailySadaqahCategory } from '../dailySadaqahCategory/dailySadaqahCategory.interface';

export type TImage = {
  url: string;
  key: string;
};

export type TProject = {
  id: string;
  title: string;
  category: string | TDailySadaqahCategory;
  images: TImage[];
  description: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};
