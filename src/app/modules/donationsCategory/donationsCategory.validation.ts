import { z } from 'zod';

const createDonationsCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Donations category name is required',
    }),
    description: z.string({
      required_error: 'Donations category description is required',
    }),
  }),
});

const updateDonationsCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Donations category name is required',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Donations category description is required',
      })
      .optional(),
  }),
});

export const DonationsCategoryValidation = {
  createDonationsCategoryValidationSchema,
  updateDonationsCategoryValidationSchema,
};
