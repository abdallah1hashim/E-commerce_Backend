// src/services/UserService.ts
import { compare, hash } from "bcrypt";
import { User } from "../Models/Users";
import HTTPError from "../libs/HTTPError";
import { config } from "dotenv";
import { createToken } from "../libs/utils";
import { UserRole } from "../types/types";
import { ProfileT, UserWithProfileT } from "../validators/user";
import Profile from "../Models/Profile";
import pool from "../libs/db";

config();

export class UserService {
  static async getAllUsers(limit?: number, offset?: number) {
    try {
      const users = await User.getUsers(limit, offset);
      return users;
    } catch (error: any) {
      HTTPError.handleServiceError(error);
    }
  }
  static async getUserWithProfile(id: number) {
    try {
      const user = await User.getUserWithProfile(id);
      return user;
    } catch (error: any) {
      HTTPError.handleServiceError(error);
    }
  }
  static async createUser(
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<void> {
    try {
      const hashedPassword = await hash(password, 10);

      // Check if the user already exists
      const user = new User(undefined, name, email, hashedPassword, role);
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

  static async editUser(
    id: number,
    data: {
      name: string;
      email: string;
      role?: UserRole;
    }
  ) {
    try {
      const user = new User(id, data.name, data.email, undefined, data.role);
      const result = await user.updateUser();
      if (!result) {
        throw new HTTPError(404, "User not found");
      }
      return result;
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
      const isCorrect = await compare(password, result.password || "");
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

  static async editProfile(id: number, data: ProfileT) {
    try {
      const profile = new Profile(
        id,
        data.first_name,
        data.last_name,
        data.phone_number,
        data.address,
        data.city,
        data.country
      );
      const result = await profile.update();
      if (!result) {
        throw new HTTPError(404, "Profile not found");
      }
      return result;
    } catch (error: any) {}
  }
  static async editUserWithProile(id: number, data: UserWithProfileT) {
    const client = await pool.connect();
    try {
      const user = new User(id, data.name, data.email, data.role);
      const profile = new Profile(
        undefined,
        data.first_name,
        data.last_name,
        data.phone_number,
        data.address,
        data.city,
        data.country,
        id
      );
      await client.query("BEGIN");
      const resultUser = await user.updateUser({ client: client });
      const resultProfile = await profile.update(client);
      if (!resultUser || !resultProfile) {
        throw new HTTPError(404, "User not found");
      }
      await client.query("COMMIT");
      return { resultUser, resultProfile };
    } catch (error: any) {
      HTTPError.handleServiceError(error);
    }
  }
}
