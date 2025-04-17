import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
  
  
});
