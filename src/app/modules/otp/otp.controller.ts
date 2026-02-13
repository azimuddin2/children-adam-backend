import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OtpServices } from './otp.service';

const handleVerifyOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req?.headers?.authorization as string;
  const otp = req.body.otp;

  const result = await OtpServices.verifyOtp(token, otp);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account verified successfully',
    data: result,
  });
});

const handleResendOtp = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email as string;
  const result = await OtpServices.resendOtp(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully. Please check your email',
    data: result,
  });
});

export const OtpControllers = {
  handleVerifyOtp,
  handleResendOtp,
};
