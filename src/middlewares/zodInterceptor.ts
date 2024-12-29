import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import HTTPError from "../libs/HTTPError";

export function zodErrorInterceptor(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({ errors: error.flatten() });
    return;
  } else if (error instanceof HTTPError) {
    error.type = error.type || "Controller";
    if (!error.status || error.status === 500) {
      console.error(
        `${error.type} error: `,
        error.message,
        "with status:",
        error.status
      );
    }
    error.status = error.status || 500;
    error.message =
      error.status === 500 ? "Internal Server Error" : error.message;

    res.status(error.status).json({ message: error.message });
    return;
  }
}
