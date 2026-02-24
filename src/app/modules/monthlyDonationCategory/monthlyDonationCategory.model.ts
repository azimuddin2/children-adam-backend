import mongoose, { model, Schema } from 'mongoose';
import { TDonationsCategory } from './monthlyDonationCategory.interface';

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
    hadithNarrator: {
      type: String,
      required: true,
    },
    hadith: {
      type: String,
      required: true,
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
