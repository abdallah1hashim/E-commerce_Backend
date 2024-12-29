import HTTPError from "../libs/HTTPError";
import pool from "../libs/db";

export default class Cart {
  constructor(
    public id?: number,
    public user_id?: number,
    public product_id?: number,
    public quantity?: number,
    public price?: number
  ) {
    this.id = id;
    this.user_id = user_id;
    this.product_id = product_id;
    this.quantity = quantity;
  }

  async getCartByUserId() {
    try {
      const res = await pool.query("SELECT * FROM cart WHERE user_id = $1", [
        this.user_id,
      ]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows as Cart[];
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async getCartByProductId() {
    try {
      const res = await pool.query("SELECT * FROM cart WHERE product_id = $1", [
        this.product_id,
      ]);
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as Cart;
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
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }

  async createCart() {
    try {
      const res = await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
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
        "UPDATE cart SET quantity = $3 WHERE id = $1 AND user_id = $2 RETURNING *",
        [this.id, this.user_id, this.quantity]
      );
      if (res.rows.length === 0) {
        throw new HTTPError(404, "Cart not found");
      }
      return res.rows[0] as Cart;
    } catch (error: any) {
      HTTPError.handleModelError(error);
    }
  }
  async deleteOneFromCart() {
    try {
      const res = await pool.query(
        "DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *",
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
