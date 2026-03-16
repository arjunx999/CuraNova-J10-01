import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";

export const appointmentQueue = new Queue("appointments", {
  connection: bullmqConnection,
});
