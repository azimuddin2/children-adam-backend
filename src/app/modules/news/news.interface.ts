export type TNews = {
  _id?: string;
  postTitle: string;
  subTitle: string;
  description: string;

  image: string | null;

  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};
