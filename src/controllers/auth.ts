import { NextFunction, Request, Response } from "express";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

import { User } from "../Models/Users";
import { config } from "dotenv";

config();

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hash(password, 10);
    const user = new User(undefined, name, email, hashedPassword);
    await user.createUser();
    res.status(201).json({ message: "User created successfully" });
  } catch (error: any) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = new User(undefined, "", email, password);
    const {
      id,
      name,
      email: emailUser,
      role,
      created_at,
    } = (await user.getUserByCredentials()) as User;
    const token = sign(
      { id, name, emailUser, role, created_at },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, user_id: id });
  } catch (error: any) {
    next(error);
  }
};
