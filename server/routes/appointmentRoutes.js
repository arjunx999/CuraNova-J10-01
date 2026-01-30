import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  initiateAppointment,
  initiatePayment,
  symptomSummary,
  verifyPayment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/initiate-appointment", verifyToken, initiateAppointment);

router.post("/initiate-payment", verifyToken, initiatePayment);

router.post("/verify-payment", verifyToken, verifyPayment);

router.post("/summarize-symptoms", verifyToken, symptomSummary);

export default router;
