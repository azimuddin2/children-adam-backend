import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import parseData from '../../middlewares/parseData';
import { DailySadaqahCategoryControllers } from './dailySadaqahCategory.controller';
import { DailySadaqahCategoryValidations } from './dailySadaqahCategory.validation';
import multer, { memoryStorage } from 'multer';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('icon'),
  parseData(),
  validateRequest(
    DailySadaqahCategoryValidations.createDailySadaqahCategoryValidationSchema,
  ),
  DailySadaqahCategoryControllers.createDailySadaqahCategory,
);

router.get(
  '/',
  auth('admin', 'user'),
  DailySadaqahCategoryControllers.getAllDailySadaqahCategory,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  DailySadaqahCategoryControllers.getDailySadaqahCategoryById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('icon'),
  parseData(),
  validateRequest(
    DailySadaqahCategoryValidations.updateDailySadaqahCategoryValidationSchema,
  ),
  DailySadaqahCategoryControllers.updateDailySadaqahCategory,
);

router.delete(
  '/:id',
  auth('admin'),
  DailySadaqahCategoryControllers.deleteDailySadaqahCategory,
);

export const DailySadaqahCategoryRoutes = router;
