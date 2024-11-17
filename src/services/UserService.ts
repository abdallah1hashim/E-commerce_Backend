// src/services/UserService.ts
import { compare, hash } from "bcrypt";
import { User } from "../Models/Users";
import HTTPError from "../utils/HTTPError";
import { sign } from "jsonwebtoken";
import { config } from "dotenv";

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
      // check password
      const isCorrect = await compare(password, result.password);
      if (!isCorrect) {
        throw new HTTPError(401, "Invalid credentials");
      }
      const { id, name, email: emailUser, role, created_at } = result;
      // create token
      const token = sign(
        { id, name, emailUser, role, created_at },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1h" }
      );
      return { token, user_id: id, role: role };
    } catch (error) {
      HTTPError.handleServiceError(error);
    }
  }
}
