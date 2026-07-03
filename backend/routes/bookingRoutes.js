import express from "express";
import {
  createPendingBooking,
  confirmBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", createPendingBooking);
router.post("/confirm", confirmBooking);

export default router;