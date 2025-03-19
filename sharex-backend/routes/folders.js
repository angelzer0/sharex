import express from "express";
import {
  createFolderController,
  getDirectoryController,
  deleteFolderController,
  renameFolderController,
  navigateController,
  backController,
  currentPathController,
} from "../controllers/folderController.js";

const router = express.Router();

router.get("/current-path", currentPathController);
router.get("/directory", getDirectoryController);
router.post("/create-folder", createFolderController);
router.delete("/delete-folder", deleteFolderController);
router.put("/rename-folder", renameFolderController);
router.get("/navigate", navigateController);
router.get("/back", backController);

export default router;
