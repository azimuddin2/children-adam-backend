import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { SadaqahJariyahDonationsValidations } from './sadaqahJariyahDonations.validation';
import { SadaqahJariyahDonationsControllers } from './sadaqahJariyahDonations.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahDonationsValidations.createSadaqahJariyahDonationsSchema,
  ),
  SadaqahJariyahDonationsControllers.createSadaqahJariyahDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  SadaqahJariyahDonationsControllers.getAllSadaqahJariyahDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  SadaqahJariyahDonationsControllers.getSadaqahJariyahDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahDonationsValidations.updateSadaqahJariyahDonationsSchema,
  ),
  SadaqahJariyahDonationsControllers.updateSadaqahJariyahDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  SadaqahJariyahDonationsControllers.deleteSadaqahJariyahDonations,
);

export const SadaqahJariyahDonationsRoutes = router;
