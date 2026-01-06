import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@modules': path.resolve(__dirname, './src/shared/modules'),
    },
  },
});
