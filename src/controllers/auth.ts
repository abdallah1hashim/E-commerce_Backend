import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserService } from "../services/UserService";
import HTTPError from "../utils/HTTPError";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { name, email, password } = req.body;
    await UserService.createUser(name, email, password);
    res.status(201).json({ message: "User created successfully" });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, password } = req.body;
    const result = await UserService.loginUser(email, password);
    const { access_token, refresh_token } = result as {
      access_token: string;
      refresh_token: string;
    };
    // send token
    res.status(200).json({ access_token, refresh_token });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token: refresh_token_from_client } = req.body;
    if (!refresh_token_from_client) {
      throw new HTTPError(400, "Refresh token is required");
    }
    const { access_token, refresh_token } = (await UserService.refreshToken(
      refresh_token_from_client
    )) as {
      access_token: string;
      refresh_token: string;
    };

    res.status(200).json({ access_token, refresh_token });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
