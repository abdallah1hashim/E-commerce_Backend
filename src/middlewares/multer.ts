import { NextFunction, Request, Response } from "express";
import multer, { diskStorage, memoryStorage } from "multer";
import path from "path";
import fs from "fs/promises";
import HTTPError from "../libs/HTTPError";
import { CustomFiles } from "../types/express";

const inMemoryStorage = memoryStorage();

export const handleOverviewImage = async (
  req: Request & { files?: CustomFiles }
) => {
  const overviewImage = req.files?.overview_img_url?.[0];
  if (!overviewImage) {
    return null;
  }
  const overviewImageOrignalName = overviewImage.originalname;
  const overviewImageBuffer = overviewImage.buffer;
  const overviewImagePath = path.join(
    __dirname,
    "..",
    "..",
    "images",
    Date.now() +
      "-" +
      Math.random().toString(36) +
      "-" +
      overviewImage.originalname
  );
  const overviewDatabasePath = `/images/${overviewImageOrignalName}`;
  return {
    overviewImageOrignalName,
    overviewDatabasePath,
    overviewImageBuffer,
    overviewImagePath,
  };
};
export const handleImages = async (req: Request & { files?: CustomFiles }) => {
  const imagesOriginal =
    req.files?.images?.map((file) => {
      return file.originalname;
    }) || [];
  if (imagesOriginal.length === 0) {
    return null;
  }
  const imagesPaths = req.files?.images?.map((file) => {
    return path.join(
      __dirname,
      "..",
      "..",
      "images",
      Date.now() + "-" + Math.random().toString(36) + "-" + file.originalname
    );
  });
  const imagesBuffers = req.files?.images?.map((file) => {
    return file.buffer;
  });
  const imagesDatabasePaths =
    req.files?.images?.map((file) => {
      return `/images/${file.originalname}`;
    }) || [];

  return {
    imagesOriginal,
    imagesDatabasePaths,
    imagesPaths,
    imagesBuffers,
  };
};
export const handleImage = async (req: Request & { files?: CustomFiles }) => {
  const image = req.files?.images?.[0];
  if (!image) {
    return null;
  }
  const imageOrignalName = image.originalname;
  const imageBuffer = image.buffer;
  const imagePath = path.join(
    __dirname,
    "..",
    "..",
    "images",
    Date.now() + "-" + Math.random().toString(36) + "-" + image.originalname
  );
};
export const saveImage = async (
  files: { imagePath: string; buffer: Buffer }[]
) => {
  if (!files || files.length === 0) {
    throw new HTTPError(400, "Image is required");
  }
  try {
    await Promise.all(
      files.map(async (file) => {
        await fs.writeFile(file.imagePath, file.buffer);
      })
    );
  } catch (error: any) {
    throw new HTTPError(500, "Error saving files to disk", "Middelware");
  }
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadMiddleware = multer({
  storage: inMemoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "overview_img_url", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
export const uploadToUpdateOverviewImgMiddleware = multer({
  storage: inMemoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([{ name: "overview_img_url", maxCount: 1 }]);

export default uploadMiddleware;
