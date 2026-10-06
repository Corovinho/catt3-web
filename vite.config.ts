import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path so it works seamlessly on GitHub Pages, Vercel, or locally
  server: {
    host: true,
    port: 3000
  }
});
