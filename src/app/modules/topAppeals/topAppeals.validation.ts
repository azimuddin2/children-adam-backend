import { z } from 'zod';

const createTopAppealsSchema = z.object({
  body: z.object({
    topAppealsCategory: z.string({
      required_error: 'Top Appeals Category ID is required',
    }),
    name: z.string({
      required_error: 'Top Appeals Name is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    fullDescription: z
      .string({ required_error: 'Full description is required' })
      .optional(),
  }),
});

const updateTopAppealsSchema = z.object({
  body: z.object({
    topAppealsCategory: z
      .string({
        required_error: 'Top Appeals Category ID is required',
      })
      .optional(),
    name: z
      .string({
        required_error: 'Top Appeals Name is required',
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

const updateTopAppealsContentSchema = z.object({
  body: z.object({
    fullDescription: z
      .string({
        required_error: 'Full Description is required',
      })
      .optional(),
    deleteKey: z.array(z.string()).optional(),
  }),
});

export const TopAppealsValidation = {
  createTopAppealsSchema,
  updateTopAppealsSchema,
  updateTopAppealsContentSchema,
};
