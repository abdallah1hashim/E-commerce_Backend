import Order from "../Models/Order";
import OrderItem from "../Models/OrderItem";
import pool from "../utils/ds";
import HTTPError from "../utils/HTTPError";

export default class OrderService {
  static async createOrder(userId: number, orderItems: OrderItem[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // get price per item
      const updatedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
          const result = await client.query(
            "SELECT price FROM product WHERE id = $1",
            [item.productId]
          );
          if (result.rows.length === 0) {
            throw new HTTPError(
              404,
              `Product with ID ${item.productId} not found`
            );
          }
          item.price_per_item = result.rows[0].price;
          return item;
        })
      );

      // Calculate total amount
      const totalAmount = updatedOrderItems.reduce(
        (total, item) =>
          total + (item.price_per_item as number) * (item.quantity as number),
        0
      );

      // Create order

      const order = new Order(undefined, userId, totalAmount);
      const retrievedOrder = (await order.create(client)) as Order;

      if (!retrievedOrder || !retrievedOrder.id) {
        throw new HTTPError(500, "Failed to create order");
      }
      //   Create order items
      await Promise.all(
        updatedOrderItems.map(async (item) => {
          const orderItem = new OrderItem(
            undefined,
            retrievedOrder.id,
            item.productId,
            item.quantity,
            item.price_per_item
          );
          await orderItem.create(client);
        })
      );

      await client.query("COMMIT");

      return { ...retrievedOrder, orderItems: updatedOrderItems };
    } catch (error) {
      await client.query("ROLLBACK");
      HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
  static async getOrderById(orderId: number) {
    const client = await pool.connect();
    try {
      const order = new Order(orderId);
      const orderItem = new OrderItem(undefined, orderId);

      if (!order) {
        throw new HTTPError(404, `Order with ID ${orderId} not found`);
      }
      return {
        ...((await order.getById(client)) as Order),
        orderItems: (await orderItem.getByOrderId(client)) as OrderItem[],
      };
    } catch (error) {
      HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
  static async cancelOrder(orderId: number) {
    const client = await pool.connect();
    try {
      const order = new Order(orderId, undefined, undefined, "Cancelled");
      const orderItem = new OrderItem(undefined, orderId);
      await client.query("BEGIN");
      await order.updateStatus(client);
      await orderItem.delete(client);
      if (!order) {
        throw new HTTPError(404, `Order with ID ${orderId} not found`);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      HTTPError.handleServiceError(error);
    } finally {
      client.release();
    }
  }
}
