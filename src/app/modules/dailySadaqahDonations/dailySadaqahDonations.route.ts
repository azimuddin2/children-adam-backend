import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { DailySadaqahDonationsController } from './dailySadaqahDonations.controller';
import { DailySadaqahDonationsValidation } from './dailySadaqahDonations.validation';
const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DailySadaqahDonationsValidation.createDailySadaqahDonationsSchema,
  ),
  DailySadaqahDonationsController.createDailySadaqahDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  DailySadaqahDonationsController.getAllDailySadaqahDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DailySadaqahDonationsController.getDailySadaqahDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DailySadaqahDonationsValidation.updateDailySadaqahDonationsSchema,
  ),
  DailySadaqahDonationsController.updateDailySadaqahDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  DailySadaqahDonationsController.deleteDailySadaqahDonations,
);

export const DailySadaqahDonationsRoutes = router;
