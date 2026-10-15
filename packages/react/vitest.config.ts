import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// @ts-expect-error -- build tooling, resolved by Node rather than by the package tsconfig
import { coreSourceAliases } from '../../scripts/source-aliases.mjs';

export default defineConfig({
  plugins: [react()],
  /* The suite exercises the source of this package, so it exercises the source
     of core too. Reading `dist` made a test fail against arithmetic that had
     already been fixed, which is a false negative nobody can debug. */
  resolve: { alias: coreSourceAliases() },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
