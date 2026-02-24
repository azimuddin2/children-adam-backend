import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { SadaqahJariyahValidation } from './sadaqahJariyah.validation';
import { SadaqahJariyahController } from './sadaqahJariyah.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahValidation.createSadaqahJariyahValidationSchema,
  ),
  SadaqahJariyahController.createSadaqahJariyah,
);

router.get(
  '/',
  auth('admin', 'user'),
  SadaqahJariyahController.getAllSadaqahJariyah,
);

router.get(
  '/:id',
  auth('admin', 'user'),
  SadaqahJariyahController.getSadaqahJariyahById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(
    SadaqahJariyahValidation.updateSadaqahJariyahValidationSchema,
  ),
  SadaqahJariyahController.updateSadaqahJariyah,
);

router.patch(
  '/content/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(
    SadaqahJariyahValidation.updateSadaqahJariyahContentValidationSchema,
  ),
  SadaqahJariyahController.updateSadaqahJariyahContent,
);

router.delete(
  '/:id',
  auth('admin'),
  SadaqahJariyahController.deleteSadaqahJariyah,
);

export const SadaqahJariyahRoutes = router;
