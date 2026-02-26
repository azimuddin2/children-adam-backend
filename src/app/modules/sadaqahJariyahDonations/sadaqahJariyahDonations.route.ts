import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { SadaqahJariyahDonationsValidation } from './sadaqahJariyahDonations.validation';
import { SadaqahJariyahDonationsController } from './sadaqahJariyahDonations.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahDonationsValidation.createSadaqahJariyahDonationsSchema,
  ),
  SadaqahJariyahDonationsController.createSadaqahJariyahDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  SadaqahJariyahDonationsController.getAllSadaqahJariyahDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  SadaqahJariyahDonationsController.getSadaqahJariyahDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahDonationsValidation.updateSadaqahJariyahDonationsSchema,
  ),
  SadaqahJariyahDonationsController.updateSadaqahJariyahDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  SadaqahJariyahDonationsController.deleteSadaqahJariyahDonations,
);

export const SadaqahJariyahDonationsRoutes = router;
