import Order from "../Models/Order";
import OrderItem from "../Models/OrderItem";

export interface MulterFile {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export type CustomFiles = {
  overview_img_url?: MulterFile[];
  images?: MulterFile[];
};

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
