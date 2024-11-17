import { Router } from "express";
import { login, signUp } from "../controllers/auth";
import { loginValidators, signUpValidators } from "../validators/user";

const router = Router();

router.post("/signup", signUpValidators, signUp);
router.post("/login", loginValidators, login);

export default router;
