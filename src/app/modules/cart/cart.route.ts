import express from 'express';
import auth from '../../middlewares/auth';
import { CartController } from './cart.controller';

const router = express.Router();

router.get('/my-cart', auth('user'), CartController.getMyCart);

router.post('/add', auth('user'), CartController.addToCart);

router.patch(
  '/increment/:itemId',
  auth('user'),
  CartController.incrementCartItemQuantity,
);

router.patch(
  '/decrement/:itemId',
  auth('user'),
  CartController.decrementCartItemQuantity,
);

router.delete(
  '/remove-item/:itemId',
  auth('user'),
  CartController.removeItemFromCart,
);

router.delete('/clear', auth('user'), CartController.deleteCart);

export const CartRoutes = router;
