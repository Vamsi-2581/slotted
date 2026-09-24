import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * The three binary controls a form lines up — checkbox, radio, switch — keep
 * one distance between the control and its label: the control gap the theme
 * restates per density, read by the same name at every size step (SW1). A
 * family that stated its own gap would sit a pixel off the other two in the
 * same form, which is the one thing a reader notices before anything else.
 */
const FAMILIES = ['checkbox', 'radio-group', 'switch'];

function normalized(family) {
  return readFileSync(join(source, family, `${family}.css`), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:>])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
}

function rules(css) {
  return css
    .split('}')
    .map((block) => block.split('{'))
    .filter(([selector, body]) => selector && body)
    .map(([selector, body]) => ({ selector: selector.trim(), body }));
}

test('every selection control reads the control gap the theme restates per density', () => {
  for (const family of FAMILIES) {
    const css = normalized(family);
    const root = `[data-ui='${family}'][data-part='root']`;
    assert.match(
      css,
      new RegExp(
        `${root.replace(/[[\]']/g, '\\$&')}\\{[^}]*--_gap:var\\(--slotted-control-gap-md,8px\\)`,
      ),
      `${family} does not read the control gap at rest`,
    );
    for (const [size, px] of [
      ['sm', '6px'],
      ['md', '8px'],
      ['lg', '8px'],
    ]) {
      assert.ok(
        css.includes(`${root}[data-size='${size}']{`) &&
          css
            .split(`${root}[data-size='${size}']{`)[1]
            .split('}')[0]
            .includes(`--_gap:var(--slotted-control-gap-${size},${px})`),
        `${family} states its own gap at ${size}`,
      );
    }
  }
});

/**
 * Where the gap lives. `checkbox` and `radio-group` put it on the grid, as the
 * column gap of the element that holds a label, because a label's own padding
 * is laid out in the label's direction: a label in Arabic inside a row in
 * Portuguese put the gap on the far side and its text against the control.
 * Their labels hug their text so the hover wash ends where the words do, and
 * the wash covers the gap, so the gap still toggles the control. `switch`
 * keeps the gap as the label's padding: the pill has no wash, and the padding
 * is what makes the gap toggle the setting. It carries the same defect with a
 * label in the other direction, recorded in `docs/process/build-order.md`.
 */
const GAP_ON = { checkbox: 'grid', 'radio-group': 'grid', switch: 'label' };

test('every selection control puts that gap, and nothing else, between the control and its label', () => {
  for (const family of FAMILIES) {
    const all = rules(normalized(family));
    const label = all.find(
      ({ selector }) =>
        selector.endsWith("[data-part='label']") && selector.startsWith(`[data-ui='${family}']`),
    );
    assert.ok(label, `${family} has no label rule`);
    assert.doesNotMatch(label.body, /margin-inline|column-gap|gap:/, `${family} adds to the gap`);
    const grid = all.filter(({ body }) => /column-gap:var\(--_gap\)/.test(body));
    if (GAP_ON[family] === 'grid') {
      assert.doesNotMatch(label.body, /padding-inline/, `${family} label pads the gap again`);
      assert.equal(grid.length, 1, `${family} states the gap on the grid ${grid.length} times`);
      assert.match(
        grid[0].selector,
        /:has\(>\[data-part='label'\]\)$/,
        `${family} opens the gap when there is no label beside the control`,
      );
    } else {
      assert.match(
        label.body,
        /padding-inline-start:var\(--_gap\)/,
        `${family} label pads by another number`,
      );
      assert.equal(grid.length, 0, `${family} states the gap twice`);
    }
  }
});
