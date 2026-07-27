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

    const appointments = await Appointment.find({
      patient: userId,
      $or: [
        { status: "completed" },
        { status: "confirmed", payment_status: "confirmed" },
      ],
    })
      .populate("doctor", "name email")
      .populate("slot", "date start_time end_time")
      .lean();

    const completedAppointments = [];
    const upcomingAppointments = [];
    for (const appt of appointments) {
      if (appt.status === "completed") completedAppointments.push(appt);
      else upcomingAppointments.push(appt);
    }

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
