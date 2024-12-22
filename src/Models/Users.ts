import { compare } from "bcrypt";

import pool from "../libs/ds";
import HTTPError from "../libs/HTTPError";

export class User {
  public role?: string;
  public created_at?: Date;
  constructor(
    public id?: number,
    public name: string = "",
    public email: string = "",
    public password: string = ""
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async createUser() {
    try {
      console.log(
        "name:",
        this.name,
        "email:",
        this.email,
        "password:",
        this.password
      );
      const result = await pool.query(
        `INSERT INTO "user"(name, email, password) VALUES ($1, $2, $3) RETURNING *`,
        [this.name, this.email, this.password]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "User not created");
      }
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getUserByEmail() {
    try {
      const result = await pool.query(
        `SELECT * FROM "user" WHERE "email" = $1 LIMIT 1`,
        [this.email]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(401, "Invalid credentials");
      }
      return result.rows[0] as User;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getUserById() {
    try {
      const result = await pool.query(
        `SELECT * FROM "user" WHERE "id" = $1 LIMIT 1`,
        [this.id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "User not found");
      }
      return result.rows[0] as User;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
