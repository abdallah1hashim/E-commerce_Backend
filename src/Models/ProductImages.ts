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

  static async getImagesbyProductId(product_id: number) {
    try {
      const res = await pool.query(
        "SELECT id,image_url FROM product_images WHERE product_id = $1",
        [product_id]
      );
      return res.rows as ProductImages[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async updateProductImage() {
    try {
      return await pool.query(
        "UPDATE product_images SET image_url = $1 WHERE id = $2 RETURNING *",
        [this.image_url, this.id]
      );
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteProductImage() {
    try {
      return await pool.query(
        "DELETE FROM product_images WHERE id = $1 RETURNING *",
        [this.id]
      );
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
