import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';

interface ImageData {
  photographer: string;
}

const ImgDisplay: React.FC = () => {
  const { imageSrc } = useParams<{ imageSrc: string }>(); // Extract imageSrc from the URL
  const [imageData, setImageData] = useState<ImageData | null>(null); // State to hold image data
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    if (!imageSrc) return; // Handle the case where imageSrc might be undefined

    setImageData({
      photographer: extractPhotographerFromFilename(imageSrc),
    });
  }, [imageSrc]);

  const extractPhotographerFromFilename = (filename: string) => {
    // Asumimos que el formato es "nombrefotografo_IDIMG.png"
    const parts = filename.split('_');
    if (parts.length > 1) {
      return parts[0];
    }
    return 'Unknown Photographer';
  };

  // Example function to navigate to the previous or next image
  const navigateToImage = (direction: 'prev' | 'next') => {
    // Implement logic to get the previous or next image based on `direction`
    // For example:
    // const newImageSrc = direction === 'prev' ? getPreviousImage(imageSrc) : getNextImage(imageSrc);
    // navigate(`/img-display/${newImageSrc}`);
  };

  if (!imageData) return <Typography>Loading...</Typography>;

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
        <CardMedia
          component="img"
          image={`/uploads/${imageSrc}`}
          alt={imageSrc}
          sx={{ 
            width: '100%',
            height: 'auto',
            border: '5px solid white',
            objectFit: 'contain', // Ensure the image is fully visible and maintains its aspect ratio
          }} 
        />
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
          flexDirection: { xs: 'column', md: 'row' }, // Responsive direction
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '8px',
          margin: 'auto', // Center the card horizontally
          textAlign: { xs: 'center', md: 'left' }, // Responsive text alignment
        }}
      >

        <Typography variant="body2" color="#FCF8F3">
          <strong style={{ fontSize: '15px', color: '#FCF8F3' }}>Fotógrafo:</strong> 
          <span style={{ fontSize: '15px', fontStyle: 'italic', color: '#FCF8F3' }}>{imageData.photographer}</span>
        </Typography>
        <Button
          aria-label="download"
          href={`/uploads/${imageSrc}`} // URL to download the image
          download={imageSrc} // The filename to use for the downloaded file
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ 
            marginTop: { xs: 2, md: 0 }, // Responsive margin top
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
      </Box>
    </Box>
  );
};

export default ImgDisplay;
