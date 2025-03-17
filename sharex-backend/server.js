const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let currentPath = 'E:/';  // Carpeta raíz inicial (puedes cambiarla según tu necesidad)

// Endpoint que devuelve la ruta actual (breadcrumb)
app.get('/current-path', (req, res) => {
    res.send({
        message: 'Ruta actual',
        currentPath: currentPath
    });
});

// Endpoint que devuelve el contenido de la carpeta actual (archivos y subcarpetas)
app.get('/directory', (req, res) => {
    fs.readdir(currentPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).send({ error: 'Error leyendo el directorio' });
        }

        // Filtrar solo archivos y directorios no ocultos o del sistema
        const fileList = files.filter(file => {
            // Excluir directorios del sistema y archivos ocultos
            const systemFiles = ['$RECYCLE.BIN', 'System Volume Information','partition_identifier_bc_new.platform'];
            return !systemFiles.includes(file.name) && 
                (!file.name.startsWith('.') || !file.isDirectory()) && 
                (file.isFile() || (file.isDirectory() && !file.name.startsWith('.')));
        }).map(file => ({
            name: file.name,               // Nombre del archivo o directorio
            isDirectory: file.isDirectory(), // True si es un directorio
            extension: file.isDirectory() ? null : path.extname(file.name) // Extensión solo si es archivo
        }));

        res.send({
            message: 'Contenido del directorio',
            files: fileList
        });
    });
});

app.post('/create-folder', (req, res) => {
    const { folderName } = req.body;  // El nombre de la carpeta será pasado en el cuerpo de la solicitud

    if (!folderName) {
        return res.status(400).send({ error: 'El nombre de la carpeta es requerido.' });
    }

    const newFolderPath = path.join(currentPath, folderName);

    // Crear la carpeta
    fs.mkdir(newFolderPath, { recursive: true }, (err) => {
        if (err) {
            return res.status(500).send({ error: 'Error al crear la carpeta' });
        }

        res.send({
            message: 'Carpeta creada con éxito',
            folderName: folderName,
            folderPath: newFolderPath
        });
    });
});



// Endpoint para navegar por las carpetas (entrar en una subcarpeta)
app.get('/navigate', (req, res) => {
    const { dir } = req.query;  // Obtener la carpeta a la que se quiere navegar

    if (!dir) {
        return res.status(400).send({ error: 'Se requiere un parámetro de carpeta.' });
    }

    // Construir la nueva ruta
    const newPath = path.join(currentPath, dir);

    // Verificar si la nueva ruta es un directorio válido
    fs.stat(newPath, (err, stats) => {
        if (err || !stats.isDirectory()) {
            return res.status(400).send({ error: 'El directorio no existe o no es válido.' });
        }

        currentPath = newPath; // Actualizar la ruta actual
        res.send({
            message: 'Navegando a la nueva carpeta',
            currentPath: currentPath
        });
    });
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
