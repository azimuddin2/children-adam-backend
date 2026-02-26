import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { TTopAppealsDonations } from './topAppealsDonations.interface';
import { TopAppealsDonations } from './topAppealsDonations.model';
import { TopAppeals } from '../topAppeals/topAppeals.model';

const createTopAppealsDonationsIntoDB = async (
  payload: TTopAppealsDonations,
  file?: Express.Multer.File,
) => {
  const { topAppeals } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.topAppeals = topAppeals;

    // 1️⃣ Check if top appeals donations exists
    const isExists = await TopAppealsDonations.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This top appeals donations already exists');
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/topAppeals-donations/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create top appeals donations inside transaction
    const created = await TopAppealsDonations.create([payload], { session });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create top appeals donations');
    }

    // 5️⃣ Push subcategory ID to Category
    const updatedSubcategory = await TopAppeals.findByIdAndUpdate(
      topAppeals,
      { $push: { donations: created[0]._id } },
      { new: true, session },
    );

    if (!updatedSubcategory) {
      throw new AppError(404, 'Top Appeals not found');
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
      error.message || 'Top Appeals donations creation failed',
    );
  }
};

const getAllTopAppealsDonationsFromDB = async (
  query: Record<string, unknown>,
) => {
  const topAppealsDonationsQuery = new QueryBuilder(
    TopAppealsDonations.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'donationsType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await topAppealsDonationsQuery.countTotal();
  const result = await topAppealsDonationsQuery.modelQuery;

  return { meta, result };
};

const getTopAppealsDonationsByIdFromDB = async (id: string) => {
  const result = await TopAppealsDonations.findById(id);

  if (!result) {
    throw new AppError(404, 'This top appeals donations not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This top appeals donations has been deleted');
  }

  return result;
};

const updateTopAppealsDonationsIntoDB = async (
  id: string,
  payload: Partial<TTopAppealsDonations>,
  file?: Express.Multer.File,
) => {
  const isTopAppealsDonationsExists = await TopAppealsDonations.findById(id);

  if (!isTopAppealsDonationsExists) {
    throw new AppError(404, 'This top appeals donations not exists');
  }

  if (isTopAppealsDonationsExists.isDeleted) {
    throw new AppError(400, 'This top appeals donations has been deleted');
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/topAppeals-donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isTopAppealsDonationsExists.image) {
      await deleteFromS3(isTopAppealsDonationsExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await TopAppealsDonations.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError(400, 'Top appeals donations update failed');
  }

  return updatedCategory;
};

const deleteTopAppealsDonationsFromDB = async (id: string) => {
  const isTopAppealsDonationsExists = await TopAppealsDonations.findById(id);

  if (!isTopAppealsDonationsExists) {
    throw new AppError(404, 'Top appeals donations not found');
  }

  if (isTopAppealsDonationsExists.isDeleted) {
    throw new AppError(400, 'Top appeals donations is already deleted');
  }

  const result = await TopAppealsDonations.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete top appeals donations');
  }

  return result;
};

export const TopAppealsDonationsService = {
  createTopAppealsDonationsIntoDB,
  getAllTopAppealsDonationsFromDB,
  getTopAppealsDonationsByIdFromDB,
  updateTopAppealsDonationsIntoDB,
  deleteTopAppealsDonationsFromDB,
};
