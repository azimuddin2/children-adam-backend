import { z } from 'zod';

const createTopAppealsDonationsSchema = z.object({
  body: z.object({
    topAppeals: z.string({
      required_error: 'Top Appeals ID is required',
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

const updateTopAppealsDonationsSchema = z.object({
  body: z.object({
    topAppeals: z
      .string({
        required_error: 'Top Appeals ID is required',
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

export const TopAppealsDonationsValidation = {
  createTopAppealsDonationsSchema,
  updateTopAppealsDonationsSchema,
};
