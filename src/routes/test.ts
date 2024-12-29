import { Router } from "express";
import pool from "../libs/db";

const router = Router();

router.get("/db", async (req, res, next) => {
  try {
    console.log("checking db connection");
    const result = await pool.query("SELECT NOW()");
    console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
