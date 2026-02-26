import mongoose, { model, Schema } from 'mongoose';
import { TTopAppealsDonations } from './topAppealsDonations.interface';

const TopAppealsDonationsSchema = new Schema<TTopAppealsDonations>(
  {
    topAppeals: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopAppeals',
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

export const TopAppealsDonations = model<TTopAppealsDonations>(
  'TopAppealsDonations',
  TopAppealsDonationsSchema,
);
