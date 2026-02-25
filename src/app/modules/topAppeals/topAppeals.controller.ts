import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TopAppealsService } from './topAppeals.service';

const createTopAppeals = catchAsync(async (req: Request, res: Response) => {
  const result = await TopAppealsService.createTopAppealsIntoDB(
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Top appeals added successfully',
    data: result,
  });
});

const getAllTopAppeals = catchAsync(async (req: Request, res: Response) => {
  const result = await TopAppealsService.getAllTopAppealsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Top appeals retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getTopAppealsById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TopAppealsService.getTopAppealsByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Top appeals retrieved successfully',
    data: result,
  });
});

const updateTopAppeals = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TopAppealsService.updateTopAppealsIntoDB(
    id,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Top appeals has been updated successfully.',
    data: result,
  });
});

const updateTopAppealsContent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TopAppealsService.updateTopAppealsContentIntoDB(
    id,
    req.body,
    req.files,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Content updated successfully',
    data: result,
  });
});

const deleteTopAppeals = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TopAppealsService.deleteTopAppealsFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Top appeals deleted successfully',
    data: result,
  });
});

export const TopAppealsController = {
  createTopAppeals,
  getAllTopAppeals,
  getTopAppealsById,
  updateTopAppeals,
  updateTopAppealsContent,
  deleteTopAppeals,
};
