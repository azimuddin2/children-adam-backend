import { z } from 'zod';

const createSupportValidationSchema = z.object({
  body: z.object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(1, 'First name cannot be empty'),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(1, 'Last name cannot be empty'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    phone: z.string({ required_error: 'Phone is required' }),
    message: z
      .string({ required_error: 'Message is required' })
      .min(1, 'Message cannot be empty'),

    isDeleted: z.boolean().optional().default(false),
  }),
});

const replyAdminSupportValidationSchema = z.object({
  body: z.object({
    messageReply: z.string({ required_error: 'Message Reply is required' }),
  }),
});

export const SupportValidations = {
  createSupportValidationSchema,
  replyAdminSupportValidationSchema,
};
