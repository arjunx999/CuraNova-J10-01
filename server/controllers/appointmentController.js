import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { Slot } from "../models/Slot.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendConfirmation } from "../services/emailConfirmation.js";
import { summarizeSymptoms } from "../services/symptomSum.js";

export const initiateAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotId } = req.params;
    const { dr_id } = req.body;

    if (!dr_id) {
      return res
        .status(400)
        .json({ success: false, message: "doctor id not provided" });
    }

    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, doctor: dr_id, isAvailable: true },
      { isAvailable: false, bookedBy: userId },
      { new: true },
    );

    if (!slot) {
      return res
        .status(409)
        .json({ success: false, message: "slot unavailable or invalid" });
    }

    const existing_appointment = await Appointment.findOne({
      slot: slotId,
    });
    if (existing_appointment) {
      await Slot.findByIdAndUpdate(slotId, {
        isAvailable: true,
        bookedBy: null,
      });

      return res.status(409).json({
        success: false,
        message: "Appointment already exists",
      });
    }

    const appointment = new Appointment({
      slot: slotId,
      patient: userId,
      doctor: dr_id,
      payment_status: "pending",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await appointment.save();

    return res.status(200).json({
      success: true,
      message:
        "appointment initiated successfully. complete payment to book appointment",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotId } = req.params;
    const { dr_id } = req.body;
    const appointment = await Appointment.findOne({
      slot: slotId,
      doctor: dr_id,
      patient: userId,
    });

    if (!appointment) {
      return res.status(409).json({
        success: false,
        message: "appointment unavailable or invalid",
      });
    }

    if (appointment.payment_status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Already paid",
      });
    }

    if (appointment.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment expired",
      });
    }

    const doctor = await Doctor.findById(dr_id).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    const options = {
      amount: doctor.consultation_fee * 100,
      currency: "INR",
      receipt: `rct_${appointment._id}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      amount: order.amount,
      currency: order.currency,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.payment_status = "confirmed";
    appointment.status = "confirmed";
    appointment.expiresAt = null;

    await appointment.save();
    sendConfirmation(appointment.slot).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Payment verified, appointment confirmed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const symptomSummary = async (req, res) => {
  try {
    const { patient_text } = req.body;
    const userId = req.user.id;
    const { appointmentId } = req.params;

    if (!patient_text || patient_text.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid symptom text",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const aiSummary = await summarizeSymptoms(patient_text);

    appointment.aiSummary = {
      ...aiSummary,
    };

    await appointment.save();

    return res.status(200).json({
      success: true,
      data: appointment.aiSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
