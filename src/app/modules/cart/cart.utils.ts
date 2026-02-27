import { TCartItem } from './cart.interface';

export const recalculateCart = async (cart: any) => {
  cart.items.forEach((item: TCartItem) => {
    item.subtotal = item.price * item.quantity;
  });
  cart.subTotal = cart.items.reduce(
    (acc: number, item: TCartItem) => acc + item.subtotal,
    0,
  );
  cart.totalPrice = cart.subTotal;
  await cart.save();
};
