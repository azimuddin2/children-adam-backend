import mongoose from 'mongoose';

export type TDonationModelType =
  | 'SadaqahJariyahDonations'
  | 'MonthlyDonations'
  | 'TopAppealsDonations'
  | 'DonationsSubcategory'
  | 'TopAppeals'
  | 'SadaqahJariyah';

export type TCartItem = {
  _id?: mongoose.Types.ObjectId;

  donationId: mongoose.Types.ObjectId;
  donationModel: TDonationModelType;
  name: string;
  image: string | null;
  price: number;
  donationsType: string;
  notes: string;

  quantity: number;
  subtotal: number;
};

export type TCart = {
  userId: mongoose.Types.ObjectId;
  items: TCartItem[];
  subTotal: number;
  totalPrice: number;
};

export type TUpdateQuantityPayload = {
  itemId: string;
  quantity: number;
};
