import { body } from "express-validator";

export const signUpValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

export const loginValidators = [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];
