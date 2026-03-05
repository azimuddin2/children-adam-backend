export const DONATION_MODELS = [
  'SadaqahJariyahDonations',
  'MonthlyDonations',
  'TopAppealsDonations',
  'DonationsSubcategory',
  'TopAppeals',
  'SadaqahJariyah',
] as const;

export type TDonationModel = (typeof DONATION_MODELS)[number];
