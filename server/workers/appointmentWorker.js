import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";
import { sendConfirmation } from "../services/emailConfirmation.js";
import { summarizeSymptoms } from "../services/symptomSum.js";
import { Appointment } from "../models/Appointment.js";

new Worker("appointments", async (job) => {
  if (job.name === "sendConfirmation") {
    await sendConfirmation(job.data.slotId);
  }

  if (job.name === "summarizeSymptoms") {
    const summary = await summarizeSymptoms(job.data.patient_text);
    await Appointment.findByIdAndUpdate(job.data.appointmentId, {
      summary: summary,
    });
  }
}, { connection: bullmqConnection });