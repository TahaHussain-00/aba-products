import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use './' for local builds to fix path issues
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist', // Use 'dist' for consistency with 'serve'
  },
  preview: {
    port: 3000,
  },
});
