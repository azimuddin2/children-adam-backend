import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PaymentControllers } from './payment.controller';

const router = Router();

router.post('/checkout', auth('user'), PaymentControllers.createPayment);

router.get('/confirm', PaymentControllers.confirmPayment);
router.get('/cancel', PaymentControllers.cancelPayment);

router.get('/transactions', auth('admin'), PaymentControllers.getAllPayments);

router.get(
  '/my-transactions-history',
  auth('user'),
  PaymentControllers.getPaymentsHistoryByUserId,
);

router.get(
  '/my-donation-stats',
  auth('user'),
  PaymentControllers.getUserDonationStats,
);

router.get(
  '/transactions/:id',
  auth('admin'),
  PaymentControllers.getPaymentById,
);

router.get('/stats', auth('admin'), PaymentControllers.getPaymentStats);

export const PaymentRoutes = router;
