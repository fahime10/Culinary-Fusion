import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: true,
    alias: {
      entries: [
        { find: /\.(css|less|scss|sass)$/, replacement: 'identity-obj-proxy' }
      ]
    },
  },
});