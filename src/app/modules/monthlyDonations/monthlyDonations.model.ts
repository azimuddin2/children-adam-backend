import mongoose, { model, Schema } from 'mongoose';
import { TMonthlyDonations } from './monthlyDonations.interface';

const MonthlyDonationsSchema = new Schema<TMonthlyDonations>(
  {
    donationsSubcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationsSubcategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    donationsType: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const MonthlyDonations = model<TMonthlyDonations>(
  'MonthlyDonations',
  MonthlyDonationsSchema,
);
