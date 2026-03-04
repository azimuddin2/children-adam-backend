import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { PromotionService } from './promotion.service';
import sendResponse from '../../utils/sendResponse';

const createPromotion = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.createPromotionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

export const PromotionControllers = {
  createPromotion,
};
