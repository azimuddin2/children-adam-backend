import { TPaymentStatus } from './payment.interface';

export const PaymentStatus: TPaymentStatus[] = [
  'pending',
  'paid',
  'refunded',
  'cancelled',
];

export enum PAYMENT_STATUS {
  pending = 'pending',
  paid = 'paid',
  refunded = 'refunded',
  cancelled = 'cancelled',
}

// payment.constant.ts

export const paymentSearchableFields = [
  'trnId',
  'status',
  'type',
  'order.items.name', // ✅ item name দিয়ে search
  'order.items.donationModel', // ✅ donation model দিয়ে search
  'order.items.donationsType', // ✅ donation type দিয়ে search
];
