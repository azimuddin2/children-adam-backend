import { z } from 'zod';
import { UserRole, UserStatus } from './user.constant';

// ✅ Register (Create) User Validation Schema
const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Full name is required',
        invalid_type_error: 'Full name must be a string',
      })
      .min(3, 'Full name must be at least 3 characters')
      .max(50, 'Full name cannot exceed 50 characters'),

    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),

    address: z
      .string({
        required_error: 'Street address is required',
      })
      .min(3, 'Street address must be at least 3 characters'),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*]/,
        'Password must contain at least one special character',
      ),

    role: z.enum([...UserRole] as [string, ...string[]]).default('user'),

    status: z.enum([...UserStatus] as [string, ...string[]]).default('ongoing'),

    image: z.string().optional(),

    isDeleted: z.boolean().optional().default(false),

    isVerified: z.boolean().optional().default(false),

    verification: z
      .object({
        otp: z.string().optional(),
        expiresAt: z.date().optional(),
        status: z.boolean().optional(),
      })
      .optional(),

    stripeCustomerId: z.string().optional(),
  }),
});

// ✅ Update User Validation Schema
const updateUserValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(50, 'Full name cannot exceed 50 characters')
      .optional(),

    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number')
      .optional(),

    email: z.string().email('Invalid email address').optional(),

    streetAddress: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),

    role: z.enum([...UserRole] as [string, ...string[]]).optional(),
    status: z.enum([...UserStatus] as [string, ...string[]]).optional(),

    image: z.string().optional(),
    isDeleted: z.boolean().optional(),
    isVerified: z.boolean().optional(),

    verification: z
      .object({
        otp: z.string().optional(),
        expiresAt: z.date().optional(),
        status: z.boolean().optional(),
      })
      .optional(),

    stripeCustomerId: z.string().optional(),
  }),
});

const createCustomerByAdminSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Full name is required',
        invalid_type_error: 'Full name must be a string',
      })
      .min(3, 'Full name must be at least 3 characters')
      .max(50, 'Full name cannot exceed 50 characters'),

    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
  }),
});

// ✅ Change User Status Validation
const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]], {
      required_error: 'Status is required',
    }),
  }),
});

const notificationSettingsValidationSchema = z.object({
  body: z.object({
    notifications: z.boolean({
      required_error: 'Notifications setting is required',
      invalid_type_error: 'Notifications must be true or false',
    }),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
  createCustomerByAdminSchema,
  changeStatusValidationSchema,
  notificationSettingsValidationSchema,
};
