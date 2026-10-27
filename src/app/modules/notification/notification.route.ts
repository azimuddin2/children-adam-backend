import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { NotificationControllers } from './notification.controller';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  NotificationControllers.getAllNotification,
);

router.put(
  '/make-read/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  NotificationControllers.makeRead,
);

router.put(
  '/make-read-all',
  auth(USER_ROLE.user, USER_ROLE.admin),
  NotificationControllers.makeReadAll,
);

router.get(
  '/admin-notifications',
  auth(USER_ROLE.admin),
  NotificationControllers.getAdminAllNotification,
);

router.post(
  '/push-notification',
  auth(USER_ROLE.user, USER_ROLE.admin),
  NotificationControllers.pushNotificationUser,
);

router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  NotificationControllers.deleteNotification,
);

export const NotificationRoutes = router;
