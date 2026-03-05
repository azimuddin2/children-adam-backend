import mongoose, { Schema, model } from 'mongoose';
import { TCart, TCartItem } from './cart.interface';
import { DONATION_MODELS } from './cart.constant';

const CartItemSchema = new Schema<TCartItem>({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.donationModel',
  },
  donationModel: {
    type: String,
    required: true,
    enum: DONATION_MODELS,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  donationsType: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
});

const CartSchema = new Schema<TCart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Cart = model<TCart>('Cart', CartSchema);
