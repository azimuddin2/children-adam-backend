import express from 'express';
import auth from '../../middlewares/auth';
import { CartControllers } from './cart.controller';

const router = express.Router();

router.get('/my-cart', auth('user'), CartControllers.getMyCart);

router.post('/add', auth('user'), CartControllers.addToCart);

router.patch(
  '/increment/:itemId',
  auth('user'),
  CartControllers.incrementCartItemQuantity,
);

router.patch(
  '/decrement/:itemId',
  auth('user'),
  CartControllers.decrementCartItemQuantity,
);

router.delete(
  '/remove-item/:itemId',
  auth('user'),
  CartControllers.removeItemFromCart,
);

router.delete('/clear', auth('user'), CartControllers.deleteCart);

export const CartRoutes = router;
