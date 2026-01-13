import express from "express";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import upload from "./config/multer.js";
import { uploadImage } from "./controllers/uploadController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/upload", upload.single("image"), uploadImage);

const PORT = process.env.PORT || 7643;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
