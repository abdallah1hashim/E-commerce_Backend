export type ErrorType = "Model" | "Controller" | "server";

export default class HTTPError extends Error {
  constructor(public status: number, message: string, public type?: ErrorType) {
    super(message);
    this.status = status;
    this.type = type;
  }
  static HandleError(err: any, type?: ErrorType) {
    throw new HTTPError(
      err.status || 500,
      err.message || "Internal Server Error",
      err.type || type
    );
  }
}
