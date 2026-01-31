import { Router } from 'express';
import { DashboardControllers } from './dashboard.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get(
  '/overview-stats',
  auth('admin'),
  DashboardControllers.getOverviewStats,
);

router.get(
  '/request-stats',
  auth('admin'),
  DashboardControllers.getRequestStats,
);

router.get(
  '/earnings-stats',
  auth('admin'),
  DashboardControllers.getEarningsStats,
);

export const DashboardRoutes = router;
