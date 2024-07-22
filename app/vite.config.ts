import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5050, // El puerto que deseas usar para Vite
    host: '0.0.0.0', // Esto permite que se pueda acceder desde una IP externa
    proxy: {
      '/api': {
        target: 'http://mentaflix.ddns.net:5000',
        // target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://mentaflix.ddns.net:5000',
        // target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
