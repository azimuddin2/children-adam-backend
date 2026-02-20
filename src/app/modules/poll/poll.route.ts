import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { PollValidations } from './poll.validation';
import { PollControllers } from './poll.controller';

const router = express.Router();

router.post(
  '/',
  auth('admin'),
  validateRequest(PollValidations.createPollValidationSchema),
  PollControllers.createPoll,
);

router.patch('/vote', auth('user'), PollControllers.votePoll);

export const PollRoutes = router;
