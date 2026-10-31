import { ClientSession } from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DailySadaqahDonations } from '../dailySadaqahDonations/dailySadaqahDonations.model';

export const generateTrxId = () => {
  const prefix = 'trx_';
  const randomString =
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12);
  return prefix + randomString;
};

const completeDailySadaqah = async (id: string, session: ClientSession) => {
  const donation = await DailySadaqahDonations.findById(id).session(session);
  if (!donation) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Daily sadaqah donation not found',
    );
  }

  if (donation.status === 'completed') return;

  donation.status = 'completed';
  await donation.save({ session });
};

const failDailySadaqah = async (id: string, session: ClientSession) => {
  await DailySadaqahDonations.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { status: 'failed' },
    { session },
  );
};

export const syncDonationStatus = async (
  order: any,
  result: 'completed' | 'failed',
  session: ClientSession,
) => {
  const items: any[] = order?.items ?? [];

  for (const item of items) {
    if (!item.donationId) continue;

    if (item.donationModel === 'DailySadaqahDonation') {
      const id = item.donationId.toString();
      if (result === 'completed') {
        await completeDailySadaqah(id, session);
      } else {
        await failDailySadaqah(id, session);
      }
    }
  }
};
