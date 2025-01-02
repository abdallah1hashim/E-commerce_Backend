import { Router } from "express";
import {
  isAuthenticated,
  login,
  getUser,
  getAllUsers,
  signUp,
} from "../controllers/auth";
import { authorize } from "../middlewares/isAuth";
import { permissions } from "../rbacConfig";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", (req, res, next) => {
  res.clearCookie("access_token");
  res.json({ message: "Logged out successfully" });
});
router.get(
  "/users",
  isAuthenticated,
  authorize(permissions.VIEW_ALL_USERS),
  getAllUsers
);
router.get(
  "/users/:id",
  isAuthenticated,
  authorize(permissions.VIEW_USER),
  getUser
);
router.get(
  "/me",
  isAuthenticated,
  authorize(permissions.VIEW_OWN_USER),
  getUser
);
router.post("/users", isAuthenticated, authorize(permissions.CREATE_USER));
router.put("/users/:id", isAuthenticated, authorize(permissions.UPDATE_USER));
router.delete(
  "/users/:id",
  isAuthenticated,
  authorize(permissions.DELETE_USER)
);

export default router;
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *
 * components:
 *   schemas:
 *     SignUpRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         userId:
 *           type: string
 *           description: User's unique identifier
 *
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
