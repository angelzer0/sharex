import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  uploadFileController,
  deleteFileController,
  renameFileController,
} from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFileController);
router.delete("/delete-file", deleteFileController);
router.put("/rename-file", renameFileController);

export default router;
