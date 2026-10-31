import { DEFAULT_TIMEZONE } from './dailySadaqahDonations.constant';

export const getToday = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: DEFAULT_TIMEZONE });

export const getCurrentMonth = () => getToday().slice(0, 7);

export const toPounds = (pence: number) => Math.round(pence) / 100;

export const formatDonation = (donation: any) => {
  const obj = donation?.toObject ? donation.toObject() : donation;
  return {
    ...obj,
    totalAmount: toPounds(obj.totalAmount),
    distribution: (obj.distribution ?? []).map((d: any) => ({
      ...d,
      amount: toPounds(d.amount),
    })),
  };
};
