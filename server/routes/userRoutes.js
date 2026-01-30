import express from "express";
import { getUserDashboard } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/dashboard", verifyToken, getUserDashboard);

export default router;
