import { z } from 'zod';

const createDailySadaqahCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Daily sadaqah category name is required',
    }),
  }),
});

const updateDailySadaqahCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Daily sadaqa category name is required',
      })
      .optional(),
  }),
});

export const DailySadaqahCategoryValidations = {
  createDailySadaqahCategoryValidationSchema,
  updateDailySadaqahCategoryValidationSchema,
};
