import mongoose, { model, Schema } from 'mongoose';
import { TDailySadaqah } from './dailySadaqah.interface';

const DailySadaqahSchema = new Schema<TDailySadaqah>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailySadaqahDonations',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const DailySadaqah = model<TDailySadaqah>(
  'DailySadaqah',
  DailySadaqahSchema,
);
