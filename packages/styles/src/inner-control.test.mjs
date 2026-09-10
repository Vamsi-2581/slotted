import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * R2: a composite family draws its own inner control — the clear in a field,
 * the close on a message, the paging arrow beside a tab list — and never
 * mounts `Button` or `IconButton` for it. A button carries a height, a
 * padding, a frame, a shadow and a radius of its own, none of which fit
 * inside a 32px control.
 *
 * The DOM half of that rule already holds (no `data-ui='button'` is rendered
 * inside any of these families). This test holds the style half, part by
 * part:
 *
 * 1. the box is sized from the control glyph scale
 *    (`--slotted-control-icon-size-*`) plus a step of air, never from a
 *    control height;
 * 2. at rest it has no frame and no shadow, and no ground;
 * 3. `hover` and `active` move the ground and nothing else — one step each,
 *    no ink change, no border, no shadow;
 * 4. `:focus-visible` draws the theme's ring (R3);
 * 5. the pointer target reaches `--slotted-target-min` — either the box does,
 *    or a transparent pseudo-element around it does — rather than the glyph
 *    growing to fill it.
 *
 * The field families additionally floor their glyph at the size SL3 fixed:
 * `--slotted-control-icon-size-*` falls to 12px and 13px at the dense step,
 * and a clear mark under 14px is a speck. The floor is a family token with a
 * 14px fallback (`--slotted-<family>-icon-size-min`) so a theme can retune
 * it and the sheet carries no literal.
 *
 * A `forced-colors` block is exempt: there the user agent owns every colour
 * and `Highlight` on hover is what survives.
 */
const PARTS = [
  { family: 'text-field', part: 'clear' },
  { family: 'text-field', part: 'reveal' },
  { family: 'select', part: 'clear' },
  { family: 'combobox', part: 'clear' },
  { family: 'multi-select', part: 'clear' },
  { family: 'number-field', part: 'increment' },
  { family: 'number-field', part: 'decrement' },
  { family: 'currency-field', part: 'increment' },
  { family: 'currency-field', part: 'decrement' },
  { family: 'alert', part: 'dismiss' },
  { family: 'toast', part: 'close' },
  { family: 'tag', part: 'remove' },
  { family: 'breadcrumb', part: 'ellipsis' },
  { family: 'tabs', part: 'scroll' },
  { family: 'toolbar', part: 'overflow' },
  { family: 'dialog', part: 'close' },
  { family: 'dialog', part: 'fullscreen' },
  { family: 'drawer', part: 'close' },
  /**
   * A file's five controls. They are inner controls for the reason the rest of
   * this list is: each is a glyph on a row twenty-six pixels tall, and a
   * `Button` there would bring a height, a padding, a frame, a shadow and a
   * radius that do not fit inside it.
   */
  { family: 'upload', part: 'viewerExternal' },
  { family: 'upload', part: 'viewerClose' },
  { family: 'upload', part: 'start' },
  { family: 'upload', part: 'pause' },
  { family: 'upload', part: 'retry' },
  { family: 'upload', part: 'cancel' },
  { family: 'upload', part: 'remove' },
];

/** Families whose glyph is floored at 14px (SL3, with CB3 and TF1). */
const FLOORED = [
  'text-field',
  'select',
  'combobox',
  'multi-select',
  'number-field',
  'currency-field',
];

const STATE = /:(?:hover|active|focus|disabled)\b|::/;
const PSEUDO = /::(?:before|after)\b/;

