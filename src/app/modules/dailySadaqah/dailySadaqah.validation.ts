import { z } from 'zod';

const createDailySadaqahValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Daily sadaqah name is required',
    }),
  }),
});

const updateDailySadaqahValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Daily sadaqah name is required',
      })
      .optional(),
  }),
});

export const DailySadaqahValidation = {
  createDailySadaqahValidationSchema,
  updateDailySadaqahValidationSchema,
};
