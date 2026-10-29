import express from "express";
import https from "https";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import upload from "./config/multer.js";
import { uploadImage } from "./controllers/uploadController.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import "./utils/cronJobs.js";
import "./workers/appointmentWorker.js";
import "./workers/imageWorker.js";
import "./workers/verificationWorker.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Appointment } from "./models/Appointment.js";

dotenv.config();

const app = express();

const key = fs.readFileSync("../certs/key.pem");
const cert = fs.readFileSync("../certs/cert.pem");

const expressServer = https.createServer({ key, cert }, app);

const io = new Server(expressServer, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

connectDB();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/auth", authRoutes);
app.use("/doctor", doctorRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/patient", userRoutes);

app.post("/upload", upload.single("image"), uploadImage);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !verified?.id ||
      !["patient", "doctor"].includes(verified.role)
    ) {
      return next(new Error("Invalid authentication token"));
    }
    socket.user = verified;
    socket.data.user = verified;

    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

const consultationRoom = (appointmentId) => `consultation_${appointmentId}`;

const isValidDescription = (description, type) =>
  description &&
  typeof description === "object" &&
  !Array.isArray(description) &&
  description.type === type &&
  typeof description.sdp === "string" &&
  description.sdp.length > 0 &&
  description.sdp.length <= 100_000;

const isValidCandidate = (candidate) =>
  candidate &&
  typeof candidate === "object" &&
  !Array.isArray(candidate) &&
  typeof candidate.candidate === "string" &&
  candidate.candidate.length <= 10_000 &&
  (candidate.sdpMid == null ||
    (typeof candidate.sdpMid === "string" && candidate.sdpMid.length <= 256)) &&
  (candidate.sdpMLineIndex == null ||
    (Number.isInteger(candidate.sdpMLineIndex) &&
      candidate.sdpMLineIndex >= 0)) &&
  (candidate.usernameFragment == null ||
    (typeof candidate.usernameFragment === "string" &&
      candidate.usernameFragment.length <= 256));

const sendConsultationError = (socket, ack, code, message) => {
  const error = { success: false, code, message };
  if (typeof ack === "function") ack(error);
  socket.emit("consultation-error", error);
};

io.on("connection", (socket) => {
  console.log("new user connected", socket.id);

  const joinedConsultations = new Set();

  const findAuthorizedAppointment = async (appointmentId) => {
    if (
      typeof appointmentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      return { error: "invalid-appointment", message: "Invalid appointment ID" };
    }

    const appointment = await Appointment.findById(appointmentId)
      .select("patient doctor status payment_status")
      .lean();

    if (!appointment) {
      return { error: "appointment-not-found", message: "Appointment not found" };
    }

    const participantId =
      socket.user.role === "doctor" ? appointment.doctor : appointment.patient;

    if (String(participantId) !== String(socket.user.id)) {
      return { error: "unauthorized", message: "Not an appointment participant" };
    }

    if (
      appointment.status !== "confirmed" ||
      appointment.payment_status !== "confirmed"
    ) {
      return { error: "appointment-not-confirmed", message: "Appointment is not confirmed" };
    }

    return { appointment };
  };

  socket.on("join-consultation", async (payload, ack) => {
    try {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        sendConsultationError(socket, ack, "invalid-payload", "Expected an appointment ID");
        return;
      }

      const result = await findAuthorizedAppointment(payload.appointmentId);
      if (result.error) {
        sendConsultationError(socket, ack, result.error, result.message);
        return;
      }

      const room = consultationRoom(String(result.appointment._id));
      await socket.join(room);
      joinedConsultations.add(room);
      const roomSockets = await io.in(room).fetchSockets();
      const peerPresent = roomSockets.some(
        (roomSocket) =>
          roomSocket.id !== socket.id &&
          roomSocket.data?.user?.role !== socket.user.role,
      );
      socket.to(room).emit("consultation-peer-joined", {
        appointmentId: String(result.appointment._id),
        role: socket.user.role,
      });
      if (typeof ack === "function") {
        ack({
          success: true,
          appointmentId: String(result.appointment._id),
          peerPresent,
        });
      }
    } catch (error) {
      console.error("Consultation join failed:", error);
      sendConsultationError(socket, ack, "server-error", "Unable to join consultation");
    }
  });

  socket.on("leave-consultation", (payload, ack) => {
    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      typeof payload.appointmentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(payload.appointmentId)
    ) {
      sendConsultationError(socket, ack, "invalid-payload", "Invalid appointment ID");
      return;
    }

    const appointmentId = payload.appointmentId;
    const room = consultationRoom(appointmentId);
    if (!joinedConsultations.has(room) || !socket.rooms.has(room)) {
      if (typeof ack === "function") ack({ success: true });
      return;
    }

    socket.to(room).emit("consultation-peer-left", {
      appointmentId,
      role: socket.user.role,
    });
    socket.leave(room);
    joinedConsultations.delete(room);
    if (typeof ack === "function") ack({ success: true });
  });

  const registerSignal = (eventName, dataKey, validator) => {
    socket.on(eventName, async (payload, ack) => {
      try {
        if (
          !payload ||
          typeof payload !== "object" ||
          Array.isArray(payload) ||
          !validator(payload[dataKey])
        ) {
          sendConsultationError(socket, ack, "invalid-payload", `Invalid ${dataKey}`);
          return;
        }

        const result = await findAuthorizedAppointment(payload.appointmentId);
        if (result.error) {
          sendConsultationError(socket, ack, result.error, result.message);
          return;
        }

        const room = consultationRoom(String(result.appointment._id));
        if (!joinedConsultations.has(room) || !socket.rooms.has(room)) {
          sendConsultationError(socket, ack, "not-in-room", "Join this consultation first");
          return;
        }

        socket.to(room).emit(eventName, {
          appointmentId: String(result.appointment._id),
          role: socket.user.role,
          [dataKey]: payload[dataKey],
        });
        if (typeof ack === "function") ack({ success: true });
      } catch (error) {
        console.error(`${eventName} forwarding failed:`, error);
        sendConsultationError(socket, ack, "server-error", "Unable to forward signaling data");
      }
    });
  };

  registerSignal("consultation-offer", "offer", (value) =>
    isValidDescription(value, "offer"),
  );
  registerSignal("consultation-answer", "answer", (value) =>
    isValidDescription(value, "answer"),
  );
  registerSignal("consultation-ice-candidate", "candidate", isValidCandidate);

  socket.on("disconnecting", () => {
    for (const room of joinedConsultations) {
      const appointmentId = room.slice("consultation_".length);
      socket.to(room).emit("consultation-peer-left", {
        appointmentId,
        role: socket.user.role,
      });
      socket.leave(room);
    }
    joinedConsultations.clear();
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 7643;
expressServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
