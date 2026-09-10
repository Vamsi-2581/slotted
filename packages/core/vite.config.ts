import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        clipboard: resolve(import.meta.dirname, 'src/clipboard/index.ts'),
        collection: resolve(import.meta.dirname, 'src/collection/index.ts'),
        count: resolve(import.meta.dirname, 'src/count/index.ts'),
        currency: resolve(import.meta.dirname, 'src/currency/index.ts'),
        date: resolve(import.meta.dirname, 'src/date/index.ts'),
        disclosure: resolve(import.meta.dirname, 'src/disclosure/index.ts'),
        'dismissable-layer': resolve(import.meta.dirname, 'src/dismissable-layer/index.ts'),
        extent: resolve(import.meta.dirname, 'src/extent/index.ts'),
        files: resolve(import.meta.dirname, 'src/files/index.ts'),
        form: resolve(import.meta.dirname, 'src/form/index.ts'),
        focus: resolve(import.meta.dirname, 'src/focus/index.ts'),
        identity: resolve(import.meta.dirname, 'src/identity/index.ts'),
        keys: resolve(import.meta.dirname, 'src/keys/index.ts'),
        'live-announcer': resolve(import.meta.dirname, 'src/live-announcer/index.ts'),
        loading: resolve(import.meta.dirname, 'src/loading/index.ts'),
        measure: resolve(import.meta.dirname, 'src/measure/index.ts'),
        number: resolve(import.meta.dirname, 'src/number/index.ts'),
        overflow: resolve(import.meta.dirname, 'src/overflow/index.ts'),
        'pointer-intent': resolve(import.meta.dirname, 'src/pointer-intent/index.ts'),
        portal: resolve(import.meta.dirname, 'src/portal/index.ts'),
        positioner: resolve(import.meta.dirname, 'src/positioner/index.ts'),
        presence: resolve(import.meta.dirname, 'src/presence/index.ts'),
        progress: resolve(import.meta.dirname, 'src/progress/index.ts'),
        pagination: resolve(import.meta.dirname, 'src/pagination/index.ts'),
        slider: resolve(import.meta.dirname, 'src/slider/index.ts'),
        state: resolve(import.meta.dirname, 'src/state/index.ts'),
        steps: resolve(import.meta.dirname, 'src/steps/index.ts'),
        toast: resolve(import.meta.dirname, 'src/toast/index.ts'),
        typeahead: resolve(import.meta.dirname, 'src/typeahead/index.ts'),
        upload: resolve(import.meta.dirname, 'src/upload/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      /**
       * The positioning engine stays a dependency rather than becoming part of
       * the bundle: an application that already uses it, or a framework package
       * that re-bundles this one, would otherwise ship a second copy.
       */
      external: [/^@floating-ui\//],
      output: { entryFileNames: '[name].js' },
    },
  },
});
