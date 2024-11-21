import { body } from "express-validator";

const maxQuantity = process.env.MAX_QUANTITY
  ? Number(process.env.MAX_QUANTITY)
  : 10;

export const cartQuantityValidator = [
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1, max: maxQuantity })
    .withMessage(`quantity must be between 1 and ${maxQuantity}`),
];

export const cartIdValidator = [
  body("id")
    .notEmpty()
    .withMessage("id is required")
    .isInt()
    .withMessage("id must be an integer"),
];

const cartValidator = [
  body("productId").notEmpty().withMessage("productId is required").isInt(),
  ...cartQuantityValidator,
];

export default cartValidator;
