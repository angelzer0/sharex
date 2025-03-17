const fs = require('fs');
const path = require('path');
let currentPath = 'E:/';  // Ruta inicial

// Obtener ruta actual
exports.currentPathController = (req, res) => {
    res.send({
        message: 'Ruta actual',
        currentPath: currentPath
    });
};

// Obtener contenido del directorio actual
exports.getDirectoryController = async (req, res) => {
    try {
        const files = await fs.promises.readdir(currentPath, { withFileTypes: true });
        const fileList = files.filter(file => {
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
};

// Crear carpeta
exports.createFolderController = async (req, res) => {
    const { folderName } = req.body;
    if (!folderName) return res.status(400).send({ error: 'El nombre de la carpeta es requerido.' });

    const newFolderPath = path.join(currentPath, folderName);

    try {
        if (fs.existsSync(newFolderPath)) {
            return res.status(400).send({ error: 'La carpeta ya existe.' });
        }

        await fs.promises.mkdir(newFolderPath, { recursive: true });
        res.send({ message: 'Carpeta creada con éxito', folderName, folderPath: newFolderPath });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al crear la carpeta: ${err.message}` });
    }
};

// Eliminar carpeta
exports.deleteFolderController = async (req, res) => {
    const { folderName } = req.body;
    if (!folderName) return res.status(400).send({ error: 'El nombre de la carpeta es requerido.' });

    const folderPath = path.join(currentPath, folderName);
    try {
        if (!fs.existsSync(folderPath)) return res.status(404).send({ error: 'La carpeta no existe.' });
        await fs.promises.rmdir(folderPath, { recursive: true });
        res.send({ message: 'Carpeta eliminada con éxito', folderName });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al eliminar la carpeta: ${err.message}` });
    }
};

// Renombrar carpeta
exports.renameFolderController = async (req, res) => {
    const { oldFolderName, newFolderName } = req.body;
    if (!oldFolderName || !newFolderName) return res.status(400).send({ error: 'Se requieren los nombres de la carpeta vieja y nueva.' });

    const oldFolderPath = path.join(currentPath, oldFolderName);
    const newFolderPath = path.join(currentPath, newFolderName);
    try {
        if (!fs.existsSync(oldFolderPath)) return res.status(404).send({ error: 'La carpeta vieja no existe.' });
        await fs.promises.rename(oldFolderPath, newFolderPath);
        res.send({ message: 'Carpeta renombrada con éxito', oldFolderName, newFolderName });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: `Error al renombrar la carpeta: ${err.message}` });
    }
};

// Navegar a subcarpeta
exports.navigateController = async (req, res) => {
    const { dir } = req.query;
    if (!dir) return res.status(400).send({ error: 'Se requiere un parámetro de carpeta.' });

    const newPath = path.join(currentPath, dir);
    try {
        const stats = await fs.promises.stat(newPath);
        if (!stats.isDirectory()) return res.status(400).send({ error: 'El directorio no existe o no es válido.' });
        currentPath = newPath;
        res.send({ message: 'Navegando a la nueva carpeta', currentPath });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error al navegar a la carpeta' });
    }
};

// Navegar hacia atrás
exports.backController = (req, res) => {
    const parentPath = path.dirname(currentPath);
    if (currentPath === parentPath) return res.status(400).send({ error: 'Ya estás en la raíz.' });
    currentPath = parentPath;
    res.send({ message: 'Navegando hacia atrás', currentPath });
};
