import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { MonthlyDonationsValidation } from './monthlyDonations.validation';
import { MonthlyDonationsController } from './monthlyDonations.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(MonthlyDonationsValidation.createMonthlyDonationsSchema),
  MonthlyDonationsController.createMonthlyDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  MonthlyDonationsController.getAllMonthlyDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  MonthlyDonationsController.getMonthlyDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(MonthlyDonationsValidation.updateMonthlyDonationsSchema),
  MonthlyDonationsController.updateMonthlyDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  MonthlyDonationsController.deleteMonthlyDonations,
);

export const MonthlyDonationsRoutes = router;
