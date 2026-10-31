import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middlewares/parseData';
import { ProjectValidations } from './project.validation';
import { ProjectControllers } from './project.controller';

const router = express.Router();

const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(ProjectValidations.createProjectSchema),
  ProjectControllers.createProject,
);

router.get('/', ProjectControllers.getAllProjects);

router.get('/:id', auth('admin', 'user'), ProjectControllers.getProjectById);

router.patch(
  '/:id',
  auth('admin'),
  upload.fields([{ name: 'images', maxCount: 10 }]),
  parseData(),
  validateRequest(ProjectValidations.updateProjectSchema),
  ProjectControllers.updateProject,
);

router.delete('/:id', auth('admin'), ProjectControllers.deleteProject);

export const ProjectRoutes = router;
