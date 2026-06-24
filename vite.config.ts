import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { productBuilderPlugin } from './vite-plugin-product-builder';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'serve' ? [productBuilderPlugin()] : []),
  ],
  base: './',
}));
