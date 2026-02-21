import mongoose, { model, Schema } from 'mongoose';
import {
  TDonationsSubcategory,
  TImage,
} from './donationsSubcategory.interface';

const ImageSchema = new Schema<TImage>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false },
);

const DonationsSubcategorySchema = new Schema<TDonationsSubcategory>(
  {
    donationsCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationsCategory',
      required: true,
    },
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
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    deleteKey: {
      type: [String],
      default: [],
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    fullDescription: {
      type: String,
      default: '',
    },
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
      },
    ],
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
