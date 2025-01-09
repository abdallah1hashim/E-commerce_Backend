import { NextFunction, Request, Response } from "express";
import HTTPError from "../../libs/HTTPError";
import CartItmes from "../../Models/CartItems";
import {
  cartItemEditSchema,
  cartItemSchema,
} from "../../validators/ZodSchemas";

// Cart Controller
export const getCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // instantiate cart object
    const cartItem = new CartItmes();
    cartItem.user_id = req.userId;

    // get cart items
    const cartItems = await cartItem.getCartByUserId();
    res.status(200).json({ cartItems });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = cartItemSchema.parse(req.body);

    const cartItem = new CartItmes(
      undefined,
      req.userId,
      validatedData.productId,
      validatedData.productDetailsId,
      validatedData.quantity
    );
    cartItem.create();
    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const validatedData = cartItemEditSchema.parse({ ...req.body, id: id });

    const cartItem = new CartItmes();
    cartItem.id = validatedData.id;
    cartItem.quantity = validatedData.quantity;
    cartItem.update();
    res.status(200).json({ message: "Product quantity updated successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.body.id);
    const type = req.params.type;
    const cart = new CartItmes(id, req.userId as number);
    if (type === "all") {
      await cart.deleteAll();
    }
    if (type === "single" && id) {
      await cart.deleteOne();
    }
    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
