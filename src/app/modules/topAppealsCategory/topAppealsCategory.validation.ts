import { z } from 'zod';

const createTopAppealsCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Top appeals category name is required',
    }),
  }),
});

const updateTopAppealsCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Top appeals category name is required',
      })
      .optional(),
  }),
});

export const TopAppealsCategoryValidation = {
  createTopAppealsCategoryValidationSchema,
  updateTopAppealsCategoryValidationSchema,
};
