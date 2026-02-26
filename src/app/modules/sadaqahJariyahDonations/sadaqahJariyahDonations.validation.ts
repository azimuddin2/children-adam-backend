import { z } from 'zod';

const createSadaqahJariyahDonationsSchema = z.object({
  body: z.object({
    sadaqahJariyah: z.string({
      required_error: 'Sadaqah Jariyah ID is required',
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

const updateSadaqahJariyahDonationsSchema = z.object({
  body: z.object({
    sadaqahJariyah: z
      .string({
        required_error: 'Sadaqah Jariyah ID is required',
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

export const SadaqahJariyahDonationsValidation = {
  createSadaqahJariyahDonationsSchema,
  updateSadaqahJariyahDonationsSchema,
};
