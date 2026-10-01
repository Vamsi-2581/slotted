import { describe, expect, it } from 'vitest';

import { processRules, splitTopLevel } from './rules';

describe('splitTopLevel', () => {
  it('keeps braces inside strings and drops top-level comments', () => {
    const css = `/* a } */ [data-ui='card']::before { content: "}"; }\n@media (width > 1px) { [data-ui='card'] { gap: 0; } }`;
    expect(splitTopLevel(css)).toEqual([
      `[data-ui='card']::before { content: "}"; }`,
      `@media (width > 1px) { [data-ui='card'] { gap: 0; } }`,
    ]);
  });
});

describe('processRules', () => {
  it('hoists keyframes with the theme prefix and rewrites the references to them', () => {
    const { hoisted, body } = processRules('aura', [
      `@keyframes pulse { from { opacity: 0; } to { opacity: 1; } }
       [data-ui='badge'] { animation: pulse 1s infinite; animation-name: pulse; }
       @font-face { font-family: X; src: url(x.woff2); }`,
    ]);
    expect(hoisted).toEqual([
      '@keyframes slotted-aura-pulse { from { opacity: 0; } to { opacity: 1; } }',
      '@font-face { font-family: X; src: url(x.woff2); }',
    ]);
    expect(body).toBe(
      "[data-ui='badge'] { animation: slotted-aura-pulse 1s infinite; animation-name: slotted-aura-pulse; }",
    );
  });

  it('refuses the at-rules the compiler writes itself', () => {
    for (const rule of ['@import url(x.css);', '@layer x { }', '@scope (.a) { }']) {
      expect(() => processRules('aura', [rule]), rule).toThrow(/aura: @(import|layer|scope) /);
    }
  });
});
