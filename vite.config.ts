import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site run from any folder (GitHub Pages, Firebase Hosting, etc).
export default defineConfig({
  plugins: [react()],
  base: './',
});
