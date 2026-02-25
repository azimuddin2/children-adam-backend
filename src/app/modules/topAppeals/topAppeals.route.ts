import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { TopAppealsValidation } from './topAppeals.validation';
import { TopAppealsController } from './topAppeals.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(TopAppealsValidation.createTopAppealsSchema),
  TopAppealsController.createTopAppeals,
);

router.get('/', auth('admin', 'user'), TopAppealsController.getAllTopAppeals);

router.get(
  '/:id',
  auth('admin', 'user'),
  TopAppealsController.getTopAppealsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(TopAppealsValidation.updateTopAppealsSchema),
  TopAppealsController.updateTopAppeals,
);

router.patch(
  '/content/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(TopAppealsValidation.updateTopAppealsContentSchema),
  TopAppealsController.updateTopAppealsContent,
);

router.delete('/:id', auth('admin'), TopAppealsController.deleteTopAppeals);

export const TopAppealsRoutes = router;
