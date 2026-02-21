import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { DonationsCategoryControllers } from './donationsCategory.controller';
import { DonationsCategoryValidation } from './donationsCategory.validation';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DonationsCategoryValidation.createDonationsCategoryValidationSchema,
  ),
  DonationsCategoryControllers.createDonationsCategory,
);

router.get(
  '/',
  auth('admin', 'user'),
  DonationsCategoryControllers.getAllDonationsCategory,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DonationsCategoryControllers.getDonationsCategoryById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DonationsCategoryValidation.updateDonationsCategoryValidationSchema,
  ),
  DonationsCategoryControllers.updateDonationsCategory,
);

router.delete(
  '/:id',
  auth('admin'),
  DonationsCategoryControllers.deleteDonationsCategory,
);

export const DonationsCategoryRoutes = router;
