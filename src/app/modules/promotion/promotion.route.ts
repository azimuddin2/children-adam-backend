import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { PromotionValidations } from './promotion.validation';
import { PromotionControllers } from './promotion.controller';

const router = express.Router();

router.post(
  '/',
  auth('admin'),
  validateRequest(PromotionValidations.createPromotionValidationSchema),
  PromotionControllers.createPromotion,
);

export const PromotionRoutes = router;
