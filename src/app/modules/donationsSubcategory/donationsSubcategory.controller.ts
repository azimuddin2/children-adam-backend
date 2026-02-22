import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DonationsSubcategoryService } from './donationsSubcategory.service';

const createDonationsSubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DonationsSubcategoryService.createDonationsSubcategoryIntoDB(
        req.body,
        req.file,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Donations subcategory added successfully',
      data: result,
    });
  },
);

const getAllDonationsSubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DonationsSubcategoryService.getAllDonationsSubcategoryFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All donations subcategory retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getDonationsSubcategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await DonationsSubcategoryService.getDonationsSubcategoryByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subcategory retrieved successfully',
    data: result,
  });
});

const updateDonationsSubcategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await DonationsSubcategoryService.updateDonationsSubcategoryIntoDB(
      id,
      req.body,
      req.file,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subcategory has been updated successfully.',
    data: result,
  });
});

const deleteDonationsSubcategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await DonationsSubcategoryService.deleteDonationsSubcategoryFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subcategory deleted successfully',
    data: result,
  });
});

export const DonationsSubcategoryController = {
  createDonationsSubcategory,
  getAllDonationsSubcategory,
  getDonationsSubcategoryById,
  updateDonationsSubcategory,
  deleteDonationsSubcategory,
};
