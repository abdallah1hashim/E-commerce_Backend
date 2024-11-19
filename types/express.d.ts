import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: numger | string; // Optional or required, depending on your logic
    }
  }
}
