import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5050, // El puerto que deseas usar para Vite
    host: '0.0.0.0', // Esto permite que se pueda acceder desde una IP externa
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://mentaflix.ddns.net:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://mentaflix.ddns.net:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
