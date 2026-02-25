import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { OtpRoutes } from '../modules/otp/otp.route';
import { TermsRoutes } from '../modules/terms/terms.route';
import { PrivacyRoutes } from '../modules/privacy/privacy.route';
import { AboutRoutes } from '../modules/about/about.route';
import { SupportRoutes } from '../modules/support/support.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import { NotificationRoutes } from '../modules/notification/notification.route';
import { NewsRoutes } from '../modules/news/news.route';
import { PollRoutes } from '../modules/poll/poll.route';
import { DonationsCategoryRoutes } from '../modules/monthlyDonationCategory/monthlyDonationCategory.route';
import { DonationsSubcategoryRoutes } from '../modules/monthlyDonationSubcategory/monthlyDonationSubcategory.route';
import { SadaqahJariyahRoutes } from '../modules/sadaqahJariyah/sadaqahJariyah.route';
import { TopAppealsRoutes } from '../modules/topAppeals/topAppeals.route';
import { TopAppealsCategoryRoutes } from '../modules/topAppealsCategory/topAppealsCategory.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/otp',
    route: OtpRoutes,
  },
  {
    path: '/terms',
    route: TermsRoutes,
  },
  {
    path: '/privacy',
    route: PrivacyRoutes,
  },
  {
    path: '/about',
    route: AboutRoutes,
  },
  {
    path: '/supports',
    route: SupportRoutes,
  },
  {
    path: '/news',
    route: NewsRoutes,
  },
  {
    path: '/polls',
    route: PollRoutes,
  },
  {
    path: '/monthly-donations-categories',
    route: DonationsCategoryRoutes,
  },
  {
    path: '/monthly-donations-subcategories',
    route: DonationsSubcategoryRoutes,
  },
  {
    path: '/sadaqah-jariyah',
    route: SadaqahJariyahRoutes,
  },
  {
    path: '/top-appeals-categories',
    route: TopAppealsCategoryRoutes,
  },
  {
    path: '/top-appeals',
    route: TopAppealsRoutes,
  },
  // TODO:
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
