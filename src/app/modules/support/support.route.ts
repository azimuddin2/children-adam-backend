import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { SupportValidations } from './support.validation';
import { SupportControllers } from './support.controller';

const router = express.Router();

router.post(
  '/',
  auth('user'),
  validateRequest(SupportValidations.createSupportValidationSchema),
  SupportControllers.createSupport,
);

router.get('/', auth('admin'), SupportControllers.getAllSupport);

router.get('/:id', auth('admin'), SupportControllers.getSupportById);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(SupportValidations.replyAdminSupportValidationSchema),
  SupportControllers.adminSupportMessageReply,
);

router.delete('/:id', auth('admin'), SupportControllers.deleteSupport);

export const SupportRoutes = router;
