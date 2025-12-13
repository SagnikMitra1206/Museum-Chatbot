import express from "express";
import { handleDialogflow } from "../controllers/dialogflowController.js";

const router = express.Router();

router.post("/", handleDialogflow);

export default router;
