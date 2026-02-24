import slugify from 'slugify';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import { TSadaqahJariyah } from './sadaqahJariyah.interface';
import { SadaqahJariyah } from './sadaqahJariyah.model';
import { sadaqahJariyahSearchableFields } from './sadaqahJariyah.constant';

const createSadaqahJariyahIntoDB = async (
  payload: TSadaqahJariyah,
  file: any,
) => {
  // 1. Check if sadaqah jariyah exists but ignore soft deleted
  const isSadaqahJariyahExists = await SadaqahJariyah.findOne({
    name: payload.name,
    isDeleted: false,
  });

  if (isSadaqahJariyahExists) {
    throw new AppError(400, `This ${payload.name} already exists`);
  }

  // 2. Auto slug
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  // 3. Upload image
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/sadaqah/${Math.floor(100000 + Math.random() * 900000)}`,
    });
    payload.image = uploadedUrl;
  }

  // 4. Create Sadaqah Jariyah
  const result = await SadaqahJariyah.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create sadaqah jariyah');
  }

  return result;
};

const getAllSadaqahJariyahFromDB = async (query: Record<string, unknown>) => {
  const sadaqahJariyahQuery = new QueryBuilder(
    SadaqahJariyah.find({ isDeleted: false }),
    query,
  )
    .search(sadaqahJariyahSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await sadaqahJariyahQuery.countTotal();
  const result = await sadaqahJariyahQuery.modelQuery;

  return { meta, result };
};

const getSadaqahJariyahByIdFromDB = async (id: string) => {
  const result = await SadaqahJariyah.findById(id);

  if (!result) {
    throw new AppError(404, 'This sadaqah jariyah not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This sadaqah jariyah has been deleted');
  }

  return result;
};

const updateSadaqahJariyahIntoDB = async (
  id: string,
  payload: Partial<TSadaqahJariyah>,
  file?: Express.Multer.File,
) => {
  const isSadaqahJariyahExists = await SadaqahJariyah.findById(id);

  if (!isSadaqahJariyahExists) {
    throw new AppError(404, `This sadaqah jariyah ${payload.name} not exists`);
  }

  if (isSadaqahJariyahExists.isDeleted) {
    throw new AppError(400, 'This sadaqah jariyah has been deleted');
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
        fileName: `images/sadaqah/${Math.floor(100000 + Math.random() * 900000)}`,
      });

      // Delete previous
      if (isSadaqahJariyahExists.image) {
        await deleteFromS3(isSadaqahJariyahExists.image);
      }

      payload.image = uploadedUrl;
    }

    const updatedSadaqahJariyah = await SadaqahJariyah.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedSadaqahJariyah) {
      throw new AppError(400, 'Sadaqah jariyah update failed');
    }

    return updatedSadaqahJariyah;
  } catch (error: any) {
    console.error('updateCategoryIntoDB Error:', error);
    throw new AppError(500, 'Failed to update sadaqah jariyah');
  }
};

const deleteSadaqahJariyahFromDB = async (id: string) => {
  const isSadaqahJariyahExists = await SadaqahJariyah.findById(id);

  if (!isSadaqahJariyahExists) {
    throw new AppError(404, 'Sadaqah jariyah not found');
  }

  if (isSadaqahJariyahExists.isDeleted) {
    throw new AppError(400, 'Donations category is already deleted');
  }

  const result = await SadaqahJariyah.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete sadaqah jariyah');
  }

  return result;
};

export const SadaqahJariyahServices = {
  createSadaqahJariyahIntoDB,
  getAllSadaqahJariyahFromDB,
  getSadaqahJariyahByIdFromDB,
  updateSadaqahJariyahIntoDB,
  deleteSadaqahJariyahFromDB,
};
