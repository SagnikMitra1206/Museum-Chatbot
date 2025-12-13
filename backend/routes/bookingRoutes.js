import express from "express";
import { bookTicket } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", bookTicket);

export default router;
