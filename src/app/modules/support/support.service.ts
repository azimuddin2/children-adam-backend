import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { supportSearchableFields } from './support.constant';
import { TSupport } from './support.interface';
import { Support } from './support.modal';

const createSupportIntoDB = async (payload: TSupport) => {
  const result = await Support.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to support message');
  }

  return result;
};

const getAllSupportFromDB = async (query: Record<string, unknown>) => {
  const supportQuery = new QueryBuilder(
    Support.find({ isDeleted: false }),
    query,
  )
    .search(supportSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await supportQuery.countTotal();
  const result = await supportQuery.modelQuery;

  return { meta, result };
};

const getSupportByIdFromDB = async (id: string) => {
  const result = await Support.findById(id);

  if (!result) {
    throw new AppError(404, 'This support message not found');
  }

  if (result.isDeleted === true) {
    throw new AppError(400, 'This support has been deleted');
  }

  return result;
};

const adminSupportMessageReplyIntoDB = async (
  id: string,
  payload: Partial<TSupport>,
) => {
  const isSupportExists = await Support.findById(id);

  if (!isSupportExists) {
    throw new AppError(404, 'This support message does not exist');
  }

  if (isSupportExists.isDeleted) {
    throw new AppError(400, 'This support message has already been deleted');
  }

  // ✅ Update reply
  const updatedSupport = await Support.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedSupport) {
    throw new AppError(400, 'Support message reply failed');
  }

  // ✅ Send personalized reply email to user
  if (payload.messageReply) {
    await sendEmail(
      isSupportExists.email,
      `Reply from Support Team - Ticket #${isSupportExists._id.toString().slice(-6)}`, // subject line
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Support Reply</title>
      </head>
      <body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial, sans-serif;">
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td>
              <h2 style="color:#007BFF;margin:0 0 15px 0;">Hello ${isSupportExists.firstName},</h2>
              <p style="font-size:15px;color:#333;margin-bottom:20px;">
                Thank you for contacting our support team. Here’s the update regarding your request:
              </p>

              <p style="font-size:14px;color:#666;margin:0;"><strong>Your Message:</strong></p>
              <blockquote style="border-left:4px solid #007BFF;margin:10px 0;padding-left:10px;color:#444;">
                ${isSupportExists.message}
              </blockquote>

              <p style="font-size:14px;color:#666;margin:0;"><strong>Admin Reply:</strong></p>
              <blockquote style="border-left:4px solid #28a745;margin:10px 0;padding-left:10px;color:#222;">
                ${payload.messageReply}
              </blockquote>

              <p style="font-size:14px;color:#444;margin-top:20px;">
                If you have any further questions, simply reply to this email — we’ll be happy to help.
              </p>

              <p style="margin-top:30px;font-size:13px;color:#999;">
                Best Regards,<br/>
                <strong>Support Team</strong><br/>
                BraidNYC
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    );
  }

  return updatedSupport;
};

const deleteSupportFromDB = async (id: string) => {
  const isSupportExists = await Support.findById(id);

  if (!isSupportExists) {
    throw new AppError(404, 'Support message not found');
  }

  const result = await Support.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(400, 'Failed to delete support message');
  }

  return result;
};

export const SupportServices = {
  createSupportIntoDB,
  getAllSupportFromDB,
  getSupportByIdFromDB,
  adminSupportMessageReplyIntoDB,
  deleteSupportFromDB,
};
