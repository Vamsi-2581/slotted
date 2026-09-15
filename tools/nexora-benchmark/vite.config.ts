import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    target: 'es2022',
  },
  worker: { format: 'es' },
});
