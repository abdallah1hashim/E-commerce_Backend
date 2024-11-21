import { body } from "express-validator";

export const cartQuantityValidator = [
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("quantity must be between 1 and 10"),
];

const cartValidator = [
  body("productId").notEmpty().withMessage("productId is required").isInt(),
  ...cartQuantityValidator,
];

export default cartValidator;
