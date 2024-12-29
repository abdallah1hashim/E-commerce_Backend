import { PoolClient } from "pg";
import HTTPError from "../libs/HTTPError";
import Pool from "../libs/db";
import CategoryModel from "./Category";

export default class Product {
  private created_at?: Date;
  private updated_at?: Date;
  private bought_times?: number;
  constructor(
    public id?: number,
    public name: string = "",
    public description: string = "",
    public category_id?: number
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category_id = category_id;
  }

  static async getAll(data: {
    limit?: number;
    offset?: number;
    searchTerm?: string;
    category?: string;
  }): Promise<Product[]> {
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
      const params: any[] = [];
      const conditions: string[] = [];

      // Handle category
      if (data.category !== undefined) {
        const categoryId = await CategoryModel.findByName(data.category.trim());
        if (categoryId) {
          conditions.push(`p.category_id = $${params.length + 1}`);
          params.push(categoryId);
        }
      }

      // Handle search term
      if (data.searchTerm !== undefined) {
        conditions.push(`p.name ILIKE $${params.length + 1}`);
        params.push(`%${data.searchTerm}%`);
      }

      // Append conditions to query
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
      }

      // Add group by, limit, and offset
      query += `
        GROUP BY 
          p.id, c.name
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      // Ensure limit and offset are numbers
      const limit = Number(data.limit) || 10;
      const offset = Number(data.offset) || 0;

      params.push(limit, offset);

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new HTTPError(404, "No products found");
      }

      return result.rows as Product[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getProductsCount(data: {
    category?: string;
    searchTerm?: string;
    is_featured?: boolean;
  }): Promise<number> {
    const client = await Pool.connect();
    try {
      let query = `
        SELECT COUNT(*) AS count
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
      `;
      const params: any[] = [];
      const conditions: string[] = [];

      // Handle is_featured
      if (data.is_featured !== undefined) {
        conditions.push(`p.is_featured = $${params.length + 1}`);
        params.push(data.is_featured);
      }

      // Handle category
      if (data.category !== undefined) {
        const categoryId = await CategoryModel.findByName(data.category.trim());
        if (categoryId) {
          conditions.push(`p.category_id = $${params.length + 1}`);
          params.push(categoryId);
        }
      }

      // Handle search term
      if (data.searchTerm !== undefined) {
        conditions.push(`p.name ILIKE $${params.length + 1}`);
        params.push(`%${data.searchTerm}%`);
      }

      // Append conditions to query
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
      }

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new HTTPError(404, "No products found");
      }

      return result.rows[0].count;
    } catch (error: any) {
      HTTPError.handleModelError(error);
      throw error;
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
      const results = await client.query(
        "INSERT INTO product (name, description, category_id) VALUES ($1, $2, $3) RETURNING *",
        [this.name, this.description, this.category_id]
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
        [this.name, this.description, this.id, this.bought_times]
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
