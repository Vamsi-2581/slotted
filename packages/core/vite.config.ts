import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        collection: resolve(import.meta.dirname, 'src/collection/index.ts'),
        count: resolve(import.meta.dirname, 'src/count/index.ts'),
        currency: resolve(import.meta.dirname, 'src/currency/index.ts'),
        files: resolve(import.meta.dirname, 'src/files/index.ts'),
        form: resolve(import.meta.dirname, 'src/form/index.ts'),
        focus: resolve(import.meta.dirname, 'src/focus/index.ts'),
        identity: resolve(import.meta.dirname, 'src/identity/index.ts'),
        keys: resolve(import.meta.dirname, 'src/keys/index.ts'),
        loading: resolve(import.meta.dirname, 'src/loading/index.ts'),
        measure: resolve(import.meta.dirname, 'src/measure/index.ts'),
        number: resolve(import.meta.dirname, 'src/number/index.ts'),
        overflow: resolve(import.meta.dirname, 'src/overflow/index.ts'),
        progress: resolve(import.meta.dirname, 'src/progress/index.ts'),
        pagination: resolve(import.meta.dirname, 'src/pagination/index.ts'),
        slider: resolve(import.meta.dirname, 'src/slider/index.ts'),
        state: resolve(import.meta.dirname, 'src/state/index.ts'),
        steps: resolve(import.meta.dirname, 'src/steps/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: { output: { entryFileNames: '[name].js' } },
  },
});
