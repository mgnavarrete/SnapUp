import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Pagination, TextField, CircularProgress, Card, CardContent, CardMedia, CardActionArea, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ITEMS_PER_PAGE = 28;

interface ImageData {
  src: string;
  photographer: string;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [photographer, setPhotographer] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [transitioning, setTransitioning] = useState<boolean>(false); // State to handle transitions
  const [showImages, setShowImages] = useState<boolean>(true); // State to control the visibility of images
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterImages(images, photographer);
  }, [images, photographer]);

  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false);
        setShowImages(true); // Show new images after transition
      }, 1000); // Match duration of transition
      return () => clearTimeout(timer);
    }
  }, [transitioning]);

  const fetchImages = () => {
    setSearching(true);
    axios.get('/api/images')
      .then(response => {
        if (Array.isArray(response.data)) {
          const imageData = response.data.map((image: string) => {
            const photographerName = image.split('_')[0];
            return { src: image, photographer: photographerName };
          });
          setImages(imageData);
        } else {
          console.error('La respuesta del servidor no es un array:', response.data);
        }
      })
      .catch(error => {
        console.error('Hubo un error al obtener las imágenes!', error);
      })
      .finally(() => {
        setSearching(false);
      });
  };

  const filterImages = (images: ImageData[], photographer: string) => {
    const photographerLowerCase = photographer.toLowerCase();
    const filtered = images.filter(image => {
      return photographer === '' || image.photographer.toLowerCase().startsWith(photographerLowerCase);
    });
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setPage(1); // Reset to first page on new filter
    setShowImages(false); // Hide images before filtering
    setTransitioning(true); // Start transition
    setTimeout(() => {
      setFilteredImages(filtered);
    }, 400); // Match transition duration
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setShowImages(false); // Hide images before changing the page
    setTransitioning(true); // Start transition
    setPage(value);
    window.scrollTo(0, 0); // Mueve la ventana a la parte superior
  };

  const handleImageClick = (image: string) => {
    navigate(`/img-display/${image}`);
  };

  const handlePhotographerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotographer(event.target.value);
  };

  const getCurrentPageImages = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredImages.slice(startIndex, endIndex);
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
            {filteredImages.length === 0 ? (
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                No hay imágenes de ese fotógrafo
              </Typography>
            ) : (
              getCurrentPageImages().map((image, index) => (
                <Grow in={showImages} key={index} timeout={400}>
                  <Card
                    sx={{
                      width: { xs: 'calc(50% - 5px)', sm: 'calc(33.33% - 5px)', md: 'calc(25% - 5px)' }, // Responsive width
                      cursor: 'pointer',
                      border: '2px solid',
                      borderRadius: '8px',
                      mb: '5px', // Margin bottom for the spacing between rows
                      opacity: transitioning ? 0 : 1, // Fade out during transition
                      transition: 'opacity 1s ease-in-out', // Match transition duration
                    }}
                    onClick={() => handleImageClick(image.src)}
                  >
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        height="200"
                        image={`/uploads/${image.src}`}
                        alt={image.src}
                        loading="lazy"
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ padding: '8px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'left', color: '#DCA47C' }}>
                          <strong>Fotógrafo:</strong> <em>{image.photographer}</em>
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grow>
              ))
            )}
          </Box>
          {filteredImages.length > 0 && (
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