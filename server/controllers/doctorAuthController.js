import jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { imageQueue } from "../queues/imageQueue.js";
import { mailQueue } from "../queues/mailQueue.js";

export const dr_signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      degrees,
      hospital_name,
      about,
      consultation_fee,
      department,
    } = req.body;

    const u = await Doctor.findOne({ email });
    if (u) {
      return res.status(400).json({
        success: false,
        message: "dr with current email already exists. Login instead!",
      });
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const dr = new Doctor({
      name,
      email,
      password: passwordHash,
      profilePicture: "",
      degrees,
      hospital_name,
      about,
      consultation_fee,
      department,
      verificationToken: hashedToken,
      tokenExpire: new Date(Date.now() + 10 * 60 * 1000),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await dr.save();

    await imageQueue.add("upload-profile-pic", {
      id: dr._id,
      role: "doctor",
      fileBuffer: req.file.buffer.toString("base64"),
    });

    await mailQueue.add("send-verification", {
      email,
      rawToken,
      role: "doctor",
    });

    return res.status(200).json({ message: "email sent for verif" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export const dr_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dr = await Doctor.findOne({ email });
    if (!dr) {
      return res.status(404).json({
        success: false,
        message: "No doctor exists with given email. Signup instead",
      });
    }

    if (!dr.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, dr.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const refreshToken = crypto.randomBytes(40).toString("hex");
    dr.refreshToken = refreshToken;
    dr.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const token = jwt.sign(
      { id: dr._id, role: "doctor" },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    await dr.save();

    const { password: _, ...drWithoutPassword } = dr.toObject();

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("role", "doctor", {
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        token,
        dr: drWithoutPassword,
        role: "doctor",
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
