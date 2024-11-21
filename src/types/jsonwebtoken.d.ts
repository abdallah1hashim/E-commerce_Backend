import jsonwebtoken from "jsonwebtoken";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    user_Id?: number;
    userRole?: string;
  }
}
