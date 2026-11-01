import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { DailySadaqahDonationsControllers } from './dailySadaqahDonations.controller';
import { DailySadaqahDonationsValidations } from './dailySadaqahDonations.validation';

const router = express.Router();

router.post(
  '/',
  auth('user'),
  validateRequest(
    DailySadaqahDonationsValidations.createDailySadaqahDonationsSchema,
  ),
  DailySadaqahDonationsControllers.createDailySadaqahDonations,
);

router.get(
  '/summary',
  auth('user'),
  DailySadaqahDonationsControllers.getGivingSummary,
);

router.get(
  '/journey',
  auth('user'),
  DailySadaqahDonationsControllers.getGivingJourney,
);

router.get(
  '/day/:date',
  auth('user'),
  DailySadaqahDonationsControllers.getGivingDayDetail,
);

router.get(
  '/recent',
  auth('user'),
  DailySadaqahDonationsControllers.getRecentGivingActivity,
);

router.get(
  '/my',
  auth('user'),
  DailySadaqahDonationsControllers.getMyDailySadaqahDonations,
);

router.get(
  '/:id',
  auth('user'),
  DailySadaqahDonationsControllers.getDailySadaqahDonationsById,
);

export const DailySadaqahDonationsRoutes = router;
