import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { TSadaqahJariyahDonations } from './sadaqahJariyahDonations.interface';
import { SadaqahJariyah } from '../sadaqahJariyah/sadaqahJariyah.model';
import { SadaqahJariyahDonations } from './sadaqahJariyahDonations.model';

const createSadaqahJariyahDonationsIntoDB = async (
  payload: TSadaqahJariyahDonations,
  file?: Express.Multer.File,
) => {
  const { sadaqahJariyah } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.sadaqahJariyah = sadaqahJariyah;

    // 1️⃣ Check if sadaqah jariyah donations exists
    const isExists = await SadaqahJariyah.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This sadaqah jariyah donations already exists');
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/sadaqah-jariyah-donations/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create sadaqah jariyah donations inside transaction
    const created = await SadaqahJariyahDonations.create([payload], {
      session,
    });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create sadaqah jariyah donations');
    }

    // 5️⃣ Push subcategory ID to Category
    const updatedSadaqahJariyah = await SadaqahJariyah.findByIdAndUpdate(
      payload.sadaqahJariyah,
      { $push: { donations: created[0]._id } },
      { new: true, session },
    );

    if (!updatedSadaqahJariyah) {
      throw new AppError(404, 'Sadaqah Jariyah not found');
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

const getAllSadaqahJariyahDonationsFromDB = async (
  query: Record<string, unknown>,
) => {
  const sadaqahJariyahDonationsQuery = new QueryBuilder(
    SadaqahJariyahDonations.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'donationsType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await sadaqahJariyahDonationsQuery.countTotal();
  const result = await sadaqahJariyahDonationsQuery.modelQuery;

  return { meta, result };
};

const getSadaqahJariyahDonationsByIdFromDB = async (id: string) => {
  const result = await SadaqahJariyahDonations.findById(id);

  if (!result) {
    throw new AppError(404, 'This sadaqah jariyah donations not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This sadaqah jariyah donations has been deleted');
  }

  return result;
};

const updateSadaqahJariyahDonationsIntoDB = async (
  id: string,
  payload: Partial<TSadaqahJariyahDonations>,
  file?: Express.Multer.File,
) => {
  const isSadaqahJariyahDonationsExists =
    await SadaqahJariyahDonations.findById(id);

  if (!isSadaqahJariyahDonationsExists) {
    throw new AppError(404, 'This sadaqah jariyah donations not exists');
  }

  if (isSadaqahJariyahDonationsExists.isDeleted) {
    throw new AppError(400, 'This sadaqah jariyah donations has been deleted');
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/sadaqah-jariyah-donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isSadaqahJariyahDonationsExists.image) {
      await deleteFromS3(isSadaqahJariyahDonationsExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await SadaqahJariyahDonations.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError(400, 'Sadaqah Jariyah donations update failed');
  }

  return updatedCategory;
};

const deleteSadaqahJariyahDonationsFromDB = async (id: string) => {
  const isSadaqahJariyahDonationsExists =
    await SadaqahJariyahDonations.findById(id);

  if (!isSadaqahJariyahDonationsExists) {
    throw new AppError(404, 'Sadaqah Jariyah donations not found');
  }

  if (isSadaqahJariyahDonationsExists.isDeleted) {
    throw new AppError(400, 'Sadaqah Jariyah donations is already deleted');
  }

  const result = await SadaqahJariyahDonations.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete sadaqah jariyah donations');
  }

  return result;
};

export const SadaqahJariyahDonationsService = {
  createSadaqahJariyahDonationsIntoDB,
  getAllSadaqahJariyahDonationsFromDB,
  getSadaqahJariyahDonationsByIdFromDB,
  updateSadaqahJariyahDonationsIntoDB,
  deleteSadaqahJariyahDonationsFromDB,
};
