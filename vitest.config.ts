import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/engine/domain/rules.ts',
        'src/game/dr3-game.ts',
        'src/persistence/save-load.ts',
      ],
      thresholds: {
        branches: 55,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
