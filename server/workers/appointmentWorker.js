import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";
import { sendConfirmation } from "../services/emailConfirmation.js";
import { summarizeSymptoms } from "../services/symptomSum.js";
import { Appointment } from "../models/Appointment.js";

const worker = new Worker(
  "appointments",
  async (job) => {
    if (job.name === "sendConfirmation") {
      await sendConfirmation(job.data.slotId);
    }

    if (job.name === "summarizeSymptoms") {
      const summary = await summarizeSymptoms(job.data.patient_text);
      // console.log(summary);
      await Appointment.findByIdAndUpdate(job.data.appointmentId, {
        summary,
        symptomStatus: "completed",
      });
    }
  },
  { connection: bullmqConnection },
);

worker.on("failed", async (job, err) => {
  console.error(`Job ${job.id} (${job.name}) failed:`, err.message);

  if (job.name === "summarizeSymptoms") {
    await Appointment.findByIdAndUpdate(job.data.appointmentId, {
      symptomStatus: "failed",
    });
  }
});
