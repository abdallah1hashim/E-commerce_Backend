import { PoolClient } from "pg";
import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";

export default class Order {
  constructor(
    public id?: number,
    public user_id?: number,
    public total_amount?: number,
    public status?: string
  ) {
    this.id = id;
    this.user_id = user_id;
    this.total_amount = total_amount;
    this.status = status;
  }

  static async getAll(userId?: number) {
    try {
      const query = userId
        ? `SELECT * FROM orders WHERE user_id = $1`
        : `SELECT * FROM orders`;
      const res = await pool.query(query, [userId]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows as Order[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getByUserId() {
    try {
      const res = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
        this.user_id,
      ]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows as Order[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getById(client: PoolClient) {
    try {
      const res = await pool.query("SELECT * FROM orders WHERE id = $1", [
        this.id,
      ]);
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0] as Order;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async create(client: PoolClient) {
    try {
      const orderRes = await client.query(
        "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *",
        [this.user_id, this.total_amount, this.status]
      );
      if (orderRes.rows.length === 0) {
        return null;
      }
      return orderRes.rows[0] as Order;
    } catch (error) {
      HTTPError.handleModelError(error);
    }
  }
  async updateTotalAmount() {
    try {
      const res = await pool.query(
        "UPDATE orders SET total_amount = $3 WHERE id = $1 AND user_id = $2 RETURNING *",
        [this.id, this.user_id, this.total_amount]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows[0] as Order;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async updateStatus(client?: PoolClient) {
    try {
      const res = await pool.query(
        "UPDATE orders SET status = $2 WHERE id = $1 RETURNING *",
        [this.id, this.status]
      );
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0] as Order;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async delete() {
    try {
      const res = await pool.query(
        "DELETE FROM orders WHERE id = $1  RETURNING *",
        [this.id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows[0] as Order;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
