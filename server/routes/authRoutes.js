import express from "express";
import { login, signup } from "../controllers/userAuthController.js";
import { dr_login, dr_signup } from "../controllers/doctorAuthController.js";
import { refresh } from "../controllers/refreshController.js";
import { verifyEmail } from "../controllers/verificationController.js";
import upload from "../config/multer.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// User routes
router.post("/user/register", upload.single("image"), signup);

router.post("/user/login", login);

// Doctor routes
router.post("/doctor/register", upload.single("image"), dr_signup);

router.post("/doctor/login", dr_login);

// refresh token route
router.post("/refresh-token", refresh);

// verification route
router.post("/verify-email", verifyEmail);

// logout route
router.post("/logout", async (req, res) => {
  return res
    .clearCookie("refreshToken")
    .clearCookie("role")
    .status(200)
    .json({ success: true });
});

export default router;
