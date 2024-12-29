import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: "admin" | "staff" | "supplier" | "customer";
      files?: express.Multer.File[] | CustomFiles;
    }
  }
}
export interface MulterFile {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export type CustomFiles = {
  images?: MulterFile[];
};
