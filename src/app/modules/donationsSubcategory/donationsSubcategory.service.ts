import mongoose from 'mongoose';
import slugify from 'slugify';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { TDonationsSubcategory } from './donationsSubcategory.interface';
import { DonationsSubcategory } from './donationsSubcategory.model';
import { DonationsCategory } from '../donationsCategory/donationsCategory.model';

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
      { $push: { subcategories: created[0]._id } },
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

// const getAllSubcategoryFromDB = async (query: Record<string, unknown>) => {
//   const { category, ...filters } = query;

//   if (!category || !mongoose.Types.ObjectId.isValid(category as string)) {
//     throw new AppError(400, 'Invalid Category ID');
//   }

//   // Base query -> always exclude deleted packages service
//   const subcategoryQuery = Subcategory.find({ category, isDeleted: false });

//   const queryBuilder = new QueryBuilder(subcategoryQuery, filters)
//     .search(['name'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const meta = await queryBuilder.countTotal();
//   const result = await queryBuilder.modelQuery;

//   return { meta, result };
// };

// const getSubcategoryByIdFromDB = async (id: string) => {
//   const result = await Subcategory.findById(id);

//   if (!result) {
//     throw new AppError(404, 'This subcategory not found');
//   }

//   if (result.isDeleted) {
//     throw new AppError(400, 'This subcategory has been deleted');
//   }

//   return result;
// };

// const updateSubcategoryIntoDB = async (
//   id: string,
//   payload: Partial<TSubcategory>,
//   file?: Express.Multer.File,
// ) => {
//   const isSubcategoryExists = await Subcategory.findById(id);

//   if (!isSubcategoryExists) {
//     throw new AppError(404, 'This subcategory not exists');
//   }

//   if (isSubcategoryExists.isDeleted) {
//     throw new AppError(400, 'This subcategory has been deleted');
//   }

//   // Auto slug update
//   if (payload.name) {
//     payload.slug = slugify(payload.name, { lower: true, strict: true });
//   }

//   // If new image is passed
//   if (file) {
//     const uploadedUrl = await uploadToS3({
//       file,
//       fileName: `images/subcategory/${Math.floor(100000 + Math.random() * 900000)}`,
//     });

//     // Delete previous
//     if (isSubcategoryExists.image) {
//       await deleteFromS3(isSubcategoryExists.image);
//     }

//     payload.image = uploadedUrl;
//   }

//   const updatedCategory = await Subcategory.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedCategory) {
//     throw new AppError(400, 'Subcategory update failed');
//   }

//   return updatedCategory;
// };

// const deleteSubcategoryFromDB = async (id: string) => {
//   const isSubcategoryExists = await Subcategory.findById(id);

//   if (!isSubcategoryExists) {
//     throw new AppError(404, 'Subcategory not found');
//   }

//   if (isSubcategoryExists.isDeleted) {
//     throw new AppError(400, 'Subcategory is already deleted');
//   }

//   const result = await Subcategory.findByIdAndUpdate(
//     id,
//     { isDeleted: true },
//     { new: true },
//   );

//   if (!result) {
//     throw new AppError(400, 'Failed to delete subcategory');
//   }

//   return result;
// };

export const DonationsSubcategoryService = {
  createDonationsSubcategoryIntoDB,
  // getAllSubcategoryFromDB,
  // getSubcategoryByIdFromDB,
  // updateSubcategoryIntoDB,
  // deleteSubcategoryFromDB,
};
