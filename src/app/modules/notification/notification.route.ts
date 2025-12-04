import { Router } from 'express';
import { notificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

router.get(
  '/all-notification',
  auth(
    USER_ROLE.customer,
    USER_ROLE.owner,
    USER_ROLE.freelancer,
    USER_ROLE.admin,
  ),
  notificationController.getAllNotification,
);

router.put(
  '/make-read/:id',
  auth(
    USER_ROLE.customer,
    USER_ROLE.owner,
    USER_ROLE.freelancer,
    USER_ROLE.admin,
  ),
  notificationController.makeRead,
);

router.put(
  '/make-read-all',
  auth(
    USER_ROLE.customer,
    USER_ROLE.owner,
    USER_ROLE.freelancer,
    USER_ROLE.admin,
  ),
  notificationController.makeReadAll,
);

router.get(
  '/admin-all-notification',
  auth(
    USER_ROLE.customer,
    USER_ROLE.owner,
    USER_ROLE.freelancer,
    USER_ROLE.admin,
  ),
  notificationController.getAdminAllNotification,
);

router.post(
  '/push-notification',
  auth(
    USER_ROLE.customer,
    USER_ROLE.owner,
    USER_ROLE.freelancer,
    USER_ROLE.admin,
  ),
  notificationController.pushNotificationUser,
);

export const NotificationRoutes = router;
