import pool from "../libs/db";
import HTTPError from "../libs/HTTPError";

class Group {
  constructor(public id: number | null, public name?: string) {}
  static async findAll() {
    try {
      pool;
      const { rows } = await pool.query('SELECT * FROM "group"');
      if (rows.length === 0) {
        throw new HTTPError(404, "Group not found");
      }
      return rows;
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  async findById() {
    try {
      const { rows } = await pool.query("SELECT * FROM group WHERE id = $1", [
        this.id,
      ]);
      if (rows.length === 0) {
        throw new HTTPError(404, "Group not found");
      }
      return rows[0];
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  async create() {
    try {
      const { rows } = await pool.query(
        'INSERT INTO "group" (name) VALUES ($1) RETURNING *',
        [this.name]
      );
      if (rows.length === 0) {
        throw new HTTPError(404, "Group not created");
      }
      return rows[0];
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  async update() {
    try {
      const { rows } = await pool.query(
        'UPDATE "group" SET name = $1 WHERE id = $2 RETURNING *',
        [this.name, this.id]
      );
      if (rows.length === 0) {
        throw new HTTPError(404, "Group not updated");
      }
      return rows[0];
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
  async destroy() {
    try {
      const { rows } = await pool.query(
        'DELETE FROM "group" WHERE id = $1 RETURNING *',
        [this.id]
      );
      if (rows.length === 0) {
        throw new HTTPError(404, "Group not deleted");
      }
      return rows[0];
    } catch (error) {
      HTTPError.handleModelError(error);
      throw error;
    }
  }
}

export default Group;
