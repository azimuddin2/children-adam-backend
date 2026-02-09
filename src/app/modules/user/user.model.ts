import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { TUser, UserModel } from './user.interface';
import { Gender, Login_With, UserRole, UserStatus } from './user.constant';

const userSchema = new Schema<TUser, UserModel>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [50, 'Full name can not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(v);
        },
        message: 'Invalid email address',
      },
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
      default: undefined,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // maxlength: [20, 'Password must not exceed 20 characters'],
    },
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
    passwordChangeAt: {
      type: Date,
    },
    gender: {
      type: String,
      enum: {
        values: Gender,
        message: '{VALUE} is not valid',
      },
      trim: true,
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: UserRole,
        message: '{VALUE} is not valid',
      },
      default: 'user',
    },
    status: {
      type: String,
      enum: {
        values: UserStatus,
        message: '{VALUE} is not valid',
      },
      default: 'ongoing',
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verification: {
      otp: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },

    loginWith: {
      type: String,
      enum: Login_With,
      default: Login_With.credentials,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Password hash before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

// ✅ Clear sensitive data after saving
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// ✅ Static methods
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  if (!passwordChangedTimestamp) return false;
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000; // convert to seconds
  return passwordChangedTime > jwtIssuedTimestamp;
};

// ✅ Export model
export const User = model<TUser, UserModel>('User', userSchema);
