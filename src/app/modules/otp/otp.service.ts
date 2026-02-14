import moment from 'moment';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TJwtPayload } from '../auth/auth.interface';
import { TVerifyOtp } from './otp.interface';
import { verifyToken } from '../../utils/verifyToken';
import { generateOtp } from '../../utils/generateOtp';
import { sendEmail } from '../../utils/sendEmail';
import { createToken } from '../auth/auth.utils';

const verifyOtp = async (token: string, otp: TVerifyOtp) => {
  if (!token) {
    throw new AppError(401, 'You are not authorized! Please Login.');
  }

  const decoded = verifyToken(token, config.jwt_access_secret as string);

  const { email } = decoded;

  const user = await User.findOne({ email: email }).select(
    'fullName email verification isVerified role',
  );

  if (!user) {
    throw new AppError(404, 'This user is not found!');
  }

  if (user?.isDeleted === true) {
    throw new AppError(403, 'This user is deleted!');
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

  const updateUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        status: 'confirmed',
        isVerified: user?.isVerified === false ? true : user?.isVerified,
        verification: {
          otp: 0,
          expiresAt: moment().add(3, 'minute'),
          status: true,
        },
      },
    },
    { new: true },
  ).select('_id fullName email role isVerified status');

  // create token and sent to the client
  const jwtPayload: TJwtPayload = {
    userId: user._id,
    name: user.fullName,
    email: user.email,
    role: user.role,
  };

  const jwtToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '5m',
  );

  return { user: updateUser, token: jwtToken };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, 'This user is not found!');
  }

  if (user?.isDeleted === true) {
    throw new AppError(403, 'This user account is deleted!');
  }

  if (user?.status === 'blocked') {
    throw new AppError(403, 'This user is blocked!');
  }

  // Generate new OTP
  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minutes').toDate();

  const updateOtp = await User.findByIdAndUpdate(user?._id, {
    $set: {
      verification: {
        otp,
        expiresAt,
        status: false,
      },
    },
  });

  if (!updateOtp) {
    throw new AppError(400, 'Failed to resend otp. Please try again later');
  }

  const jwtPayload: TJwtPayload = {
    userId: user._id,
    name: user.fullName,
    email: user.email,
    role: user.role,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '5m',
  );

  await sendEmail(
    user.email,
    'Your OTP Code for Email Verification',
    `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <h2 style="color: #EA6919; margin: 0;">Email Verification</h2>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; color: #333333; padding-bottom: 20px; text-align: center;">
                    <p style="margin: 0;">Hello <strong>${user.fullName}</strong>,</p>
                    <p style="margin: 5px 0 0;">Use the OTP below to verify your email and complete your registration:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #EA6919; border-radius: 6px; letter-spacing: 2px;">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #666666; text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0;">This OTP is valid for <strong>5 minutes</strong> (expires at <strong>${expiresAt.toLocaleTimeString()}</strong>).</p>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #999999; text-align: center;">
                    <p style="margin: 0;">If you did not request this OTP, please ignore this email. No action is required.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px; text-align: center;">
                    <p style="font-size: 12px; color: #cccccc; margin: 0;">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
  );

  return { token };
};

export const OtpServices = {
  verifyOtp,
  resendOtp,
};
