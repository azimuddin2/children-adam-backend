import mongoose, { model, Schema } from 'mongoose';
import { TOrder } from './order.interface';

const OrderItemSchema = new Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'items.donationModel',
    required: true,
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
  name: { type: String, required: true },
  image: { type: String, default: null },
  price: { type: Number, required: true },
  donationsType: { type: String, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new Schema<TOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Order = model<TOrder>('Order', OrderSchema);
