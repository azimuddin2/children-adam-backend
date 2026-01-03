import { Twilio } from 'twilio';
import config from '../config';

// Twilio client
const client = new Twilio(
  config.twilio_account_sid as string,
  config.twilio_auth_token as string,
);

export const sendPhoneOTP = async (phoneNumber: string) => {
  try {
    const verification = await client.verify.v2
      .services(config.twilio_verify_sid!)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    return {
      success: true,
      status: verification.status,
      sid: verification.sid,
      message: 'OTP sent successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send OTP',
    };
  }
};

export const verifyPhoneOTP = async (phoneNumber: string, code: string) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(config.twilio_verify_sid!)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
      message:
        verificationCheck.status === 'approved'
          ? 'OTP verified successfully'
          : 'Invalid or expired OTP',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify OTP',
    };
  }
};
