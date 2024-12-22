import { NextFunction, Request, Response } from "express";
import { Roles } from "../rbacConfig";

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
