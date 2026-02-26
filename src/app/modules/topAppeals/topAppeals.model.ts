import mongoose, { model, Schema } from 'mongoose';
import { TImage, TTopAppeals } from './topAppeals.interface';

const ImageSchema = new Schema<TImage>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false },
);

const TopAppealsSchema = new Schema<TTopAppeals>(
  {
    topAppealsCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopAppealsCategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
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
        ref: 'TopAppealsDonations',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const TopAppeals = model<TTopAppeals>('TopAppeals', TopAppealsSchema);
