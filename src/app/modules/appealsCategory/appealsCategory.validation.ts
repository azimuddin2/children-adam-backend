import { z } from 'zod';

const createDonationsCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Donations category name is required',
    }),
    hadithNarrator: z.string({
      required_error:
        'Hadith narrator is required (e.g. The Prophet Muhammad ﷺ said)',
    }),
    hadith: z.string({
      required_error: 'Hadith text is required',
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
    hadithNarrator: z
      .string({
        required_error:
          'Hadith narrator is required (e.g. The Prophet Muhammad ﷺ said)',
      })
      .optional(),
    hadith: z
      .string({
        required_error: 'Hadith text is required',
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
