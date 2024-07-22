const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Ruta para subir archivos (imágenes y videos)
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subieron archivos.');
  }

  const photographerName = req.body.photographerName || 'undefined';
  const files = req.files.files; // Cambiar a "files" para aceptar múltiples tipos de archivos
  const uploadPromises = [];

  const saveFile = (file) => {
    return new Promise((resolve, reject) => {
      const uniqueSuffix = uuidv4();
      const extension = path.extname(file.name);
      const filename = `${photographerName}_${uniqueSuffix}${extension}`;
      const filepath = path.join(uploadsDir, filename);

      file.mv(filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
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

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(uploadsDir));

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
