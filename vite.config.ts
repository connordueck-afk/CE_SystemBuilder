import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { productBuilderPlugin } from './vite-plugin-product-builder';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'serve' ? [productBuilderPlugin()] : []),
  ],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    // Don't watch runtime log files — they can be locked by other processes on
    // Windows and crash the file watcher (EBUSY).
    watch: { ignored: ['**/dev-server-remote.log', '**/*.log'] },
  },
}));
