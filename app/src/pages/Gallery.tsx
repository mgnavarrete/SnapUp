import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Pagination, TextField, CircularProgress, Card, CardContent, CardMedia, CardActionArea, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import exifr from 'exifr';

const ITEMS_PER_PAGE = 28;

interface MediaData {
  src: string;
  photographer: string;
  date: string;
  time: string;
  type: 'image' | 'video';
}

const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [photographer, setPhotographer] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [filteredMedia, setFilteredMedia] = useState<MediaData[]>([]);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [showMedia, setShowMedia] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia(media, photographer);
  }, [media, photographer]);

  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false);
        setShowMedia(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transitioning]);

  const fetchMedia = async () => {
    setSearching(true);
    try {
      const response = await axios.get<string[]>('/api/media');
      if (Array.isArray(response.data)) {
        const mediaDataPromises: Promise<MediaData>[] = response.data.map(async (item: string): Promise<MediaData> => {
          const photographerName = item.split('_')[0];
          const { date, time } = await fetchMediaDateTime(`/uploads/${item}`);
          const type = /\.(jpg|jpeg|png|gif)$/i.test(item) ? 'image' : 'video';
          return { src: item, photographer: photographerName, date, time, type };
        });
        const mediaData = await Promise.all(mediaDataPromises);
        setMedia(mediaData);
      } else {
        console.error('La respuesta del servidor no es un array:', response.data);
      }
    } catch (error) {
      console.error('Hubo un error al obtener los medios!', error);
    } finally {
      setSearching(false);
    }
  };

  const fetchMediaDateTime = async (mediaSrc: string): Promise<{ date: string; time: string }> => {
    try {
      const response = await fetch(mediaSrc);
      const mediaBlob = await response.blob();
      const exifData = await exifr.parse(mediaBlob);
      const modificationDate = response.headers.get('last-modified');
      console.log('EXIF Data:', exifData);
      console.log('Modification Date:', modificationDate);

      let dateTime = exifData?.DateTimeOriginal?.toString() || modificationDate || 'Fecha desconocida';
      if (dateTime === 'Fecha desconocida') {
        return { date: 'Fecha desconocida', time: '' };
      }

      // Formatear la fecha y la hora
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

  const filterMedia = (media: MediaData[], photographer: string) => {
    const photographerLowerCase = photographer.toLowerCase();
    const filtered = media.filter(item => {
      return photographer === '' || item.photographer.toLowerCase().startsWith(photographerLowerCase);
    });
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setPage(1);
    setShowMedia(false);
    setTransitioning(true);
    setTimeout(() => {
      setFilteredMedia(filtered);
    }, 400);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setShowMedia(false);
    setTransitioning(true);
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleMediaClick = (src: string, type: 'image' | 'video') => {
    navigate(`/media-display/${type}/${src}`);
  };

  const handlePhotographerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotographer(event.target.value);
  };

  const getCurrentPageMedia = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMedia.slice(startIndex, endIndex);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: { xs: '30px', md: '50px' }, mb: { xs: 2, md: 0 } }}>Galería</Typography>
        <TextField
          label="Buscar Fotógrafo"
          variant="outlined"
          value={photographer}
          onChange={handlePhotographerChange}
        />
      </Box>
      {searching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', height: 'auto', overflowY: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {filteredMedia.length === 0 ? (
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                No hay archivos de ese fotógrafo
              </Typography>
            ) : (
              getCurrentPageMedia().map((item, index) => (
                <Grow in={showMedia} key={index} timeout={400}>
                  <Card
                    sx={{
                      width: { xs: 'calc(50% - 5px)', sm: 'calc(33.33% - 5px)', md: 'calc(25% - 5px)' },
                      cursor: 'pointer',
                      border: '2px solid',
                      borderRadius: '8px',
                      mb: '5px',
                      opacity: transitioning ? 0 : 1,
                      transition: 'opacity 1s ease-in-out',
                    }}
                    onClick={() => handleMediaClick(item.src, item.type)}
                  >
                    <CardActionArea>
                      {item.type === 'image' ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`/uploads/${item.src}`}
                          alt={item.src}
                          loading="lazy"
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`/thumbnails/${item.src.replace(/\.[^/.]+$/, ".jpg")}`} // Usar la imagen de miniatura correspondiente al video
                          alt={item.src}
                          loading="lazy"
                          sx={{ objectFit: 'cover' }}
                        />
                      )}
                      <CardContent sx={{ padding: '8px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'left', color: '#DCA47C' }}>
                          <strong>Fotógrafo:</strong> <em>{item.photographer}</em>
                          <br />
                          <strong>Fecha:</strong> <em>{item.date}</em>
                          <br />
                          <strong>Hora:</strong> <em>{item.time}</em>
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grow>
              ))
            )}
          </Box>
          {filteredMedia.length > 0 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default Gallery;
