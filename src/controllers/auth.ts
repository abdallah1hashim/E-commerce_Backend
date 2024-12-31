import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserService } from "../services/UserService";
import HTTPError from "../libs/HTTPError";
import { decode, JwtPayload, verify } from "jsonwebtoken";
import { parse } from "cookie";
import { createToken } from "../libs/utils";
import { profileSchema, UserScehma, UserWithProfile } from "../validators/user";

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
    const result = (await UserService.loginUser(email, password)) as {
      access_token: string;
      userData: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: Date;
      };
    };
    if (!result) {
      throw new HTTPError(401, "Invalid credentials");
    }
    const { access_token, userData } = result;

    // send token
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge:
        Number(process.env.COOKIE_MAX_AGE_IN_MILSEC) || 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ userData });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.headers.cookie;
  if (!cookies) {
    res.status(401).json({ message: "No cookies provided" });
    return;
  }
  const { access_token } = parse(cookies);
  if (!access_token) {
    res.status(401).json({ message: "No access token provided" });
    return;
  }

  try {
    const decodedToken = verify(
      access_token,
      process.env.JWT_SECRET_KEY as string
    );
    const { exp, role, id } = decodedToken as {
      exp: number;
      role: "admin" | "staff" | "supplier" | "customer";
      id: number;
    };

    if (!exp || !role || !id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (exp < Date.now() / 1000) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    req.userRole = role;

    //  refresh the token if it's near expiry
    const new_access_token = createToken(id as number, role);
    const timeToExpire = exp - Date.now() / 1000;
    if (timeToExpire < 24 * 60 * 60 * 1000) {
      res.cookie("access_token", new_access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge:
          Number(process.env.COOKIE_MAX_AGE_IN_MILSEC) ||
          7 * 24 * 60 * 60 * 1000,
      });
    }

    next();
  } catch (error: any) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

export const sendUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ users });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};

export const sendOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const user = await UserService.getUserWithProfile(id);
    res.status(200).json({ user });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
//todo
export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const VD = UserScehma.parse(req.body);
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new HTTPError(400, "Invalid user ID");
    }
    const user = await UserService.editUser(id, VD);
    res
      .status(200)
      .json({ updatadUser: user, message: "User updated successfully" });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
export const editUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const VD = UserWithProfile.parse(req.body);
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new HTTPError(400, "Invalid user ID");
    }
    const user = await UserService.editUserWithProile(id, VD);
    res
      .status(200)
      .json({ updatadUser: user, message: "User updated successfully" });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
export const editProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const VD = profileSchema.parse(req.body);
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new HTTPError(400, "Invalid user ID");
    }
    const user = await UserService.editProfile(id, VD);
    res
      .status(200)
      .json({ updatadUser: user, message: "User updated successfully" });
  } catch (error: any) {
    HTTPError.handleControllerError(error, next);
  }
};
