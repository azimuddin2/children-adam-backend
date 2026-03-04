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

  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      'items._id': objectItemId,
    },
    {
      $inc: {
        'items.$.quantity': 1,
        subTotal: 0, // temporary (we recalc below)
        totalPrice: 0,
      },
    },
    {
      new: true,
      projection: {
        items: { $elemMatch: { _id: objectItemId } },
        subTotal: 1,
        totalPrice: 1,
        updatedAt: 1,
      },
    },
  );

  if (!cart || !cart.items.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found');
  }

  // manually update subtotal for that item
  const updatedItem = cart.items[0];
  updatedItem.subtotal = updatedItem.price * updatedItem.quantity;

  // recalculate full cart total safely
  const fullCart = await Cart.findOne({ userId });

  if (!fullCart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  fullCart.subTotal = fullCart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  fullCart.totalPrice = fullCart.subTotal;

  await fullCart.save();

  return {
    item: updatedItem,
    subTotal: fullCart.subTotal,
    totalPrice: fullCart.totalPrice,
  };
};

const decrementCartItemQuantityIntoDB = async (
  userId: string,
  itemId: string,
) => {
  const isExist = await Cart.findOne({
    userId,
    'items._id': itemId,
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  const cart = await Cart.findOneAndUpdate(
    {
      userId: userId,
      'items._id': itemId,
    },
    {
      $inc: {
        'items.$.quantity': -1,
      },
    },
    {
      new: true,
    },
  );

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // ⭐ Remove item if quantity <= 0
  await Cart.updateOne(
    {
      userId: userId,
      'items._id': itemId,
      'items.quantity': { $lte: 0 },
    },
    {
      $pull: {
        items: { _id: itemId },
      },
    },
  );

  const total = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

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
