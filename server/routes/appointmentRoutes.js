import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  initiateAppointment,
  initiatePayment,
  completeAppointment,
  submitAppointmentRating,
  symptomSummary,
  verifyPayment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/initiate-appointment/:slotId", verifyToken, initiateAppointment);

router.post("/initiate-payment/:slotId", verifyToken, initiatePayment);

router.post("/verify-payment", verifyToken, verifyPayment);

router.post("/complete/:appointmentId", verifyToken, completeAppointment);

router.post("/rate/:appointmentId", verifyToken, submitAppointmentRating);

router.post("/summarize-symptoms/:appointmentId", verifyToken, symptomSummary);

export default router;
