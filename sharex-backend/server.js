const express = require("express");
const cors = require("cors");
const path = require("path");

const {
  createFolderController,
  getDirectoryController,
  deleteFolderController,
  renameFolderController,
  navigateController,
  backController,
  currentPathController,
} = require("./controllers/folderController");

const {
  uploadFileController,
  deleteFileController,
  renameFileController,
} = require("./controllers/fileController");

const { upload } = require("./middlewares/uploadMiddleware");
const { getDiskUsageController } = require("./controllers/diskController");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Endpoints de carpetas
app.get("/current-path", currentPathController);
app.get("/directory", getDirectoryController);
app.post("/create-folder", createFolderController);
app.delete("/delete-folder", deleteFolderController);
app.put("/rename-folder", renameFolderController);
app.get("/navigate", navigateController);
app.get("/back", backController);

// Endpoints de archivos
app.post("/upload", upload.single("file"), uploadFileController);
app.delete("/delete-file", deleteFileController);
app.put("/rename-file", renameFileController);

// Endpoint de disco
app.get("/disk-usage", getDiskUsageController);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
