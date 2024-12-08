import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import shopRouter from "./routes/shop";
import authRouter from "./routes/auth";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API information",
    },
  },
  apis: ["./src/routes/*.ts", "./routes/*.ts", "./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(compression());
app.use("/api", limiter);

// static
app.use("/images", express.static("images"));

// routes
app.use("/shop", shopRouter);
app.use("/auth", authRouter);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  error.type = error.type || "server";
  if (!error.status || error.status === 500) {
    console.error(
      `${error.type} error: `,
      error.message,
      "with status:",
      error.status
    );
  }
  error.status = error.status || 500;
  error.message =
    error.status === 500 ? "Internal Server Error" : error.message;

  res.status(error.status).json({ message: error.message });
});

// server
app.listen(process.env.PORT || 3000, () => {
  console.log(
    `app listening on port 3000!
http://localhost:3000 🚀🚀🚀🚀`
  );
});
