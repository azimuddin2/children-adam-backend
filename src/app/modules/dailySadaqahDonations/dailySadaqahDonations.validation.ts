import { z } from 'zod';

const createDailySadaqahDonationsSchema = z.object({
  body: z.object({
    totalAmount: z
      .number({ required_error: 'Amount is required' })
      .min(1, 'Minimum donation is £1')
      .max(10000, 'Maximum donation is £10,000')
      .refine(
        (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6,
        'Amount can have at most 2 decimal places',
      ),
  }),
});

export const DailySadaqahDonationsValidations = {
  createDailySadaqahDonationsSchema,
};
