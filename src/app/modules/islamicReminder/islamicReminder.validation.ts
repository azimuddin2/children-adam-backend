import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (value: string) => {
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(value);
};

const dateField = z
  .string({ required_error: 'Date is required' })
  .regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format')
  .refine(isRealDate, 'Invalid calendar date');

const createIslamicReminderValidationSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Text is required' })
      .trim()
      .min(1, 'Text cannot be empty'),
    reference: z
      .string({ required_error: 'Reference is required' })
      .trim()
      .min(1, 'Reference cannot be empty'),
    date: dateField,
  }),
});

const updateIslamicReminderValidationSchema = z.object({
  body: z
    .object({
      text: z.string().trim().min(1, 'Text cannot be empty').optional(),
      reference: z
        .string()
        .trim()
        .min(1, 'Reference cannot be empty')
        .optional(),
      date: dateField.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required to update',
    }),
});

const getTodayIslamicReminderValidationSchema = z.object({
  query: z.object({
    date: dateField.optional(),
    timeZone: z.string().trim().min(1).optional(),
  }),
});

export const IslamicReminderValidations = {
  createIslamicReminderValidationSchema,
  updateIslamicReminderValidationSchema,
  getTodayIslamicReminderValidationSchema,
};
