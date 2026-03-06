import mongoose, { model, Schema } from 'mongoose';
import { TOrder } from './order.interface';
import { DONATION_MODELS } from '../cart/cart.constant';

const OrderItemSchema = new Schema({
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

const OrderSchema = new Schema<TOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderType: {
      type: String,
      enum: ['direct', 'cart'],
      required: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      default: null,
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
