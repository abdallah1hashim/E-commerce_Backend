import Category from "../Models/Category";
import Order from "../Models/Order";
import OrderItem from "../Models/OrderItem";
import ProductDetails from "../Models/ProductDetails";

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
export type Size = "s" | "m" | "l" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

export type ProductDetailsPostData = {
  size: Size;
  color: string;
  stock: number;
};
