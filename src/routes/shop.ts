import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/shop";
import { ProductValidators } from "../validators/product";

const router = Router();

router.get("/products", getAllProducts);
router.post("/products", ProductValidators, createProduct);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

export default router;
