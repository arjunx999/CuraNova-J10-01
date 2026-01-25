import express from "express";
import { createSlot } from "../controllers/doctorController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/add-slot", verifyToken, createSlot);

export default router;
