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
    patientSymptoms: {
      type: String,
      default: null,
    },
    summary: {
      symptoms: {
        type: [String],
        default: [],
      },

      notablePoints: {
        type: [String],
        default: [],
      },

      possibleConcerns: {
        type: [String],
        default: [],
      },
    },
    symptomStatus: {
      type: String,
      enum: ["not_submitted", "processing", "completed", "failed"],
      default: "not_submitted",
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
