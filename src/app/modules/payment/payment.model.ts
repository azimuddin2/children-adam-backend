import { Schema, model } from 'mongoose';
import { TPayment } from './payment.interface';
import { PaymentStatus } from './payment.constant';

const paymentSchema = new Schema<TPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit'],
      default: 'deposit',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: PaymentStatus,
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    trnId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Payment = model<TPayment>('Payment', paymentSchema);
