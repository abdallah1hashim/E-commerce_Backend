import HTTPError from "../utils/HTTPError";
import pool from "../utils/ds";

export default class Cart {
  constructor(
    public id?: number,
    public user_id?: number,
    public product_id?: number,
    public quantity?: number
  ) {
    this.id = id;
    this.user_id = user_id;
    this.product_id = product_id;
    this.quantity = quantity;
  }

  static async getCartByUserId(user_id: number) {
    try {
      const res = await pool.query("SELECT * FROM carts WHERE user_id = $1", [
        user_id,
      ]);
      return res.rows as Cart[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async createCart() {
    try {
      const res = await pool.query(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [this.user_id, this.product_id, this.quantity]
      );
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async updateQuantity() {
    try {
      const res = await pool.query(
        "UPDATE carts SET quantity = $3 WHERE id = $1 AND user_id = $2 RETURNING *",
        [this.id, this.user_id, this.quantity]
      );
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteOneFromCart() {
    try {
      const res = await pool.query(
        "DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING *",
        [this.id, this.user_id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteAllFromCart() {
    try {
      const res = await pool.query(
        "DELETE FROM carts WHERE user_id = $1 RETURNING *",
        [this.id]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
}
