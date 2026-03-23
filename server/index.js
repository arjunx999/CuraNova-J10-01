import express from "express";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import upload from "./config/multer.js";
import { uploadImage } from "./controllers/uploadController.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import "./utils/cronJobs.js";
import "./workers/appointmentWorker.js";
import "./workers/imageWorker.js";
import "./workers/verificationWorker.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.102:5173"],
    credentials: true,
  }),
);

connectDB();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/auth", authRoutes);
app.use("/doctor", doctorRoutes);
app.use("/appointment", appointmentRoutes);

app.post("/upload", upload.single("image"), uploadImage);

const PORT = process.env.PORT || 7643;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
