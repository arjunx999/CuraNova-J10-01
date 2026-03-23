import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      // required: true,
      default: "",
    },
    verificationToken: {
      type: String,
    },
    tokenExpire: {
      type: Date,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    refreshTokenExpire: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    },
    weight: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
