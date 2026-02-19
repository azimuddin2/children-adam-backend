import { z } from 'zod';

const createNewsValidationSchema = z.object({
  body: z.object({
    postTitle: z.string({
      required_error: 'Post title is required',
    }),
    subTitle: z.string({
      required_error: 'Sub title is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
  }),
});

const updateNewsValidationSchema = z.object({
  body: z.object({
    postTitle: z
      .string({
        required_error: 'Post title is required',
      })
      .optional(),
    subTitle: z
      .string({
        required_error: 'Sub title is required',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .optional(),
  }),
});

export const NewsValidations = {
  createNewsValidationSchema,
  updateNewsValidationSchema,
};
