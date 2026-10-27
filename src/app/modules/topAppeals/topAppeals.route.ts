import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { TopAppealsValidations } from './topAppeals.validation';
import { TopAppealsControllers } from './topAppeals.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(TopAppealsValidations.createTopAppealsSchema),
  TopAppealsControllers.createTopAppeals,
);

router.get('/', auth('admin', 'user'), TopAppealsControllers.getAllTopAppeals);

router.get(
  '/:id',
  auth('admin', 'user'),
  TopAppealsControllers.getTopAppealsById,
);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(TopAppealsValidations.updateTopAppealsSchema),
  TopAppealsControllers.updateTopAppeals,
);

router.patch(
  '/content/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(TopAppealsValidations.updateTopAppealsContentSchema),
  TopAppealsControllers.updateTopAppealsContent,
);

router.delete('/:id', auth('admin'), TopAppealsControllers.deleteTopAppeals);

export const TopAppealsRoutes = router;
