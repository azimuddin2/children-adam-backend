import { z } from 'zod';

const verifyOtpValidationSchema = z.object({
  body: z.object({
    otp: z
      .string({
        required_error: 'OTP is required',
      })
      .min(6, 'OTP must be at least 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
  }),
});

export const OtpValidations = {
  verifyOtpValidationSchema,
};
