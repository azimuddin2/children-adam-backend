import { TDonationStatus } from './dailySadaqahDonations.interface';

export const DONATION_STATUS: TDonationStatus[] = [
  'pending',
  'completed',
  'failed',
] as const;
export const DEFAULT_TIMEZONE = 'UTC';
