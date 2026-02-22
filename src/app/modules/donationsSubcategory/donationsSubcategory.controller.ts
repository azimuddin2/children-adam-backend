import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DonationsSubcategoryService } from './donationsSubcategory.service';

const createDonationsSubcategory = catchAsync(async (req, res) => {
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
});

// const getAllSubcategory = catchAsync(async (req, res) => {
//   const result = await SubcategoryService.getAllSubcategoryFromDB(req.query);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Subcategory retrieved successfully',
//     meta: result.meta,
//     data: result.result,
//   });
// });

// const getSubcategoryById = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await SubcategoryService.getSubcategoryByIdFromDB(id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Subcategory retrieved successfully',
//     data: result,
//   });
// });

// const updateSubcategory = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await SubcategoryService.updateSubcategoryIntoDB(
//     id,
//     req.body,
//     req.file,
//   );

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Subcategory has been updated successfully.',
//     data: result,
//   });
// });

// const deleteSubcategory = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await SubcategoryService.deleteSubcategoryFromDB(id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Subcategory deleted successfully',
//     data: result,
//   });
// });

export const DonationsSubcategoryController = {
  createDonationsSubcategory,
  //   getAllSubcategory,
  //   getSubcategoryById,
  //   updateSubcategory,
  //   deleteSubcategory,
};
