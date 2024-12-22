import pool from "../libs/ds";
import HTTPError from "../libs/HTTPError";

import { Size } from "../types/types";
export default class ProductDetails {
  constructor(
    public id?: number,
    public size?: Size,
    public color?: string,
    public stock?: number,
    public img_preview?: string,
    public product_id?: number
  ) {
    this.id = id;
    this.size = size;
    this.color = color;
    this.stock = stock;
    this.img_preview = img_preview;
    this.product_id = product_id;
  }
  async getbyProductId(product_id: number) {
    try {
      const result = await pool.query(
        `SELECT * FROM product_details WHERE product_id = $1`,
        [product_id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Product details not found");
      }
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  async create(data: { product_id: number }) {
    try {
      const result = await pool.query(
        `INSERT INTO product_details (size, color, stock, product_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [this.size, this.color, this.stock, this.product_id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Product details not created");
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async update(data: { id: number; product_id: number }) {
    try {
      const result = await pool.query(
        `UPDATE product_details SET size = $1, color = $2, stock = $3 WHERE id = $4 RETURNING *`,
        [this.size, this.color, this.stock, data.id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Product details not updated");
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async delete(data: { id: number }) {
    try {
      const result = await pool.query(
        `DELETE FROM product_details WHERE id = $1 RETURNING *`,
        [data.id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Product details not deleted");
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}
