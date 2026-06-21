import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/simulate': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
