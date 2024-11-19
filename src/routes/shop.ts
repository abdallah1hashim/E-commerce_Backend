import { NextFunction, Request, Response, Router } from "express";
import {
  addToCart,
  createProduct,
  deleteProduct,
  getAllProducts,
  getCartItems,
  getProductById,
  removeAllFromCart,
  removeItemFromCart,
  updateProduct,
  updateQuantityInCart,
} from "../controllers/shop";
import { ProductValidators } from "../validators/product";
import { isAdminORStaff, isAutenticated } from "../middlewares/isAuth";
import uploadMiddleware from "../middlewares/multer";

const router = Router();

router.get("/products", getAllProducts);
router.post(
  "/products",
  isAutenticated,
  isAdminORStaff,
  uploadMiddleware,
  ProductValidators,
  createProduct
);
router.get("/products/:productId", getProductById);
router.put(
  "/products/:productId",
  isAutenticated,
  isAdminORStaff,
  ProductValidators,
  updateProduct
);
router.delete(
  "/products/:productId",
  isAutenticated,
  isAdminORStaff,
  deleteProduct
);

router.get("/cart", isAutenticated, getCartItems);
router.post("/cart", isAutenticated, addToCart);
router.delete("/cart", isAutenticated, removeAllFromCart);
router.put("/cart/:id", isAutenticated, updateQuantityInCart);
router.delete("/cart/:id", isAutenticated, removeItemFromCart);

export default router;
