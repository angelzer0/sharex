const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configuración de multer para almacenar archivos en el directorio deseado
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Directorio donde se almacenarán los archivos subidos
        cb(null, 'E:/'); // Puedes cambiar 'E:/' por la ruta que desees
    },
    filename: (req, file, cb) => {
        // Nombre del archivo subido
        cb(null, file.originalname); // Mantiene el nombre original del archivo
    }
});

// Inicializar multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

let currentPath = 'E:/';  // Carpeta raíz inicial (puedes cambiarla según tu necesidad)

// Endpoint que devuelve la ruta actual (breadcrumb)
app.get('/current-path', (req, res) => {
    res.send({
        message: 'Ruta actual',
        currentPath: currentPath
    });
});

// Endpoint que devuelve el contenido de la carpeta actual (archivos y subcarpetas)
app.get('/directory', async (req, res) => {
    try {
        const files = await fs.promises.readdir(currentPath, { withFileTypes: true });

        const fileList = files.filter(file => {
            // Excluir directorios del sistema y archivos ocultos
            const systemFiles = ['$RECYCLE.BIN', 'System Volume Information', 'partition_identifier_bc_new.platform'];
            return !systemFiles.includes(file.name) &&
                (!file.name.startsWith('.') || !file.isDirectory()) &&
                (file.isFile() || (file.isDirectory() && !file.name.startsWith('.')));
        }).map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            extension: file.isDirectory() ? null : path.extname(file.name)
        }));

        res.send({
            message: 'Contenido del directorio',
            files: fileList
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error leyendo el directorio' });
    }
});

// Endpoint para crear carpetas con verificación de existencia
app.post('/create-folder', async (req, res) => {
    const { folderName } = req.body;  // El nombre de la carpeta será pasado en el cuerpo de la solicitud

    if (!folderName) {
        return res.status(400).send({ error: 'El nombre de la carpeta es requerido.' });
    }

    const newFolderPath = path.join(currentPath, folderName);

    try {
        // Comprobar si la carpeta ya existe
        if (fs.existsSync(newFolderPath)) {
            return res.status(400).send({ error: 'La carpeta ya existe.' });
        }

        // Si no existe, crear la carpeta
        await fs.promises.mkdir(newFolderPath, { recursive: true });

        res.send({
            message: 'Carpeta creada con éxito',
            folderName: folderName,
            folderPath: newFolderPath
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al crear la carpeta: ${err.message}` });
    }
});

// Endpoint para subir archivos (usando multer)
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No se ha recibido el archivo.' });
        }

        res.send({
            message: 'Archivo subido con éxito',
            fileName: req.file.originalname,
            filePath: req.file.path
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al subir el archivo: ${err.message}` });
    }
});

// Endpoint para eliminar un archivo
app.delete('/delete-file', async (req, res) => {
    const { fileName } = req.body;  // El nombre del archivo a eliminar será pasado en el cuerpo de la solicitud

    if (!fileName) {
        return res.status(400).send({ error: 'El nombre del archivo es requerido.' });
    }

    const filePath = path.join(currentPath, fileName);

    try {
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).send({ error: 'El archivo no existe.' });
        }

        await fs.promises.unlink(filePath);

        res.send({
            message: 'Archivo eliminado con éxito',
            fileName: fileName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al eliminar el archivo: ${err.message}` });
    }
});

// Endpoint para eliminar una carpeta
app.delete('/delete-folder', async (req, res) => {
    const { folderName } = req.body;  // El nombre de la carpeta a eliminar será pasado en el cuerpo de la solicitud

    if (!folderName) {
        return res.status(400).send({ error: 'El nombre de la carpeta es requerido.' });
    }

    const folderPath = path.join(currentPath, folderName);

    try {
        // Verificar si la carpeta existe
        if (!fs.existsSync(folderPath)) {
            return res.status(404).send({ error: 'La carpeta no existe.' });
        }

        // Eliminar la carpeta
        await fs.promises.rmdir(folderPath, { recursive: true });

        res.send({
            message: 'Carpeta eliminada con éxito',
            folderName: folderName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al eliminar la carpeta: ${err.message}` });
    }
});

// Endpoint para renombrar un archivo
app.put('/rename-file', async (req, res) => {
    const { oldFileName, newFileName } = req.body;  // Los nombres del archivo viejo y nuevo

    if (!oldFileName || !newFileName) {
        return res.status(400).send({ error: 'Se requieren los nombres del archivo viejo y nuevo.' });
    }

    const oldFilePath = path.join(currentPath, oldFileName);
    const newFilePath = path.join(currentPath, newFileName);

    try {
        // Verificar si el archivo viejo existe
        if (!fs.existsSync(oldFilePath)) {
            return res.status(404).send({ error: 'El archivo viejo no existe.' });
        }

        // Renombrar el archivo
        await fs.promises.rename(oldFilePath, newFilePath);

        res.send({
            message: 'Archivo renombrado con éxito',
            oldFileName: oldFileName,
            newFileName: newFileName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al renombrar el archivo: ${err.message}` });
    }
});

// Endpoint para renombrar una carpeta
app.put('/rename-folder', async (req, res) => {
    const { oldFolderName, newFolderName } = req.body;  // Los nombres de la carpeta vieja y nueva

    if (!oldFolderName || !newFolderName) {
        return res.status(400).send({ error: 'Se requieren los nombres de la carpeta vieja y nueva.' });
    }

    const oldFolderPath = path.join(currentPath, oldFolderName);
    const newFolderPath = path.join(currentPath, newFolderName);

    try {
        // Verificar si la carpeta vieja existe
        if (!fs.existsSync(oldFolderPath)) {
            return res.status(404).send({ error: 'La carpeta vieja no existe.' });
        }

        // Renombrar la carpeta
        await fs.promises.rename(oldFolderPath, newFolderPath);

        res.send({
            message: 'Carpeta renombrada con éxito',
            oldFolderName: oldFolderName,
            newFolderName: newFolderName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al renombrar la carpeta: ${err.message}` });
    }
});

// Endpoint para navegar por las carpetas (entrar en una subcarpeta)
app.get('/navigate', async (req, res) => {
    const { dir } = req.query;  // Obtener la carpeta a la que se quiere navegar

    if (!dir) {
        return res.status(400).send({ error: 'Se requiere un parámetro de carpeta.' });
    }

    const newPath = path.join(currentPath, dir);

    try {
        const stats = await fs.promises.stat(newPath);

        if (!stats.isDirectory()) {
            return res.status(400).send({ error: 'El directorio no existe o no es válido.' });
        }

        currentPath = newPath;
        res.send({
            message: 'Navegando a la nueva carpeta',
            currentPath: currentPath
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error al navegar a la carpeta' });
    }
});

// Endpoint para navegar hacia atrás (volver a la carpeta anterior)
app.get('/back', (req, res) => {
    const parentPath = path.dirname(currentPath); // Obtener la carpeta superior

    if (currentPath === parentPath) {
        return res.status(400).send({ error: 'Ya estás en la raíz.' });
    }

    currentPath = parentPath; // Establecer la nueva ruta actual
    res.send({
        message: 'Navegando hacia atrás',
        currentPath: currentPath
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
