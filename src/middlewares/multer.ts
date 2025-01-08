import { NextFunction, Request, Response } from "express";
import multer, { diskStorage, memoryStorage } from "multer";
import path from "path";
import fs from "fs/promises";
import HTTPError from "../libs/HTTPError";
import { CustomFiles } from "../types/express";
import { count } from "console";

const inMemoryStorage = memoryStorage();

export const handleAllPreviewImages = async (req: Request) => {
  if (!req.files || req.files.length === 0) {
    return null; // No files uploaded
  }

  // Filter all files with the prefix `img_preview`
  const previewImages = (req.files as Express.Multer.File[]).filter((file) =>
    file.fieldname.startsWith("img_preview[")
  );

  if (previewImages.length === 0) {
    return null; // No img_preview files found
  }
  // Process each preview image
  const processedImages = previewImages.map((file) => {
    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${uniqueSuffix}-${file.originalname}`;

    const previewImagePath = path.join(
      __dirname,
      "..",
      "..",
      "images",
      fileName
    );
    const previewDatabasePath = `/images/${fileName}`;

    return {
      originalName: file.originalname,
      buffer: file.buffer,
      localPath: previewImagePath,
      databasePath: previewDatabasePath,
    };
  });

  return { images: processedImages, count: processedImages.length };
};

export const handleProductImages = async (req: Request) => {
  const images = (req.files as Express.Multer.File[]).filter(
    (file) => file.fieldname === "images"
  );
  if (!images) {
    return null;
  }

  const processedImages = images.map((file, index) => {
    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${uniqueSuffix}-${file.originalname}`;

    const imagePath = path.join(__dirname, "..", "..", "images", fileName);

    return {
      originalName: file.originalname,
      databasePath: `/images/${fileName}`,
      buffer: file.buffer,
      localPath: imagePath,
    };
  });

  return {
    images: processedImages,
    count: processedImages.length,
  };
};

export const saveImages = async (files: { path: string; buffer: Buffer }[]) => {
  if (!files || files.length === 0) {
    throw new HTTPError(400, "At least one image is required");
  }

  try {
    await Promise.all(
      files.map(async (file) => {
        await fs.writeFile(file.path, file.buffer);
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).any();

export default uploadMiddleware;
