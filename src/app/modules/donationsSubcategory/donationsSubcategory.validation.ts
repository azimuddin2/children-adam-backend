import { z } from 'zod';

const createDonationsSubcategorySchema = z.object({
  body: z.object({
    donationsCategory: z.string({
      required_error: 'Donations Category ID is required',
    }),
    name: z.string({
      required_error: 'Subcategory Name is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    fullDescription: z
      .string({ required_error: 'Full description is required' })
      .optional(),
  }),
});

const updateDonationsSubcategorySchema = z.object({
  body: z.object({
    donationsCategory: z
      .string({
        required_error: 'Donations Category ID is required',
      })
      .optional(),
    name: z
      .string({
        required_error: 'Subcategory Name is required',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .optional(),
    fullDescription: z
      .string({ required_error: 'Full description is required' })
      .optional(),
  }),
});

export const DonationsSubcategoryValidation = {
  createDonationsSubcategorySchema,
  updateDonationsSubcategorySchema,
};
