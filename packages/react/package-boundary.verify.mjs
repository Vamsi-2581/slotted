import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

import { LAYER_ORDER_STATEMENT } from '@slotted/theme/layer-order';

const packageDirectory = fileURLToPath(new URL('.', import.meta.url));
const distDirectory = join(packageDirectory, 'dist');
const forbiddenPattern = /storybook-workbench|@storybook|fontsource|@testing-library/i;
const textArtifactPattern = /\.(?:css|d\.ts|html|js|json|map)$/;

function collectTextArtifacts(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return collectTextArtifacts(path);
    return textArtifactPattern.test(entry.name) ? [path] : [];
  });
}

const violations = collectTextArtifacts(distDirectory).flatMap((path) => {
  const content = readFileSync(path, 'utf8');
  return content.match(forbiddenPattern) ? [relative(packageDirectory, path)] : [];
});

/**
 * A declaration file is read by the consumer's compiler, which resolves every
 * module it names — a side-effect import included. A package the manifest
 * does not install for the consumer, such as the `@slotted/styles`
 * devDependency, then fails their type check unless `skipLibCheck` hides it.
 */
const manifest = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
const installed = new Set([
  ...Object.keys(manifest.dependencies ?? {}),
  ...Object.keys(manifest.peerDependencies ?? {}),
]);
const specifierPatterns = [
  /^\s*import\s+['"]([^'"]+)['"]/gm,
  /^\s*(?:import|export|\})[^'"\n]*\bfrom\s+['"]([^'"]+)['"]/gm,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const packageOf = (specifier) =>
  specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');
const undeclaredImports = collectTextArtifacts(join(distDirectory, 'types'))
  .filter((path) => path.endsWith('.d.ts'))
  .flatMap((path) => {
    const content = readFileSync(path, 'utf8');
    return specifierPatterns
      .flatMap((pattern) => [...content.matchAll(pattern)].map((match) => match[1]))
      .filter((specifier) => !specifier.startsWith('.') && !installed.has(packageOf(specifier)))
      .map((specifier) => `${relative(packageDirectory, path)}: ${specifier}`);
  });

const bundledStyles = readFileSync(join(distDirectory, 'styles.css'), 'utf8');
/**
 * Canaries for "the bundled stylesheet still carries the families it imports".
 * They are written in the public identifier because a class name is not
 * contract, and the minifier drops the quotes an authored selector keeps, so
 * both sides are normalised the same way.
 */
const requiredSelectors = ['[data-ui=button]{', '[data-ui=divider]{', '@layer slotted.components{'];
const normalize = (css) => css.replace(/\s+/g, '').replace(/['"]/g, '');
const normalizedStyles = normalize(bundledStyles);
const missingSelectors = requiredSelectors.filter(
  (selector) => !normalizedStyles.includes(normalize(selector)),
);

if (!bundledStyles.startsWith(LAYER_ORDER_STATEMENT)) {
  console.error('The bundled stylesheet does not open with the published layer order.');
  process.exitCode = 1;
}

if (missingSelectors.length > 0) {
  console.error('The bundled stylesheet lost required rules:');
  for (const selector of missingSelectors) console.error(`- ${selector}`);
  process.exitCode = 1;
}

if (violations.length > 0) {
  console.error('Private Storybook dependencies leaked into @slotted/react artifacts:');
  for (const path of violations) console.error(`- ${path}`);
  process.exitCode = 1;
}

if (undeclaredImports.length > 0) {
  console.error('Declaration files import packages @slotted/react does not install:');
  for (const entry of undeclaredImports) console.error(`- ${entry}`);
  process.exitCode = 1;
}
