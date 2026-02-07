import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
});
