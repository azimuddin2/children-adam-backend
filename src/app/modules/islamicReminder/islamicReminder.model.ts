import { model, Schema } from 'mongoose';
import { TIslamicReminder } from './islamicReminder.interface';

const IslamicReminderSchema = new Schema<TIslamicReminder>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
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

export const IslamicReminder = model<TIslamicReminder>(
  'IslamicReminder',
  IslamicReminderSchema,
);
