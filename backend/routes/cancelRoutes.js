// routes/cancelRoutes.js
import express from "express";
import { cancelTicket } from "../controllers/cancelController.js";

const router = express.Router();

// POST /api/cancel
router.post("/", cancelTicket);

export default router;
