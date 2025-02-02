import { PoolClient } from "pg";
import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";
import { PublicUser, PublicUserWithProfile, UserRole } from "../types/types";

export class User {
  public created_at?: Date;
  constructor(
    public id?: number,
    public name?: string,
    public email?: string,
    public password?: string,
    public role?: UserRole,
    public isActive?: boolean
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static async getUsers(limit?: number, offset?: number) {
    try {
      const result = await pool.query(
        `SELECT id, name, email, role, is_active, created_at FROM "user" LIMIT ${
          limit || 10
        } OFFSET ${offset || 0}`
      );
      if (result.rows.length === 0 || !result.rows) {
        throw new HTTPError(404, "Users not found");
      }
      return result.rows as PublicUser[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  static async getUserWithProfile(id: number) {
    try {
      const query = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_active,
          u.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'firstName',
                p.first_name,
                'lastName',
                p.last_name,
                'phone',
                p.phone,
                'address',
                p.address,
                'city',
                p.city,
                'country',
                p.country
              )
            ),
            '[]'::json
          ) AS profile
        FROM "user" AS u
        LEFT JOIN profile AS p
        ON u.id = p.user_id
        WHERE u.id = $1
        GROUP BY u.id;
        `;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0 || !result.rows) {
        throw new HTTPError(404, "Users not found");
      }
      return result.rows[0] as PublicUserWithProfile;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async createUser() {
    console.log("hoi");
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
        `INSERT INTO "user"(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
        [this.name, this.email, this.password, this.role || "customer"]
      );
      console.log(result);
      if (result.rows.length === 0) {
        throw new HTTPError(404, "User not created");
      }
      return result.rows[0] as User;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async updateUser({
    newPassword,
    client,
  }: {
    newPassword?: string;
    client?: PoolClient;
  } = {}) {
    const c = client || pool;
    try {
      // get current role
      const current = await c.query(
        `SELECT * FROM "user" WHERE id = $1 LIMIT 1`,
        [this.id]
      );
      if (current.rows.length === 0) {
        throw new HTTPError(404, "User not found");
      }
      const currentUser: User = current.rows[0];
      // update
      const query = `UPDATE "user" SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *`;
      const params = [
        this.name || currentUser.name,
        this.email || currentUser.email,
        newPassword || currentUser.password,
        this.role || currentUser.role,
        this.id,
      ];
      const result = await pool.query(query, params);
      if (result.rowCount === 0) {
        throw new HTTPError(404, "User not updated");
      }
      return result.rows[0] as User;
    } catch (error: any) {
      c.query("ROLLBACK");
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
        return null;
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
  async destroy() {
    try {
      const result = await pool.query(
        `DELETE FROM "user" WHERE id = $1 RETURNING *`,
        [this.id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "User not deleted");
      }
      return result.rows[0] as User;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
