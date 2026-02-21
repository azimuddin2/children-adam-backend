import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { SubcategoryValidation } from './donationsSubcategory.validation';
import { SubcategoryController } from './donationsSubcategory.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(SubcategoryValidation.createSubcategoryValidationSchema),
  SubcategoryController.createSubcategory,
);

router.get('/', SubcategoryController.getAllSubcategory);

router.get('/:id', SubcategoryController.getSubcategoryById);

router.patch(
  '/:id',
  auth('admin'),
  upload.single('image'),
  parseData(),
  validateRequest(SubcategoryValidation.updateSubcategoryValidationSchema),
  SubcategoryController.updateSubcategory,
);

router.delete('/:id', auth('admin'), SubcategoryController.deleteSubcategory);

export const SubcategoryRoutes = router;
