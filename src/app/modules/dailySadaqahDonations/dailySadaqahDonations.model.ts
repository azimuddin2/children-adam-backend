import mongoose, { model, Schema } from 'mongoose';
import { TTDailySadaqahDonations } from './dailySadaqahDonations.interface';

const DailySadaqahDonationsSchema = new Schema<TTDailySadaqahDonations>(
  {
    dailySadaqah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailySadaqah',
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

export const DailySadaqahDonations = model<TTDailySadaqahDonations>(
  'DailySadaqahDonations',
  DailySadaqahDonationsSchema,
);
