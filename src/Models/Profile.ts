import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";

export default class Profile {
  constructor(
    public id?: number,
    public first_name?: string,
    public last_name?: string,
    public address?: string,
    public phone?: string,
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
  async create(user_id: number) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const query = `
                INSERT INTO profile (first_name, last_name, address, phone, user_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
      const result = await client.query(query, [
        this.first_name,
        this.last_name,
        this.address,
        this.phone,
        user_id,
      ]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error creating profile");
      client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      client.query("ROLLBACK");
      throw new HTTPError(500, "Error creating profile");
    } finally {
      client.release();
    }
  }
  async update(id: number) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const query = `
                UPDATE profile SET first_name = $1, last_name = $2, address = $3, phone = $4
                WHERE id = $5
                RETURNING *
            `;
      const result = await client.query(query, [
        this.first_name,
        this.last_name,
        this.address,
        this.phone,
        id,
      ]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error updating profile");
      client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      client.query("ROLLBACK");
      throw new HTTPError(500, "Error updating profile");
    } finally {
      client.release();
    }
  }
  async delete(id: number) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const query = `
                DELETE FROM profile WHERE id = $1 RETURNING *
            `;
      const result = await client.query(query, [id]);
      if (result.rows.length === 0)
        throw new HTTPError(500, "Error deleting profile");
      client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      client.query("ROLLBACK");
      throw new HTTPError(500, "Error deleting profile");
    } finally {
      client.release();
    }
  }
}
