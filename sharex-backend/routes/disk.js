import express from "express";
import { getDiskUsageController } from "../controllers/diskController.js";

const router = express.Router();

router.get("/disk-usage", getDiskUsageController);

export default router;
