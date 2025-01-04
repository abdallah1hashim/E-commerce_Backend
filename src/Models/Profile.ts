import { PoolClient } from "pg";
import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";

export default class Profile {
  constructor(
    public id?: number,
    public first_name?: string,
    public last_name?: string,
    public phone?: string,
    public address?: string,
    public city?: string,
    public country?: string,
    public user_id?: number
  ) {
    this.id = id;
    this.user_id = user_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.address = address;
    this.phone = phone;
    this.user_id = user_id;
  }
  async getbyId(id: number) {
    try {
      const client = await pool.connect();
      const query = `
                SELECT * FROM profile WHERE id = $1
            `;
      const result = await client.query(query, [id]);
      if (result.rows.length === 0)
        throw new HTTPError(404, "Profile not found");

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async getbyUserId(user_id: number) {
    try {
      const client = await pool.connect();
      const query = `
                SELECT * FROM profile WHERE user_id = $1
            `;
      const result = await client.query(query, [user_id]);
      if (result.rows.length === 0)
        throw new HTTPError(404, "Profile not found");

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async create(client?: PoolClient) {
    const c = client || pool;
    try {
      const query = `
                INSERT INTO profile (first_name, last_name, phone, address, city, country, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
      const result = await c.query(query, [
        this.first_name,
        this.last_name,
        this.address,
        this.phone,
        this.city,
        this.country,
        this.user_id,
      ]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error creating profile");
      return result.rows[0];
    } catch (error) {
      client && client.query("ROLLBACK");
      HTTPError.handleModelError(error);
    }
  }
  async update(client?: PoolClient) {
    const c = client || pool;
    const id = this.id || this.user_id;
    try {
      const baseQuery = `
          UPDATE profile 
          SET first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, country = $6
          WHERE 
        `;
      const query = this.id
        ? baseQuery + `id = $7 RETURNING *`
        : baseQuery + `user_id = $7 RETURNING *`;
      const result = await c.query(query, [
        this.first_name,
        this.last_name,
        this.address,
        this.phone,
        this.city,
        this.country,
        id,
      ]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error updating profile");
      return result.rows[0] as Profile;
    } catch (err: any) {
      client && client.query("ROLLBACK");
      HTTPError.handleModelError(err);
    }
  }
  async destroy() {
    try {
      const query = `
                DELETE FROM profile WHERE id = $1 RETURNING *
            `;
      const result = await pool.query(query, [this.id]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error deleting profile");
      return result.rows[0];
    } catch (error) {
      throw new HTTPError(500, "Error deleting profile");
    }
  }
}
