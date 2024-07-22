const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Crear carpeta de uploads y thumbnails si no existen
const uploadsDir = path.join(__dirname, 'uploads');
const thumbnailsDir = path.join(__dirname, 'thumbnails');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

// Función para formatear la fecha y hora
const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Función para asegurar nombres de archivo únicos
const getUniqueFilename = (baseName, ext) => {
  const uniqueId = uuidv4();
  return `${baseName}_${uniqueId}${ext}`;
};

// Ruta para subir archivos (imágenes y videos)
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subieron archivos.');
  }

  const photographerName = req.body.photographerName || 'undefined';
  const uploadDate = formatDateTime(new Date());
  const baseName = `${photographerName}_${uploadDate}`;
  const files = req.files.files; // Cambiar a "files" para aceptar múltiples tipos de archivos
  const uploadPromises = [];

  const saveFile = (file) => {
    return new Promise((resolve, reject) => {
      const extension = path.extname(file.name);
      const filename = getUniqueFilename(baseName, extension);
      const filepath = path.join(uploadsDir, filename);

      file.mv(filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          if (/\.(mp4|avi|mkv|mov)$/i.test(filename)) {
            const thumbnailFilename = filename.replace(extension, '.jpg');
            ffmpeg(filepath)
              .screenshots({
                timestamps: ['50%'],
                filename: thumbnailFilename,
                folder: thumbnailsDir,
                size: '320x240'
              })
              .on('end', () => {
                resolve();
              })
              .on('error', (err) => {
                reject(err);
              });
          } else {
            resolve();
          }
        }
      });
    });
  };

  if (Array.isArray(files)) {
    files.forEach(file => {
      uploadPromises.push(saveFile(file));
    });
  } else {
    uploadPromises.push(saveFile(files));
  }

  Promise.all(uploadPromises)
    .then(() => {
      res.send('Archivos subidos correctamente.');
    })
    .catch((err) => {
      res.status(500).send('Error al subir los archivos.');
    });
});

// Servir archivos estáticos desde las carpetas 'uploads' y 'thumbnails'
app.use('/uploads', express.static(uploadsDir));
app.use('/thumbnails', express.static(thumbnailsDir));

app.get('/api/images', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).send('No se pueden escanear los archivos.');
    }
    const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(images); // Asegurarse de enviar un JSON array
  });
});

app.get('/api/videos', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).send('No se pueden escanear los archivos.');
    }
    const videos = files.filter(file => /\.(mp4|avi|mkv|mov)$/i.test(file));
    res.json(videos); // Asegurarse de enviar un JSON array
  });
});

app.get('/api/media', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    const videos = files.filter(file => /\.(mp4|avi|mkv|mov)$/i.test(file));
    const media = [...images, ...videos];
    res.json(media); // Asegurarse de enviar un JSON array
  } catch (err) {
    res.status(500).send('No se pueden escanear los archivos.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
