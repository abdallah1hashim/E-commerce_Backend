import HTTPError from "../libs/HTTPError";
import pool from "../libs/db";

export default class CartItmes {
  private total_amount?: number;
  private created_at?: number;
  private updated_at?: number;

  constructor(
    public id?: number,
    public user_id?: number,
    public product_id?: number,
    public product_details_id?: number,
    public quantity?: number
  ) {
    this.id = id;
    this.user_id = user_id;
    this.product_id = product_id;
    this.product_details_id = product_details_id;
    this.quantity = quantity;
  }

  async getCartByUserId() {
    try {
      const query = `
      SELECT
        ci.id,
        ci.quantity,
        ci.product_id,
        p.name as product_name,
        ci.product_details_id,
        pd.size,
        pd.color,
        pd.price,
        pd.discount,
        pd.img_preview,
        (pd.price * pd.discount / 100) * ci.quantity as total_amount,
        COALESCE(pd.stock > 0, false) as in_stock
    FROM cart_items ci
    JOIN product p ON ci.product_id = p.id 
    JOIN product_details pd ON ci.product_details_id = pd.id
    WHERE ci.user_id = $1;
      `;

      const res = await pool.query(query, [this.user_id]);
      if (res.rows.length === 0 || !res || res.rows === undefined) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows as CartItmes[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getCartByProductId() {
    try {
      const res = await pool.query(
        "SELECT * FROM cart_items WHERE product_id = $1",
        [this.product_id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getCartByProductIdAndUserId() {
    try {
      const res = await pool.query(
        "SELECT * FROM cart WHERE product_id = $1 AND user_id = $2",
        [this.product_id, this.user_id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "cart_items not found");
      }
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async create() {
    try {
      const query = `INSERT INTO cart_items (user_id, product_id, product_details_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *`;
      const params = [
        this.user_id,
        this.product_id,
        this.product_details_id,
        this.quantity,
      ];
      const res = await pool.query(query, params);
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async update() {
    try {
      const query = `UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *`;
      const params = [this.quantity, this.id];
      const res = await pool.query(query, params);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteOne() {
    try {
      const res = await pool.query("DELETE FROM cart_items WHERE id = $1", [
        this.id,
      ]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteAll() {
    try {
      const res = await pool.query(
        "DELETE FROM cart_items WHERE user_id = $1 RETURNING *",
        [this.user_id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as CartItmes;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
