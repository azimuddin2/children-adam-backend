import AppError from '../../errors/AppError';
import { TPrivacy } from './privacy.interface';
import { Privacy } from './privacy.model';

const getPrivacyFromDB = async () => {
  const result = await Privacy.findOne({ isDeleted: false });
  if (!result) {
    throw new AppError(404, 'No active privacy policy is currently available.');
  }
  return result;
};

const upsertPrivacyIntoDB = async (payload: TPrivacy) => {
  const result = await Privacy.findOneAndUpdate(
    {},
    { ...payload, isDeleted: false },
    { new: true, upsert: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to save privacy');
  }
  return result;
};

const deletePrivacyFromDB = async () => {
  const isPrivacyExists = await Privacy.findOne();
  if (!isPrivacyExists) {
    throw new AppError(404, 'Privacy not found');
  }

  const result = await Privacy.findOneAndUpdate(
    {},
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete privacy');
  }

  return result;
};

export const PrivacyServices = {
  getPrivacyFromDB,
  upsertPrivacyIntoDB,
  deletePrivacyFromDB,
};
