import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

import shopRouter from "./routes/shop";
import authRouter from "./routes/auth";
import testRouter from "./routes/test";

import { isAuthenticated } from "./controllers/auth";
import { zodErrorInterceptor } from "./middlewares/zodInterceptor";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from any origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: "3.0.0",
//     info: {
//       title: "API Documentation",
//       version: "1.0.0",
//       description: "API information",
//     },
//   },
//   apis: ["./src/routes/*.ts", "./routes/*.ts", "./routes/*.js"],
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));
app.use(compression());
app.use("/api", limiter);

// static
app.use("/images", express.static("images"));

// test

app.use("/test", testRouter);

// routes
app.use("/shop", shopRouter);
app.use("/auth", authRouter);
app.use("/protected-route", isAuthenticated, (req, res) => {
  res.send("This is a protected route.");
});

// app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 404
app.use("/", (req, res) => {
  res.status(404).json("404 Not Found: The URL you requested does not exist.");
});
// error handler
app.use(zodErrorInterceptor);

// server
app.listen(process.env.PORT || 3000, () => {
  console.log(
    `app listening on port 3000!
http://localhost:3000 🚀🚀🚀🚀`
  );
});
