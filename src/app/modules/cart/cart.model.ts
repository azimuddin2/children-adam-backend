import mongoose, { Schema, model } from 'mongoose';
import { TCart, TCartItem } from './cart.interface';

const CartItemSchema = new Schema<TCartItem>({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.donationModel',
  },
  donationModel: {
    type: String,
    required: true,
    enum: [
      'SadaqahJariyahDonations',
      'MonthlyDonations',
      'TopAppealsDonations',
    ],
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

CartSchema.pre('save', function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });
  this.subTotal = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.totalPrice = this.subTotal;
  next();
});

export const Cart = model<TCart>('Cart', CartSchema);
