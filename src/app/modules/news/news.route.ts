import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { NewsValidations } from './news.validation';
import { NewsControllers } from './news.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(NewsValidations.createNewsValidationSchema),
  NewsControllers.createNews,
);

router.get('/', auth('user', 'admin'), NewsControllers.getAllNews);

router.get('/:id', auth('user', 'admin'), NewsControllers.getNewsById);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(NewsValidations.updateNewsValidationSchema),
  NewsControllers.updateNews,
);

router.delete('/:id', auth('admin'), NewsControllers.deleteNews);

export const NewsRoutes = router;
