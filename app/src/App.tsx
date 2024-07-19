import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ImgDisplay from './pages/ImgDisplay';
import TakeImg from './pages/TakeImg';
import UploadImg from './pages/UploadImg';
import { Navbar } from './components/Navbar';
import theme from './theme.ts';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/img-display/:imageSrc" element={<ImgDisplay />} /> {/* Actualiza aquí */}
            <Route path="/take-img" element={<TakeImg />} />
            <Route path="/upload-img" element={<UploadImg />} />
          </Routes>
        </main>
        <footer>
          <p>created with ❤️ by Menta</p>
        </footer>
      </Router>
    </ThemeProvider>
  );
};

export default App;
