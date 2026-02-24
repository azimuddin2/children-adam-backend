import mongoose from 'mongoose';
import slugify from 'slugify';
import AppError from '../../errors/AppError';
import {
  deleteFromS3,
  deleteManyFromS3,
  uploadManyToS3,
  uploadToS3,
} from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { DonationsSubcategory } from './monthlyDonationSubcategory.model';
import { DonationsCategory } from '../monthlyDonationCategory/monthlyDonationCategory.model';
import { donationsSubcategorySearchableFields } from './monthlyDonationSubcategory.constant';
import { UploadedFiles } from '../../interface/common.interface';
import {
  TDonationsSubcategory,
  TImage,
} from './monthlyDonationSubcategory.interface';

const createDonationsSubcategoryIntoDB = async (
  payload: TDonationsSubcategory,
  file?: Express.Multer.File,
) => {
  const { donationsCategory } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.donationsCategory = donationsCategory;

    // 1️⃣ Check if  donations subcategory exists
    const isExists = await DonationsSubcategory.findOne({
      name: payload.name,
      isDeleted: false,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This donations subcategory already exists');
    }

    // 2️⃣ Auto generate slug
    if (payload.name) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
    }

    // 3️⃣ Upload image if provided
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/donations/${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000,
        )}`,
      });
      payload.image = uploadedUrl;
    }

    // 4️⃣ Create donations subcategory inside transaction
    const created = await DonationsSubcategory.create([payload], { session });
    if (!created || created.length === 0) {
      throw new AppError(400, 'Failed to create subcategory');
    }

    // 5️⃣ Push subcategory ID to Category
    const updatedCategory = await DonationsCategory.findByIdAndUpdate(
      donationsCategory,
      { $push: { donationsSubcategory: created[0]._id } },
      { new: true, session },
    );

    if (!updatedCategory) {
      throw new AppError(404, 'Donations Category not found');
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
      error.message || 'Donations subcategory creation failed',
    );
  }
};

const getAllDonationsSubcategoryFromDB = async (
  query: Record<string, unknown>,
) => {
  const donationsSubcategoryQuery = new QueryBuilder(
    DonationsSubcategory.find({ isDeleted: false }).populate(
      'donationsCategory',
    ),
    query,
  )
    .search(donationsSubcategorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await donationsSubcategoryQuery.countTotal();
  const result = await donationsSubcategoryQuery.modelQuery;

  return { meta, result };
};

const getDonationsSubcategoryByIdFromDB = async (id: string) => {
  const result = await DonationsSubcategory.findById(id);

  if (!result) {
    throw new AppError(404, 'This subcategory not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This subcategory has been deleted');
  }

  return result;
};

const updateDonationsSubcategoryIntoDB = async (
  id: string,
  payload: Partial<TDonationsSubcategory>,
  file?: Express.Multer.File,
) => {
  const isSubcategoryExists = await DonationsSubcategory.findById(id);

  if (!isSubcategoryExists) {
    throw new AppError(404, 'This subcategory not exists');
  }

  if (isSubcategoryExists.isDeleted) {
    throw new AppError(400, 'This subcategory has been deleted');
  }

  // Auto slug update
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  // If new image is passed
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Delete previous
    if (isSubcategoryExists.image) {
      await deleteFromS3(isSubcategoryExists.image);
    }

    payload.image = uploadedUrl;
  }

  const updatedCategory = await DonationsSubcategory.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCategory) {
    throw new AppError(400, 'Subcategory update failed');
  }

  return updatedCategory;
};

const updateDonationsSubcategoryContentIntoDB = async (
  id: string,
  payload: Partial<TDonationsSubcategory>,
  files: any,
) => {
  // 1. Check if subcategory exists
  const isSubcategoryExists = await DonationsSubcategory.findById(id);
  if (!isSubcategoryExists) {
    throw new AppError(404, 'This subcategory not exists');
  }

  if (isSubcategoryExists.isDeleted) {
    throw new AppError(400, 'This subcategory has been deleted');
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
        path: `images/donations/gallery`,
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
      (key: string) => `images/donations/gallery/${key}`,
    );

    await deleteManyFromS3(keysToDelete);

    await DonationsSubcategory.findByIdAndUpdate(
      id,
      { $pull: { images: { key: { $in: deleteKey } } } },
      { new: true },
    );
  }

  // 5. Push new images to document
  if (uploadedImages.length > 0) {
    await DonationsSubcategory.findByIdAndUpdate(
      id,
      { $addToSet: { images: { $each: uploadedImages } } },
      { new: true },
    );
  }

  // 6. Update fullDescription and other fields
  const result = await DonationsSubcategory.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new AppError(400, 'Subcategory update failed');
  }

  return result;
};

const deleteDonationsSubcategoryFromDB = async (id: string) => {
  const isSubcategoryExists = await DonationsSubcategory.findById(id);

  if (!isSubcategoryExists) {
    throw new AppError(404, 'Subcategory not found');
  }

  if (isSubcategoryExists.isDeleted) {
    throw new AppError(400, 'Subcategory is already deleted');
  }

  const result = await DonationsSubcategory.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete subcategory');
  }

  return result;
};

export const DonationsSubcategoryService = {
  createDonationsSubcategoryIntoDB,
  getAllDonationsSubcategoryFromDB,
  getDonationsSubcategoryByIdFromDB,
  updateDonationsSubcategoryIntoDB,
  updateDonationsSubcategoryContentIntoDB,
  deleteDonationsSubcategoryFromDB,
};
