import config from '../../config';
import httpStatus from 'http-status';
import StripeService from '../../class/stripe';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';

// Create Stripe Express account & onboarding link
const stripLinkAccount = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');

  // 1️⃣ Prevent creating multiple accounts
  if (user.stripeAccountId) {
    return {
      object: 'already_exists',
      url: null,
      message: 'User already has a Stripe account',
      accountId: user.stripeAccountId,
    };
  }

  //2️⃣ Create new Stripe Express account
  const account = await StripeService.getStripe().accounts.create({
    type: 'express',
    country: 'US',
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const refresh_url = `${config.server_url}/api/v1/stripe/refresh/${account.id}?userId=${user._id}`;
  const return_url = `${config.server_url}/api/v1/stripe/return?userId=${user._id}&stripeAccountId=${account.id}`;

  const accountLink = await StripeService.connectAccount(
    return_url,
    refresh_url,
    account.id,
  );

  return {
    object: accountLink.object,
    url: accountLink.url,
    expires_at: accountLink.expires_at,
    created: accountLink.created,
    accountId: account.id,
  };
};

// Refresh onboarding for incomplete accounts
const refresh = async (stripeAccountId: string, query: Record<string, any>) => {
  const user = await User.findById(query.userId);
  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');

  const refresh_url = `${config.server_url}/api/v1/stripe/refresh/${stripeAccountId}?userId=${user._id}`;
  const return_url = `${config.server_url}/api/v1/stripe/return?userId=${user._id}&stripeAccountId=${stripeAccountId}`;

  const accountLink = await StripeService.connectAccount(
    return_url,
    refresh_url,
    stripeAccountId,
  );
  return accountLink.url;
};

// Complete onboarding and save stripeAccountId in DB
const returnUrl = async (payload: {
  userId: string;
  stripeAccountId: string;
}) => {
  const user = await User.findByIdAndUpdate(
    payload.userId,
    { stripeAccountId: payload.stripeAccountId },
    { new: true }, // updated document return
  );

  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  return true;
};

// Admin: delete all restricted test accounts
const deleteAllRestrictedTestAccounts = async () => {
  const results = await StripeService.deleteAllRestrictedAccounts();
  return { count: results.length };
};

export const stripeService = {
  stripLinkAccount,
  refresh,
  returnUrl,
  deleteAllRestrictedTestAccounts,
};
