import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const role = req.cookies.role;

    if (!refreshToken || !role) {
      return res
        .status(401)
        .json({ success: false, message: "Missing credentials" });
    }

    let token;
    let newRefreshToken;
    let userData;

    if (role === "doctor") {
      const dr = await Doctor.findOne({ refreshToken });
      if (!dr) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid refresh token provided" });
      }

      if (dr.refreshTokenExpire < Date.now()) {
        return res
          .status(403)
          .json({ success: false, message: "Refresh token expired" });
      }

      token = jwt.sign({ id: dr._id, role: "doctor" }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      newRefreshToken = crypto.randomBytes(40).toString("hex");
      dr.refreshToken = newRefreshToken;
      dr.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await dr.save();

      const { password: _p, ...drData } = dr.toObject();
      userData = drData;
    } else {
      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid refresh token provided" });
      }

      if (user.refreshTokenExpire < Date.now()) {
        return res
          .status(403)
          .json({ success: false, message: "Refresh token expired" });
      }

      token = jwt.sign(
        { id: user._id, role: "patient" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      newRefreshToken = crypto.randomBytes(40).toString("hex");
      user.refreshToken = newRefreshToken;
      user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      const { password: _p, ...patientData } = user.toObject();
      userData = patientData;
    }

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("role", role, {
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        token,
        role,
        user: userData,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
