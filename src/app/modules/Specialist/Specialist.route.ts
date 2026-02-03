import express from 'express';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { SpecialistValidations } from './Specialist.validation';
import { SpecialistControllers } from './Specialist.controller';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('owner'),
  upload.single('image'),
  parseData(),
  validateRequest(SpecialistValidations.createSpecialistValidationSchema),
  SpecialistControllers.createSpecialist,
);

router.get(
  '/',
  // auth('customer', 'freelancer', 'owner', 'admin'),
  SpecialistControllers.getAllSpecialist,
);

router.get(
  '/:id',
  auth('customer', 'freelancer', 'owner', 'admin'),
  SpecialistControllers.getSpecialistById,
);

router.patch(
  '/:id',
  auth('owner'),
  upload.single('image'),
  parseData(),
  validateRequest(SpecialistValidations.updateSpecialistValidationSchema),
  SpecialistControllers.updateSpecialist,
);

router.delete('/:id', auth('owner'), SpecialistControllers.deleteSpecialist);

export const SpecialistRoutes = router;
