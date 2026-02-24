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

const updateSadaqahJariyahContentValidationSchema = z.object({
  body: z.object({
    fullDescription: z.string({
      required_error: 'Full Description is required',
    }),
    deleteKey: z.array(z.string()).optional(),
  }),
});

export const SadaqahJariyahValidation = {
  createSadaqahJariyahValidationSchema,
  updateSadaqahJariyahValidationSchema,
  updateSadaqahJariyahContentValidationSchema,
};
