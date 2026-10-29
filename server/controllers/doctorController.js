import { Doctor } from "../models/Doctor.js";
import { Slot } from "../models/Slot.js";
import { Department } from "../models/Department.js";
import { Appointment } from "../models/Appointment.js";
import redisClient from "../config/redisClient.js";

export const createSlot = async (req, res) => {
  try {
    const { date, start_time, end_time } = req.body;
    const dr_id = req.user.id;

    const doctor = await Doctor.findById(dr_id);
    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "No user found with current id" });
    }

    const slot_duration = Number(req.body.slot_duration);
    const break_duration = Number(req.body.break_duration);

    const startMin = toMinutes(start_time);
    const endMin = toMinutes(end_time);

    if (endMin <= startMin) {
      return res.status(400).json({
        success: false,
        message: "Invalid time for slot creation",
      });
    }

    const existingSlots = await Slot.findOne({
      doctor: dr_id,
      date: new Date(date),
      start_time: { $lt: end_time },
      end_time: { $gt: start_time },
    });

    if (existingSlots) {
      return res.status(400).json({
        success: false,
        message: "Slots already exist for this date and time",
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
    console.log(error);
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

    const doctor = await Doctor.findById(dr_id).lean();
    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "No user found with current id" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [slots, appointments] = await Promise.all([
      Slot.find({ doctor: dr_id, date: { $gte: startOfDay } }).lean(),
      
      Appointment.find({
        doctor: dr_id,
          $or: [{ status: "completed" }, { payment_status: "confirmed" }],
      })
        .populate("patient", "name email")
        .populate("slot", "date start_time end_time")
        .lean(),
    ]);

    const todaySlotIds = new Set();
    const upcomingSlotIds = new Set();
    for (const slot of slots) {
      const id = slot._id.toString();
      if (slot.date <= endOfDay) todaySlotIds.add(id);
      else upcomingSlotIds.add(id);
    }

    const completedAppointments = [];
    const todayAppointments = [];
    const upcomingAppointments = [];
    let totalAppointments = 0;
 
    for (const appt of appointments) {
      if (appt.status === "completed") {
        completedAppointments.push(appt);
      }

      if (appt.payment_status === "confirmed") {
        totalAppointments++;
        const slotId = appt.slot?._id?.toString();
        if (appt.status !== "completed") {
          if (slotId && todaySlotIds.has(slotId)) todayAppointments.push(appt);
          else if (slotId && upcomingSlotIds.has(slotId))
            upcomingAppointments.push(appt);
        }
      }
    }

    upcomingAppointments.sort((a, b) => {
      const dateDifference =
        new Date(b.slot?.date || 0).getTime() -
        new Date(a.slot?.date || 0).getTime();
      if (dateDifference !== 0) return dateDifference;
      return (b.slot?.start_time || "").localeCompare(a.slot?.start_time || "");
    });

    return res.status(200).json({
      success: true,
      appointment_data: {
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
    const { id } = req.params;
    const cache_key = `doctor:${id}`;

    let doctor;

    const cached = await redisClient.get(cache_key);

    if (cached) {
      doctor = JSON.parse(cached);
    } else {
      const [doctorData, patientsCount] = await Promise.all([
        Doctor.findById(
          id,
          "-password -verificationToken -tokenExpire -refreshToken -refreshTokenExpire -expiresAt",
        ).lean(),

        Appointment.countDocuments({
          doctor: id,
          status: "completed",
        }),
      ]);

      if (!doctorData) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      doctor = {
        ...doctorData,
        patients_count: patientsCount,
      };

      await redisClient.setEx(cache_key, 600, JSON.stringify(doctor));
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      doctor: id,
      date: { $gte: startOfDay },
    })
      .sort({ date: 1, start_time: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      doctor,
      slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const fetchWithFilters = async (
  doctors,
  { department, sort, available_today },
  res,
) => {
  if (department && department !== "All") {
    doctors = doctors.filter((dr) => dr.department === department);
  }

  if (sort === "rating") {
    doctors.sort((a, b) => b.rating - a.rating);
  } else if (sort === "fee_asc") {
    doctors.sort((a, b) => a.consultation_fee - b.consultation_fee);
  } else if (sort === "fee_desc") {
    doctors.sort((a, b) => b.consultation_fee - a.consultation_fee);
  }

  if (available_today === "true") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const available_doctors = await Slot.distinct("doctor", {
      date: { $gte: todayStart, $lte: todayEnd },
      isAvailable: true,
    });
    const idSet = new Set(available_doctors.map((id) => id.toString()));
    doctors = doctors.filter((dr) => idSet.has(dr._id.toString()));
  }

  return res.status(200).json({ success: true, doctors });
};

export const getDoctors = async (req, res) => {
  try {
    const { department, sort, available_today } = req.query;
    const cache_key = "all_doctors";
    const cached = await redisClient.get(cache_key);

    if (cached) {
      return fetchWithFilters(
        JSON.parse(cached),
        { department, sort, available_today },
        res,
      );
    }

    const data = await Doctor.find(
      {},
      "-password -verificationToken -tokenExpire -refreshToken -refreshTokenExpire -expiresAt",
    ).lean();

    await redisClient.setEx(cache_key, 600, JSON.stringify(data));

    return fetchWithFilters(data, { department, sort, available_today }, res);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
