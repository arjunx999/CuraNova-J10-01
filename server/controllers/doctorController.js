import { Doctor } from "../models/Doctor.js";
import { Slot } from "../models/Slot.js";

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
