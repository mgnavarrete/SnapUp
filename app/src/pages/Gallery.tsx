import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Pagination,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grow,
  MenuItem,
  Menu,
  Button,
} from '@mui/material';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import exifr from 'exifr';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import dayjs, { Dayjs } from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ITEMS_PER_PAGE = 20;

interface MediaData {
  src: string;
  photographer: string;
  date: string;
  time: string;
  type: 'image' | 'video';
  duration?: string;
  uploadDate: Date;
}

const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [photographer, setPhotographer] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(true);
  const [filteredMedia, setFilteredMedia] = useState<MediaData[]>([]);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [showMedia, setShowMedia] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia(media, photographer, selectedDate);
  }, [media, photographer, selectedDate]);

  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false);
        setShowMedia(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transitioning]);

  useEffect(() => {
    sortMedia(filteredMedia);
  }, [sortOrder]);

  const fetchMedia = async () => {
    setSearching(true);
    try {
      const response = await axios.get<string[]>('/api/media');
      if (Array.isArray(response.data)) {
        const mediaDataPromises: Promise<MediaData>[] = response.data.map(async (item: string): Promise<MediaData> => {
          const photographerName = item.split('_')[0];
          const { date, time, uploadDate } = await fetchMediaDateTime(`/uploads/${item}`, item);
          const type = /\.(jpg|jpeg|png|gif)$/i.test(item) ? 'image' : 'video';
          const duration = type === 'video' ? await fetchVideoDuration(`/uploads/${item}`) : undefined;
          return { src: item, photographer: photographerName, date, time, type, duration, uploadDate };
        });
        let mediaData = await Promise.all(mediaDataPromises);
        mediaData = mediaData.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()); // Orden descendente por defecto
        setMedia(mediaData);
        setFilteredMedia(mediaData);
        setTotalPages(Math.ceil(mediaData.length / ITEMS_PER_PAGE));
      } else {
        console.error('La respuesta del servidor no es un array:', response.data);
      }
    } catch (error) {
      console.error('Hubo un error al obtener los medios!', error);
    } finally {
      setSearching(false);
    }
  };

  const fetchMediaDateTime = async (mediaSrc: string, filename: string): Promise<{ date: string; time: string; uploadDate: Date }> => {
    try {
      const response = await fetch(mediaSrc);
      const mediaBlob = await response.blob();
      const exifData = await exifr.parse(mediaBlob);
      let dateTime = exifData?.DateTimeOriginal?.toString();

      if (!dateTime) {
        const parts = filename.split('_');
        if (parts.length >= 3) {
          const datePart = parts[1];
          const timePart = parts[2].split('.')[0];

          const [year, month, day] = datePart.split('-');
          const [hours, minutes, seconds] = timePart.split('-');

          const dateObj = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
          const date = dateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const time = dateObj.toTimeString().split(' ')[0];

          return { date, time, uploadDate: dateObj };
        } else {
          return { date: 'Fecha desconocida', time: '', uploadDate: new Date(0) };
        }
      } else {
        const dateObj = new Date(dateTime);
        const date = dateObj.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const time = dateObj.toTimeString().split(' ')[0];

        return { date, time, uploadDate: dateObj };
      }
    } catch (error) {
      console.error('Error al obtener metadatos EXIF:', error);
      const parts = filename.split('_');
      if (parts.length >= 3) {
        const datePart = parts[1];
        const timePart = parts[2].split('.')[0];

        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split('-');

        const dateObj = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
        const date = dateObj.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const time = dateObj.toTimeString().split(' ')[0];

        return { date, time, uploadDate: dateObj };
      } else {
        return { date: 'Fecha desconocida', time: '', uploadDate: new Date(0) };
      }
    }
  };

  const fetchVideoDuration = async (videoSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.onerror = () => {
        resolve('Desconocido');
      };
    });
  };

  const filterMedia = (media: MediaData[], photographer: string, selectedDate: Dayjs | null) => {
    const photographerLowerCase = photographer.toLowerCase();
    const filtered = media.filter(item => {
      const matchesPhotographer = photographer === '' || item.photographer.toLowerCase().startsWith(photographerLowerCase);
      const matchesDate = !selectedDate || (dayjs(item.uploadDate).isSame(selectedDate, 'day'));
      return matchesPhotographer && matchesDate;
    });
    sortMedia(filtered); // Asegurarse de ordenar los datos filtrados
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setPage(1);
    setShowMedia(false);
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      setShowMedia(true);
    }, 400);
  };

  const sortMedia = (media: MediaData[]) => {
    const sortedMedia = [...media].sort((a, b) => 
      sortOrder === 'desc' 
        ? b.uploadDate.getTime() - a.uploadDate.getTime()
        : a.uploadDate.getTime() - b.uploadDate.getTime()
    );
    setFilteredMedia(sortedMedia);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setShowMedia(false);
    setTransitioning(true);
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleMediaClick = (src: string, _type: 'image' | 'video') => {
    navigate(`/media-display/${src}`);
  };

  const handlePhotographerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotographer(event.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleResetFilters = () => {
    setPhotographer('');
    setSelectedDate(null);
    setSortOrder('desc');
    filterMedia(media, '', null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isPhotographerEmpty = (photographer: string) => {
    return !photographer.trim();
  };

  const getCurrentPageMedia = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMedia.slice(startIndex, endIndex);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: { xs: '30px', md: '50px' }, mb: 4 }}>Galería de Fotos 📷</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center'}}>
          <Button
            id="demo-customized-button"
            aria-controls={open ? 'demo-customized-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="contained"
            disableElevation
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
            startIcon={<CreateIcon />}
            sx={{ marginBottom: 3 }}
          >
            Filtros
          </Button>
          <Menu
            id="demo-customized-menu"
            MenuListProps={{
              'aria-labelledby': 'demo-customized-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem disableRipple>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                
                label="Seleccionar Fecha"
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{ textField: { variant: 'outlined', size: 'small' },
                  layout: {
                    sx: {
                      variant: 'outlined',
                      color: '#DCA47C',         
                      borderColor: '#DCA47C',

                    }
                    
                  }
                 }} // Tamaño pequeño
              />
            </LocalizationProvider>
            </MenuItem>
            <MenuItem disableRipple sx={{ color: '#DCA47C' }}>
              <TextField
                variant="outlined"

                label="Buscar Fotógrafo"
                value={photographer}
                onChange={handlePhotographerChange}
                size="small" // Tamaño pequeño
                fullWidth
              />
            </MenuItem>
            <MenuItem disableRipple>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width:'100%'}}>
            <Button
                onClick={handleSortOrderToggle}
                variant="contained"
                startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                sx={{
                  position: 'right',
                  marginTop: '5px',
                  fontSize: '13px'}}
              >
                {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <Button onClick={handleResetFilters} variant= 'contained' startIcon= {<DeleteIcon/>}  
            sx={{
                position: 'right',
                marginTop: '5px',
                fontSize: '13px',
                '& .MuiButton-startIcon': {
                  marginRight: 0, // Ajusta este valor según la distancia que desees
                }}}>limpiar</Button>
            </Box>
            </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ width: '100%', height: 'auto', overflowY: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
            {searching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, flexWrap: 'wrap'}}>
                <CircularProgress sx={{ color: '#FCF8F3' }} />
              </Box>
            ) : filteredMedia.length === 0 && !isPhotographerEmpty(photographer) ? (
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                No se encontraron resultados
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
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={`/thumbnails/${item.src.replace(/\.[^/.]+$/, ".jpg")}`}
                            alt={item.src}
                            loading="lazy"
                            sx={{ objectFit: 'cover' }}
                          />
                          {item.duration && (
                            <Typography
                              variant="body2"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                margin: '4px',
                                fontSize: '0.8rem',
                              }}
                            >
                              {item.duration}
                            </Typography>
                          )}
                        </Box>
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
        </Box>
      </Box>
    </Container>
  );
};

export default Gallery;
