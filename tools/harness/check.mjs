import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/** Values no scale can express, so a literal is the honest answer. */
const KEYWORDS = new Set([
  '0',
  'none',
  'auto',
  '100%',
  'transparent',
  'currentColor',
  'inherit',
  'unset',
  'initial',
  '1',
]);

const FALLBACK = /var\(\s*(--slotted-[a-z0-9-]+)\s*,\s*([^;]*?)\)(?=[;\s}])/g;
const CONTENT = /content:\s*([^;}]+)/g;
const DURATION = /(?<![\w-])\d+(?:\.\d+)?m?s(?![\w-])/;
const EASING = /(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|cubic-bezier|steps)\s*\(?/;

export function checkFamily({ family, css }) {
  const errors = [];
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const match of source.matchAll(FALLBACK)) {
    const [, token, fallback] = match;
    const value = fallback.trim();
    if (value.startsWith('var(') || KEYWORDS.has(value)) continue;
    const declarationStart = Math.max(
      source.lastIndexOf(';', match.index),
      source.lastIndexOf('{', match.index),
      source.lastIndexOf('}', match.index),
    );
    const declaration = source.slice(declarationStart + 1, match.index);
    const property = /content\s*:\s*$/.test(declaration) ? 'content: ' : '';
    errors.push(
      `${family}: ${property}${token} falls back to the literal ${value}. Reach for a scale step instead.`,
    );
  }

  for (const [, raw] of source.matchAll(CONTENT)) {
    const value = raw.trim();
    if (value === "''" || value === '""' || value.startsWith('var(')) continue;
    errors.push(
      `${family}: content is ${value}. A character is never an icon — use a glyph token as a mask.`,
    );
  }

  for (const declaration of source.matchAll(/(transition|animation)(?:-[a-z-]+)?:\s*([^;}]+)/g)) {
    const value = declaration[2];
    if (declaration[1] === 'animation' && /\binfinite\b/.test(value)) continue;
    const outsideVar = value.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '');
    if (DURATION.test(outsideVar) || EASING.test(outsideVar)) {
      errors.push(
        `${family}: ${declaration[1]} writes its own timing in "${value.trim()}". Use the motion scale.`,
      );
    }
  }

  if (/animation[^;}]*\binfinite\b/.test(source) && !source.includes('prefers-reduced-motion')) {
    errors.push(
      `${family}: an animation loops forever with no reduced-motion rule. Collapsing a duration is not enough — it has to stop.`,
    );
  }

  if (source.includes('@container') && !source.includes('container-type')) {
    errors.push(`${family}: uses @container without declaring container-type on its own root.`);
  }

  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const family = process.argv[2];
  if (!family) throw new Error('usage: node tools/harness/check.mjs <family>');
  const css = await readFile(
    new URL(`../../packages/styles/src/${family}/${family}.css`, import.meta.url),
    'utf8',
  );
  const errors = checkFamily({ family, css });
  for (const error of errors) console.error(`- ${error}`);
  console.log(errors.length === 0 ? `${family}: clean` : `${family}: ${errors.length} to fix`);
  process.exitCode = errors.length === 0 ? 0 : 1;
}
