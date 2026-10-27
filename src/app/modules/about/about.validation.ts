import { z } from 'zod';

const createAboutValidationSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: 'About content is required',
    }),
  }),
});

const updateAboutValidationSchema = z.object({
  body: z.object({
    content: z
      .string({
        required_error: 'About content is required',
      })
      .optional(),
  }),
});

export const AboutValidations = {
  createAboutValidationSchema,
  updateAboutValidationSchema,
};
