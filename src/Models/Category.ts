import pool from "../libs/ds";
import HTTPError from "../libs/HTTPError";

// Explicitly define interfaces for type safety
export interface Category {
  id: number | null;
  name: string | null;
  parentId: number | null;
}

export interface NestedCategory extends Category {
  children: NestedCategory[];
}

export default class CategoryModel {
  constructor(
    public id: number | null = null,
    public name: string | null = null,
    public parentId: number | null = null
  ) {}

  // Improve error handling and typing
  static async findAll(): Promise<Category[]> {
    try {
      const query = `
        WITH RECURSIVE category_tree AS (
          SELECT 
            id, 
            name, 
            parent_id, 
            0 AS depth
          FROM category
          WHERE parent_id IS NULL
          
          UNION ALL
          
          SELECT 
            c.id, 
            c.name, 
            c.parent_id, 
            ct.depth + 1
          FROM category c
          JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT 
          *
        FROM category_tree
        ORDER BY depth, name
      `;
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return []; // Return empty array instead of throwing error
      }

      return result.rows.map(
        (row) => new CategoryModel(row.id, row.name, row.parent_id)
      );
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error; // Re-throw to ensure caller can handle
    }
  }
  static async findByName(name: string) {
    try {
      const result = await pool.query(
        "SELECT id FROM category WHERE name = $1",
        [name]
      );
      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not found");
      }
      return result.rows[0].id;
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  async create(): Promise<Category> {
    try {
      // Fix typo: 'parent' should be 'this.parentId'
      const query = this.parentId
        ? "INSERT INTO category (name, parent_id) VALUES ($1, $2) RETURNING *"
        : "INSERT INTO category (name) VALUES ($1) RETURNING *";

      const params = this.parentId ? [this.name, this.parentId] : [this.name];

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not created");
      }

      const createdCategory = result.rows[0];
      return new CategoryModel(
        createdCategory.id,
        createdCategory.name,
        createdCategory.parent_id
      );
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }

  static async update(data: {
    id: number;
    name?: string;
    parentId?: number;
  }): Promise<Category> {
    try {
      // Validation
      if (!data.name && data.parentId === undefined) {
        throw new HTTPError(400, "No update fields provided");
      }

      // dynamic update query
      const updateFields: string[] = [];
      const params: (string | number | null)[] = [];
      let paramCount = 1;

      if (data.name) {
        updateFields.push(`name = $${paramCount}`);
        params.push(data.name);
        paramCount++;
      }

      if (data.parentId !== undefined) {
        updateFields.push(`parent_id = $${paramCount}`);
        params.push(data.parentId);
        paramCount++;
      }

      // Add the ID as the final parameter
      params.push(data.id);

      const query = `
        UPDATE category 
        SET ${updateFields.join(", ")} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        throw new HTTPError(404, "Category not found or no changes made");
      }

      const updatedCategory = result.rows[0];
      return new CategoryModel(
        updatedCategory.id,
        updatedCategory.name,
        updatedCategory.parent_id
      );
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  static async destroy(data: { where: { id: number } }): Promise<Category> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check if the category exists
      const checkCategory = await client.query(
        "SELECT * FROM category WHERE id = $1",
        [data.where.id]
      );
      if (checkCategory.rows.length === 0) {
        throw new HTTPError(404, "Category not found");
      }

      // Delete child categories (manual cascade)
      await client.query("DELETE FROM category WHERE parent_id = $1", [
        data.where.id,
      ]);

      // Delete the requested category
      const result = await client.query(
        "DELETE FROM category WHERE id = $1 RETURNING *",
        [data.where.id]
      );

      const deletedCategory = result.rows[0];

      await client.query("COMMIT");

      // Return deleted category
      return new CategoryModel(
        deletedCategory.id,
        deletedCategory.name,
        deletedCategory.parent_id
      );
    } catch (error) {
      await client.query("ROLLBACK");
      HTTPError.handleModelError(error);
      throw error;
    } finally {
      client.release();
    }
  }
}
