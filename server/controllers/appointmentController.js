import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { Slot } from "../models/Slot.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendConfirmation } from "../services/emailConfirmation.js";
import { summarizeSymptoms } from "../services/symptomSum.js";
import { appointmentQueue } from "../queues/appointmentQueue.js";
import mongoose from "mongoose";
import redisClient from "../config/redisClient.js";

export const completeAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only the assigned doctor can complete this appointment" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      doctor: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (appointment.status === "completed") {
      return res.status(200).json({ success: true, appointmentId: appointment._id, status: appointment.status });
    }
    if (appointment.status !== "confirmed" || appointment.payment_status !== "confirmed") {
      return res.status(409).json({ success: false, message: "Only a confirmed, paid appointment can be completed" });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();
    await appointment.save();

    const io = req.app.get("io");
    if (io && appointment.patient) {
      io.to(`user_patient_${appointment.patient}`).emit("appointment-finished", {
        appointmentId: String(appointment._id),
        message: "Appointment finished. Please rate your consultation from your dashboard.",
      });
    }

    return res.status(200).json({
      success: true,
      appointmentId: appointment._id,
      status: appointment.status,
      completedAt: appointment.completedAt,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAppointmentRating = async (req, res) => {
  const rating = req.body?.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a whole number from 1 to 5" });
  }
  if (req.user.role !== "patient") {
    return res.status(403).json({ success: false, message: "Only the patient can rate this appointment" });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      patient: req.user.id,
      status: "completed",
      payment_status: "confirmed",
    }).session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Completed appointment not found" });
    }
    if (appointment.rating != null) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "This appointment has already been rated" });
    }

    const doctor = await Doctor.findById(appointment.doctor).session(session);
    if (!doctor) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Assigned doctor not found" });
    }

    const priorCount = doctor.rating_count || 0;
    const priorRating = doctor.rating || 0;
    appointment.rating = rating;
    appointment.ratedAt = new Date();
    doctor.rating = Number(((priorRating * priorCount + rating) / (priorCount + 1)).toFixed(2));
    doctor.rating_count = priorCount + 1;

    await appointment.save({ session });
    await doctor.save({ session });
    await session.commitTransaction();

    await Promise.allSettled([
      redisClient.del("all_doctors"),
      redisClient.del(`doctor:${doctor._id}`),
    ]);

    return res.status(200).json({
      success: true,
      rating: appointment.rating,
      ratedAt: appointment.ratedAt,
      doctor: { rating: doctor.rating, rating_count: doctor.rating_count },
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const initiateAppointment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can book appointments" });
    }
    const userId = req.user.id;
    const { slotId } = req.params;
    const { dr_id } = req.body;

    if (!dr_id) {
      return res.status(400).json({
        success: false,
        message: "doctor id not provided",
      });
    }

    session.startTransaction();

    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        doctor: dr_id,
        isAvailable: true,
      },
      {
        isAvailable: false,
        bookedBy: userId,
      },
      {
        new: true,
        session,
      },
    );

    if (!slot) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message: "slot unavailable or invalid",
      });
    }

    const slotDay = new Date(slot.date);
    const [slotHour, slotMinute] = slot.start_time.split(":").map(Number);
    slotDay.setHours(slotHour, slotMinute, 0, 0);
    if (slotDay <= new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot book an appointment in the past" });
    }

    const appointment = new Appointment({
      slot: slotId,
      patient: userId,
      doctor: dr_id,
      payment_status: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await appointment.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "appointment initiated. complete payment to book appointment",
      appointmentId: appointment._id,
      expiresAt: appointment.expiresAt,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Appointment initiation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const initiatePayment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can initiate payment" });
    }
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

    appointment.razorpayOrderId = order.id;
    await appointment.save();

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
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can verify payment" });
    }
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    const userId = req.user.id;

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

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: userId,
      razorpayOrderId: razorpay_order_id,
    });

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
    await appointmentQueue.add("sendConfirmation", {
      slotId: appointment.slot,
    });

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
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can submit symptoms" });
    }
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

    if (
      appointment.symptomStatus === "processing" ||
      appointment.symptomStatus === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Symptoms already submitted",
      });
    }

    appointment.patientSymptoms = patient_text.trim();
    appointment.symptomStatus = "processing";

    await appointment.save();

    await appointmentQueue.add(
      "summarizeSymptoms",
      {
        patient_text: patient_text.trim(),
        appointmentId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Symptoms received, summary will be ready shortly",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
