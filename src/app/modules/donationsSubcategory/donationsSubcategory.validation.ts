import { z } from 'zod';

const createSubcategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Sub Category name is required',
    }),
  }),
});

const updateSubcategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Sub Category name is required',
      })
      .optional(),
  }),
});

export const SubcategoryValidation = {
  createSubcategoryValidationSchema,
  updateSubcategoryValidationSchema,
};
