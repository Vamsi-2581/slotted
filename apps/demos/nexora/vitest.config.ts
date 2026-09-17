import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@nexora/domain': here('./packages/domain/src'),
      '@nexora/data': here('./packages/data/src'),
      '@nexora/api': here('./packages/api/src'),
    },
  },
  test: {
    projects: ['packages/domain', 'packages/data', 'packages/api'],
    passWithNoTests: true,
  },
});
