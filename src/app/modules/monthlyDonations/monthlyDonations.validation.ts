import { z } from 'zod';

const createMonthlyDonationsSchema = z.object({
  body: z.object({
    donationsSubcategory: z.string({
      required_error: 'Donations Subcategory ID is required',
    }),
    name: z.string({
      required_error: 'Name is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }),
    donationsType: z.string({
      required_error: 'Donations type is required',
    }),
  }),
});

const updateMonthlyDonationsSchema = z.object({
  body: z.object({
    donationsSubcategory: z
      .string({
        required_error: 'Donations Subcategory ID is required',
      })
      .optional(),
    name: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    amount: z
      .number({
        required_error: 'Amount is required',
      })
      .optional(),
    donationsType: z
      .string({
        required_error: 'Donations type is required',
      })
      .optional(),
  }),
});

export const MonthlyDonationsValidation = {
  createMonthlyDonationsSchema,
  updateMonthlyDonationsSchema,
};
