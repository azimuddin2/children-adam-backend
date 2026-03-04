import { z } from 'zod';

const createPromotionValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .trim()
      .min(5, 'Title must be at least 5 characters long'),

    message: z
      .string({
        required_error: 'Message is required',
      })
      .trim()
      .min(10, 'Message must be at least 10 characters long'),

    recipients: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format'))
      .min(1, 'Please select at least one recipient'),
  }),
});

export const PromotionValidations = {
  createPromotionValidationSchema,
};
