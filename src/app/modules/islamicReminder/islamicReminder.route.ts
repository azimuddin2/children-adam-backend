import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { IslamicReminderValidations } from './islamicReminder.validation';
import { IslamicReminderControllers } from './islamicReminder.controller';

const router = express.Router();

router.get(
  '/today',
  // auth('user', 'admin'),
  IslamicReminderControllers.getTodayIslamicReminder,
);

router.post(
  '/',
  auth('admin'),
  validateRequest(
    IslamicReminderValidations.createIslamicReminderValidationSchema,
  ),
  IslamicReminderControllers.createIslamicReminder,
);

router.get(
  '/',
  auth('admin'),
  IslamicReminderControllers.getAllIslamicReminders,
);

router.get(
  '/:id',
  auth('admin'),
  IslamicReminderControllers.getIslamicReminderById,
);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(
    IslamicReminderValidations.updateIslamicReminderValidationSchema,
  ),
  IslamicReminderControllers.updateIslamicReminder,
);

router.delete(
  '/:id',
  auth('admin'),
  IslamicReminderControllers.deleteIslamicReminder,
);

export const IslamicReminderRoutes = router;
