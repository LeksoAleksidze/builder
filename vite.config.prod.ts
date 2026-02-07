import { defineConfig } from 'vite';
// @ts-ignore
import react from '@vitejs/plugin-react';
// @ts-ignore
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@modules': path.resolve(__dirname, './src/shared/modules'),
      '@d2d-ui': path.resolve(__dirname, './src/shared/d2d-ui'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'landing.html'),
    },
  },
});
