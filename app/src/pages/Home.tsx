import React from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={6}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '40px', md: '80px' },
          }}
        >
          Sé Nuestro Fotógrafo Profesional
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '16px', md: '25px' },
            mt: 2,
          }}
        >
          Saca tus propias fotos y ayúdanos a guardar todos los recuerdos.
        </Typography>
        <Grid container spacing={2} sx={{ mt: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Grid item>
            <Button
              component={Link}
              to="/upload-img"
              variant="contained"
              color="primary"
              sx={{ fontSize: { xs: '16px', md: '20px' } }}
            >
              Subir Foto
            </Button>
          </Grid>
          <Grid item>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
        <img
          src="src/assets/homeImg.png"
          alt="homeImg"
          style={{ height: 'auto', maxWidth: '100%', maxHeight: '450px' }}
        />
      </Grid>
    </Grid>
  );
};

export default Home;
