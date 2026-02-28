import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';

const router = Router();

router.post('/checkout', auth('user'), PaymentController.createPayment);

router.get('/confirm', PaymentController.confirmPayment);
router.get('/cancel', PaymentController.cancelPayment);

router.get('/transactions', auth('admin'), PaymentController.getAllPayments);

router.get(
  '/transactions/:id',
  auth('admin'),
  PaymentController.getPaymentById,
);

router.get('/stats', auth('admin'), PaymentController.getPaymentStats);

export const PaymentRoutes = router;
