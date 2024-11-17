import { compare } from "bcrypt";

import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

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
      const result = await pool.query(
        "INSERT INTO user (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [this.name, this.email, this.password]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "User not created");
      }
      return;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getUserByCredentials() {
    try {
      const result = await pool.query(
        "SELECT * FROM user WHERE email = $1 RETURNING *",
        [this.email]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(401, "Invalid credentials");
      }
      const returnedUser = result.rows[0] as User;
      const isCorrect = await compare(this.password, returnedUser.password);
      if (!isCorrect) {
        throw new HTTPError(401, "Invalid credentials");
      }
      return returnedUser as User;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
