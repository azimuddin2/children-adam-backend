import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { SadaqahJariyahValidations } from './sadaqahJariyah.validation';
import { SadaqahJariyahControllers } from './sadaqahJariyah.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahValidations.createSadaqahJariyahValidationSchema,
  ),
  SadaqahJariyahControllers.createSadaqahJariyah,
);

router.get(
  '/',
  auth('admin', 'user'),
  SadaqahJariyahControllers.getAllSadaqahJariyah,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  SadaqahJariyahControllers.getSadaqahJariyahById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahValidations.updateSadaqahJariyahValidationSchema,
  ),
  SadaqahJariyahControllers.updateSadaqahJariyah,
);

router.patch(
  '/content/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(
    SadaqahJariyahValidations.updateSadaqahJariyahContentValidationSchema,
  ),
  SadaqahJariyahControllers.updateSadaqahJariyahContent,
);

router.delete(
  '/:id',
  auth('admin'),
  SadaqahJariyahControllers.deleteSadaqahJariyah,
);

export const SadaqahJariyahRoutes = router;
