import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import crypto from "crypto";
import redisClient from "../config/redisClient.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const { role } = req.query;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    if (role === "doctor") {
      const u = await Doctor.findOne({
        verificationToken: hashedToken,
        tokenExpire: { $gt: Date.now() },
      });
      //   console.log(u);

      if (!u) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      u.isVerified = true;
      u.verificationToken = undefined;
      u.tokenExpire = undefined;
      u.expiresAt = undefined;

      await u.save();

      await redisClient.del("all_doctors");
    } else if (role === "patient") {
      const user = await User.findOne({
        verificationToken: hashedToken,
        tokenExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.tokenExpire = undefined;
      user.expiresAt = undefined;

      await user.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
