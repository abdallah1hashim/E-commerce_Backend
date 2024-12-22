import { ResourceType } from "../types/types";
import pool from "../libs/ds";

export default class ResourceService {
  static async getById(resourceType: ResourceType, id: number) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM ${resourceType} WHERE id = $1 limit 1`;
      const { rows } = await client.query(query, [id]);
      return rows[0]; // Assuming the resource has a single row
    } finally {
      client.release();
    }
  }
}
