import { Router } from 'express';
import { DashboardControllers } from './dashboard.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/stats', auth('admin'), DashboardControllers.getDashboardStats);

router.get(
  '/earnings-overview',
  auth('admin'),
  DashboardControllers.getEarningsOverview,
);

router.get(
  '/user-overview',
  auth('admin'),
  DashboardControllers.getUserOverview,
);

export const DashboardRoutes = router;
