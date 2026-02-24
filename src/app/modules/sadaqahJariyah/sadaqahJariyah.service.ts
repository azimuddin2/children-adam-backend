import slugify from 'slugify';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import {
  deleteFromS3,
  deleteManyFromS3,
  uploadManyToS3,
  uploadToS3,
} from '../../utils/awsS3FileUploader';
import { TImage, TSadaqahJariyah } from './sadaqahJariyah.interface';
import { SadaqahJariyah } from './sadaqahJariyah.model';
import { sadaqahJariyahSearchableFields } from './sadaqahJariyah.constant';
import { UploadedFiles } from '../../interface/common.interface';

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

const updateSadaqahJariyahContentIntoDB = async (
  id: string,
  payload: Partial<TSadaqahJariyah>,
  files: any,
) => {
  // 1. Check if sadaqah jariyah exists
  const isSadaqahJariyahExists = await SadaqahJariyah.findById(id);
  if (!isSadaqahJariyahExists) {
    throw new AppError(404, 'This sadaqah jariyah not exists');
  }

  if (isSadaqahJariyahExists.isDeleted) {
    throw new AppError(400, 'This sadaqah jariyah has been deleted');
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
        path: `images/sadaqah/gallery`,
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

    await SadaqahJariyah.findByIdAndUpdate(
      id,
      { $pull: { images: { key: { $in: deleteKey } } } },
      { new: true },
    );
  }

  // 5. Push new images to document
  if (uploadedImages.length > 0) {
    await SadaqahJariyah.findByIdAndUpdate(
      id,
      { $addToSet: { images: { $each: uploadedImages } } },
      { new: true },
    );
  }

  // 6. Update fullDescription and other fields
  const result = await SadaqahJariyah.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new AppError(400, 'Sadaqah jariyah update failed');
  }

  return result;
};

const deleteSadaqahJariyahFromDB = async (id: string) => {
  const isSadaqahJariyahExists = await SadaqahJariyah.findById(id);

  if (!isSadaqahJariyahExists) {
    throw new AppError(404, 'Sadaqah jariyah not found');
  }

  if (isSadaqahJariyahExists.isDeleted) {
    throw new AppError(400, 'Sadaqah jariyah is already deleted');
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
  updateSadaqahJariyahContentIntoDB,
  deleteSadaqahJariyahFromDB,
};
