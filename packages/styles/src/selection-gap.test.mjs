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

test('every selection control puts that gap, and nothing else, between the control and its label', () => {
  for (const family of FAMILIES) {
    const label = rules(normalized(family)).find(
      ({ selector }) =>
        selector.endsWith("[data-part='label']") && selector.startsWith(`[data-ui='${family}']`),
    );
    assert.ok(label, `${family} has no label rule`);
    assert.match(
      label.body,
      /padding-inline-start:var\(--_gap\)/,
      `${family} label pads by another number`,
    );
    assert.doesNotMatch(label.body, /margin-inline|column-gap|gap:/, `${family} adds to the gap`);
  }
});
