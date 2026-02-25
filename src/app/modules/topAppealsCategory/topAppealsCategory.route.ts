import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import parseData from '../../middlewares/parseData';
import { TopAppealsCategoryValidation } from './topAppealsCategory.validation';
import { TopAppealsCategoryControllers } from './topAppealsCategory.controller';

const router = express.Router();

router.post(
  '/',
  auth('admin'),
  validateRequest(
    TopAppealsCategoryValidation.createTopAppealsCategoryValidationSchema,
  ),
  TopAppealsCategoryControllers.createTopAppealsCategory,
);

router.get(
  '/',
  auth('admin', 'user'),
  TopAppealsCategoryControllers.getAllTopAppealsCategory,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  TopAppealsCategoryControllers.getTopAppealsCategoryById,
);

router.patch(
  '/:id',
  auth('admin'),
  parseData(),
  validateRequest(
    TopAppealsCategoryValidation.updateTopAppealsCategoryValidationSchema,
  ),
  TopAppealsCategoryControllers.updateTopAppealsCategory,
);

router.delete(
  '/:id',
  auth('admin'),
  TopAppealsCategoryControllers.deleteTopAppealsCategory,
);

export const TopAppealsCategoryRoutes = router;
