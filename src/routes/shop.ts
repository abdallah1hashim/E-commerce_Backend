// imports
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
import { authorize, isAutenticated } from "../middlewares/isAuth";
import uploadMiddleware, {
  uploadToUpdateOverviewImgMiddleware,
} from "../middlewares/multer";
import cartValidator, {
  cartIdValidator,
  cartQuantityValidator,
} from "../validators/cart";
import { Permissions } from "../rbacConfig";
import { checkOwnership } from "../middlewares/checkOwnership";

const router = Router();

// Product routes
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductById);

router.post(
  "/products",
  isAutenticated,
  authorize(Permissions.CREATE_PRODUCT),
  uploadMiddleware,
  ProductValidators,
  createProduct
);
router.put(
  "/products/:productId",
  isAutenticated,
  authorize(Permissions.UPDATE_PRODUCT),
  uploadToUpdateOverviewImgMiddleware,
  ProductValidators,
  updateProduct
);
router.delete(
  "/products/:productId",
  isAutenticated,
  authorize(Permissions.DELETE_PRODUCT),
  deleteProduct
);

// Cart routes
router.get(
  "/cart",
  isAutenticated,
  authorize(Permissions.VIEW_OWN_CART),
  getCartItems
);
router.post(
  "/cart",
  isAutenticated,
  authorize(Permissions.CREATE_OWN_CART),
  cartValidator,
  addToCart
);
router.delete(
  "/cart",
  isAutenticated,
  authorize(Permissions.DELETE_OWN_CART),
  removeAllFromCart
);
router.put(
  "/cart",
  isAutenticated,
  authorize(Permissions.UPDATE_OWN_CART),
  cartIdValidator,
  checkOwnership("cart"),
  cartQuantityValidator,
  updateQuantityInCart
);
router.delete(
  "/cart",
  isAutenticated,
  cartIdValidator,
  checkOwnership("cart"),
  removeItemFromCart
);

// order routes

// admin
router.post(
  "/admin/order",
  isAutenticated,
  authorize(Permissions.CREATE_ORDER)
);
router.post(
  "/admin/order",
  isAutenticated,
  authorize(Permissions.DELETE_ORDER)
);

// staff or higher
router.get("/order", isAutenticated, authorize(Permissions.VIEW_ALL_ORDERS));
router.put("/order", isAutenticated, authorize(Permissions.UPDATE_ORDER));

// customer
router.get("/order", isAutenticated, authorize(Permissions.VIEW_OWN_ORDERS));
router.post("/order", isAutenticated, authorize(Permissions.CREATE_OWN_ORDER));
router.put("/order", isAutenticated, authorize(Permissions.UPDATE_OWN_ORDER));

// user routes
router.get("/user", isAutenticated, authorize(Permissions.VIEW_ALL_USERS));
router.post("/user", isAutenticated, authorize(Permissions.UPDATE_OWN_USER));
router.put("/user", isAutenticated, authorize(Permissions.UPDATE_USER));
router.delete("/user", isAutenticated, authorize(Permissions.DELETE_USER));

export default router;
