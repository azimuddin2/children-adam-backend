import { Schema, model } from 'mongoose';
import { TSupport } from './support.interface';

const supportSchema = new Schema<TSupport>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(v);
        },
        message: 'Invalid email address',
      },
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageReply: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Support = model<TSupport>('Support', supportSchema);
