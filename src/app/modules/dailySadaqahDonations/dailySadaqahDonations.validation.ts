import { z } from 'zod';

const createDailySadaqahDonationsSchema = z.object({
  body: z.object({
    dailySadaqah: z.string({
      required_error: 'Daily Sadaqah ID is required',
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

const updateDailySadaqahDonationsSchema = z.object({
  body: z.object({
    dailySadaqah: z
      .string({
        required_error: 'Daily Sadaqah ID is required',
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

export const DailySadaqahDonationsValidation = {
  createDailySadaqahDonationsSchema,
  updateDailySadaqahDonationsSchema,
};
