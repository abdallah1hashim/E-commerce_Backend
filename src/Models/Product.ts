import { PoolClient } from "pg";
import HTTPError from "../utils/HTTPError";
import Pool from "../utils/ds";

export default class Product {
  private created_at?: Date;
  private updated_at?: Date;
  private bought_times?: number;
  constructor(
    public id?: number,
    public name: string = "",
    public description: string = "",
    public price: number = 0,
    public stock: number = 0,
    public overview_img_url: string | null = null,
    public category_id?: number
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.overview_img_url = overview_img_url;
    this.category_id = category_id;
  }

  static async getAll(
    limit: number = 10,
    offset: number = 0,
    searchTerm?: string
  ) {
    const client = await Pool.connect();
    try {
      let query = `
        SELECT 
          p.*, 
          c.name AS category_name 
        FROM 
          product p 
        LEFT JOIN 
          category c ON p.category_id = c.id
      `;
      const params: (number | string)[] = [limit, offset];

      // Add WHERE clause for searchTerm
      if (searchTerm) {
        query += ` WHERE p.name ILIKE $3 `;
        params.push(`%${searchTerm}%`);
      }

      query += `
        GROUP BY 
          p.id, c.name
        LIMIT $1 OFFSET $2;
      `;

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new HTTPError(404, "No products found");
      }

      return result.rows as Product[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    } finally {
      client.release();
    }
  }

  async getById(client?: PoolClient) {
    try {
      const query = `SELECT 
          p.*, 
          c.name as category 
          FROM 
            product p 
          LEFT JOIN 
            category c ON p.category_id = c.id
          WHERE 
            p.id = $1
          limit 1
        `;
      const results = await (client || Pool).query(query, [this.id]);
      if (results.rows.length === 0) {
        return null;
      }
      return results.rows[0];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async create(client: PoolClient) {
    try {
      const results = await Pool.query(
        "INSERT INTO product (name, description, price, stock, overview_img_url, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          this.name,
          this.description,
          this.price,
          this.stock,
          this.overview_img_url,
          this.category_id,
        ]
      );
      if (results.rows.length === 0) {
        return null;
      }
      return results.rows[0] as Product;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async update() {
    try {
      const results = await Pool.query(
        "UPDATE product SET name = $1, description = $2, price = $3, stock = $4,  bought_times = $6 WHERE id = $5 RETURNING *",
        [
          this.name,
          this.description,
          this.price,
          this.stock,
          this.id,
          this.bought_times,
        ]
      );
      if (results.rows.length === 0) {
        throw new HTTPError(404, "Product not found or no changes made");
      }
      return results.rows[0] as Product;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async updateOverView() {
    try {
      const results = await Pool.query(
        "UPDATE product SET overview_img_url = $1 WHERE id = $2 RETURNING *",
        [this.overview_img_url, this.id]
      );
      if (results.rows.length === 0) {
        throw new HTTPError(404, "Product not found or no changes made");
      }
      return results.rows[0] as Product;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async delete() {
    try {
      const imagesResult = await Pool.query(
        "SELECT image_url FROM product_images WHERE product_id = $1",
        [this.id]
      );
      const results = await Pool.query(
        "DELETE FROM product WHERE id = $1 RETURNING *",
        [this.id]
      );
      if (results.rows.length === 0) {
        throw new HTTPError(404, "Product not found");
      }
      results.rows[0].images = imagesResult.rows.map(
        (image) => image.image_url
      );
      return results.rows[0] as Product;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
