import express from "express";
import cors from "cors";
import foldersRoutes from "./routes/folders.js";
import filesRoutes from "./routes/files.js";
import diskRoutes from "./routes/disk.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/folders", foldersRoutes);
app.use("/files", filesRoutes);
app.use("/disk", diskRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
