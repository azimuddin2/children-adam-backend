import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { TPromotion } from './promotion.interface';
import { Promotion } from './promotion.model';

const createPromotionIntoDB = async (payload: TPromotion) => {
  const existingUsers = await User.find({
    _id: { $in: payload.recipients },
    isDeleted: false,
  }).select('email fullName');

  if (!existingUsers || existingUsers.length === 0) {
    throw new Error('No valid users found for the selected user IDs.');
  }

  if (existingUsers.length !== payload.recipients.length) {
    console.warn('Some user IDs provided do not exist in the database.');
  }

  const validRecipientIds = existingUsers.map((user) => user._id);

  const result = await Promotion.create({
    ...payload,
    recipients: validRecipientIds,
  });

  if (!result) {
    throw new Error('Failed to save promotion in database');
  }

  const emailPromises = existingUsers.map((user) => {
    return sendEmail(
      user.email,
      payload.title,
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Promotion</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
                <tr>
                  <td align="left" style="padding-bottom: 25px;">
                    <h1 style="color: #EA6919; font-size: 24px; margin: 0; border-left: 4px solid #EA6919; padding-left: 15px;">
                      ${payload.title}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; line-height: 1.8; color: #444; padding-bottom: 20px;">
                    <p style="margin: 0; font-weight: bold; color: #000;">Assalamu Alaikum ${user.fullName},</p>
                    <p style="margin: 15px 0 0 0;">
                       ${payload.message}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="https://yourwebsite.com" target="_blank" style="display: inline-block; padding: 14px 35px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #EA6919; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 6px rgba(234, 105, 25, 0.3);">
                      Visit Our Website
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px; border-top: 1px solid #eeeeee; text-align: center;">
                    <p style="font-size: 12px; color: #888888; margin: 0;">
                      You received this email because you are a valued member of <strong>Children of Adam</strong>.
                    </p>
                    <p style="font-size: 12px; color: #aaaaaa; margin: 10px 0 0 0;">
                      &copy; ${new Date().getFullYear()} Children of Adam. All rights reserved.
                    </p>
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
  });

  await Promise.all(emailPromises);
  return result;
};

export const PromotionService = {
  createPromotionIntoDB,
};
