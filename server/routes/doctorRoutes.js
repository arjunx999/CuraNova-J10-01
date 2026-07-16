import express from "express";
import {
  createSlot,
  getAllDoctors,
  getDoctorByDepartment,
  getDoctorDashboard,
  getDoctorInfo,
  getDoctors,
} from "../controllers/doctorController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/add-slot", verifyToken, createSlot);

router.get("/get-all", verifyToken, getAllDoctors);

router.get(
  "/get-by-department/:department",
  verifyToken,
  getDoctorByDepartment,
);

router.get("/dashboard", verifyToken, getDoctorDashboard);

router.get("/get-doctor-info/:id", verifyToken, getDoctorInfo);

router.get("/get-doctors", verifyToken, getDoctors);

export default router;
