import moment from 'moment';
import config from '../../config';
import AppError from '../../errors/AppError';
import { verifyToken } from '../../utils/verifyToken';
import { User } from '../user/user.model';
import { TJwtPayload } from '../auth/auth.interface';
import { TVerifyOtp } from './otp.interface';
import { createToken } from '../auth/auth.utils';
import { generateOtp } from '../../utils/generateOtp';
import jwt, { Secret } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../../utils/sendEmail';

const verifyOtp = async (token: string, otp: TVerifyOtp) => {
  if (!token) {
    throw new AppError(401, 'You are not authorized! Please Login.');
  }

  const decoded = verifyToken(token, config.jwt_access_secret as string);

  const { email } = decoded;

  const user = await User.findOne({ email: email }).select(
    'verification isVerified role email',
  );

  if (!user) {
    throw new AppError(404, 'This user is not found!');
  }

  if (user?.isDeleted === true) {
    throw new AppError(403, 'This user account is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(403, 'This user is blocked!');
  }

  const verifyExpiresAt = user?.verification?.expiresAt;
  if (new Date() > verifyExpiresAt) {
    throw new AppError(400, 'Otp has expired. Please resend it');
  }

  const verifyOtpCode = Number(user?.verification?.otp);
  if (Number(otp) !== verifyOtpCode) {
    throw new AppError(400, 'Otp did not match');
  }

  await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        isVerified: user?.isVerified === false ? true : user?.isVerified,
        verification: {
          otp: 0,
          expiresAt: moment().add(3, 'minute'),
          status: true,
        },
      },
    },
    { new: true },
  );

  // create token and sent to the client
  const jwtPayload: TJwtPayload = {
    userId: user._id.toString(),
    email: user?.email,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { token: accessToken };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email }).select(
    '_id email name verification',
  );

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Optional: prevent resending if already verified
  if (user.verification?.status === true) {
    throw new AppError(400, 'Account already verified');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(3, 'minutes').toDate();

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      verification: {
        otp,
        expiresAt,
        status: false,
      },
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(500, 'Failed to resend OTP');
  }

  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
    },
    config.jwt_access_secret as Secret,
    { expiresIn: '3m' },
  );

  const otpEmailPath = path.join(process.cwd(), 'public/view/otp_mail.html');

  const emailTemplate = fs
    .readFileSync(otpEmailPath, 'utf8')
    .replace('{{fullName}}', user.fullName)
    .replace('{{otpCode}}', otp)
    .replace('{{email}}', user.email)
    .replace(
      '{{verifyUrl}}',
      `${config.server_url}/otp/verify-link?token=${token}`,
    );

  await sendEmail(user.email, 'Your One Time OTP', emailTemplate);

  return {
    token,
    expiresIn: '3 minutes',
  };
};

export const OtpServices = {
  verifyOtp,
  resendOtp,
};
