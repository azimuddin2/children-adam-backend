import mongoose, { model, Schema } from 'mongoose';
import { TDonationsSubcategory } from './donationsSubcategory.interface';

const DonationsSubcategorySchema = new Schema<TDonationsSubcategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    donationsCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationsCategory',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const DonationsSubcategory = model<TDonationsSubcategory>(
  'DonationsSubcategory',
  DonationsSubcategorySchema,
);
