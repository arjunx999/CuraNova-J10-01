import express from "express";
import {
  login,
  refresh,
  signup,
  verifyEmail,
} from "../controllers/userAuthController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/register", upload.single("image"), signup);

router.post("/verify-email", verifyEmail);

router.post("/login", login);

router.post("/refresh-token", refresh);

export default router;
