import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * G15. A glyph is drawn as a mask: the element takes a `mask-image` from a
 * `--slotted-icon-*` token and a `background-color` shows through it. The mark
 * is therefore a painted background, and `forced-colors: active` replaces a
 * painted background with the system's own — so the mark disappears and the
 * box it sat in stays. Measured over 47 masked glyphs in 28 families before
 * this guard existed, 23 of them in 16 families lost every pixel of ink in
 * that mode.
 *
 * The line between the two is `currentcolor`. A mark painted from a theme tone
 * survives, because the theme's `forced-colors` block remaps its tones to
 * system colours and a system colour is the one background the system keeps —
 * that is the theme's job and `docs/build-briefing.md` gives it to the theme.
 * `currentcolor` is the value the theme cannot reach, and it is what a glyph
 * beside a label is painted with: the mark is the host's ink, and follows it
 * into `hover`, `disabled` and `Highlight` without the family naming a colour.
 * So the idiom that is right everywhere else is the one this mode throws away.
 *
 * The rule this file enforces: a mask painted from `currentcolor` keeps its
 * ink in forced colours, by one of the two means that were measured to work.
 *
 * 1. `forced-color-adjust: none` on the element that paints the mask. The
 *    author's `currentcolor` is then used, and `currentcolor` there is the
 *    host's own `color`, which the system has already forced to the right
 *    value — so the mark is drawn in the system's palette rather than against
 *    it, and it still follows every state.
 * 2. A `background-color` restated as a system colour inside the same media
 *    query. `alert`, `toast`, `inline-message` and `link` state `CanvasText`,
 *    `GrayText` and `LinkText` on a status glyph whose tone the system has no
 *    counterpart for, and were measured to keep their ink that way.
 *
 * The first is preferred, and is the one a new family should write: it follows
 * every state, where the second has to name a colour per state to do the same.
 *
 * `forced-color-adjust` is inherited, which is why the rule is written on the
 * painting element and never on a root: a family that turned it off at the
 * top would take the whole subtree — including artwork the consumer put in a
 * slot — out of the system's palette. Where the mask sits on a slot that can
 * hold consumer content (`[data-part='icon']` in `select`, `combobox`,
 * `listbox` and `menu`), the rule is written against `:empty`, which is the
 * state in which the family paints the mask at all.
 */

