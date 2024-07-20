import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5050, // El puerto que deseas usar para Vite
    host: true, // Esto permite que se pueda acceder desde una IP externa
    proxy: {
      '/api': {
        target: 'mentaflix.ddns.net:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'mentaflix.ddns.net/:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
