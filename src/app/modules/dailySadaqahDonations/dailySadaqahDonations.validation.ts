import { z } from 'zod';

const createDailySadaqahDonationsSchema = z.object({
  body: z.object({
    totalAmount: z
      .number({
        required_error: 'Amount is required',
      })
      .int('Amount must be in cents (whole number)')
      .min(100, 'Minimum donation is $1'),
    isCustomAmount: z
      .boolean({
        required_error: 'Custom amount flag is required',
      })
      .optional()
      .default(false),
  }),
});

export const DailySadaqahDonationsValidations = {
  createDailySadaqahDonationsSchema,
};
