// src/services/UserService.ts
import { compare, hash } from "bcrypt";
import { User } from "../Models/Users";
import HTTPError from "../libs/HTTPError";
import { config } from "dotenv";
import { createToken } from "../libs/utils";
import { UserRole } from "../types/types";

config();

export class UserService {
  static async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    try {
      const hashedPassword = await hash(password, 10);

      // Check if the user already exists
      const user = new User(undefined, name, email, hashedPassword);
      const existingUser = await user.getUserByEmail();

      if (existingUser) {
        throw new HTTPError(409, "User already exists");
      }

      // Create the user
      await user.createUser();
    } catch (error: any) {
      HTTPError.handleServiceError(error);
    }
  }

  static async loginUser(email: string, password: string) {
    try {
      const user = new User(undefined, "", email);
      // get user
      const result = (await user.getUserByEmail()) as User;
      console.log(result);
      // check password
      const isCorrect = await compare(password, result.password);
      console.log(isCorrect);
      if (!isCorrect) {
        throw new HTTPError(401, "Invalid credentials");
      }
      const { id, name, email: emailUser, role, created_at } = result;
      // create access_token
      const userData = {
        id,
        name,
        email: emailUser,
        role,
        created_at,
      };
      if (!id || !role) {
        throw new HTTPError(404, "User not found");
      }
      // Create refresh token
      const access_token = createToken(id as number, role);

      // send token
      return { access_token, userData };
    } catch (error) {
      HTTPError.handleServiceError(error);
    }
  }

  // static async refreshToken(token: string) {
  //   try {
  //     const payload = verify(
  //       token,
  //       process.env.JWT_REFRESH_SECRET_KEY as string
  //     ) as JwtPayload & { id: number };

  //     const user = new User(payload.id);
  //     const retrievedUser = (await user.getUserById()) as User;
  //     const access_token = sign(
  //       {
  //         id: retrievedUser.id,
  //         name: retrievedUser.name,
  //         email: retrievedUser.email,
  //         role: retrievedUser.role,
  //         created_at: retrievedUser.created_at,
  //       },
  //       process.env.JWT_SECRET_KEY as string,
  //       { expiresIn: "15m" }
  //     );
  //     // Create refresh token
  //     const refresh_token = sign(
  //       { id: payload.id },
  //       process.env.JWT_REFRESH_SECRET_KEY as string,
  //       { expiresIn: "30d" }
  //     );
  //     return { access_token, refresh_token };
  //   } catch (error) {
  //     HTTPError.handleServiceError(error);
  //   }
  // }
}
