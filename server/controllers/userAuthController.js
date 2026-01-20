import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const upload = await uploadToCloudinary(req.file.buffer);
    const imageUrl = upload.secure_url;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with current email already exists. Login instead!",
      });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = new User({
      name,
      email,
      password: passwordHash,
      verificationToken: hashedToken,
      tokenExpire: new Date(Date.now() + 10 * 60 * 1000),
      profilePicture: imageUrl,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const u = await user.save();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: "arjun.ver2520@gmail.com",
      subject: "Email verification for onboarding",
      text: `Welcome aboard!

To complete your registration, please verify your email by clicking the link below:

http://localhost:5173/auth/verify-email/${rawToken}

If you did not request this, you can safely ignore this email.`,

      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f7f7f7;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e2e2e2;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #555; font-size: 15px;">
          Thank you for signing up. Please verify your email address to activate your CuraNova account.
        </p>
        
        <a href="http://localhost:5173/auth/verify-email/${rawToken}"
           style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">
          Verify Email
        </a>

        <p style="color: #777; font-size: 14px;">
          If the button above does not work, click or paste the following link in your browser:
        </p>

        <p style="color: #007bff; font-size: 14px; word-break: break-all;">
          http://localhost:5173/auth/verify-email/${rawToken}
        </p>

        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return res.status(200).json({ message: "email sent for verif" });
      })
      .catch((error) => {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Verification email failed" });
      });
  } catch (error) {
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

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
      .json({
        success: true,
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.save();

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        token,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
