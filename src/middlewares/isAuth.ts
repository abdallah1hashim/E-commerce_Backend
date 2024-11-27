import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import jsonwebtoken from "jsonwebtoken";
import { Roles } from "../rbacConfig";

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
  next();
};

export const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.userRole; // Assumes user role is set in `req.userRole`
      if (!role) {
        throw new Error("Role not defined");
      }

      const permissions = Roles[role];
      if (!permissions || !permissions.includes(requiredPermission)) {
        res.status(403).json({ message: "Forbidden: Access denied" });
        return;
      }

      next(); // User has the required permission
    } catch (err) {
      next(err);
    }
  };
};

export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== "customer") {
    res.status(403).json({ message: "Forbidden: Access denied" });
    return;
  }

  next();
};
