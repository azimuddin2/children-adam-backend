import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { TopAppealsDonationsValidations } from './topAppealsDonations.validation';
import { TopAppealsDonationsControllers } from './topAppealsDonations.controller';
const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    TopAppealsDonationsValidations.createTopAppealsDonationsSchema,
  ),
  TopAppealsDonationsControllers.createTopAppealsDonations,
);

router.get(
  '/',
  auth('admin', 'user'),
  TopAppealsDonationsControllers.getAllTopAppealsDonations,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  TopAppealsDonationsControllers.getTopAppealsDonationsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    TopAppealsDonationsValidations.updateTopAppealsDonationsSchema,
  ),
  TopAppealsDonationsControllers.updateTopAppealsDonations,
);

router.delete(
  '/:id',
  auth('admin'),
  TopAppealsDonationsControllers.deleteTopAppealsDonations,
);

export const TopAppealsDonationsRoutes = router;
