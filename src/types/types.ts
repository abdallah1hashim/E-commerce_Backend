import Category from "../Models/Category";
import Order from "../Models/Order";
import OrderItem from "../Models/OrderItem";

export type orderItemsData = {
  product_id: number;
  quantity: number;
  price_per_item: number | undefined;
};

export type DetailedOrder = Order & {
  orderItems: OrderItem[];
};

export type UserRole = "Admin" | "Staff" | "Supplier" | "Customer";

export type ResourceType = "product" | "cart" | "order";
