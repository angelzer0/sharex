import fs from "fs";
import path from "path";

let currentPath = "E:/"; // Ruta inicial

// Subir archivo
export const uploadFileController = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).send({ error: "No se ha recibido el archivo." });
    res.send({
      message: "Archivo subido con éxito",
      fileName: req.file.originalname,
      filePath: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: `Error al subir el archivo: ${err.message}` });
  }
};

// Eliminar archivo
export const deleteFileController = async (req, res) => {
  const { fileName } = req.body;
  if (!fileName)
    return res
      .status(400)
      .send({ error: "El nombre del archivo es requerido." });

  const filePath = path.join(currentPath, fileName);
  try {
    if (!fs.existsSync(filePath))
      return res.status(404).send({ error: "El archivo no existe." });
    await fs.promises.unlink(filePath);
    res.send({ message: "Archivo eliminado con éxito", fileName });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: `Error al eliminar el archivo: ${err.message}` });
  }
};

// Renombrar archivo
export const renameFileController = async (req, res) => {
  const { oldFileName, newFileName } = req.body;
  if (!oldFileName || !newFileName)
    return res
      .status(400)
      .send({ error: "Se requieren los nombres del archivo viejo y nuevo." });

  const oldFilePath = path.join(currentPath, oldFileName);
  const newFilePath = path.join(currentPath, newFileName);
  try {
    if (!fs.existsSync(oldFilePath))
      return res.status(404).send({ error: "El archivo viejo no existe." });
    await fs.promises.rename(oldFilePath, newFilePath);
    res.send({
      message: "Archivo renombrado con éxito",
      oldFileName,
      newFileName,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: `Error al renombrar el archivo: ${err.message}` });
  }
};
