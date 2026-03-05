import mongoose from 'mongoose';
import { Cart } from './cart.model';
import { SadaqahJariyahDonations } from '../sadaqahJariyahDonations/sadaqahJariyahDonations.model';
import { MonthlyDonations } from '../monthlyDonations/monthlyDonations.model';
import { TopAppealsDonations } from '../topAppealsDonations/topAppealsDonations.model';
import { TopAppeals } from '../topAppeals/topAppeals.model';
import { DonationsSubcategory } from '../monthlyDonationSubcategory/monthlyDonationSubcategory.model';
import { SadaqahJariyah } from '../sadaqahJariyah/sadaqahJariyah.model';
import { TCartItem, TDonationModelType } from './cart.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { recalculateCart } from './cart.utils';

const DonationModelMap: Record<TDonationModelType, mongoose.Model<any>> = {
  SadaqahJariyahDonations,
  MonthlyDonations,
  TopAppealsDonations,
  DonationsSubcategory,
  TopAppeals,
  SadaqahJariyah,
};

const addToCartIntoDB = async (userId: string, payload: TCartItem) => {
  const { donationId, donationModel, price } = payload;

  if (!mongoose.Types.ObjectId.isValid(donationId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid donation ID');
  }

  const DonationModel = DonationModelMap[donationModel];

  const donation = await DonationModel.findById(donationId);

  if (!donation || donation.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Donation is not available');
  }

  /**
   * ⭐ Step 1: Increase quantity if item exists
   */
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items.donationId': donationId,
      'items.donationModel': donationModel,
    },
    {
      $inc: {
        'items.$.quantity': 1,
      },
    },
    { new: true },
  );

  /**
   * ⭐ Step 2: If cart exists → update subtotal + totalPrice
   */
  if (cart) {
    cart.items = cart.items.map((item) => {
      if (
        item.donationId.toString() === donationId.toString() &&
        item.donationModel === donationModel
      ) {
        item.subtotal = item.price * item.quantity;
      }

      return item;
    });

    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

    await cart.save();

    return cart;
  }

  /**
   * ⭐ Step 3: If item not exists → create new cart item
   */
  const newCart = await Cart.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { userId },
      $push: {
        items: {
          donationId,
          donationModel,
          name: payload.name,
          image: payload.image ?? null,
          price,
          donationsType: payload.donationsType,
          quantity: 1,
          subtotal: price,
        },
      },
    },
    { new: true, upsert: true },
  );

  newCart.totalPrice = newCart.items.reduce(
    (acc, item) => acc + item.subtotal,
    0,
  );

  await newCart.save();

  return newCart;
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

const incrementCartItemQuantityIntoDB = async (
  userId: string,
  itemId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid item ID');
  }

  const objectItemId = new mongoose.Types.ObjectId(itemId);

  // ✅ Step 1: Increase quantity
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': objectItemId,
    },
    {
      $inc: {
        'items.$.quantity': 1,
      },
    },
    {
      new: true,
    },
  );

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found');
  }

  // ✅ Step 2: Update subtotal inside document array
  cart.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  // ✅ Step 3: Recalculate cart total
  cart.subTotal = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  cart.totalPrice = cart.subTotal;

  await cart.save();

  const updatedItem = cart.items.find(
    (item) => item._id?.toString() === itemId,
  );

  return {
    item: updatedItem,
    subTotal: cart.subTotal,
    totalPrice: cart.totalPrice,
  };
};

const decrementCartItemQuantityIntoDB = async (
  userId: string,
  itemId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid item ID');
  }

  const objectItemId = new mongoose.Types.ObjectId(itemId);

  // decrement quantity
  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': objectItemId,
    },
    {
      $inc: {
        'items.$.quantity': -1,
      },
    },
    { new: true },
  );

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // remove item if quantity <= 0
  cart.items = cart.items.filter((item) => item.quantity > 0);

  // update subtotal per item
  cart.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  // recalc cart total
  const total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  cart.subTotal = total;
  cart.totalPrice = total;

  await cart.save();

  const updatedItem = cart.items.find(
    (item) => item._id?.toString() === itemId,
  );

  return {
    item: updatedItem || { _id: itemId, removed: true },
    subTotal: total,
    totalPrice: total,
  };
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
