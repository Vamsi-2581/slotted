import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./drawer.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ');

/** Every rule as its selector list and its declarations. */
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
  selectors: selector.split(',').map((part) => part.trim()),
  body,
}));

/**
 * On an inline side the grip is a dot matrix: dots in `currentColor` drawn by a
 * gradient over a transparent box. A state that writes `background-color` on
 * it fills the box, and the grip turned into a solid block under the hand,
 * under hover and under focus — reported on every story that rendered the
 * separator. The states of that picture recolour the ink, as `splitter`'s do.
 */
test('recolours the dot grip in its states and never fills its box', () => {
  const offenders = rules.filter(
    ({ body, selectors }) =>
      /background-color/.test(body) &&
      selectors.some(
        (selector) =>
          /\[data-part-grip\]/.test(selector) &&
          /:hover|:focus-visible|\[data-dragging\]/.test(selector) &&
          !/\[data-side='(top|bottom)'\]/.test(selector),
      ),
  );
  assert.deepEqual(
    offenders.map(({ selectors }) => selectors.join(', ')),
    [],
    'a grip state that can reach an inline side fills the dot matrix',
  );
});
