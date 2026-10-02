import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

import { coreSourceAliases } from '../../scripts/source-aliases.mjs';

/**
 * `@slotted/react` resolved to its source, for the reason
 * `scripts/source-aliases.mjs` gives for core: the package publishes `dist`,
 * and a page that renders a stale build documents code that no longer exists.
 */
const reactRoot = fileURLToPath(new URL('../../packages/react/src/', import.meta.url));

const reactSourceAliases = () => [
  ...readdirSync(reactRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(reactRoot, entry.name, 'index.ts')))
    .map((entry) => ({
      find: `@slotted/react/${entry.name}`,
      replacement: join(reactRoot, entry.name, 'index.ts'),
    })),
  { find: /^@slotted\/react$/, replacement: join(reactRoot, 'index.ts') },
];

export default defineConfig({
  integrations: [mdx(), react()],
  /* The development host the Nexora demo also allows (`demos/nexora/angular/angular.json`). */
  server: { allowedHosts: ['devserver.local'] },
  devToolbar: { enabled: false },
  vite: {
    resolve: {
      alias: [...reactSourceAliases(), ...coreSourceAliases()],
    },
  },
});
