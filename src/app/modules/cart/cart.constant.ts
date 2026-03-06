export const DONATION_MODELS = [
  'SadaqahJariyahDonations',
  'MonthlyDonations',
  'TopAppealsDonations',
  'DonationsSubcategory',
  'TopAppeals',
  'SadaqahJariyah',
  'DailySadaqah',
  'DailySadaqahDonation',
] as const;

export type TDonationModel = (typeof DONATION_MODELS)[number];
