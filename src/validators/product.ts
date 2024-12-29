import { group } from "console";
import z from "zod";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

const fileValidator = (file: File | unknown) => {
  console.log(file);
  console.log(file instanceof File);
  console.log(file?.constructor.name); // This will give the constructor name

  return file instanceof File && ALLOWED_MIME_TYPES.includes(file.type);
};
const fileValidationError = `File must be a JPEG or PNG.`;

const productSchema = z.object({
  name: z.string().nonempty("Product name is required."),
  description: z.string().nonempty("Description is required."),
  category_id: z.preprocess(
    (value) => parseInt(value as string),
    z.number().positive("Category is required.")
  ),
  group_id: z.preprocess((value) => {
    if (typeof value === "number") return value;
    return parseInt(value as string);
  }, z.number().positive("Group is required.").optional()),
  product_details: z.preprocess(
    (value) => JSON.parse(value as string),
    z
      .array(
        z.object({
          size: z.string().nonempty("Size is required."),
          color: z.string().nonempty("Color is required."),
          price: z.preprocess((value) => {
            if (typeof value === "number") return value;
            if (typeof value === "string") return parseInt(value);
            throw new Error("Price must be a number.");
          }, z.number().positive("Price must be a positive value.").int("Price must be an integer.")),
          discount: z.preprocess((value) => {
            if (typeof value === "number") return value;
            if (typeof value === "string") return parseInt(value);
            throw new Error("Discount must be an integer.");
          }, z.number().int("Discount must be an integer.").max(99, "Discount must be less than or equal to 100.").min(0, "Discount must be greater than or equal to 0.")),
          stock: z.preprocess((value) => {
            if (typeof value === "number") return value;
            if (typeof value === "string") return parseInt(value);
            throw new Error("Stock must be an integer.");
          }, z.number().int("Stock must be an integer.").positive("Stock must be positive.")),
          img_preview: z.any(),
        })
      )
      .nonempty("At least one product detail is required.")
  ),
  images: z.any(),
});

export default productSchema;