function stylesheet(family) {
  return readFileSync(join(source, family, `${family}.css`), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

function withoutForcedColors(css) {
  let out = '';
  let index = 0;
  const marker = /@media\s*\(forced-colors:\s*active\)\s*\{/g;
  for (let match = marker.exec(css); match; match = marker.exec(css)) {
    out += css.slice(index, match.index);
    let depth = 1;
    let end = match.index + match[0].length;
    for (; end < css.length && depth > 0; end += 1) {
      if (css[end] === '{') depth += 1;
      else if (css[end] === '}') depth -= 1;
    }
    index = end;
    marker.lastIndex = end;
  }
  return out + css.slice(index);
}

/** Every innermost `selector { declarations }` pair, whatever it is nested in. */
function rules(css) {
  const found = [];
  const stack = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      stack.push({ selector: css.slice(start, index).trim(), body: index + 1 });
      start = index + 1;
    } else if (char === '}') {
      const open = stack.pop();
      if (open && !open.selector.startsWith('@')) {
        const body = css.slice(open.body, index);
        const declarations = body.slice(
          0,
          body.indexOf('{') === -1 ? undefined : body.indexOf('{'),
        );
        found.push({
          selector: open.selector.replace(/\s+/g, ' '),
          declarations: parse(declarations),
        });
      }
      start = index + 1;
    } else if (char === ';') {
      start = index + 1;
    }
  }
  return found;
}

/** `{ property: value }` for one declaration block. */
function parse(block) {
  const declarations = {};
  for (const entry of block.split(';')) {
    const colon = entry.indexOf(':');
    if (colon === -1) continue;
    declarations[entry.slice(0, colon).trim()] = entry
      .slice(colon + 1)
      .replace(/\s+/g, ' ')
      .trim();
  }
  return declarations;
}

/** Every value a private property is given anywhere in the sheet. */
function privateProperties(css) {
  const values = new Map();
  for (const { declarations } of rules(css)) {
    for (const [property, value] of Object.entries(declarations)) {
      if (!property.startsWith('--_')) continue;
      values.set(property, [...(values.get(property) ?? []), value]);
    }
  }
  return values;
}

/** A value with every private property it reads written out, to a depth. */
function expand(value, privates, depth = 6) {
  if (depth === 0) return value;
  return value.replace(/--_[a-z0-9-]+/g, (name) =>
    privates.has(name)
      ? `${name}(${expand(privates.get(name).join(' | '), privates, depth - 1)})`
      : name,
  );
}

function selectorSays(selector, part) {
  return selector.includes(`[data-part='${part}']`);
}

function atRest(selector) {
  return !STATE.test(selector);
}

function audit(family, part) {
  const css = withoutForcedColors(stylesheet(family));
  const privates = privateProperties(css);
  const own = rules(css).filter(({ selector }) => selectorSays(selector, part));
  const findings = [];

  /**
   * The inline axis is the one every part owns: a paging control beside a
   * tab list or an overflow control in a toolbar is as tall as the row it
   * sits in, and that height may read the control scale; its width may not.
   */
  const rest = own.filter(({ selector }) => atRest(selector));
  const widths = rest.flatMap(({ declarations }) =>
    ['inline-size', 'min-inline-size']
      .filter((property) => property in declarations)
      .map((property) => expand(declarations[property], privates)),
  );
  const sizes = rest.flatMap(({ declarations }) =>
    ['inline-size', 'min-inline-size', 'block-size', 'min-block-size']
      .filter((property) => property in declarations)
      .map((property) => expand(declarations[property], privates)),
  );
  if (!widths.some((value) => value.includes('--slotted-control-icon-size-'))) {
    findings.push('is not sized from --slotted-control-icon-size-*');
  }
  if (widths.some((value) => /--slotted-control-height-/.test(value) && !/min\(/.test(value))) {
    findings.push('is sized from a control height');
  }

  for (const { selector, declarations } of rest) {
    const border = declarations.border;
    if (border !== undefined && !/^(?:0|none)$/.test(border)) {
      findings.push(`draws a frame at rest (${selector})`);
    }
    const shadow = declarations['box-shadow'];
    if (shadow !== undefined && shadow !== 'none') {
      findings.push(`draws a shadow at rest (${selector})`);
    }
  }
  if (!rest.some(({ declarations }) => declarations.padding === '0')) {
    findings.push("keeps the user agent's button padding, which squeezes the glyph");
  }
  const ground = rest.some(({ declarations }) =>
    /^(?:transparent|none)$/.test(
      declarations['background-color'] ?? declarations.background ?? '',
    ),
  );
  if (!ground) findings.push('paints a ground at rest');

  for (const state of ['hover', 'active']) {
    const moves = own.filter(({ selector }) => new RegExp(`:${state}\\b`).test(selector));
    if (moves.length === 0) {
      findings.push(`has no ${state} rule`);
      continue;
    }
    for (const { selector, declarations } of moves) {
      const extra = Object.keys(declarations).filter((property) => property !== 'background-color');
      if (extra.length > 0) {
        findings.push(`${state} moves ${extra.join(', ')} as well as the ground (${selector})`);
      }
    }
  }

  const ring = own.some(
    ({ selector, declarations }) =>
      /:focus-visible/.test(selector) &&
      /--slotted-focus-ring-color/.test(declarations.outline ?? ''),
  );
  if (!ring) findings.push('has no focus ring of its own');

  const boxReaches = sizes.some((value) => value.includes('--slotted-target-min'));
  const haloReaches = own.some(
    ({ selector, declarations }) =>
      PSEUDO.test(selector) &&
      declarations.position === 'absolute' &&
      /--slotted-target-min/.test(declarations.inset ?? ''),
  );
  if (!boxReaches && !haloReaches) findings.push('reaches no 24px target');

  return findings;
}

for (const { family, part } of PARTS) {
  test(`${family}: [data-part='${part}'] is an inner control, not a button (R2)`, () => {
    const findings = audit(family, part);
    assert.deepEqual(findings, [], `${family} [data-part='${part}']:\n  ${findings.join('\n  ')}`);
  });
}

for (const family of FLOORED) {
  test(`${family}: the glyph never falls under the family's floor (SL3)`, () => {
    const css = stylesheet(family);
    const privates = privateProperties(css);
    const floor = privates.get('--_icon-floor');
    assert.deepEqual(
      floor,
      [`var(--slotted-${family}-icon-size-min, 14px)`],
      `${family} states no --_icon-floor of 14px`,
    );
    const sizes = privates.get('--_icon-size') ?? [];
    assert.ok(sizes.length >= 1, `${family} states no --_icon-size`);
    for (const value of sizes) {
      assert.match(
        value,
        /^max\(var\(--_icon-floor\), var\(--slotted-control-icon-size-(?:sm|md|lg), \d+px\)\)$/,
        `${family}: --_icon-size "${value}" is not floored`,
      );
    }
  });
}

test('reads the rules it guards', () => {
  const guarded = PARTS.flatMap(({ family, part }) =>
    rules(withoutForcedColors(stylesheet(family))).filter(({ selector }) =>
      selectorSays(selector, part),
    ),
  );
  assert.ok(guarded.length >= 80, `Expected the inner-control rules, found ${guarded.length}`);
});
