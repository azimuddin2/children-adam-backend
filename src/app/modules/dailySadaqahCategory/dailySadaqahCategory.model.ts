import { model, Schema } from 'mongoose';
import { TDailySadaqahCategory } from './dailySadaqahCategory.interface';

const dailySadaqahCategorySchema = new Schema<TDailySadaqahCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const DailySadaqahCategory = model<TDailySadaqahCategory>(
  'DailySadaqahCategory',
  dailySadaqahCategorySchema,
);
