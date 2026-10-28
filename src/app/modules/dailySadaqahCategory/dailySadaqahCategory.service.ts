import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import { TDailySadaqahCategory } from './dailySadaqahCategory.interface';
import { DailySadaqahCategory } from './dailySadaqahCategory.model';

const createDailySadaqahCategoryIntoDB = async (
  payload: Pick<TDailySadaqahCategory, 'name'>,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new AppError(400, 'Category icon is required');
  }

  const name = payload.name.trim();
  const existing = await DailySadaqahCategory.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      $options: 'i',
    },
    isDeleted: false,
  });
  if (existing) {
    throw new AppError(409, `${name} category already exists`);
  }

  let uploadedUrl: string | undefined;

  uploadedUrl = (await uploadToS3({
    file,
    fileName: `images/daily-sadaqah/category/${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`,
  })) as string;

  const result = await DailySadaqahCategory.create({
    name,
    icon: uploadedUrl,
  });

  if (!result) {
    throw new AppError(400, 'Failed to create daily sadaqah category');
  }

  return result;
};

const getAllDailySadaqahCategoryFromDB = async () => {
  const result = await DailySadaqahCategory.find({ isDeleted: false });

  return result;
};

const getDailySadaqahCategoryByIdFromDB = async (id: string) => {
  const result = await DailySadaqahCategory.findById(id);

  if (!result) {
    throw new AppError(404, 'This daily sadaqah category not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This daily sadaqah category has been deleted');
  }

  return result;
};

const updateDailySadaqahCategoryIntoDB = async (
  id: string,
  payload: Partial<TDailySadaqahCategory>,
  file?: Express.Multer.File,
) => {
  // 🔍 Step 1: Check if category exists
  const existingCategory = await DailySadaqahCategory.findById(id).select(
    'name icon isDeleted',
  );
  if (!existingCategory) {
    throw new AppError(404, 'Daily sadaqah category not found');
  }
  if (existingCategory.isDeleted) {
    throw new AppError(400, 'This daily sadaqah category has been deleted');
  }

  // 🔍 Step 2: Check duplicate name
  if (payload.name) {
    payload.name = payload.name.trim();
    const duplicate = await DailySadaqahCategory.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${payload.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
      isDeleted: false,
    });
    if (duplicate) {
      throw new AppError(409, `${payload.name} category already exists`);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 📸 Step 3: Handle icon upload
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/daily-sadaqah/category/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });

      // 🧹 Delete old icon if exists
      if (existingCategory.icon) {
        await deleteFromS3(existingCategory.icon);
      }

      payload.icon = uploadedUrl as string;
    }

    // 📝 Step 4: Update category
    const updatedCategory = await DailySadaqahCategory.findByIdAndUpdate(
      id,
      { $set: { ...payload } },
      { new: true, runValidators: true, session },
    );
    if (!updatedCategory) {
      throw new AppError(400, 'Failed to update daily sadaqah category');
    }

    await session.commitTransaction();
    session.endSession();

    return updatedCategory;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      error.statusCode || 500,
      error.message || 'Daily sadaqah category update failed',
    );
  }
};

const deleteDailySadaqahCategoryFromDB = async (id: string) => {
  const isCategoryExists = await DailySadaqahCategory.findById(id);

  if (!isCategoryExists) {
    throw new AppError(404, 'This daily sadaqah category not exists');
  }

  if (isCategoryExists.isDeleted) {
    throw new AppError(400, 'This daily sadaqah category has been deleted');
  }

  const result = await DailySadaqahCategory.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete daily sadaqah category');
  }

  return result;
};

export const DailySadaqahCategoryServices = {
  createDailySadaqahCategoryIntoDB,
  getAllDailySadaqahCategoryFromDB,
  getDailySadaqahCategoryByIdFromDB,
  updateDailySadaqahCategoryIntoDB,
  deleteDailySadaqahCategoryFromDB,
};
