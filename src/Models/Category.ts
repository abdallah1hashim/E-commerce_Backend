import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

export default class Category {
  constructor(public id?: number, public name: string = "") {
    this.id = id;
    this.name = name;
  }

  static async getAllCategories() {
    try {
      const result = await pool.query("SELECT * FROM category");
      if (result.rows.length === 0) {
        throw new HTTPError(404, "No categories found");
      }
      return result.rows as Category[];
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }

  static async createCategory(name: string) {
    try {
      const result = await pool.query(
        "INSERT INTO category (name) VALUES ($1) RETURNING *",
        [name]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not created");
      }
      return result.rows[0] as Category;
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }

  static async deleteCategory(id: number) {
    try {
      const result = await pool.query(
        "DELETE FROM category WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not found");
      }
      return result.rows[0] as Category;
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }

  static async updateCategory(id: number, name: string) {
    try {
      const result = await pool.query(
        "UPDATE category SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not found or no changes made");
      }
      return result.rows[0] as Category;
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }
}
