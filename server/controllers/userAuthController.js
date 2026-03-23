import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { imageQueue } from "../queues/imageQueue.js";
import { mailQueue } from "../queues/mailQueue.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, weight, age } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with current email already exists. Login instead!",
      });
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = new User({
      name,
      email,
      weight,
      age,
      password: passwordHash,
      verificationToken: hashedToken,
      tokenExpire: new Date(Date.now() + 10 * 60 * 1000),
      profilePicture: "",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await user.save();

    await imageQueue.add("upload-profile-pic", {
      id: user._id,
      role: "user",
      fileBuffer: req.file.buffer.toString("base64"),
    });

    await mailQueue.add("send-verification", { email, rawToken });

    return res.status(200).json({ message: "email sent for verif" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user exists with given email. Signup instead",
      });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const refreshToken = crypto.randomBytes(40).toString("hex");
    user.refreshToken = refreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const token = jwt.sign(
      { id: user._id, role: "patient" },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("role", "patient", {
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        token,
        user: userWithoutPassword,
        role: "patient",
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
