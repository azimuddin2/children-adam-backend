import { model, Schema } from 'mongoose';
import { TPromotion } from './promotion.interface';

const PromotionSchema = new Schema<TPromotion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Promotion = model<TPromotion>('Promotion', PromotionSchema);
