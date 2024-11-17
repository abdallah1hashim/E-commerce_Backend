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
    const { token, user_id, role } = result as {
      token: string;
      user_id: number;
      role: string;
    };
    // send token
    res.status(200).json({ token, user_id, role });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
