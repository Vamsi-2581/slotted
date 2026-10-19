import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * The root and one entry per family: every folder of `src` with an `index.ts`.
 * Derived rather than listed, because the hand-kept list and `exports` drifted
 * apart (`entry-points.test.ts`).
 */
function entries(): Record<string, string> {
  const source = resolve(import.meta.dirname, 'src');
  const families = readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(source, entry.name, 'index.ts')))
    .map((entry) => [entry.name, resolve(source, entry.name, 'index.ts')] as const);
  return { index: resolve(source, 'index.ts'), ...Object.fromEntries(families) };
}

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      cssFileName: 'styles',
      entry: entries(),
      formats: ['es'],
    },
    rollupOptions: {
      /* The frameworks are the consumer's: `react-dom` bundled in was a
         CommonJS copy that required `react` at runtime, which a browser cannot. */
      external: [/^@slotted\/core/, /^@slotted\/theme(\/|$)/, /^react(\/|$)/, /^react-dom(\/|$)/],
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
