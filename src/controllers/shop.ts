import { NextFunction, Request, Response } from "express";
import HTTPError, { ErrorType } from "../utils/HTTPError";
import { validationResult } from "express-validator";
import fs from "fs/promises";

import Product from "../Models/Product";
import { clearImage } from "../utils/fns";
import { DetailedOrder, UserRole } from "../types/types";
import {
  handleImage,
  handleImages,
  handleOverviewImage,
  saveImage,
} from "../middlewares/multer";
import Cart from "../Models/Cart";
import ProductService from "../services/productService";
import ProductImages from "../Models/ProductImages";
import OrderService from "../services/OrderService";
import Order from "../Models/Order";
import Category from "../Models/Category";
import CategoryService from "../services/CategoryService";
import CategoryModel from "../Models/Category";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const products = await Product.getAll(limit, offset, search);
    res.status(200).json({ products });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // 2. Handle images
    const resImg = await handleOverviewImage(req);
    const resImgs = await handleImages(req);
    if (!resImg || !resImgs) {
      throw new HTTPError(400, "Images are required");
    }
    const { overviewImageBuffer, overviewImagePath, overviewDatabasePath } =
      resImg;
    const { imagesPaths, imagesDatabasePaths, imagesBuffers } = resImgs;

    const imagesPathsAsStringArray: string[] = imagesPaths as string[];
    const imagesBuffersAsBufferArray: Buffer[] = imagesBuffers as Buffer[];

    // 3. Create product (service layer)
    await ProductService.createProduct(
      req.body.name,
      req.body.description,
      req.body.price,
      req.body.stock,
      overviewDatabasePath,
      req.body.category_id,
      imagesDatabasePaths
    );

    // 4. save image if all goes well
    saveImage([
      { imagePath: overviewImagePath, buffer: overviewImageBuffer },
      ...imagesBuffersAsBufferArray.map((buffer, index) => ({
        imagePath: imagesPathsAsStringArray[index],
        buffer,
      })),
    ]);
    // 5. send response
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
    const result = (await ProductService.getProductByIdWithImages(
      productId
    )) as Product & { images: ProductImages[] };
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
    const product = new Product(
      +req.params.productId,
      req.body.name,
      req.body.description,
      +req.body.price,
      +req.body.stock,
      undefined,
      +req.body.category_id
    );
    const result = await product.update();
    res.status(200).json({ message: "Product updated successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateProductOverViewImage = async (
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
    const resImg = await handleOverviewImage(req);
    if (!resImg) {
      throw new HTTPError(400, "Image is required");
    }
    const { overviewImageBuffer, overviewImagePath, overviewDatabasePath } =
      resImg;

    const retrievedProduct = await ProductService.findById(
      +req.params.productId
    );
    const result = await ProductService.updateOverViewImage(
      +req.params.productId,
      overviewDatabasePath
    );
    if (result.id && retrievedProduct.overview_img_url) {
      await fs.unlink(retrievedProduct.overview_img_url as string);
    }
    saveImage([{ imagePath: overviewImagePath, buffer: overviewImageBuffer }]);
    res.status(200).json({ message: "Product image updated successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const deleteProductOverViewImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const retrievedProduct = await ProductService.findById(
      +req.params.productId
    );
    if (retrievedProduct.overview_img_url) {
      await fs.unlink(retrievedProduct.overview_img_url as string);
    }
    const result = await ProductService.updateOverViewImage(
      +req.params.productId,
      null
    );
    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const addProductImages = async (
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
    const resImgs = await handleImages(req);
    if (!resImgs) {
      throw new HTTPError(400, "Image is required");
    }
    const { imagesPaths, imagesDatabasePaths, imagesBuffers } = resImgs;
    const imagesPathsAsStringArray: string[] = imagesPaths as string[];
    const imagesBuffersAsBufferArray: Buffer[] = imagesBuffers as Buffer[];

    const productImages = new ProductImages(
      undefined,
      undefined,
      +req.params.productId
    );
    const retrievedProductImgs =
      (await productImages.findByProductId()) as ProductImages[];
    if (retrievedProductImgs.length + imagesPathsAsStringArray.length > 5) {
      throw new HTTPError(
        400,
        "You can not add more than 5 images to a product"
      );
    }
    const result = await ProductService.createProductImage(
      +req.params.productId,
      imagesDatabasePaths
    );
    saveImage([
      ...imagesBuffersAsBufferArray.map((buffer, index) => ({
        imagePath: imagesPathsAsStringArray[index],
        buffer,
      })),
    ]);
    res.status(200).json({ message: "Product image added successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const updateProductImages = async (
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
    const id = req.body.ids as number;
    const resImg = await handleImage(req);
    if (!resImg) {
      throw new HTTPError(400, "Image is required");
    }
    const { imagePath, buffer } = resImg;
    const productImage = new ProductImages(id, imagePath, undefined);
    const retrievedImg = (await productImage.findById()) as ProductImages;
    const result = (await productImage.update()) as ProductImages;
    if ((result.id, retrievedImg)) {
      await fs.unlink(retrievedImg.image_url as string);
    }
    saveImage([{ imagePath, buffer }]);
    res.status(200).json({ message: "Product image updated successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.ids as number;
    const productImage = new ProductImages(id);
    const result = (await productImage.delete()) as ProductImages;
    if (result.id) {
      await fs.unlink(result.image_url as string);
    }
    res.status(200).json({ message: "Product image deleted successfully" });
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
    const productResult = new ProductImages(undefined, undefined, productId);
    const images = (await productResult.findByProductId()) as ProductImages[];
    const result = (await product.delete()) as Product;
    if (result.overview_img_url) {
      await clearImage(result.overview_img_url);
    }
    await Promise.all(
      images.map((image) => clearImage(image.image_url as string))
    );
    res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getCategores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all categories
    const categories = (await Category.findAll()) as Category[];
    // Generate nested category structure
    const nestedCategories = CategoryService.buildCategoryTree(categories);

    // Send response
    res.status(200).json({ categories: nestedCategories });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const createCategory = async (
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
    const { name, parentId } = req.body;
    const category = await CategoryService.createCategory({
      name,
      parentId,
    });
    res
      .status(200)
      .json({ message: "Category created successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const updateCategory = async (
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
    const { id, name, parentId } = req.body;
    const category = await CategoryModel.update({
      id,
      name,
      parentId,
    });
    res
      .status(200)
      .json({ message: "Category updated successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const deleteCategory = async (
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
    const { id } = req.body;
    const category = await CategoryModel.destroy({ where: { id } });
    res
      .status(200)
      .json({ message: "Category deleted successfully", data: category });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
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
    const productResult = (await product.getById()) as Product;

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
export const createOrder = async (
  res: Response,
  req: Request,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const orderItems = req.body.orderItems;
    const userId = req.userId;
    const order = await OrderService.createOrder(userId as number, orderItems);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as number;
    const role = req.userRole as UserRole;
    let orders;
    if (role === "Admin") {
      orders = await Order.getAll();
    } else {
      orders = await Order.getAll(userId);
    }
    res.status(200).json({ orders });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId as number;
    const role = req.userRole;

    if (!role) {
      throw new Error("User role Not defined");
    }

    let order: DetailedOrder;
    if (role === "admin") {
      order = (await OrderService.getOrderById(orderId)) as DetailedOrder;
    } else {
      order = (await OrderService.getOrderById(
        orderId,
        userId
      )) as DetailedOrder;
    }

    res.status(200).json({ order });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateOrder = async (
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

    const userId = Number(req.userId);
    const userRole = req.userRole;
    const orderId = +req.params.orderId;
    const { status } = req.body;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new HTTPError(404, `Order with ID ${orderId} not found`);
    }

    const isUserAuthorized = order.user_id === userId || userRole === "admin";

    if (!isUserAuthorized) {
      throw new HTTPError(403, "You are not authorized to update this order");
    }
    const serviceMethod =
      status === "Cancelled"
        ? OrderService.cancelOrder.bind(null, orderId)
        : OrderService.updateOrderStatus.bind(null, orderId, status);

    await serviceMethod();

    const successMessage =
      status === "Cancelled"
        ? "Order cancelled successfully"
        : `Order status updated to ${status} successfully`;

    res.status(200).json({ message: successMessage });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const deleteOrder = async (
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
    const orderId = Number(req.params.orderId);
    const order = new Order(undefined, undefined, undefined, undefined);
    await order.delete();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
