import { config } from "dotenv";
import z from "zod";

config();

const MAX_QUANTITY = Number(process.env.MAX_QUANTITY) || 10;

const ID = z.number().int().min(1, "ID is required");

// Group
export const groupSchema = z.object({
  name: z
    .string()
    .nonempty("Group name is required")
    .min(2, "Group name must be at least 2 characters.")
    .max(20, "Group name must be less than 20 characters."),
});

// Category
export const categorySchema = z.object({
  name: z
    .string()
    .nonempty("Category name is required")
    .min(2, "Category name must be at least 2 characters.")
    .max(20, "Category name must be less than 20 characters."),
});

// Cart
const Quantity = z
  .number()
  .int()
  .min(1, "Quantity is required")
  .max(MAX_QUANTITY);

export const cartItemSchema = z.object({
  productId: ID,
  productDetailsId: ID,
  quantity: Quantity,
});

export type cartItemSchemaT = z.infer<typeof cartItemSchema>;

export const cartItemEditSchema = z.object({
  id: ID,
  quantity: Quantity,
});

export type cartItemEditSchemaT = z.infer<typeof cartItemEditSchema>;
