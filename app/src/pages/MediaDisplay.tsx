import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';

interface MediaData {
  src: string;
  photographer: string;
  type: 'image' | 'video';
}

const MediaDisplay: React.FC = () => {
  const { mediaSrc } = useParams<{ mediaSrc: string }>(); // Extract mediaSrc from the URL
  const [mediaList, setMediaList] = useState<MediaData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMediaList();
  }, []);

  useEffect(() => {
    if (mediaSrc && mediaList.length > 0) {
      const index = mediaList.findIndex((media) => media.src === mediaSrc);
      if (index !== -1) {
        setCurrentIndex(index);
        setMediaData(mediaList[index]);
      }
    }
  }, [mediaSrc, mediaList]);

  const fetchMediaList = async () => {
    try {
      const response = await axios.get<string[]>('/api/media');
      if (Array.isArray(response.data)) {
        const mediaData = response.data.map((item: string): MediaData => {
          const photographerName = item.split('_')[0];
          const type = /\.(mp4|avi|mkv|mov)$/i.test(item) ? 'video' : 'image';
          return { src: item, photographer: photographerName, type };
        });
        setMediaList(mediaData);
      } else {
        console.error('La respuesta del servidor no es un array:', response.data);
      }
    } catch (error) {
      console.error('Hubo un error al obtener los medios!', error);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % mediaList.length;
    navigate(`/media-display/${mediaList[nextIndex].src}`);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    navigate(`/media-display/${mediaList[prevIndex].src}`);
  };

  if (!mediaData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: { xs: 2, md: 0 } }}>
      <Card
        sx={{
          maxWidth: 800,
          border: '5px solid white', // White border around the card
          borderRadius: '8px', // Optional: rounded corners
          margin: 'auto', // Center the card horizontally
        }}
      >
        {mediaData.type === 'image' ? (
          <CardMedia
            component="img"
            image={`/uploads/${mediaSrc}`}
            alt={mediaSrc}
            sx={{
              width: '100%',
              height: 'auto',
              border: '5px solid white',
              objectFit: 'contain', // Ensure the image is fully visible and maintains its aspect ratio
            }}
          />
        ) : (
          <Box sx={{ width: '100%', height: 'auto', border: '5px solid white' }}>
            <video
              controls
              style={{ width: '100%', height: 'auto' }}
            >
              <source src={`/uploads/${mediaSrc}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}
      </Card>
      <Box
        sx={{
          width: { xs: '100%', md: 600 }, // Responsive width
          backgroundColor: 'transparent', // Transparent background for this card
          boxShadow: 'none', // Remove shadow if necessary
          border: 'none', // Remove border if necessary
          marginTop: '-1px', // To overlap the bottom border of the image card
          padding: '16px',
          display: 'flex',
          flexDirection: 'row', // Align items in a row
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '8px',
          margin: 'auto', // Center the card horizontally
        }}
      >
        <Button
          aria-label="previous"
          onClick={handlePrevious}
          variant="contained"
          sx={{
            marginRight: 2,
            fontSize: '15px',
            backgroundColor: '#FCF8F3', // Button background color
            color: '#DCA47C', // Button text color
            '&:hover': {
              backgroundColor: '#DCA47C',
              color: '#FCF8F3',
            },
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Button
          aria-label="download"
          href={`/uploads/${mediaSrc}`} // URL to download the media
          download={mediaSrc} // The filename to use for the downloaded file
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            marginX: 2,
            fontSize: '15px',
            backgroundColor: '#FCF8F3', // Button background color
            color: '#DCA47C', // Button text color
            '&:hover': {
              backgroundColor: '#DCA47C',
              color: '#FCF8F3',
            },
          }}
        >
          Descargar
        </Button>
        <Button
          aria-label="next"
          onClick={handleNext}
          variant="contained"
          sx={{
            marginLeft: 2,
            fontSize: '15px',
            backgroundColor: '#FCF8F3', // Button background color
            color: '#DCA47C', // Button text color
            '&:hover': {
              backgroundColor: '#DCA47C',
              color: '#FCF8F3',
            },
          }}
        >
          <ArrowForwardIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default MediaDisplay;
