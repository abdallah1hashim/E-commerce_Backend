// imports
import { NextFunction, Request, Response, Router } from "express";

import {
  addToCart,
  createCategory,
  deleteCategory,
  getCartItems,
  getCategores,
  removeAllFromCart,
  removeItemFromCart,
  updateCategory,
  updateQuantityInCart,
} from "../controllers/shop/shop";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/shop/product";

import { ProductValidators } from "../validators/product";
import { authorize } from "../middlewares/isAuth";

import uploadMiddleware, {
  uploadToUpdateOverviewImgMiddleware,
} from "../middlewares/multer";
import cartValidator, {
  cartIdValidator,
  cartQuantityValidator,
} from "../validators/cart";
import { Permissions } from "../rbacConfig";
import { checkOwnership } from "../middlewares/checkOwnership";
import { body } from "express-validator";
import { isAuthenticated } from "../controllers/auth";

const router = Router();

// Product routes
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductById);

router.post(
  "/products",
  isAuthenticated,
  authorize(Permissions.CREATE_PRODUCT),
  uploadMiddleware,
  ProductValidators,
  createProduct
);
router.put(
  "/products/:productId",
  isAuthenticated,
  authorize(Permissions.UPDATE_PRODUCT),
  uploadToUpdateOverviewImgMiddleware,
  ProductValidators,
  updateProduct
);
router.delete(
  "/products/:productId",
  isAuthenticated,
  authorize(Permissions.DELETE_PRODUCT),
  deleteProduct
);

// catergories routes

router.get("/categories", getCategores);
router.post(
  "/categories",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("parentId").isInt().withMessage("Parent id must be an integer"),
  ],
  createCategory
);
router.put(
  "/categories/:id",
  [body("name").trim().notEmpty().withMessage("Name is required")],
  updateCategory
);
router.delete("/categories/:id", deleteCategory);
// Cart routes
router.get(
  "/cart",
  isAuthenticated,
  authorize(Permissions.VIEW_OWN_CART),
  getCartItems
);
router.post(
  "/cart",
  isAuthenticated,
  authorize(Permissions.CREATE_OWN_CART),
  cartValidator,
  addToCart
);
router.delete(
  "/cart",
  isAuthenticated,
  authorize(Permissions.DELETE_OWN_CART),
  removeAllFromCart
);
router.put(
  "/cart",
  isAuthenticated,
  authorize(Permissions.UPDATE_OWN_CART),
  cartIdValidator,
  checkOwnership("cart"),
  cartQuantityValidator,
  updateQuantityInCart
);
router.delete(
  "/cart",
  isAuthenticated,
  cartIdValidator,
  checkOwnership("cart"),
  removeItemFromCart
);

// order routes

// admin
router.post(
  "/admin/order",
  isAuthenticated,
  authorize(Permissions.CREATE_ORDER)
);
router.post(
  "/admin/order",
  isAuthenticated,
  authorize(Permissions.DELETE_ORDER)
);

// staff or higher
router.get("/order", isAuthenticated, authorize(Permissions.VIEW_ALL_ORDERS));
router.put("/order", isAuthenticated, authorize(Permissions.UPDATE_ORDER));

// customer
router.get("/order", isAuthenticated, authorize(Permissions.VIEW_OWN_ORDERS));
router.post("/order", isAuthenticated, authorize(Permissions.CREATE_OWN_ORDER));
router.put("/order", isAuthenticated, authorize(Permissions.UPDATE_OWN_ORDER));

// user routes
router.get("/user", isAuthenticated, authorize(Permissions.VIEW_ALL_USERS));
router.post("/user", isAuthenticated, authorize(Permissions.UPDATE_OWN_USER));
router.put("/user", isAuthenticated, authorize(Permissions.UPDATE_USER));
router.delete("/user", isAuthenticated, authorize(Permissions.DELETE_USER));

export default router;
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *     Cart:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: number
 *
 * tags:
 *   - name: Products
 *     description: Product management endpoints
 *   - name: Cart
 *     description: Shopping cart management endpoints
 *   - name: Categories
 *     description: Product categories endpoints
 *   - name: Orders
 *     description: Order management endpoints
 *   - name: Users
 *     description: User management endpoints
 *
 * /shop/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *
 * /shop/products/{productId}:
 *   get:
 *     summary: Get a specific product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *
 * /shop/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *
 * /shop/cart:
 *   get:
 *     summary: Get cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart items
 *
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       201:
 *         description: Item added to cart
 *
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item quantity updated
 *
 *   delete:
 *     summary: Remove all items from cart or a specific item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart items removed
 *
 * /shop/order:
 *   get:
 *     summary: Get orders (depends on user role)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order updated successfully
 *
 * /shop/user:
 *   get:
 *     summary: Get users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *
 *   post:
 *     summary: Update own user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile updated
 *
 *   put:
 *     summary: Update user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *
 *   delete:
 *     summary: Delete user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
