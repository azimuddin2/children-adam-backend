import { Router } from 'express';
import { stripeController } from './stripe.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.patch(
  '/connect',
  auth('freelancer', 'owner'),
  stripeController.stripLinkAccount,
);
router.get('/oauth/callback', stripeController?.handleStripeOAuth);
router.post('/return', stripeController.returnUrl);
router.get('/refresh/:id', stripeController.refresh);

router.delete(
  '/restricted/delete-all',
  auth('admin'),
  stripeController.deleteAllRestricted,
);

export const StripeRoute = router;
