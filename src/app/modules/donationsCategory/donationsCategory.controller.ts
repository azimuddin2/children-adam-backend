import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DonationsCategoryServices } from './donationsCategory.service';

const createDonationsCategory = catchAsync(async (req, res) => {
  const result = await DonationsCategoryServices.createDonationsCategoryIntoDB(
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Donations category added successfully',
    data: result,
  });
});

const getAllDonationsCategory = catchAsync(async (req, res) => {
  const result = await DonationsCategoryServices.getAllDonationsCategoryFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Donations Categories retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getDonationsCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await DonationsCategoryServices.getDonationsCategoryByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Donations Category retrieved successfully',
    data: result,
  });
});

const updateDonationsCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DonationsCategoryServices.updateDonationsCategoryIntoDB(
    id,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Donations category has been updated successfully.',
    data: result,
  });
});

const deleteDonationsCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await DonationsCategoryServices.deleteDonationsCategoryFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Donations category deleted successfully',
    data: result,
  });
});

export const DonationsCategoryControllers = {
  createDonationsCategory,
  getAllDonationsCategory,
  getDonationsCategoryById,
  updateDonationsCategory,
  deleteDonationsCategory,
};
