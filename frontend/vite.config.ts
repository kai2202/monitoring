/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => ({
  root: path.resolve(__dirname),
  base:
    process.env.VITE_BASE_PATH ||
    (command === 'build' && mode === 'mock' ? '/monitoring/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fortawesome/react-fontawesome': path.resolve(__dirname, './src/shared/icons/FontAwesomeIcon.tsx'),
      '@fortawesome/free-solid-svg-icons': path.resolve(__dirname, './src/shared/icons/solidIcons.ts'),
      '@fortawesome/free-regular-svg-icons': path.resolve(__dirname, './src/shared/icons/solidIcons.ts'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
  },
}));

