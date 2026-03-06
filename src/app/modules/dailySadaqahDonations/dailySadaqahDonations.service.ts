import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { TTDailySadaqahDonations } from './dailySadaqahDonations.interface';
import { DailySadaqah } from '../dailySadaqah/dailySadaqah.model';
import { DailySadaqahDonations } from './dailySadaqahDonations.model';

const createDailySadaqahDonationsIntoDB = async (
  payload: TTDailySadaqahDonations,
  file?: Express.Multer.File,
) => {
  const { dailySadaqah } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.dailySadaqah = dailySadaqah;

    // 1️⃣ Check if daily sadaqah donations exists
    const isExists = await DailySadaqahDonations.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This daily sadaqah donations already exists');
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/dailySadaqah-donations/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create daily sadaqah donations inside transaction
    const created = await DailySadaqahDonations.create([payload], { session });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create daily sadaqah donations');
    }

    // 5️⃣ Push subcategory ID to Category
    const updateDailySadaqah = await DailySadaqah.findByIdAndUpdate(
      dailySadaqah,
      { $push: { donations: created[0]._id } },
      { new: true, session },
    );

    if (!updateDailySadaqah) {
      throw new AppError(404, 'Daily Sadaqah not found');
    }

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return created[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      500,
      error.message || 'Daily Sadaqah donations creation failed',
    );
  }
};

const getAllDailySadaqahDonationsFromDB = async (
  query: Record<string, unknown>,
) => {
  const dailySadaqahDonationsQuery = new QueryBuilder(
    DailySadaqahDonations.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'donationsType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await dailySadaqahDonationsQuery.countTotal();
  const result = await dailySadaqahDonationsQuery.modelQuery;

  return { meta, result };
};

const getDailySadaqahDonationsByIdFromDB = async (id: string) => {
  const result = await DailySadaqahDonations.findById(id);

  if (!result) {
    throw new AppError(404, 'This daily sadaqah donations not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This daily sadaqah donations has been deleted');
  }

  return result;
};

const updateDailySadaqahDonationsIntoDB = async (
  id: string,
  payload: Partial<TTDailySadaqahDonations>,
  file?: Express.Multer.File,
) => {
  const isDailySadaqahDonationsExists =
    await DailySadaqahDonations.findById(id);

  if (!isDailySadaqahDonationsExists) {
    throw new AppError(404, 'This daily sadaqah donations not exists');
  }

  if (isDailySadaqahDonationsExists.isDeleted) {
    throw new AppError(400, 'This daily sadaqah donations has been deleted');
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/dailySadaqah-donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isDailySadaqahDonationsExists.image) {
      await deleteFromS3(isDailySadaqahDonationsExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await DailySadaqahDonations.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError(400, 'Daily sadaqah donations update failed');
  }

  return updatedCategory;
};

const deleteDailySadaqahDonationsFromDB = async (id: string) => {
  const isDailySadaqahDonationsExists =
    await DailySadaqahDonations.findById(id);

  if (!isDailySadaqahDonationsExists) {
    throw new AppError(404, 'Daily sadaqah donations not found');
  }

  if (isDailySadaqahDonationsExists.isDeleted) {
    throw new AppError(400, 'Daily sadaqah donations is already deleted');
  }

  const result = await DailySadaqahDonations.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete daily sadaqah donations');
  }

  return result;
};

export const DailySadaqahDonationsService = {
  createDailySadaqahDonationsIntoDB,
  getAllDailySadaqahDonationsFromDB,
  getDailySadaqahDonationsByIdFromDB,
  updateDailySadaqahDonationsIntoDB,
  deleteDailySadaqahDonationsFromDB,
};
