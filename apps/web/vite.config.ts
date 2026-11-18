import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@generalstaff/ui-components': path.resolve(__dirname, '../../packages/ui-components/src'),
      '@generalstaff/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@generalstaff/calculation-engine': path.resolve(__dirname, '../../packages/calculation-engine/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.tsx'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@generalstaff/ui-components': path.resolve(__dirname, '../../packages/ui-components/src'),
      '@generalstaff/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@generalstaff/calculation-engine': path.resolve(__dirname, '../../packages/calculation-engine/src'),
    },
  },
});