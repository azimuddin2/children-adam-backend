import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { deleteFromS3, uploadToS3 } from '../../utils/awsS3FileUploader';
import { TNews } from './news.interface';
import { News } from './news.model';
import { newsSearchableFields } from './news.constant';

const createNewsIntoDB = async (payload: TNews, file: any) => {
  // 1. Check if news exists but ignore soft deleted
  const isNewsExists = await News.findOne({
    postTitle: payload.postTitle,
    isDeleted: false,
  });

  if (isNewsExists) {
    throw new AppError(400, 'This news already exists');
  }

  // 2. Upload image
  if (file) {
    const uploadedUrl = await uploadToS3({
      file,
      fileName: `images/news/${Math.floor(100000 + Math.random() * 900000)}`,
    });
    payload.image = uploadedUrl;
  }

  // 4. Create news
  const result = await News.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create news');
  }

  return result;
};

const getAllNewsFromDB = async (query: Record<string, unknown>) => {
  const newsQuery = new QueryBuilder(News.find({ isDeleted: false }), query)
    .search(newsSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await newsQuery.countTotal();
  const result = await newsQuery.modelQuery;

  return { meta, result };
};

const getNewsByIdFromDB = async (id: string) => {
  const result = await News.findById(id);

  if (!result) {
    throw new AppError(404, 'This news not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This news has been deleted');
  }

  return result;
};

const updateNewsIntoDB = async (
  id: string,
  payload: Partial<TNews>,
  file?: Express.Multer.File,
) => {
  const isNewsExists = await News.findById(id);

  if (!isNewsExists) {
    throw new AppError(404, 'This news not exists');
  }

  if (isNewsExists.isDeleted) {
    throw new AppError(400, 'This news has been deleted');
  }

  try {
    if (file) {
      const uploadedUrl = await uploadToS3({
        file,
        fileName: `images/news/${Math.floor(100000 + Math.random() * 900000)}`,
      });

      // Delete previous
      if (isNewsExists.image) {
        await deleteFromS3(isNewsExists.image);
      }

      payload.image = uploadedUrl;
    }

    const updatedNews = await News.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) {
      throw new AppError(400, 'News update failed');
    }

    return updatedNews;
  } catch (error: any) {
    console.error('updateNewsIntoDB Error:', error);
    throw new AppError(500, 'Failed to update news');
  }
};

const deleteNewsFromDB = async (id: string) => {
  const isNewsExists = await News.findById(id);

  if (!isNewsExists) {
    throw new AppError(404, 'News not found');
  }

  if (isNewsExists.isDeleted) {
    throw new AppError(400, 'News is already deleted');
  }

  const result = await News.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete news');
  }

  return result;
};

export const NewsServices = {
  createNewsIntoDB,
  getAllNewsFromDB,
  getNewsByIdFromDB,
  updateNewsIntoDB,
  deleteNewsFromDB,
};
