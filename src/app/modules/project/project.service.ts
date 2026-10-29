import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import {
  deleteManyFromS3,
  uploadManyToS3,
} from '../../utils/awsS3FileUploader';
import QueryBuilder from '../../builder/QueryBuilder';
import { UploadedFiles } from '../../interface/common.interface';
import { Project } from './project.model';
import { DailySadaqahCategory } from '../dailySadaqahCategory/dailySadaqahCategory.model';
import { TProject } from './project.interface';

const createProjectIntoDB = async (
  payload: TProject,
  files?: UploadedFiles,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const categoryExists = await DailySadaqahCategory.findById(
      payload.category,
    ).session(session);

    if (!categoryExists) {
      throw new AppError(404, 'Project category not found');
    }

    const isExists = await Project.findOne({
      title: payload.title,
    }).session(session);

    if (isExists) {
      throw new AppError(400, 'This project already exists');
    }

    const imageFiles = files?.images;

    if (Array.isArray(imageFiles) && imageFiles.length > 0) {
      const uploadedImages = await uploadManyToS3(
        imageFiles.map((file) => ({
          file,
          path: 'images/projects/gallery',
        })),
      );

      payload.images = uploadedImages;
    } else {
      payload.images = payload.images || [];
    }

    const createdProjects = await Project.create([payload], {
      session,
    });

    if (!createdProjects.length) {
      throw new AppError(400, 'Failed to create project');
    }

    await session.commitTransaction();

    return createdProjects[0];
  } catch (error: any) {
    await session.abortTransaction();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, error.message || 'Project creation failed');
  } finally {
    await session.endSession();
  }
};

const getAllProjectsFromDB = async (query: Record<string, unknown>) => {
  const projectQuery = new QueryBuilder(
    Project.find().populate({
      path: 'category',
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await projectQuery.countTotal();
  const result = await projectQuery.modelQuery;

  return { meta, result };
};

const getProjectByIdFromDB = async (id: string) => {
  const result = await Project.findById(id).populate({
    path: 'category',
  });

  if (!result) {
    throw new AppError(404, 'Project not found');
  }

  return result;
};

const updateProjectIntoDB = async (
  id: string,
  payload: Partial<TProject>,
  files?: UploadedFiles,
) => {
  const existingProject = await Project.findById(id);

  if (!existingProject) {
    throw new AppError(404, 'Project not found');
  }

  if (payload.category) {
    const categoryExists = await DailySadaqahCategory.findById(
      payload.category,
    );

    if (!categoryExists) {
      throw new AppError(404, 'Project category not found');
    }
  }

  if (payload.title) {
    const duplicateProject = await Project.findOne({
      _id: { $ne: id },
      title: payload.title,
    });

    if (duplicateProject) {
      throw new AppError(400, 'This project title already exists');
    }
  }

  const imageFiles = files?.images;

  if (Array.isArray(imageFiles) && imageFiles.length > 0) {
    const uploadedImages = await uploadManyToS3(
      imageFiles.map((file) => ({
        file,
        path: 'images/projects/gallery',
      })),
    );

    payload.images = [...existingProject.images, ...uploadedImages];
  }

  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!result) {
    throw new AppError(400, 'Project update failed');
  }

  return result;
};

const deleteProjectFromDB = async (id: string) => {
  const existingProject = await Project.findById(id);

  if (!existingProject) {
    throw new AppError(404, 'Project not found');
  }

  if (existingProject.images?.length > 0) {
    const imageKeys = existingProject.images.map((image) => image.key);

    await deleteManyFromS3(imageKeys);
  }

  const result = await Project.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(400, 'Failed to delete project');
  }

  return result;
};

export const ProjectServices = {
  createProjectIntoDB,
  getAllProjectsFromDB,
  getProjectByIdFromDB,
  updateProjectIntoDB,
  deleteProjectFromDB,
};
