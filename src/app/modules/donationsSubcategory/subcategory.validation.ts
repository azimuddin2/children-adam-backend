import { z } from 'zod';

const createSubcategoryValidationSchema = z.object({
  body: z.object({
    donationsCategory: z.string({
      required_error: 'Donations category is required',
    }),
    name: z.string({
      required_error: 'Sub category name is required',
    }),
    slug: z
      .string({
        required_error: 'Slug is required',
      })
      .optional(),
    description: z.string().optional(),
    fullDescription: z.string().optional(),
    image: z.string().nullable().optional(),
    deleteKey: z.array(z.string()).optional(),
    images: z
      .array(
        z.object({
          url: z.string(),
          key: z.string(),
        }),
      )
      .optional(),
    donations: z.array(z.string()).optional(),
  }),
});

const updateSubcategoryValidationSchema = z.object({
  body: z.object({
    donationsCategory: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    fullDescription: z.string().optional(),
    image: z.string().nullable().optional(),
    deleteKey: z.array(z.string()).optional(),
    images: z
      .array(
        z.object({
          url: z.string(),
          key: z.string(),
        }),
      )
      .optional(),
    donations: z.array(z.string()).optional(),
  }),
});

export const SubcategoryValidation = {
  createSubcategoryValidationSchema,
  updateSubcategoryValidationSchema,
};
