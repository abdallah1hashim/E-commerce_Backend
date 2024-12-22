import { body } from "express-validator";

export const ProductValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
  body("product_details")
    .isArray({ min: 1 })
    .withMessage("Product details must be an array"),
  body("product_details.*.size").notEmpty().withMessage("Size is required"),
  body("product_details.*.color").notEmpty().withMessage("Color is required"),
  body("product_details.*.stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ gt: 0 })
    .withMessage("Stock must be greater than 0"),
];
