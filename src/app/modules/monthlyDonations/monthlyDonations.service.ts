import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { TMonthlyDonations } from './monthlyDonations.interface';
import { MonthlyDonations } from './monthlyDonations.model';
import { DonationsSubcategory } from '../monthlyDonationSubcategory/monthlyDonationSubcategory.model';

const createMonthlyDonationsIntoDB = async (
  payload: TMonthlyDonations,
  file?: Express.Multer.File,
) => {
  const { donationsSubcategory } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.donationsSubcategory = donationsSubcategory;

    // 1️⃣ Check if monthly donations exists
    const isExists = await MonthlyDonations.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This monthly donations already exists');
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/monthly-donations/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create monthly donations inside transaction
    const created = await MonthlyDonations.create([payload], { session });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create monthly donations');
    }

    // 5️⃣ Push subcategory ID to Category
    const updatedSubcategory = await DonationsSubcategory.findByIdAndUpdate(
      donationsSubcategory,
      { $push: { monthlyDonations: created[0]._id } },
      { new: true, session },
    );

    if (!updatedSubcategory) {
      throw new AppError(404, 'Donations Subcategory not found');
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
      error.message || 'Monthly donations creation failed',
    );
  }
};

const getAllMonthlyDonationsFromDB = async (query: Record<string, unknown>) => {
  const monthlyDonationsQuery = new QueryBuilder(
    MonthlyDonations.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'donationsType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await monthlyDonationsQuery.countTotal();
  const result = await monthlyDonationsQuery.modelQuery;

  return { meta, result };
};

const getMonthlyDonationsByIdFromDB = async (id: string) => {
  const result = await MonthlyDonations.findById(id);

  if (!result) {
    throw new AppError(404, 'This monthly donations not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This monthly donations has been deleted');
  }

  return result;
};

const updateMonthlyDonationsIntoDB = async (
  id: string,
  payload: Partial<TMonthlyDonations>,
  file?: Express.Multer.File,
) => {
  const isMonthlyDonationsExists = await MonthlyDonations.findById(id);

  if (!isMonthlyDonationsExists) {
    throw new AppError(404, 'This monthly donations not exists');
  }

  if (isMonthlyDonationsExists.isDeleted) {
    throw new AppError(400, 'This monthly donations has been deleted');
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/monthly-donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isMonthlyDonationsExists.image) {
      await deleteFromS3(isMonthlyDonationsExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await MonthlyDonations.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError(400, 'Monthly donations update failed');
  }

  return updatedCategory;
};

const deleteMonthlyDonationsFromDB = async (id: string) => {
  const isMonthlyDonationsExists = await MonthlyDonations.findById(id);

  if (!isMonthlyDonationsExists) {
    throw new AppError(404, 'Monthly donations not found');
  }

  if (isMonthlyDonationsExists.isDeleted) {
    throw new AppError(400, 'Monthly donations is already deleted');
  }

  const result = await MonthlyDonations.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete monthly donations');
  }

  return result;
};

export const MonthlyDonationsService = {
  createMonthlyDonationsIntoDB,
  getAllMonthlyDonationsFromDB,
  getMonthlyDonationsByIdFromDB,
  updateMonthlyDonationsIntoDB,
  deleteMonthlyDonationsFromDB,
};
