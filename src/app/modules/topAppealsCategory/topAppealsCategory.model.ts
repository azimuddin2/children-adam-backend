// topAppealsCategory.model.ts
import mongoose, { model, Schema } from 'mongoose';
import { TTopAppealsCategory } from './topAppealsCategory.interface';

const TopAppealsCategorySchema = new Schema<TTopAppealsCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    topAppeals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TopAppeals',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const TopAppealsCategory = model<TTopAppealsCategory>(
  'TopAppealsCategory',
  TopAppealsCategorySchema,
);
