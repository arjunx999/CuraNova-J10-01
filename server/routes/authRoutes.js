import express from "express";
import {
  login,
  signup,
  verifyEmail,
} from "../controllers/userAuthController.js";
import {
  dr_login,
  dr_signup,
  dr_verifyEmail,
} from "../controllers/doctorAuthController.js";
import { refresh } from "../controllers/refreshController.js";
import upload from "../config/multer.js";

const router = express.Router();

// User routes
router.post("/user/register", upload.single("image"), signup);

router.post("/user/verify-email", verifyEmail);

router.post("/user/login", login);

// Doctor routes
router.post("/doctor/register", upload.single("image"), dr_signup);

router.post("/doctor/verify-email", dr_verifyEmail);

router.post("/doctor/login", dr_login);

// refresh token route
router.post("/refresh-token", refresh);

export default router;
