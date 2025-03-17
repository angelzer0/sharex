const { exec } = require("child_process");

// Función para formatear el tamaño del disco en TB, GB, MB o bytes
const formatSize = (sizeInBytes) => {
  if (sizeInBytes >= 1024 ** 4) {
    return `${Math.round(sizeInBytes / 1024 ** 4)} TB`;
  } else if (sizeInBytes >= 1024 ** 3) {
    return `${Math.round(sizeInBytes / 1024 ** 3)} GB`;
  } else if (sizeInBytes >= 1024 ** 2) {
    return `${Math.round(sizeInBytes / 1024 ** 2)} MB`;
  } else {
    return `${sizeInBytes} bytes`;
  }
};

// Función para calcular el porcentaje de espacio consumido como número entero
const calculateConsumedSpacePercentage = (usedSpace, totalSize) => {
  return Math.floor((usedSpace / totalSize) * 100); // Devuelve el porcentaje redondeado hacia abajo sin decimales
};

// Función para obtener la información del disco (espacio total y consumido)
exports.getDiskUsageController = (req, res) => {
  const driveLetter = "E:"; // Puedes ajustar esto según el disco que quieras consultar

  exec("wmic logicaldisk get size,freespace,caption", (error, stdout) => {
    if (error) {
      console.error(error);
      return res
        .status(500)
        .send({ error: "Error al obtener el uso del disco." });
    }

    const lines = stdout.split("\n").filter((line) => line.trim() !== "");
    const drives = lines
      .slice(1)
      .map((line) => {
        const [drive, freeSpace, totalSize] = line.trim().split(/\s+/);

        if (drive === driveLetter) {
          // Convertir los valores de tamaño a enteros
          const freeSpaceInt = parseInt(freeSpace);
          const totalSizeInt = parseInt(totalSize);
          const usedSpaceInt = totalSizeInt - freeSpaceInt; // Espacio consumido

          // Devolver el tamaño total y el porcentaje de espacio consumido
          return {
            drive,
            totalSizeFormatted: formatSize(totalSizeInt),
            usedSpacePercentage:
              calculateConsumedSpacePercentage(usedSpaceInt, totalSizeInt) +
              "%",
          };
        }
      })
      .filter((drive) => drive !== undefined);

    if (drives.length > 0) {
      res.send({ message: "Uso del disco obtenido con éxito", drives });
    } else {
      res.status(404).send({ error: "Unidad no encontrada." });
    }
  });
};
