import cron from "node-cron";
import { Appointment } from "../models/Appointment.js";
import { Slot } from "../models/Slot.js";

cron.schedule("*/5 * * * *", async () => {
  console.log("Running appointment cleanup job...");

  try {
    const now = new Date();

    const expiredAppointments = await Appointment.find({
      payment_status: "pending",
      expiresAt: { $lt: now },
    });

    if (!expiredAppointments.length) {
      console.log("No expired appointments");
      return;
    }

    const slotIds = expiredAppointments.map((a) => a.slot);

    await Slot.updateMany(
      { _id: { $in: slotIds } },
      { isAvailable: true, bookedBy: null },
    );

    await Appointment.deleteMany({
      _id: { $in: expiredAppointments.map((a) => a._id) },
    });

    console.log(`Cleaned ${expiredAppointments.length} appointments`);
  } catch (err) {
    console.error("Cron job error:", err);
  }
});
