import express from "express";
import { addShow, updateShow, deleteShow, getShows } from "../controllers/adminController.js";

const router = express.Router();

// CRUD routes
router.get("/shows", getShows);
router.post("/add-show", addShow);
router.put("/update-show/:id", updateShow);
router.delete("/delete-show/:id", deleteShow);

export default router;
