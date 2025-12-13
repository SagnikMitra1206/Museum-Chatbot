import express from "express";
import { getAllShows } from "../controllers/showController.js";

const router = express.Router();

router.get("/", getAllShows); // GET /api/shows

export default router;
