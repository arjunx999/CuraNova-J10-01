import express from "express";
import {
  login,
  refresh,
  signup,
  verifyEmail,
} from "../controllers/userAuthController.js";
import {
  dr_login,
  dr_refresh,
  dr_signup,
  dr_verifyEmail,
} from "../controllers/doctorAuthController.js";
import upload from "../config/multer.js";

const router = express.Router();

// User routes
router.post("/user/register", upload.single("image"), signup);

router.post("/user/verify-email", verifyEmail);

router.post("/user/login", login);

router.post("/user/refresh-token", refresh);

// Doctor routes
router.post("/doctor/register", upload.single("image"), dr_signup);

router.post("/doctor/verify-email", dr_verifyEmail);

router.post("/doctor/login", dr_login);

router.post("/doctor/refresh-token", dr_refresh);

export default router;
