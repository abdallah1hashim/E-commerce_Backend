import { group } from "console";
import z from "zod";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

const fileValidator = (file: File | unknown) => {
  return file instanceof File && ALLOWED_MIME_TYPES.includes(file.type);
};
const fileValidationError = `File must be a JPEG or PNG.`;

const preprocessId = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const parsed = parseInt(value as string);
  return isNaN(parsed) ? undefined : parsed;
};

const Name = z
  .string()
  .nonempty("Product name is required.")
  .min(2, "Name must be at least 2 characters");
const Description = z.string().nonempty("Description is required.");
const CategoryId = z.preprocess(preprocessId, z.number());
const GroupId = z.preprocess(
  preprocessId,
  z.number().positive("Group is required.").optional()
);
const Size = z.string().nonempty("Size is required.");
const Color = z.string().nonempty("Color is required.");
const Price = z.preprocess(
  preprocessId,
  z
    .number()
    .positive("Price must be a positive value.")
    .int("Price must be an integer.")
);
const Discount = z.preprocess(
  preprocessId,
  z
    .number()
    .int("Discount must be an integer.")
    .max(99, "Discount must be less than or equal to 100.")
    .min(0, "Discount must be greater than or equal to 0.")
);
const Stock = z.preprocess(
  preprocessId,
  z
    .number()
    .int("Stock must be an integer.")
    .positive("Stock must be positive.")
);

const productSchema = z.object({
  name: Name,
  description: Description,
  category_id: CategoryId,
  group_id: GroupId,
  product_details: z.preprocess(
    (value) => JSON.parse(value as string),
    z
      .array(
        z.object({
          size: Size,
          color: Color,
          price: Price,
          discount: Discount,
          stock: Stock,
          img_preview: z.any(),
        })
      )
      .nonempty("At least one product detail is required.")
  ),
  images: z.any(),
});

export default productSchema;
