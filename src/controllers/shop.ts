import e, { NextFunction, Request, Response } from "express";
import HTTPError, { ErrorType } from "../utils/HTTPError";

import Product from "../Models/Product";
import { clearImage } from "../utils/fns";
import { validationResult } from "express-validator";
import { CustomFiles } from "../types";
import { handlefileUpload, saveImage } from "../middlewares/multer";
import Cart from "../Models/Cart";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await Product.getAllProducts(limit, offset);
    res.status(200).json({ products });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const createProduct = async (
  req: Request & { files?: CustomFiles },
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      overviewImagePath,
      overviewImageBuffer,
      overviewDatabasePath,
      imagesPaths,
      imagesDatabasePaths,
      imagesBuffers,
    } = await handlefileUpload(req);

    const imagesPathsAsStringArray: string[] = imagesPaths as string[];
    const imagesBuffersAsBufferArray: Buffer[] = imagesBuffers as Buffer[];

    const product = new Product(
      0,
      req.body.name,
      req.body.description,
      +req.body.price,
      +req.body.stock,
      overviewDatabasePath,
      imagesDatabasePaths as string[],
      +req.body.category_id
    );
    await product.createProduct();

    saveImage([
      { imagePath: overviewImagePath, buffer: overviewImageBuffer },
      ...imagesBuffersAsBufferArray.map((buffer, index) => ({
        imagePath: imagesPathsAsStringArray[index],
        buffer,
      })),
    ]);

    res.status(201).json({ message: "Product created successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.productId);
    if (isNaN(productId)) {
      throw new HTTPError(400, "Invalid product ID");
    }
    const product = new Product(productId);
    const result = await product.getProductById();
    res.status(200).json({ result });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const overViewImagePath = req.files?.overview_img_url[0].filename || "";
    // @ts-ignore
    const images = req.files?.images?.map((image) => image.filename) || [];

    const product = new Product(
      +req.params.productId,
      req.body.name,
      req.body.description,
      +req.body.price,
      +req.body.stock,
      overViewImagePath,
      images,
      +req.body.category_id
    );
    const result = await product.updateProduct();
    res.status(200).json({ message: "Product updated successfully", result });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.productId);
    if (isNaN(productId)) {
      throw new HTTPError(400, "Invalid product ID");
    }
    const product = new Product(productId);
    const result = (await product.deleteProduct()) as Product;
    await clearImage(result.overview_img_url);
    result.images.forEach(async (image) => {
      console.log(image);
      await clearImage(image);
    });
    res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = new Cart(undefined, req.userId);
    const cartItems = await cart.getCartByUserId();
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { productId, quantity } = req.body;

    // Get product details
    const product = new Product(productId);
    const productResult = (await product.getProductById()) as Product;

    // Check if the product is available in stock
    if (!productResult || productResult.stock === 0) {
      throw new HTTPError(400, "Product out of stock");
    }

    // Create or fetch the cart for the user and product
    const cart = new Cart(undefined, req.userId, productId, quantity);
    const cartResult = (await cart.getCartByProductIdAndUserId()) as Cart;

    if (cartResult) {
      if (quantity + cartResult.quantity > productResult.stock) {
        throw new HTTPError(400, "Not enough stock available");
      }
      if (quantity + cartResult.quantity > Number(process.env.MAX_QUANTITY)) {
        throw new HTTPError(400, "Maximum quantity exceeded");
      }
      cart.id = cartResult.id;

      cart.quantity = cartResult.quantity + quantity;
      console.log(
        "id:",
        cart.id,
        "cart quantity: ",
        cart.quantity,
        "user_id: ",
        cart.user_id
      );
      await cart.updateQuantity();
      res
        .status(200)
        .json({ message: "Product quantity updated successfully" });
      return;
    }
    if (quantity > productResult.stock) {
      throw new HTTPError(400, "Not enough stock available");
    }
    await cart.createCart();
    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateQuantityInCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { id, quantity } = req.body;
    const cart = new Cart(id, req.userId, quantity);
    await cart.updateQuantity();
    res.status(200).json({ message: "Product quantity updated successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const removeItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const id = Number(req.body.id);
    if (isNaN(id)) {
      throw new HTTPError(400, "Invalid cart ID");
    }
    const cart = new Cart(id, req.userId as number);
    await cart.deleteOneFromCart();
    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const removeAllFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = new Cart(undefined, req.userId as number);
    await cart.deleteAllFromCart();
    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
