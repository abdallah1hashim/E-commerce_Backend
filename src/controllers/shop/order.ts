import { NextFunction, Request, Response } from "express";
import HTTPError, { ErrorType } from "../../libs/HTTPError";
import { validationResult } from "express-validator";
import { DetailedOrder, UserRole } from "../../types/types";
import OrderService from "../../services/OrderService";
import Order from "../../Models/Order";

export const createOrder = async (
  res: Response,
  req: Request,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const orderItems = req.body.orderItems;
    const userId = req.userId;
    const order = await OrderService.createOrder(userId as number, orderItems);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as number;
    const role = req.userRole as UserRole;
    let orders;
    if (role === "admin") {
      orders = await Order.getAll();
    } else {
      orders = await Order.getAll(userId);
    }
    res.status(200).json({ orders });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId as number;
    const role = req.userRole;

    if (!role) {
      throw new Error("User role Not defined");
    }

    let order: DetailedOrder;
    if (role === "admin") {
      order = (await OrderService.getOrderById(orderId)) as DetailedOrder;
    } else {
      order = (await OrderService.getOrderById(
        orderId,
        userId
      )) as DetailedOrder;
    }

    res.status(200).json({ order });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = Number(req.userId);
    const userRole = req.userRole;
    const orderId = +req.params.orderId;
    const { status } = req.body;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new HTTPError(404, `Order with ID ${orderId} not found`);
    }

    const isUserAuthorized = order.user_id === userId || userRole === "admin";

    if (!isUserAuthorized) {
      throw new HTTPError(403, "You are not authorized to update this order");
    }
    const serviceMethod =
      status === "Cancelled"
        ? OrderService.cancelOrder.bind(null, orderId)
        : OrderService.updateOrderStatus.bind(null, orderId, status);

    await serviceMethod();

    const successMessage =
      status === "Cancelled"
        ? "Order cancelled successfully"
        : `Order status updated to ${status} successfully`;

    res.status(200).json({ message: successMessage });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const orderId = Number(req.params.orderId);
    const order = new Order(undefined, undefined, undefined, undefined);
    await order.delete();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
