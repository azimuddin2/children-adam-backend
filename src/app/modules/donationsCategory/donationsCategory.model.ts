import mongoose, { model, Schema } from 'mongoose';
import { TDonationsCategory } from './donationsCategory.interface';

const DonationsCategorySchema = new Schema<TDonationsCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    donationsSubcategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DonationsSubcategory', // Reference to Subcategory Model
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const DonationsCategory = model<TDonationsCategory>(
  'DonationsCategory',
  DonationsCategorySchema,
);
