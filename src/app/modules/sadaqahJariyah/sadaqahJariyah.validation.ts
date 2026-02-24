import { z } from 'zod';

const createSadaqahJariyahValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
  }),
});

const updateSadaqahJariyahValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .optional(),
    description: z
      .string({
        required_error: 'Description is required',
      })
      .optional(),
  }),
});

export const SadaqahJariyahValidation = {
  createSadaqahJariyahValidationSchema,
  updateSadaqahJariyahValidationSchema,
};
