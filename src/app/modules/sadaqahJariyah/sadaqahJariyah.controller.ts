import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SadaqahJariyahServices } from './sadaqahJariyah.service';

const createSadaqahJariyah = catchAsync(async (req: Request, res: Response) => {
  const result = await SadaqahJariyahServices.createSadaqahJariyahIntoDB(
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Sadaqah jariyah added successfully',
    data: result,
  });
});

const getAllSadaqahJariyah = catchAsync(async (req: Request, res: Response) => {
  const result = await SadaqahJariyahServices.getAllSadaqahJariyahFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sadaqah jariyah retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSadaqahJariyahById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SadaqahJariyahServices.getSadaqahJariyahByIdFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Sadaqah jariyah retrieved successfully',
      data: result,
    });
  },
);

const updateSadaqahJariyah = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SadaqahJariyahServices.updateSadaqahJariyahIntoDB(
    id,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sadaqah jariyah has been updated successfully.',
    data: result,
  });
});

// const updateDonationsSubcategoryGallery = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result =
//     await SadaqahJariyahServices.updateDonationsSubcategoryGalleryIntoDB(
//       id,
//       req.body,
//       req.files,
//     );

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Gallery added successfully',
//     data: result,
//   });
// });

const deleteSadaqahJariyah = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SadaqahJariyahServices.deleteSadaqahJariyahFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sadaqah jariyah deleted successfully',
    data: result,
  });
});

export const SadaqahJariyahController = {
  createSadaqahJariyah,
  getAllSadaqahJariyah,
  getSadaqahJariyahById,
  updateSadaqahJariyah,
  deleteSadaqahJariyah,
};
