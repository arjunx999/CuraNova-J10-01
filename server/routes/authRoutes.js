import express from "express";
import { login, signup } from "../controllers/userAuthController.js";
import { dr_login, dr_signup } from "../controllers/doctorAuthController.js";
import { refresh } from "../controllers/refreshController.js";
import { verifyEmail } from "../controllers/verificationController.js";
import upload from "../config/multer.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";

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
  try {
    const { refreshToken, role } = req.cookies || {};
    if (refreshToken && ["patient", "doctor"].includes(role)) {
      const Model = role === "doctor" ? Doctor : User;
      await Model.updateOne(
        { refreshToken },
        { $set: { refreshToken: null, refreshTokenExpire: null } },
      );
    }

    return res
      .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" })
      .clearCookie("role", { secure: true, sameSite: "none" })
      .status(200)
      .json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to end session" });
  }
});

export default router;
