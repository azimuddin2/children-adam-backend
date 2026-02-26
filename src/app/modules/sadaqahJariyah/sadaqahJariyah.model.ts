import mongoose, { model, Schema } from 'mongoose';
import { TImage, TSadaqahJariyah } from './sadaqahJariyah.interface';

const ImageSchema = new Schema<TImage>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false },
);

const SadaqahJariyahSchema = new Schema<TSadaqahJariyah>(
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

    deleteKey: [{ type: String, required: false }],
    images: {
      type: [ImageSchema],
      required: false,
    },
    fullDescription: {
      type: String,
      default: '',
    },

    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SadaqahJariyahDonations',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const SadaqahJariyah = model<TSadaqahJariyah>(
  'SadaqahJariyah',
  SadaqahJariyahSchema,
);
