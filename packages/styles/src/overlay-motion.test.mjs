import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * R7 — an anchored layer arrives along the axis it opens on. `opacity` 0→1
 * with `translate` 0 −4px → 0 when it opens downward, 0 4px → 0 when it opens
 * upward, and never a movement along the inline axis; a `scale` from the
 * corner the positioner named as origin moved the far edge by four per cent
 * of the width and read as an entrance from the left (SL2, CB2, M1). A menu
 * placed beside its anchor — every submenu — is the one lateral case and
 * slides one step along the inline axis it opens on. Reduced motion keeps the
 * fade and drops the movement.
 *
 * The distance is one step of the space scale, so a theme retunes it where it
 * retunes every other gap.
 */
const LAYERS = [
  { family: 'select', layer: "[data-ui='select'][data-part='positioner']", lateral: 'fade' },
  { family: 'combobox', layer: "[data-ui='combobox'][data-part='positioner']", lateral: 'fade' },
  { family: 'popover', layer: "[data-ui='popover']", lateral: 'fade' },
  { family: 'tooltip', layer: "[data-ui='tooltip']", lateral: 'fade' },
];

const DISTANCE = 'var(--_enter-distance)';

/** Every innermost `selector { declarations }` pair, tagged with the media query it sits in. */
function rules(css) {
  const found = [];
  const stack = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      stack.push({
        selector: css
          .slice(start, index)
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim(),
        body: index + 1,
      });
      start = index + 1;
    } else if (char === '}') {
      const open = stack.pop();
      if (open && !open.selector.startsWith('@')) {
        const media = stack.map((frame) => frame.selector).find((s) => s.startsWith('@media'));
        found.push({
          selector: open.selector.replace(/\s+/g, ' ').trim(),
          body: css.slice(open.body, index).replace(/\/\*[\s\S]*?\*\//g, ''),
          media: media ?? '',
        });
      }
      start = index + 1;
    }
  }
  return found;
}

function declaration(body, property) {
  const match = body.match(new RegExp(`(?:^|;|\\n)\\s*${property}\\s*:\\s*([^;]+);`));
  return match ? match[1].replace(/\s+/g, ' ').trim() : undefined;
}

/** A selector list split on the commas outside any parenthesis. */
function selectors(list) {
  return list.split(/,(?![^(]*\))/).map((s) => s.trim());
}

function find(all, selector, media = '') {
  const rule = all.find(
    (candidate) =>
      selectors(candidate.selector).includes(selector) && candidate.media.startsWith(media),
  );
  assert.ok(rule, `no rule for \`${selector}\`${media ? ` inside ${media}` : ''}`);
  return rule;
}

for (const { family, layer, lateral } of LAYERS) {
  const css = readFileSync(`${source}${family}/${family}.css`, 'utf8');
  const all = rules(css);

  test(`${family}: the layer arrives from one step above its place when it opens downward`, () => {
    const closed = find(all, layer);
    assert.equal(declaration(closed.body, 'opacity'), '0');
    assert.equal(declaration(closed.body, 'scale'), undefined, `${family} scales its layer`);
    assert.equal(declaration(closed.body, 'translate'), `0 calc(-1 * ${DISTANCE})`);
    assert.equal(
      declaration(closed.body, '--_enter-distance'),
      'var(--slotted-space-2, 0.25rem)',
      `${family} takes the distance from somewhere other than the space scale`,
    );
    const transition = declaration(closed.body, 'transition');
    assert.match(
      transition,
      /opacity var\(--slotted-duration-short\) var\(--slotted-easing-exit\)/,
    );
    assert.match(
      transition,
      /translate var\(--slotted-duration-short\) var\(--slotted-easing-exit\)/,
    );
    assert.doesNotMatch(transition, /\bscale\b/);
  });

  test(`${family}: the layer arrives from one step below its place when it opens upward`, () => {
    const top = find(all, `${layer}[data-side='top']`);
    assert.equal(declaration(top.body, 'translate'), `0 ${DISTANCE}`);
  });

  test(`${family}: a lateral side ${lateral === 'slide' ? 'slides along the inline axis it opens on' : 'only fades'}`, () => {
    if (lateral === 'slide') {
      assert.equal(
        declaration(find(all, `${layer}[data-side='right']`).body, 'translate'),
        `calc(-1 * ${DISTANCE}) 0`,
      );
      assert.equal(
        declaration(find(all, `${layer}[data-side='left']`).body, 'translate'),
        `${DISTANCE} 0`,
      );
    } else {
      const sides = find(all, `${layer}:is([data-side='left'], [data-side='right'])`);
      assert.equal(declaration(sides.body, 'translate'), '0 0');
    }
  });

  test(`${family}: the open layer settles in place on the entering duration`, () => {
    const open = find(all, `${layer}[data-open]`);
    assert.equal(declaration(open.body, 'opacity'), '1');
    assert.equal(declaration(open.body, 'translate'), '0 0');
    assert.equal(declaration(open.body, 'scale'), undefined);
    const transition = declaration(open.body, 'transition');
    assert.match(
      transition,
      /opacity var\(--slotted-duration-medium\) var\(--slotted-easing-enter\)/,
    );
    assert.match(
      transition,
      /translate var\(--slotted-duration-medium\) var\(--slotted-easing-enter\)/,
    );
    assert.doesNotMatch(transition, /\bscale\b/);
  });

  test(`${family}: reduced motion keeps the fade and drops the movement`, () => {
    const media = '@media (prefers-reduced-motion: reduce)';
    for (const selector of [
      layer,
      `${layer}[data-side='top']`,
      `${layer}[data-side='left']`,
      `${layer}[data-side='right']`,
    ]) {
      const still = find(all, selector, media);
      assert.equal(declaration(still.body, 'translate'), '0 0');
      assert.equal(
        declaration(still.body, 'transition'),
        'opacity var(--slotted-duration-short) var(--slotted-easing-exit)',
      );
    }
    const open = find(all, `${layer}[data-open]`, media);
    assert.equal(
      declaration(open.body, 'transition'),
      'opacity var(--slotted-duration-medium) var(--slotted-easing-enter)',
    );
  });
}
