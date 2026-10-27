import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { MonthlyDonationsValidations } from './monthlyDonations.validation';
import { MonthlyDonationsControllers } from './monthlyDonations.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(MonthlyDonationsValidations.createMonthlyDonationsSchema),
  MonthlyDonationsControllers.createMonthlyDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  MonthlyDonationsControllers.getAllMonthlyDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  MonthlyDonationsControllers.getMonthlyDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(MonthlyDonationsValidations.updateMonthlyDonationsSchema),
  MonthlyDonationsControllers.updateMonthlyDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  MonthlyDonationsControllers.deleteMonthlyDonations,
);

export const MonthlyDonationsRoutes = router;
