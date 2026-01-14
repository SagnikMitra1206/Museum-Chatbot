import express from "express";
import { verifyTicket } from "../controllers/verifyController.js";

const router = express.Router();

router.get("/", verifyTicket);

export default router;
