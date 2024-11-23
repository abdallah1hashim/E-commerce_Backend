import { NextFunction, Request, Response } from "express";
import multer, { diskStorage, memoryStorage } from "multer";
import path from "path";
import fs from "fs/promises";
import { CustomFiles, MulterFile } from "../types/types";
import HTTPError from "../utils/HTTPError";

const inMemoryStorage = memoryStorage();

// const fileStorage = diskStorage({
//   destination: (req, file, cb) => {
//     const imagesPath = path.join(__dirname, "..", "images");
//     cb(null, imagesPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

export const handlefileUpload = async (
  req: Request & { files?: CustomFiles }
) => {
  const overviewImage = req.files?.overview_img_url?.[0];
  if (!overviewImage) {
    throw new HTTPError(400, "Overview image is required");
  }
  const overviewImageOrignalName =
    Date.now() +
    "-" +
    Math.random().toString(36) +
    "-" +
    overviewImage.originalname;
  console.log(overviewImageOrignalName);
  const overviewImageBuffer = overviewImage.buffer;
  const overviewImagePath = path.join(
    __dirname,
    "..",
    "..",
    "images",
    overviewImageOrignalName
  );
  const overviewDatabasePath = `/images/${overviewImageOrignalName}`;
  // Collect additional images
  const imagesOriginal =
    req.files?.images?.map((file) => {
      return file.originalname;
    }) || [];
  if (imagesOriginal.length === 0) {
    throw new HTTPError(400, "At least one image is required");
  }
  const imagesPaths = req.files?.images?.map((file) => {
    console.log(file.originalname);
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
    overviewImageOrignalName,
    overviewDatabasePath,
    overviewImageBuffer,
    overviewImagePath,
    imagesOriginal,
    imagesDatabasePaths,
    imagesPaths,
    imagesBuffers,
  };
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

export default uploadMiddleware;
