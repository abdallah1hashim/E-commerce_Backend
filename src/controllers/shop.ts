import { NextFunction, Request, Response } from "express";
import HTTPError, { ErrorType } from "../utils/HTTPError";

import Product from "../Models/Product";
import { clearImage } from "../utils/fns";
import { validationResult } from "express-validator";
import { CustomFiles } from "../types";
import { handlefileUpload, saveImage } from "../middlewares/multer";

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
