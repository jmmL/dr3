import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
});
