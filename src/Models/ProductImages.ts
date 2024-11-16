import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

export default class ProductImages {
  constructor(
    public id?: number,
    public product_id?: number,
    public image_url?: string
  ) {
    this.id = id;
    this.product_id = product_id;
    this.image_url = image_url;
  }

  async updateProductImage() {
    try {
      return await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE id = $2 RETURNING *",
        [this.image_url, this.id]
      );
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }
  async deleteProductImage() {
    try {
      return await pool.query(
        "DELETE FROM product_images WHERE id = $1 RETURNING *",
        [this.id]
      );
    } catch (error: any) {
      HTTPError.HandleError(error, "Model");
    }
  }
}
