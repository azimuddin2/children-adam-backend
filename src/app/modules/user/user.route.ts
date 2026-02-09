import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';

const router = express.Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/signup',
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.signupUser,
);

router.get('/', auth('admin'), UserControllers.getAllUsers);

router.get('/profile', auth('user', 'admin'), UserControllers.getUserProfile);

router.patch(
  '/profile',
  auth('admin', 'user'),
  validateRequest(UserValidations.updateUserValidationSchema),
  UserControllers.updateUserProfile,
);

router.patch(
  '/profile/picture',
  auth('admin', 'user'),
  upload.single('profile'),
  UserControllers.updateUserPicture,
);

router.put(
  '/change-status/:id',
  auth('admin'),
  validateRequest(UserValidations.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.delete('/', auth('admin', 'user'), UserControllers.deleteUserAccount);

router.patch(
  '/update-notifications',
  auth('admin', 'user'),
  validateRequest(UserValidations.notificationSettingsValidationSchema),
  UserControllers.updateNotificationSettings,
);

export const UserRoutes = router;
