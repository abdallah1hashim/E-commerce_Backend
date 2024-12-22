import { PoolClient } from "pg";
import HTTPError from "../libs/HTTPError";
import pool from "../libs/ds";

export default class OrderItem {
  constructor(
    public id?: number,
    public orderId?: number,
    public productId?: number,
    public quantity?: number,
    public price_per_item?: number
  ) {
    this.id = id;
    this.productId = productId;
    this.quantity = quantity;
    this.price_per_item = price_per_item;
  }
  static async getAll() {
    try {
      const res = await pool.query("SELECT * FROM order_items");
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows as OrderItem[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getById() {
    try {
      const res = await pool.query("SELECT * FROM order_items WHERE id = $1", [
        this.id,
      ]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows[0] as OrderItem;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getByOrderId(client: PoolClient) {
    try {
      const res = await pool.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [this.orderId]
      );
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows as OrderItem[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async create(client: PoolClient) {
    try {
      const orderItemResult = await client.query(
        "INSERT INTO order_items (product_id, quantity, price_per_item) VALUES ($1, $2, $3) RETURNING *",
        [this.productId, this.quantity, this.price_per_item]
      );
      if (orderItemResult.rows.length === 0) {
        throw new HTTPError(404, "Order not created");
      }
      return orderItemResult.rows[0] as OrderItem;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async delete(client: PoolClient) {
    try {
      const res = await pool.query(
        "DELETE FROM order_items WHERE id = $1 RETURNING *",
        [this.id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Order not found");
      }
      return res.rows[0] as OrderItem;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
