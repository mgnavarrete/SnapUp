import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import MediaDisplay from './pages/MediaDisplay';
import TakeImg from './pages/TakeImg';
import UploadImg from './pages/UploadImg';
import Slideshow from './pages/Slideshow';
import { Navbar } from './components/Navbar';
import theme from './theme.ts';
import './App.css';

const App: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className={isFullscreen ? 'fullscreen' : ''}>
          <header>
            <Navbar />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/media-display/:mediaSrc" element={<MediaDisplay />} />
              <Route path="/take-img" element={<TakeImg />} />
              <Route path="/upload-img" element={<UploadImg />} />
              <Route path="/slideshow" element={<Slideshow setIsFullscreen={setIsFullscreen} />} />
            </Routes>
          </main>
          <footer>
            <p>created with ❤️ by Menta</p>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
