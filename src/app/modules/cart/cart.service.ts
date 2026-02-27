import mongoose from 'mongoose';
import { Cart } from './cart.model';
import { SadaqahJariyahDonations } from '../sadaqahJariyahDonations/sadaqahJariyahDonations.model';
import { MonthlyDonations } from '../monthlyDonations/monthlyDonations.model';
import { TopAppealsDonations } from '../topAppealsDonations/topAppealsDonations.model';
import { TAddToCartPayload, TDonationModelType } from './cart.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { recalculateCart } from './cart.utils';

const DonationModelMap: Record<TDonationModelType, mongoose.Model<any>> = {
  SadaqahJariyahDonations,
  MonthlyDonations,
  TopAppealsDonations,
};

const getMyCartFromDB = async (userId: string) => {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [], subTotal: 0, totalPrice: 0 } },
    {
      new: true,
      upsert: true,
      lean: true,
    },
  );

  return cart;
};

const addToCartIntoDB = async (userId: string, payload: TAddToCartPayload) => {
  const { donationId, donationModel } = payload;

  // ✅ Step 1: donationId format validate
  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid donation ID');
  }

  // ✅ Step 2: সঠিক model থেকে donation খোঁজা
  const DonationModel = DonationModelMap[donationModel];
  const donation = await DonationModel.findById(donationId);

  if (!donation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Donation not found');
  }

  if (donation.isDeleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This donation is no longer available',
    );
  }

  // ✅ Step 3: user এর cart খোঁজা, না থাকলে নতুন তৈরি
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // ✅ Step 4: same item already cart এ আছে কিনা চেক
  const existingItem = cart.items.find(
    (item) =>
      item.donationId.toString() === donationId &&
      item.donationModel === donationModel,
  );

  if (existingItem) {
    // বার বার click করলে quantity +1
    existingItem.quantity += 1;
  } else {
    // প্রথমবার add হলে নতুন item push
    cart.items.push({
      donationId: donation._id,
      donationModel,
      name: donation.name,
      image: donation.image ?? null,
      price: donation.amount,
      donationsType: donation.donationsType,
      quantity: 1,
      subtotal: 0, // pre-save hook এ calculate হবে
    });
  }

  // ✅ Step 5: save — pre-save hook subtotal + totalPrice calculate করবে
  await cart.save();
  return cart;
};

const incrementCartItemQuantityIntoDB = async (
  userId: string,
  itemId: string,
) => {
  // Validate the format of the provided itemId
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid item ID');
  }

  // Atomically increment quantity by 1 using $inc
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': new mongoose.Types.ObjectId(itemId),
    },
    { $inc: { 'items.$.quantity': 1 } },
    { new: true },
  );

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in your cart');
  }

  // Recalculate subtotal + totalPrice after increment
  await recalculateCart(cart);
  return cart;
};

const decrementCartItemQuantityIntoDB = async (
  userId: string,
  itemId: string,
) => {
  // Validate the format of the provided itemId
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid item ID');
  }

  // Decrement only if quantity > 1 — prevents going below 1
  let cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': new mongoose.Types.ObjectId(itemId),
      'items.quantity': { $gt: 1 },
    },
    { $inc: { 'items.$.quantity': -1 } },
    { new: true },
  );

  if (!cart) {
    // quantity was 1 — remove item completely using $pull
    cart = await Cart.findOneAndUpdate(
      {
        userId,
        'items._id': new mongoose.Types.ObjectId(itemId),
      },
      { $pull: { items: { _id: itemId } } },
      { new: true },
    );
  }

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in your cart');
  }

  // Recalculate subtotal + totalPrice after decrement
  await recalculateCart(cart);
  return cart;
};

const removeItemFromCart = async (userId: string, itemId: string) => {
  // Validate the format of the provided itemId
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid item ID');
  }

  // Atomically remove the item using $pull — no need to fetch first
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': new mongoose.Types.ObjectId(itemId), // confirm item exists
    },
    { $pull: { items: { _id: itemId } } },
    { new: true },
  );

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in your cart');
  }

  // Recalculate subtotal + totalPrice after removal
  await recalculateCart(cart);
  return cart;
};

const deleteCartFromDB = async (userId: string) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  return { message: 'Cart cleared successfully' };
};

export const CartService = {
  getMyCartFromDB,
  addToCartIntoDB,
  incrementCartItemQuantityIntoDB,
  decrementCartItemQuantityIntoDB,
  removeItemFromCart,
  deleteCartFromDB,
};
