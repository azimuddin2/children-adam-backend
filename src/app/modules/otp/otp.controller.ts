import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OtpServices } from './otp.service';

const handleVerifyOtp = catchAsync(async (req, res) => {
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

// const handleRendOtp = catchAsync(async (req, res) => {
//   const result = await OtpServices.resendOtp(req.body);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: result.message,
//     data: { userId: result.userId },
//   });
// });

export const OtpControllers = {
  handleVerifyOtp,
};
