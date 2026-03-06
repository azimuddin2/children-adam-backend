import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import parseData from '../../middlewares/parseData';
import { DailySadaqahControllers } from './dailySadaqah.controller';
import { DailySadaqahValidation } from './dailySadaqah.validation';

const router = express.Router();

router.post(
  '/',
  auth('admin'),
  validateRequest(DailySadaqahValidation.createDailySadaqahValidationSchema),
  DailySadaqahControllers.createDailySadaqah,
);

router.get(
  '/',
  auth('admin', 'user'),
  DailySadaqahControllers.getAllDailySadaqah,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DailySadaqahControllers.getDailySadaqahById,
);

router.patch(
  '/:id',
  auth('admin'),
  parseData(),
  validateRequest(DailySadaqahValidation.updateDailySadaqahValidationSchema),
  DailySadaqahControllers.updateDailySadaqah,
);

router.delete(
  '/:id',
  auth('admin'),
  DailySadaqahControllers.deleteDailySadaqah,
);

export const DailySadaqahRoutes = router;
