import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";

export const imageQueue = new Queue("image-upload", {
  connection: bullmqConnection,
});
