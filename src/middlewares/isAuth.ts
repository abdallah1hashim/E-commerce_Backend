import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import jsonwebtoken from "jsonwebtoken";

export const isAutenticated = (
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
      process.env.JWT_SECRET_KEY as string
    ) as any;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  req.userId = decodedToken.id;
  req.userRole = decodedToken.role;
  console.log("decodedToken: ", decodedToken);
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
