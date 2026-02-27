import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NewsServices } from './news.service';

const createNews = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsServices.createNewsIntoDB(req.body, req.file);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'News added successfully',
    data: result,
  });
});

const getAllNews = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsServices.getAllNewsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'News retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getNewsById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NewsServices.getNewsByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

const updateNews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NewsServices.updateNewsIntoDB(id, req.body, req.file);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'News has been updated successfully.',
    data: result,
  });
});

const deleteNews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NewsServices.deleteNewsFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'News deleted successfully',
    data: result,
  });
});

export const NewsControllers = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
};
