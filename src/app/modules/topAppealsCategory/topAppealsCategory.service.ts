import AppError from '../../errors/AppError';
import { TTopAppealsCategory } from './topAppealsCategory.interface';
import { TopAppealsCategory } from './topAppealsCategory.model';

const createTopAppealsCategoryIntoDB = async (payload: TTopAppealsCategory) => {
  // 1. Check if top appeals category exists but ignore soft deleted
  const isTopAppealsCategoryExists = await TopAppealsCategory.findOne({
    name: payload.name,
    isDeleted: false,
  });

  if (isTopAppealsCategoryExists) {
    throw new AppError(400, 'This top appeals category already exists');
  }

  // 2. Create top appeals category
  const result = await TopAppealsCategory.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create top appeals category');
  }

  return result;
};

const getAllTopAppealsCategoryFromDB = async () => {
  const result = await TopAppealsCategory.find({ isDeleted: false })
    .populate({
      path: 'topAppeals',
      match: { isDeleted: false },
    })
    .sort({ createdAt: -1 });

  return result;
};

const getTopAppealsCategoryByIdFromDB = async (id: string) => {
  const result = await TopAppealsCategory.findById(id).populate({
    path: 'topAppeals',
    match: { isDeleted: false },
  });

  if (!result) {
    throw new AppError(404, 'This top appeals category not found');
  }

  if (result.isDeleted) {
    throw new AppError(400, 'This top appeals category has been deleted');
  }

  return result;
};

const updateTopAppealsCategoryIntoDB = async (
  id: string,
  payload: Partial<TTopAppealsCategory>,
) => {
  const isTopAppealsCategoryExists = await TopAppealsCategory.findById(id);

  if (!isTopAppealsCategoryExists) {
    throw new AppError(404, 'This top appeals category not exists');
  }

  if (isTopAppealsCategoryExists.isDeleted) {
    throw new AppError(400, 'This top appeals category has been deleted');
  }

  const updatedTopAppealsCategory = await TopAppealsCategory.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTopAppealsCategory) {
    throw new AppError(400, 'Top appeals category update failed');
  }

  return updatedTopAppealsCategory;
};

const deleteTopAppealsCategoryFromDB = async (id: string) => {
  const isTopAppealsCategoryExists = await TopAppealsCategory.findById(id);

  if (!isTopAppealsCategoryExists) {
    throw new AppError(404, 'This top appeals category not exists');
  }

  if (isTopAppealsCategoryExists.isDeleted) {
    throw new AppError(400, 'This top appeals category has been deleted');
  }

  const result = await TopAppealsCategory.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to delete top appeals category');
  }

  return result;
};

export const TopAppealsCategoryServices = {
  createTopAppealsCategoryIntoDB,
  getAllTopAppealsCategoryFromDB,
  getTopAppealsCategoryByIdFromDB,
  updateTopAppealsCategoryIntoDB,
  deleteTopAppealsCategoryFromDB,
};
