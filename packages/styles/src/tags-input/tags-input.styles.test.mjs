import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./tags-input.css', import.meta.url), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/**
 * The chips are `tag`'s, worn as `data-ui` beside the row this family owns,
 * and this sheet lays them out and paints none of them — the rule
 * `chip-preview.test.mjs` holds for `select` and `multi-select`, restated here
 * because that file's other rules assume a popup this family does not have.
 *
 * What the family needs from a chip it asks for through the two tokens
 * `tag.css` reads — `--slotted-tag-inset-block` for a frame shorter than the
 * chip at `dense`, `--slotted-tag-border-color` for the chip that answered a
 * duplicate — and never by naming the tag's identifier or its private hooks.
 */
test('lays the chips out and paints none of them', () => {
  assert.doesNotMatch(css, /\[data-ui='tag'\]/, 'reaches into the tag sheet');
  assert.doesNotMatch(css, /--_inset-block|--_border\b|--_surface|--_text\b/, 'writes a tag hook');
  assert.match(css, /--slotted-tag-inset-block:\s*var\(--_chip-inset\)/);
  assert.match(css, /--slotted-tag-border-color:/);
});

/**
 * A control holding one row of chips is the height of an empty one beside it
 * at every density, and the chip never touches the frame: the chip's inset
 * yields to the room the frame has, and the air is kept.
 */
test('keeps two pixels of air around a chip at every density', () => {
  assert.match(css, /--_row-air:\s*var\(--slotted-space-1/);
  assert.match(css, /--_chip-inset:\s*clamp\(\s*0px/);
  assert.match(css, /--_row-size:\s*calc\(var\(--_chip-line\) \+ 2 \* var\(--_chip-inset\)\)/);
  assert.doesNotMatch(css, /--_row-size:\s*var\(--slotted-target-min/);
});
