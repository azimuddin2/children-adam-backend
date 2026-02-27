import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CartService } from './cart.service';
import sendResponse from '../../utils/sendResponse';

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CartService.getMyCartFromDB(userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Cart retrieved successfully',
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CartService.addToCartIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Item added to cart successfully',
    data: result,
  });
});

const incrementCartItemQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const itemId = req.params.itemId;
    const result = await CartService.incrementCartItemQuantityIntoDB(
      userId,
      itemId,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Item quantity incremented successfully',
      data: result,
    });
  },
);

const decrementCartItemQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const itemId = req.params.itemId;
    const result = await CartService.decrementCartItemQuantityIntoDB(
      userId,
      itemId,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Item quantity decremented successfully',
      data: result,
    });
  },
);

const removeItemFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = req.params.itemId;
  const result = await CartService.removeItemFromCart(userId, itemId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Item removed from cart successfully',
    data: result,
  });
});

const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CartService.deleteCartFromDB(userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  });
});

export const CartController = {
  getMyCart,
  addToCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
  removeItemFromCart,
  deleteCart,
};
