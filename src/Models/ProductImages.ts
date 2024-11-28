import { PoolClient } from "pg";
import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

export default class ProductImages {
  constructor(
    public id?: number,
    public image_url?: string,
    public product_id?: number
  ) {
    this.id = id;
    this.product_id = product_id;
    this.image_url = image_url;
  }

  async findById(client?: PoolClient) {
    try {
      const results = await (client || pool).query(
        "SELECT * FROM product_images WHERE id = $1",
        [this.id]
      );
      if (results.rows.length === 0) {
        return null;
      }
      return results.rows[0] as ProductImages;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async findByProductId(client?: PoolClient) {
    try {
      const results = await (client || pool).query(
        "SELECT * FROM product_images WHERE product_id = $1",
        [this.id]
      );
      if (results.rows.length === 0) {
        return null;
      }
      return results.rows as ProductImages[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async create(client: PoolClient) {
    try {
      const results = await client.query(
        "INSERT INTO product_images (image_url, product_id) VALUES ($1, $2) RETURNING *",
        [this.image_url, this.product_id]
      );

      if (results.rows.length === 0) return null;

      return results.rows[0] as ProductImages;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async update() {
    try {
      const res = await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE id = $2 RETURNING *",
        [this.image_url, this.id]
      );
      if (!res.rows[0]) return null;
      return res.rows[0] as ProductImages;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async delete() {
    try {
      const res = await pool.query(
        "DELETE FROM product_images WHERE id = $1 RETURNING *",
        [this.id]
      );
      if (!res.rows[0]) return null;
      return res.rows[0] as ProductImages;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
