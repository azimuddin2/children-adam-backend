import slugify from 'slugify';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import { donationsCategorySearchableFields } from './donationsCategory.constant';
import { TDonationsCategory } from './donationsCategory.interface';
import { DonationsCategory } from './donationsCategory.model';

const createDonationsCategoryIntoDB = async (
  payload: TDonationsCategory,
  file: any,
) => {
  // 1. Check if donation category exists but ignore soft deleted
  const isDonationsCategoryExists = await DonationsCategory.findOne({
    name: payload.name,
    isDeleted: false,
  });

  if (isDonationsCategoryExists) {
    throw new AppError(400, 'This donations already exists');
  }

  // 2. Auto slug
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  // 3. Upload image
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/donations/${Math.floor(100000 + Math.random() * 900000)}`,
    });
    payload.image = uploadedUrl;
  }

  // 4. Create donations category
  const result = await DonationsCategory.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create donations category');
  }

  return result;
};

const getAllDonationsCategoryFromDB = async (
  query: Record<string, unknown>,
) => {
  const donationsCategoryQuery = new QueryBuilder(
    DonationsCategory.find({ isDeleted: false }).populate(
      'donationsSubcategory',
    ),
    query,
  )
    .search(donationsCategorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await donationsCategoryQuery.countTotal();
  const result = await donationsCategoryQuery.modelQuery;

  return { meta, result };
};

const getDonationsCategoryByIdFromDB = async (id: string) => {
  const result = await DonationsCategory.findById(id).populate(
    'donationsSubcategory',
  );

  if (!result) {
    throw new AppError(404, 'This donations category not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This donations category has been deleted');
  }

  return result;
};

const updateDonationsCategoryIntoDB = async (
  id: string,
  payload: Partial<TDonationsCategory>,
  file?: Express.Multer.File,
) => {
  const isDonationsCategoryExists = await DonationsCategory.findById(id);

  if (!isDonationsCategoryExists) {
    throw new AppError(404, 'This donations category not exists');
  }

  if (isDonationsCategoryExists.isDeleted) {
    throw new AppError(400, 'This donations category has been deleted');
  }

  // Auto slug update
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  try {
    // If new image is passed
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/donations/${Math.floor(100000 + Math.random() * 900000)}`,
      });

      // Delete previous
      if (isDonationsCategoryExists.image) {
        await deleteFromS3(isDonationsCategoryExists.image);
      }

      payload.image = uploadedUrl;
    }

    const updatedDonationsCategory = await DonationsCategory.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedDonationsCategory) {
      throw new AppError(400, 'Donations category update failed');
    }

    return updatedDonationsCategory;
  } catch (error: any) {
    console.error('updateCategoryIntoDB Error:', error);
    throw new AppError(500, 'Failed to update donations category');
  }
};

const deleteDonationsCategoryFromDB = async (id: string) => {
  const isDonationsCategoryExists = await DonationsCategory.findById(id);

  if (!isDonationsCategoryExists) {
    throw new AppError(404, 'Donations category not found');
  }

  if (isDonationsCategoryExists.isDeleted) {
    throw new AppError(400, 'Donations category is already deleted');
  }

  const result = await DonationsCategory.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete donations category');
  }

  return result;
};

export const DonationsCategoryServices = {
  createDonationsCategoryIntoDB,
  getAllDonationsCategoryFromDB,
  getDonationsCategoryByIdFromDB,
  updateDonationsCategoryIntoDB,
  deleteDonationsCategoryFromDB,
};
