import express from "express";
import { getMyTickets } from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getMyTickets);

export default router;
