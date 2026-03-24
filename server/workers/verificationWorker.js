import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";
import { sendVerificationMail } from "../services/emailVerification.js";

new Worker("send-verification", async (job) => {
    const { email, rawToken, role } = job.data;
    await sendVerificationMail(email, rawToken, role);

}, { connection: bullmqConnection });