import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import {
  deleteFromS3,
  deleteManyFromS3,
  uploadManyToS3,
  uploadToS3,
} from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { UploadedFiles } from '../../interface/common.interface';
import { TopAppeals } from './topAppeals.model';
import { TopAppealsCategory } from '../topAppealsCategory/topAppealsCategory.model';
import { TImage, TTopAppeals } from './topAppeals.interface';
import { topAppealsSearchableFields } from './topAppeals.constant';

const createTopAppealsIntoDB = async (
  payload: TTopAppeals,
  file?: Express.Multer.File,
) => {
  const { topAppealsCategory } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.topAppealsCategory = topAppealsCategory;

    // 1️⃣ Check if  top appeals exists
    const isExists = await TopAppeals.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This top appeals already exists');
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/appeals/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create top appeals inside transaction
    const created = await TopAppeals.create([payload], { session });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create top appeals');
    }

    // 5️⃣ Push subcategory ID to Category
    const updatedCategory = await TopAppealsCategory.findByIdAndUpdate(
      topAppealsCategory,
      { $push: { topAppeals: created[0]._id } },
      { new: true, session },
    );

    if (!updatedCategory) {
      throw new AppError(404, 'Top Appeals Category not found');
    }

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return created[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(500, error.message || 'Top appeals creation failed');
  }
};

const getAllTopAppealsFromDB = async (query: Record<string, unknown>) => {
  const topAppealsQuery = new QueryBuilder(
    TopAppeals.find({ isDeleted: false })
      .populate({
        path: 'topAppealsCategory',
        match: { isDeleted: false },
      })
      .populate({
        path: 'donations',
        match: { isDeleted: false },
      }),
    query,
  )
    .search(topAppealsSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await topAppealsQuery.countTotal();
  const result = await topAppealsQuery.modelQuery;

  return { meta, result };
};

const getTopAppealsByIdFromDB = async (id: string) => {
  const result = await TopAppeals.findById(id)
    .populate({
      path: 'topAppealsCategory',
      match: { isDeleted: false },
    })
    .populate({
      path: 'donations',
      match: { isDeleted: false },
    });

  if (!result) {
    throw new AppError(404, 'This top appeals not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This top appeals has been deleted');
  }

  return result;
};

const updateTopAppealsIntoDB = async (
  id: string,
  payload: Partial<TTopAppeals>,
  file?: Express.Multer.File,
) => {
  const isTopAppealsExists = await TopAppeals.findById(id);

  if (!isTopAppealsExists) {
    throw new AppError(404, 'This top appeals not exists');
  }

  if (isTopAppealsExists.isDeleted) {
    throw new AppError(400, 'This top appeals has been deleted');
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isTopAppealsExists.image) {
      await deleteFromS3(isTopAppealsExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await TopAppeals.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedCategory) {
    throw new AppError(400, 'Top appeals update failed');
  }

  return updatedCategory;
};

const updateTopAppealsContentIntoDB = async (
  id: string,
  payload: Partial<TTopAppeals>,
  files: any,
) => {
  // 1. Check if top appeals exists
  const isTopAppealsExists = await TopAppeals.findById(id);
  if (!isTopAppealsExists) {
    throw new AppError(404, 'This top appeals not exists');
  }

  if (isTopAppealsExists.isDeleted) {
    throw new AppError(400, 'This top appeals has been deleted');
  }

  // 2. Parse deleteKey if coming as string (FormData)
  if (typeof payload.deleteKey === 'string') {
    try {
      payload.deleteKey = JSON.parse(payload.deleteKey);
    } catch {
      throw new AppError(400, 'Invalid deleteKey format');
    }
  }

  const { deleteKey, images, ...updateData } = payload;

  // 3. Upload new images to S3
  let uploadedImages: TImage[] = [];
  if (files) {
    const { images: imageFiles } = files as UploadedFiles;

    if (Array.isArray(imageFiles) && imageFiles.length > 0) {
      const imgsArray = imageFiles.map((image) => ({
        file: image,
        path: `images/appeals/gallery`,
      }));

      try {
        uploadedImages = await uploadManyToS3(imgsArray);
      } catch {
        throw new AppError(500, 'Image upload failed');
      }
    }
  }

  // 4. Delete images from S3 and remove from document
  if (Array.isArray(deleteKey) && deleteKey.length > 0) {
    const keysToDelete = deleteKey.map(
      (key: string) => `images/appeals/gallery/${key}`,
    );

    await deleteManyFromS3(keysToDelete);

    await TopAppeals.findByIdAndUpdate(
      id,
      { $pull: { images: { key: { $in: deleteKey } } } },
      { new: true },
    );
  }

  // 5. Push new images to document
  if (uploadedImages.length > 0) {
    await TopAppeals.findByIdAndUpdate(
      id,
      { $addToSet: { images: { $each: uploadedImages } } },
      { new: true },
    );
  }

  // 6. Update fullDescription and other fields
  const result = await TopAppeals.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new AppError(400, 'Top appeals update failed');
  }

  return result;
};

const deleteTopAppealsFromDB = async (id: string) => {
  const isTopAppealsExists = await TopAppeals.findById(id);

  if (!isTopAppealsExists) {
    throw new AppError(404, 'Top appeals not found');
  }

  if (isTopAppealsExists.isDeleted) {
    throw new AppError(400, 'Top appeals is already deleted');
  }

  const result = await TopAppeals.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete top appeals');
  }

  return result;
};

export const TopAppealsService = {
  createTopAppealsIntoDB,
  getAllTopAppealsFromDB,
  getTopAppealsByIdFromDB,
  updateTopAppealsIntoDB,
  updateTopAppealsContentIntoDB,
  deleteTopAppealsFromDB,
};
