import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      cssFileName: 'styles',
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        avatar: resolve(import.meta.dirname, 'src/avatar/index.ts'),
        'avatar-group': resolve(import.meta.dirname, 'src/avatar-group/index.ts'),
        badge: resolve(import.meta.dirname, 'src/badge/index.ts'),
        button: resolve(import.meta.dirname, 'src/button/index.ts'),
        card: resolve(import.meta.dirname, 'src/card/index.ts'),
        container: resolve(import.meta.dirname, 'src/container/index.ts'),
        'description-list': resolve(import.meta.dirname, 'src/description-list/index.ts'),
        dialog: resolve(import.meta.dirname, 'src/dialog/index.ts'),
        divider: resolve(import.meta.dirname, 'src/divider/index.ts'),
        grid: resolve(import.meta.dirname, 'src/grid/index.ts'),
        icon: resolve(import.meta.dirname, 'src/icon/index.ts'),
        inline: resolve(import.meta.dirname, 'src/inline/index.ts'),
        'inline-message': resolve(import.meta.dirname, 'src/inline-message/index.ts'),
        link: resolve(import.meta.dirname, 'src/link/index.ts'),
        list: resolve(import.meta.dirname, 'src/list/index.ts'),
        'list-item': resolve(import.meta.dirname, 'src/list-item/index.ts'),
        skeleton: resolve(import.meta.dirname, 'src/skeleton/index.ts'),
        stack: resolve(import.meta.dirname, 'src/stack/index.ts'),
        tag: resolve(import.meta.dirname, 'src/tag/index.ts'),
        typography: resolve(import.meta.dirname, 'src/typography/index.ts'),
        'visually-hidden': resolve(import.meta.dirname, 'src/visually-hidden/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^@slotted\/core/, 'react', 'react/jsx-runtime'],
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
