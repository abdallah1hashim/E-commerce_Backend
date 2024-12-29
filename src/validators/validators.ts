import z from "zod";

export const groupSchema = z.object({
  name: z
    .string()
    .nonempty("Group name is required")
    .min(2, "Group name must be at least 2 characters.")
    .max(20, "Group name must be less than 20 characters."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .nonempty("Category name is required")
    .min(2, "Category name must be at least 2 characters.")
    .max(20, "Category name must be less than 20 characters."),
});
