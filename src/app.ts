import express, { NextFunction, Request, Response } from "express";

import shopRouter from "./routes/shop";
import authRouter from "./routes/auth";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("images"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/shop", shopRouter);
app.use("/auth", authRouter);

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

app.listen(3000, () => {
  console.log(
    `app listening on port 3000!
http://localhost:3000 🚀🚀🚀🚀`
  );
});
