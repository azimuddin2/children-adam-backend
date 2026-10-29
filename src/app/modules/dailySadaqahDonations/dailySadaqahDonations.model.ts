import mongoose, { model, Schema } from 'mongoose';
import { TDailySadaqahDonations } from './dailySadaqahDonations.interface';
import { DONATION_STATUS } from './dailySadaqahDonations.constant';

const distributionSchema = new Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailySadaqahCategory',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const DailySadaqahDonationsSchema = new Schema<TDailySadaqahDonations>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    isCustomAmount: {
      type: Boolean,
      default: false,
    },
    distribution: {
      type: [distributionSchema],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: DONATION_STATUS,
        message: '{VALUE} is not valid',
      },
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

DailySadaqahDonationsSchema.index(
  { user: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'completed', isDeleted: false },
  },
);

export const DailySadaqahDonations = model<TDailySadaqahDonations>(
  'DailySadaqahDonations',
  DailySadaqahDonationsSchema,
);
