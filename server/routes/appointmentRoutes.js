import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  initiateAppointment,
  initiatePayment,
  verifyPayment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/initiate-appointment", verifyToken, initiateAppointment);

router.post("/initiate-payment", verifyToken, initiatePayment);

router.post("/verify-payment", verifyToken, verifyPayment);

export default router;
