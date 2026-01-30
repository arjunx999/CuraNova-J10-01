import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["na", "pending", "confirmed"],
      default: "na",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
      unique: true,
    },
    summary: {
      symptoms: [String],
      notablePoints: [String],
      possibleConcerns: [String],
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
