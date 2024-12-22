import { Response } from "express";
import fs from "fs/promises";
import path from "path";
import Category from "../Models/Category";
import { sign } from "jsonwebtoken";
import { UserRole } from "../types/types";

export const clearImage = async (imagePath: string) => {
  const filePath = path.resolve(__dirname, "../../images", imagePath);
  try {
    await fs.unlink(filePath);
    console.log(`File removed: ${filePath}`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.warn(`File not found, skipping removal: ${filePath}`);
    } else {
      throw error;
    }
  }
};

export const createToken = (id: number, role: string) => {
  const access_token = sign(
    { id, role },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: Number(process.env.COOKIE_MAX_AGE_IN_MILSEC) as number,
    }
  );
  return access_token;
};
