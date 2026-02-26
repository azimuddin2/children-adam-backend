import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { TopAppealsDonationsValidation } from './topAppealsDonations.validation';
import { TopAppealsDonationsController } from './topAppealsDonations.controller';
const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    TopAppealsDonationsValidation.createTopAppealsDonationsSchema,
  ),
  TopAppealsDonationsController.createTopAppealsDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  TopAppealsDonationsController.getAllTopAppealsDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  TopAppealsDonationsController.getTopAppealsDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    TopAppealsDonationsValidation.updateTopAppealsDonationsSchema,
  ),
  TopAppealsDonationsController.updateTopAppealsDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  TopAppealsDonationsController.deleteTopAppealsDonations,
);

export const TopAppealsDonationsRoutes = router;
