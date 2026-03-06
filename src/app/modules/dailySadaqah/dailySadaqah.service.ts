import AppError from '../../errors/AppError';
import { TDailySadaqah } from './dailySadaqah.interface';
import { DailySadaqah } from './dailySadaqah.model';

const createDailySadaqahIntoDB = async (payload: TDailySadaqah) => {
  const existing = await DailySadaqah.findOne({ isDeleted: false });

  if (existing) {
    throw new AppError(400, 'Daily Sadaqah already created');
  }

  const result = await DailySadaqah.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create daily sadaqah');
  }

  return result;
};

const getAllDailySadaqahFromDB = async () => {
  const result = await DailySadaqah.find({ isDeleted: false })
    .populate({
      path: 'donations',
      match: { isDeleted: false },
      select: '-__v -dailySadaqah',
    })
    .select('-__v')
    .sort({ createdAt: -1 });

  return result;
};

const getDailySadaqahByIdFromDB = async (id: string) => {
  const result = await DailySadaqah.findById(id).populate({
    path: 'donations',
    match: { isDeleted: false },
  });

  if (!result) {
    throw new AppError(404, 'This daily sadaqah not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This daily sadaqah has been deleted');
  }

  return result;
};

const updateDailySadaqahIntoDB = async (
  id: string,
  payload: Partial<TDailySadaqah>,
) => {
  const isDailySadaqahExists = await DailySadaqah.findById(id);

  if (!isDailySadaqahExists) {
    throw new AppError(404, 'This daily sadaqah not exists');
  }

  if (isDailySadaqahExists.isDeleted) {
    throw new AppError(400, 'This daily sadaqah has been deleted');
  }

  const updatedDailySadaqah = await DailySadaqah.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedDailySadaqah) {
    throw new AppError(400, 'Daily sadaqah update failed');
  }

  return updatedDailySadaqah;
};

const deleteDailySadaqahFromDB = async (id: string) => {
  const isDailySadaqahExists = await DailySadaqah.findById(id);

  if (!isDailySadaqahExists) {
    throw new AppError(404, 'This daily sadaqah not exists');
  }

  if (isDailySadaqahExists.isDeleted) {
    throw new AppError(400, 'This daily sadaqah has been deleted');
  }

  const result = await DailySadaqah.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete daily sadaqah');
  }

  return result;
};

export const DailySadaqahServices = {
  createDailySadaqahIntoDB,
  getAllDailySadaqahFromDB,
  getDailySadaqahByIdFromDB,
  updateDailySadaqahIntoDB,
  deleteDailySadaqahFromDB,
};
