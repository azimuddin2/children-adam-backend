import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { DailySadaqahDonationsControllers } from './dailySadaqahDonations.controller';
import { DailySadaqahDonationsValidations } from './dailySadaqahDonations.validation';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DailySadaqahDonationsValidations.createDailySadaqahDonationsSchema,
  ),
  DailySadaqahDonationsControllers.createDailySadaqahDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  DailySadaqahDonationsControllers.getAllDailySadaqahDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DailySadaqahDonationsControllers.getDailySadaqahDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DailySadaqahDonationsValidations.updateDailySadaqahDonationsSchema,
  ),
  DailySadaqahDonationsControllers.updateDailySadaqahDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  DailySadaqahDonationsControllers.deleteDailySadaqahDonations,
);

export const DailySadaqahDonationsRoutes = router;
