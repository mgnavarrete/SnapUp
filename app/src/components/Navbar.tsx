import { AppBar, Toolbar, Typography, Box, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

export const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ bgcolor: '#DCA47C', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="SnapUp" />
        </ListItem>
        <ListItem button component={Link} to="/upload-img">
          <ListItemText primary="Subir Archivos" />
        </ListItem>
        <ListItem button component={Link} to="/gallery">
          <ListItemText primary="Galería" />
        </ListItem>
        
      </List>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#FCF8F3' }}>
          menta © 2024
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: '#DCA47C' }}>
        <Toolbar style={{ padding: 0 }}>
          <Box sx={{ marginLeft: '50px' }}>
            <IconButton
              component={Link}
              to="/"
              size="large"
              edge="start"
              color="inherit"
              aria-label="logo"
              style={{ margin: 0, padding: 0 }}
            >
              <img src="src/assets/SnapUpLogo.png" alt="Logo" style={{ height: '55px' }} />
            </IconButton>

            <Typography
              variant="h6"
              component={Link}
              to="/"
              style={{ color: '#FCF8F3', textDecoration: 'none', marginLeft: '5px', fontSize: '25px', marginTop: '10px' }}
            >
              SnapUp
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} /> {/* Este Box empuja los elementos hacia la derecha */}
          {isMobile ? (
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle} sx={{marginRight: '50px'}}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ marginRight: '50px' }}>
              {/* <Button color="inherit" component={Link} to="/slideshow" style={{ textTransform: 'none', fontSize: '20px', color: '#FCF8F3' }}>slideshow</Button> */}
              <Button color="inherit" component={Link} to="/upload-img" style={{ textTransform: 'none', fontSize: '20px', color: '#FCF8F3' }}>subir foto</Button>
              {/* <Button color="inherit" component={Link} to="/take-img" style={{ textTransform: 'none', fontSize: '20px', color: '#FCF8F3' }}>sacar foto</Button> */}
              <Button color="inherit" component={Link} to="/gallery" style={{ textTransform: 'none', fontSize: '20px', color: '#FCF8F3' }}>galería</Button>
              
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </Box>
  );
};
