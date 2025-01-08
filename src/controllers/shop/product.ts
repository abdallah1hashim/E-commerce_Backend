import { NextFunction, Request, Response } from "express";
import HTTPError, { ErrorType } from "../../libs/HTTPError";
import { validationResult } from "express-validator";
import fs from "fs/promises";

import Product from "../../Models/Product";
import { clearImage } from "../../libs/utils";

import ProductService from "../../services/productService";
import ProductImages from "../../Models/ProductImages";
import productSchema from "../../validators/product";
import {
  handleAllPreviewImages,
  handleProductImages,
  saveImages,
} from "../../middlewares/multer";
import { Size } from "../../types/types";
import ProductDetails from "../../Models/ProductDetails";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search as string;
    const category = req.query.category as string;

    const products = await Product.getAll({
      limit,
      offset,
      searchTerm,
      category,
    });
    const total_products = +(await Product.getProductsCount({
      category,
      searchTerm,
    }));
    res.status(200).json({
      products,
      total_products,
      limit,
      page,
      maxPages: Math.ceil(total_products / limit),
    });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("body in req", req.body);
  try {
    console.log("createProduct");
    // 1. Validate input
    const validatedProduct = productSchema.parse(req.body);

    console.log(validatedProduct);

    // 2. Handle images
    const resImgPreview = await handleAllPreviewImages(req);
    const resImgs = await handleProductImages(req);
    // console.log("resImgsPrev", resImgPreview, "resImgs", resImgs);
    if (
      !resImgPreview ||
      !resImgs ||
      !resImgs.images ||
      !resImgPreview.images ||
      resImgPreview.count === 0 ||
      resImgs.count === 0
    ) {
      throw new HTTPError(400, "Images are required");
    }
    const { images: PreviewImages } = resImgPreview;
    const { images: imgaes } = resImgs;

    const imagesDBPaths = imgaes.map((img) => img.databasePath);
    const PreviewImagesDBPaths = PreviewImages.map((img) => img.databasePath);
    console.log("PreviewImages: ", PreviewImages);
    console.log("imagesDBPaths:", imagesDBPaths);
    // product_details
    const product_details = validatedProduct.product_details.map((pd, i) => ({
      size: pd.size as Size,
      color: pd.color,
      stock: pd.stock,
      discount: pd.discount,
      price: pd.price,
      img_preview: PreviewImagesDBPaths[i],
    }));
    // 3. Create product (service layer)
    await ProductService.createProduct(
      validatedProduct.name,
      validatedProduct.description,
      validatedProduct.category_id,
      validatedProduct.group_id,
      imagesDBPaths,
      product_details
    );

    // 4. save image if all goes well
    saveImages([
      ...imgaes.map((img) => ({ path: img.localPath, buffer: img.buffer })),
      ...PreviewImages.map((img) => ({
        path: img.localPath,
        buffer: img.buffer,
      })),
    ]);
    // // 5. send response
    res.status(201).json({ message: "Product created successfully" });
  } catch (err: any) {
    console.log(err);
    next(err);
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
    const productWithImages =
      (await ProductService.getProductByIdWithImagesAndDetails(
        productId
      )) as Product & { images: ProductImages[] };

    res.status(200).json({ product: { ...productWithImages } });
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
      +req.body.price
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
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   res.status(400).json({ errors: errors.array() });
    //   return;
    // }
    // const resImg = await handleOverviewImage(req);
    // if (!resImg) {
    //   throw new HTTPError(400, "Image is required");
    // }
    // const { overviewImageBuffer, overviewImagePath, overviewDatabasePath } =
    //   resImg;

    // const retrievedProduct = await ProductService.findById(
    //   +req.params.productId
    // );
    // const result = await ProductService.updateOverViewImage(
    //   +req.params.productId,
    //   overviewDatabasePath
    // );
    // if (result.id && retrievedProduct.overview_img_url) {
    //   await fs.unlink(retrievedProduct.overview_img_url as string);
    // }
    // saveImage([{ imagePath: overviewImagePath, buffer: overviewImageBuffer }]);
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
    // if (retrievedProduct.overview_img_url) {
    //   await fs.unlink(retrievedProduct.overview_img_url as string);
    // }
    // const result = await ProductService.updateOverViewImage(
    //   +req.params.productId,
    //   null
    // );
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
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   res.status(400).json({ errors: errors.array() });
    //   return;
    // }
    // const resImgs = await handleImages(req);
    // if (!resImgs) {
    //   throw new HTTPError(400, "Image is required");
    // }
    // const { imagesPaths, imagesDatabasePaths, imagesBuffers } = resImgs;
    // const imagesPathsAsStringArray: string[] = imagesPaths as string[];
    // const imagesBuffersAsBufferArray: Buffer[] = imagesBuffers as Buffer[];

    // const productImages = new ProductImages(
    //   undefined,
    //   undefined,
    //   +req.params.productId
    // );
    // const retrievedProductImgs =
    //   (await productImages.findByProductId()) as ProductImages[];
    // if (retrievedProductImgs.length + imagesPathsAsStringArray.length > 5) {
    //   throw new HTTPError(
    //     400,
    //     "You can not add more than 5 images to a product"
    //   );
    // }
    // const result = await ProductService.createProductImage(
    //   +req.params.productId,
    //   imagesDatabasePaths
    // );
    // saveImage([
    //   ...imagesBuffersAsBufferArray.map((buffer, index) => ({
    //     imagePath: imagesPathsAsStringArray[index],
    //     buffer,
    //   })),
    // ]);
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
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   res.status(400).json({ errors: errors.array() });
    //   return;
    // }
    // const id = req.body.ids as number;
    // const resImg = await handleImage(req);
    // if (!resImg) {
    //   throw new HTTPError(400, "Image is required");
    // }
    // const { imagePath, buffer } = resImg;
    // const productImage = new ProductImages(id, imagePath, undefined);
    // const retrievedImg = (await productImage.findById()) as ProductImages;
    // const result = (await productImage.update()) as ProductImages;
    // if ((result.id, retrievedImg)) {
    //   await fs.unlink(retrievedImg.image_url as string);
    // }
    // saveImage([{ imagePath, buffer }]);
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
    // if (result.overview_img_url) {
    //   await clearImage(result.overview_img_url);
    // }
    if (images) {
      await Promise.all(
        images.map((image) => clearImage(image.image_url as string))
      );
    }
    res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
