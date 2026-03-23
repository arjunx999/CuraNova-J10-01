import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmqRedis.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";

const modelMap = {
  user: User,
  doctor: Doctor,
};

new Worker("image-upload", async (job) => {
  const { id, role, fileBuffer } = job.data;

  const Model = modelMap[role];
  if (!Model) throw new Error(`Unknown role: ${role}`);

  const buffer = Buffer.from(fileBuffer, "base64"); // back to buffer
  const upload = await uploadToCloudinary(buffer);
  // const upload = await uploadToCloudinary(Buffer.from(fileBuffer));
  await Model.findByIdAndUpdate(id, { profilePicture: upload.secure_url });
  console.log(`Profile picture updated for ${role} ${id}`);
}, { connection: bullmqConnection });

