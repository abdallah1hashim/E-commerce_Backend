import express, { NextFunction, Request, Response } from "express";
import multer, { diskStorage } from "multer";
import path from "path";

import shopRouter from "./routes/shop";
import authRouter from "./routes/auth";

const app = express();

const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    const imagesPath = path.join(__dirname, "..", "images");
    cb(null, imagesPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "overview_img_url", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ])
);

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
