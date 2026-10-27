import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { DonationsSubcategoryValidations } from './monthlyDonationSubcategory.validation';
import { DonationsSubcategoryControllers } from './monthlyDonationSubcategory.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DonationsSubcategoryValidations.createDonationsSubcategorySchema,
  ),
  DonationsSubcategoryControllers.createDonationsSubcategory,
);

router.get(
  '/',
  auth('admin', 'user'),
  DonationsSubcategoryControllers.getAllDonationsSubcategory,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DonationsSubcategoryControllers.getDonationsSubcategoryById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    DonationsSubcategoryValidations.updateDonationsSubcategorySchema,
  ),
  DonationsSubcategoryControllers.updateDonationsSubcategory,
);

router.patch(
  '/content/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(
    DonationsSubcategoryValidations.updateSubcategoryContentSchema,
  ),
  DonationsSubcategoryControllers.updateDonationsSubcategoryContent,
);

router.delete(
  '/:id',
  auth('admin'),
  DonationsSubcategoryControllers.deleteDonationsSubcategory,
);

export const DonationsSubcategoryRoutes = router;
