import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";

export const mailQueue = new Queue("send-verification", {
  connection: bullmqConnection,
});
