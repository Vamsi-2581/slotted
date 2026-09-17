import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineProject({
  resolve: {
    alias: {
      '@nexora/domain': here('../domain/src'),
      '@nexora/data': here('../data/src'),
      '@nexora/api': here('../api/src'),
    },
  },
  test: { name: '@nexora/data', environment: 'node', include: ['src/**/*.test.ts'] },
});
