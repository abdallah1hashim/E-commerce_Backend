import { PoolClient } from "pg";
import HTTPError from "../libs/HTTPError";

class GroupToProduct {
  static async addRelation(
    client: PoolClient,
    group_id: number,
    product_id: number
  ) {
    try {
      const results = await client.query(
        'INSERT INTO "_GroupToProduct" ( "A", "B") VALUES ($1, $2) RETURNING *',
        [group_id, product_id]
      );
      if (results.rows.length === 0) {
        new HTTPError(404, "Relation Faild to add between group and product");
      }
      return results.rows[0] as GroupToProduct;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}

export default GroupToProduct;
