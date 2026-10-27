import express from 'express';
import auth from '../../middlewares/auth';
import { OrderControllers } from './order.controller';

const router = express.Router();

router.post('/', auth('user'), OrderControllers.createOrder);

export const OrderRoutes = router;
