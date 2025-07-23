import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@contentful-landing-page-builder/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  define: {
    // Ensure process.env is available for environment variables
    'process.env': process.env,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3001,
    open: true,
  },
});