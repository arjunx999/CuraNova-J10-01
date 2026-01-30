import { Doctor } from "../models/Doctor.js";
import { Slot } from "../models/Slot.js";
import { Department } from "../models/Department.js";
import { Appointment } from "../models/Appointment.js";
import redisClient from "../config/redisClient.js";

export const createSlot = async (req, res) => {
  try {
    const { date, start_time, end_time, slot_duration, break_duration } =
      req.body;
    const dr_id = req.user.id;

    const doctor = await Doctor.findById(dr_id);
    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "No user found with current id" });
    }

    const startMin = toMinutes(start_time);
    const endMin = toMinutes(end_time);

    if (endMin <= startMin) {
      return res.status(400).json({
        success: false,
        message: "Invalid time for slot creation",
      });
    }

    const slots = [];

    for (
      let current = startMin;
      current + slot_duration <= endMin;
      current += slot_duration + break_duration
    ) {
      const slotStart = current;
      const slotEnd = current + slot_duration;

      slots.push({
        doctor: dr_id,
        date: new Date(date),
        start_time: toTimeString(slotStart),
        end_time: toTimeString(slotEnd),
      });
    }

    await Slot.insertMany(slots);
    await redisClient.del("all_doctors");
    return res.status(201).json({
      success: true,
      message: "Slots created successfully",
      totalSlots: slots.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const toTimeString = (totalMinutes) => {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const m = String(totalMinutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const getAllDoctors = async (req, res) => {
  try {
    const cache_key = "all_doctors";
    const cached = await redisClient.get(cache_key);

    if (cached) {
      return res.status(200).json({
        success: true,
        doctors: JSON.parse(cached),
        source: "cache",
      });
    }

    const data = await Doctor.find(
      {},
      "-password -verificationToken -tokenExpire -refreshToken -refreshTokenExpire -expiresAt",
    ).lean();

    await redisClient.setEx(cache_key, 600, JSON.stringify(data));

    return res
      .status(200)
      .json({ success: true, doctors: data, source: "database" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoctorByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const cache_key = `department:${department}:doctors`;
    const cached = await redisClient.get(cache_key);

    if (cached) {
      return res.status(200).json({
        success: true,
        doctors: JSON.parse(cached),
        source: "cache",
      });
    }

    const dept = await Department.findOne({ name: department })
      .populate({
        path: "doctors",
        select:
          "name profilePicture hospital_name about rating rating_count consultation_fee department degrees email",
      })
      .lean();
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const data = dept.doctors;

    await redisClient.setEx(cache_key, 600, JSON.stringify(data));

    return res
      .status(200)
      .json({ success: true, doctors: data, source: "database" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    const dr_id = req.user.id;

    const doctor = await Doctor.findById(dr_id)
      .select("rating rating_count consultation_fee")
      .lean();
    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "No user found with current id" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalAppointments,
      completedAppointments,
      todayAppointments,
      upcomingAppointments,
      slots,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctor: dr_id,
        payment_status: "confirmed",
      }),

      Appointment.find({
        doctor: dr_id,
        status: "completed",
      })
        .populate("patient", "name email")
        .populate("slot", "date start_time end_time")
        .lean(),

      Appointment.find({ doctor: dr_id })
        .populate("patient", "name email")
        .populate({
          path: "slot",
          match: { date: { $gte: startOfDay, $lte: endOfDay } },
          select: "date start_time end_time",
        })
        .lean(),

      Appointment.find({ doctor: dr_id })
        .populate("patient", "name email")
        .populate({
          path: "slot",
          match: { date: { $gt: endOfDay } },
          select: "date start_time end_time",
        })
        .lean(),

      Slot.find({ doctor: dr_id, date: { $gte: startOfDay } }).lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        slots,
      },
      doctor,
      totalEarnings: totalAppointments * doctor.consultation_fee,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoctorInfo = async (req, res) => {
  try {
    const { dr_id } = req.params;
    const doctor = await Doctor.findById(
      dr_id,
      "-password -verificationToken -tokenExpire -refreshToken -refreshTokenExpire -expiresAt",
    ).lean();
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      doctor: dr_id,
      date: { $gte: startOfDay },
    })
      .sort({ date: 1, start_time: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      slots,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
