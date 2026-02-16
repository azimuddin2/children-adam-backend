import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { SupportValidation } from './support.validation';
import { SupportControllers } from './support.controller';

const router = express.Router();

router.post(
  '/',
  auth('user'),
  validateRequest(SupportValidation.createSupportValidationSchema),
  SupportControllers.createSupport,
);

router.get('/', auth('admin'), SupportControllers.getAllSupport);

router.get('/:id', auth('admin'), SupportControllers.getSupportById);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(SupportValidation.replyAdminSupportValidationSchema),
  SupportControllers.adminSupportMessageReply,
);

router.delete('/:id', auth('admin'), SupportControllers.deleteSupport);

export const SupportRoutes = router;
