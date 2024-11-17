import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const isAutenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization");
  let decodedToken;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    decodedToken = verify(
      token.split(" ")[1],
      process.env.JWT_SECRET as string
    );
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  //@ts-ignore
  req.userId = decodedToken.user_id;
  //@ts-ignore
  req.userRole = decodedToken.role;
  next();
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  req.userRole === "admin"
    ? next()
    : res.status(401).json({ message: "Unauthorized" });
};
export const isAdminORStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  req.userRole === "admin" || req.userRole === "staff"
    ? next()
    : res.status(401).json({ message: "Unauthorized" });
};
