import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/shop";
import { ProductValidators } from "../validators/product";
import { isAdminORStaff, isAutenticated } from "../middlewares/isAuth";

const router = Router();

router.get("/products", getAllProducts);
router.post(
  "/products",
  isAutenticated,
  isAdminORStaff,
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

export default router;
