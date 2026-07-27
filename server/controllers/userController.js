import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password -refreshToken -refreshTokenExpire ")
      .lean();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "No user found with current id" });
    }

    const now = new Date();

    const [completedAppointments, upcomingAppointments] = await Promise.all([
      Appointment.find({
        patient: userId,
        status: "completed",
      })
        .populate("doctor", "name email")
        .populate("slot", "date start_time end_time")
        .lean(),

      Appointment.find({
        patient: userId,
        status: "confirmed",
        payment_status: "confirmed",
      })
        .populate("doctor", "name email")
        .populate("slot", "date start_time end_time")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      user,
      upcomingAppointments,
      completedAppointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
