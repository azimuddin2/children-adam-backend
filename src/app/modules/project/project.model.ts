import mongoose, { model, Schema } from 'mongoose';
import { TProject, TImage } from './project.interface';

const ImageSchema = new Schema<TImage>(
  {
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const ProjectSchema = new Schema<TProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailySadaqahCategory',
      required: true,
    },
    images: {
      type: [ImageSchema],
      required: true,
      validate: [
        (v: TImage[]) => v.length > 0,
        'At least one image is required',
      ],
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      lead: {
        type: String,
        required: true,
        trim: true,
      },
      body: {
        type: String,
        required: true,
        trim: true,
      },
      quote: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

export const Project = model<TProject>('Project', ProjectSchema);
