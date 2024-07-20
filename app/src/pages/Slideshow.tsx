import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import exifr from 'exifr';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

interface ImageData {
  src: string;
  photographer: string;
  date: string;
  time: string;
}

interface SlideshowProps {
  setIsFullscreen: (isFullscreen: boolean) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ setIsFullscreen }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreenState] = useState<boolean>(false);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images]);

  const fetchImages = () => {
    setLoading(true);
    axios.get('/api/images')
      .then(async response => {
        if (Array.isArray(response.data)) {
          const imageDataPromises = response.data.map(async (image: string) => {
            const photographerName = image.split('_')[0];
            const { date, time } = await fetchImageDateTime(`/uploads/${image}`);
            return { src: image, photographer: photographerName, date, time };
          });
          const imageData = await Promise.all(imageDataPromises);
          setImages(imageData);
        } else {
          console.error('La respuesta del servidor no es un array:', response.data);
        }
      })
      .catch(error => {
        console.error('Hubo un error al obtener las imágenes!', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchImageDateTime = async (imageSrc: string): Promise<{ date: string; time: string }> => {
    try {
      const response = await fetch(imageSrc);
      const img = await response.blob();
      const exifData = await exifr.parse(img);
      const modificationDate = response.headers.get('last-modified');

      let dateTime = exifData?.DateTimeOriginal?.toString() || modificationDate || 'Fecha desconocida';
      if (dateTime === 'Fecha desconocida') {
        return { date: 'Fecha desconocida', time: '' };
      }

      const dateObj = new Date(dateTime);
      const date = dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = dateObj.toTimeString().split(' ')[0];

      return { date, time };
    } catch (error) {
      console.error('Error al obtener metadatos EXIF:', error);
      return { date: 'Fecha desconocida', time: '' };
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setIsFullscreenState(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
        setIsFullscreenState(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      } else if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (images.length === 0) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
        No hay imágenes disponibles
      </Typography>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <Container sx={{ position: 'relative', height: '100vh', p: 0, m: 0, maxWidth: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          transition: 'opacity 1s ease-in-out',
          opacity: loading ? 0 : 1,
          bgcolor: 'black',
          width: '100%',
        }}
      >
        <IconButton
          className="fullscreen-icon"
          onClick={toggleFullscreen}
          color="inherit"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            opacity: 0.5,
            transition: 'opacity 0.3s ease-in-out',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
        <img
          src={`/uploads/${currentImage.src}`}
          alt={currentImage.src}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Container>
  );
};

export default Slideshow;