/** Every innermost `selector { declarations }` pair, with the media it is in. */
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
        found.push({
          selector: open.selector.replace(/\s+/g, ' ').trim(),
          body: css.slice(open.body, index).replace(/\/\*[\s\S]*?\*\//g, ''),
          forced: stack.some((frame) => /^@media[^{]*forced-colors:\s*active/.test(frame.selector)),
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

/** Split on top-level commas, so a comma inside `:is(…)` stays put. */
function split(selector) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of selector) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
}

/** `:is(a, b) c` is two selectors, and each has to be read on its own. */
function expand(selector) {
  const out = [];
  const walk = (one) => {
    const at = one.indexOf(':is(');
    if (at < 0) {
      out.push(one.replace(/\s+/g, ' ').trim());
      return;
    }
    let depth = 0;
    let end = at + 3;
    for (; end < one.length; end += 1) {
      if (one[end] === '(') depth += 1;
      else if (one[end] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    for (const alternative of split(one.slice(at + 4, end))) {
      walk(one.slice(0, at) + alternative + one.slice(end + 1));
    }
  };
  for (const one of split(selector)) walk(one);
  return out;
}

/**
 * What a selector paints: the family it belongs to, the part it ends on and
 * the pseudo-element it draws in. Two rules that reach the same box agree
 * here even when one of them qualifies an ancestor — `[data-stepper='split']
 * [data-part='increment']::before` paints the box that `[data-part='increment']
 * ::before` gives its colour — which is what lets a mask written in one rule
 * be read against a paint written in another.
 */
function subject(selector) {
  const family = selector.match(/\[data-ui='([^']+)'\]/)?.[1] ?? '';
  const pseudo = selector.match(/::[a-z-]+$/)?.[0] ?? '';
  const compound = selector
    .replace(/::[a-z-]+$/, '')
    .split(/\s*[>+~]\s*|\s+/)
    .pop();
  const part =
    compound.match(/\[data-part='[^']+'\]/)?.[0] ?? (compound.startsWith('[') ? '' : compound);
  return `${family}|${part}${pseudo}`;
}

const SYSTEM_COLOURS = new Set(
  [
    'accentcolor',
    'accentcolortext',
    'activetext',
    'buttonborder',
    'buttonface',
    'buttontext',
    'canvas',
    'canvastext',
    'field',
    'fieldtext',
    'graytext',
    'highlight',
    'highlighttext',
    'linktext',
    'mark',
    'marktext',
    'selecteditem',
    'selecteditemtext',
    'visitedtext',
  ].map((name) => name.toLowerCase()),
);

const GRADIENT = /^(?:repeating-)?(?:linear|radial|conic)-gradient\(/;

const families = readdirSync(source)
  .filter((name) => {
    try {
      return statSync(join(source, name, `${name}.css`)).isFile();
    } catch {
      return false;
    }
  })
  .sort();

/** Boxes that paint a glyph through a mask, and how each sheet answers for them. */
function read(edit = (css) => css) {
  const painters = [];
  const kept = new Set();
  for (const family of families) {
    const css = edit(readFileSync(join(source, family, `${family}.css`), 'utf8'), family);
    const painted = new Map();
    for (const rule of rules(css)) {
      for (const selector of expand(rule.selector)) {
        const box = subject(selector);
        if (rule.forced) {
          const adjust = declaration(rule.body, 'forced-color-adjust');
          const paint =
            declaration(rule.body, 'background-color') ?? declaration(rule.body, 'background');
          if (adjust === 'none' || (paint && SYSTEM_COLOURS.has(paint.toLowerCase())))
            kept.add(box);
          continue;
        }
        const entry = painted.get(box) ?? { family, box, selector, mask: false, paint: false };
        const mask = declaration(rule.body, '(?:-webkit-)?mask-image');
        const paint =
          declaration(rule.body, 'background-color') ?? declaration(rule.body, 'background');
        if (mask && mask !== 'none' && !GRADIENT.test(mask)) {
          entry.mask = true;
          entry.selector = selector;
        }
        if (paint && /currentcolor/i.test(paint)) entry.paint = true;
        painted.set(box, entry);
      }
    }
    for (const entry of painted.values()) if (entry.mask && entry.paint) painters.push(entry);
  }
  return { painters, kept };
}

test('every masked glyph keeps its ink when the system takes the palette over', () => {
  const { painters, kept } = read();

  assert.ok(
    painters.length >= 30,
    `only ${painters.length} masks painted from currentcolor were read; the scan stopped finding them`,
  );

  const dropped = painters.filter((painter) => !kept.has(painter.box));
  assert.deepEqual(
    dropped.map((painter) => `${painter.family}: ${painter.selector}`),
    [],
    'these paint a glyph through a mask and state nothing for `forced-colors: active`, ' +
      'so the system replaces the paint and the mark disappears. Add ' +
      '`forced-color-adjust: none` on the element that paints the mask, or — when the ' +
      "mark is painted from a tone rather than from the host's ink — restate its " +
      '`background-color` as a system colour in that media query.',
  );
});

test('the guard names the family that drops the rule', () => {
  /** The same reading, with `text-field` stripped of what answers for it. */
  const { painters, kept } = read((css, family) =>
    family === 'text-field' ? css.replace(/forced-color-adjust:\s*none;/g, '') : css,
  );

  const dropped = painters
    .filter((painter) => !kept.has(painter.box))
    .map((painter) => painter.selector);
  assert.deepEqual(dropped, [
    "[data-ui='text-field'] > [data-part='clear']::before",
    "[data-ui='text-field'] > [data-part='reveal'][aria-pressed='true']::before",
  ]);
});
