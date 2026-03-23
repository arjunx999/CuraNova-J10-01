import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";
import { sendVerificationMail } from "../services/emailVerification.js";

new Worker("send-verification", async (job) => {
    const { email, rawToken } = job.data;
    await sendVerificationMail(email, rawToken);

}, { connection: bullmqConnection });