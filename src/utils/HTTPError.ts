import { NextFunction } from "express";

export type ErrorType = "Model" | "Controller" | "server";

export default class HTTPError extends Error {
  constructor(public status: number, message: string, public type?: ErrorType) {
    super(message);
    this.status = status;
    this.type = type;
  }
  static handleModelError(err: any) {
    throw new HTTPError(
      err.status || 500,
      err.message || "Internal Server Error",
      err.type || "Model"
    );
  }
  static handleControllerError(err: any, next: NextFunction) {
    next(
      new HTTPError(
        err.status || 500,
        err.message || "Internal Server Error",
        err.type || "Controller"
      )
    );
  }
}
