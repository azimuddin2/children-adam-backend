import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await OrderService.createOrderIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
};
