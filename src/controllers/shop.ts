import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import HTTPError, { ErrorType } from "../utils/HTTPError";

import Product from "../Models/Product";
import { clearImage } from "../utils/fns";

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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const overViewImagePath = req.files?.overview_img_url[0].filename || "";
  // @ts-ignore
  const images = req.files?.images?.map((image) => image.filename) || [];
  try {
    const product = new Product(
      0,
      req.body.name,
      req.body.description,
      +req.body.price,
      +req.body.stock,
      overViewImagePath,
      images,
      +req.body.category_id
    );
    const result = await product.createProduct();
    res.status(201).json({ message: "Product created successfully", result });
  } catch (err: any) {
    const filePath = path.resolve(__dirname, "../../images");
    try {
      await fs.unlink(filePath);
      console.log(`File removed: ${overViewImagePath}`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.warn(`File not found, skipping removal: ${filePath}`);
      } else {
        throw error;
      }
    }
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
    console.log("hi");
    console.log(product);
    result.images.forEach(async (image) => {
      console.log(image);
      await clearImage(image);
    });
    console.log("hi");
    res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
