import mongoose, { model, Schema } from 'mongoose';
import { TSadaqahJariyahDonations } from './sadaqahJariyahDonations.interface';

const SadaqahJariyahDonationsSchema = new Schema<TSadaqahJariyahDonations>(
  {
    sadaqahJariyah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SadaqahJariyah',
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

export const SadaqahJariyahDonations = model<TSadaqahJariyahDonations>(
  'SadaqahJariyahDonations',
  SadaqahJariyahDonationsSchema,
);
