import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProjectServices } from './project.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.createProjectIntoDB(
    req.body,
    req.files as Express.Multer.File[] & {
      images?: Express.Multer.File[];
    },
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Project added successfully',
    data: result,
  });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getAllProjectsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Projects retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProjectServices.getProjectByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProjectServices.updateProjectIntoDB(
    id,
    req.body,
    req.files as Express.Multer.File[] & {
      images?: Express.Multer.File[];
    },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project updated successfully',
    data: result,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProjectServices.deleteProjectFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project permanently deleted successfully',
    data: result,
  });
});

export const ProjectControllers = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
