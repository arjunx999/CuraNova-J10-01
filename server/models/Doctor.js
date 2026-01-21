import mongoose from "mongoose";

const doctorSchema = mongoose.Schema(
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
      required: true,
    },
    degrees: [
      {
        type: String,
        required: true,
      },
    ],
    hospital_name: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
      minLength: 5,
      maxlength: 150,
    },
    rating: {
      type: Number,
      default: 0,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
    consultation_fee: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
    },
    tokenExpire: {
      type: Date,
    },
    available_slots: [
      {
        day: {
          type: String,
          required: true,
        },
        start_time: {
          type: String,
          required: true,
        },
        end_time: {
          type: String,
          required: true,
        },
        per_slot_duration: {
          type: Number,
          required: true,
        },
      },
    ],
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
  },
  { timestamps: true },
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
