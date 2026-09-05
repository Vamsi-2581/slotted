import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/list-item/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./list-item.css', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

/**
 * A chooser in the leading column sits on the title's first line (LI2). The
 * column stands at the top of that line and is as tall as it, so `checkbox`'s
 * own lift lands the box on the line's centre; centred on the block it stood a
 * pixel low on one line and between the lines on two. The column is the
 * chooser's own square, fixed across densities as the chooser is (CK1).
 */
test('stands a chooser in the leading column on the title’s first line', () => {
  const chooser = rule(`${ui} [data-part='start']:has(>[data-ui='checkbox'])`);
  assert.match(chooser, /align-items:start/);
  assert.match(chooser, /inline-size:var\(--_control-size\)/);
  assert.match(
    chooser,
    /min-block-size:calc\(var\(--_font-size\) \* var\(--slotted-line-height-md,1\.5\)\)/,
  );
  assert.match(
    rule(root),
    /--_control-size:var\(--slotted-list-item-control-size,var\(--slotted-selection-size-md,16px\)\)/,
  );
  for (const [size, px] of [
    ['sm', '14px'],
    ['lg', '18px'],
  ]) {
    assert.match(
      rule(`${ui}[data-size='${size}']`),
      new RegExp(
        `--_control-size:var\\(--slotted-list-item-control-size-${size},var\\(--slotted-selection-size-${size},${px}\\)\\)`,
      ),
      `the ${size} step does not size the chooser's column`,
    );
  }
  /* The gap beside the chooser is the row's own control gap, nothing added. */
  const start = rule(`${ui} [data-part='start']`);
  assert.match(start, /margin-inline-end:var\(--_gap\)/);
  assert.doesNotMatch(chooser, /margin-inline|padding-inline/);
});

/**
 * Nothing leaves the row at 240px (LI4, the rule `#Alert:2` sets): the text
 * column can shrink below its longest word, and the independent targets take
 * their own line below the breakpoint — a line that counts its own inset,
 * because at `flex-basis: 100%` a content box plus the row's inline padding
 * stood twenty-six pixels wider than the row.
 */
test('yields at 240px: the content shrinks and the actions take a line that fits', () => {
  assert.match(rule(`${ui}>[data-part='content']`), /min-inline-size:0/);
  assert.match(rule(`${ui} [data-part='body']`), /min-inline-size:0/);
  const actions = rule(`${ui}>[data-part='actions']`);
  assert.match(actions, /box-sizing:border-box/);
  const narrow = normalized.split('@container slotted-list-item (max-inline-size:22rem){')[1] ?? '';
  assert.match(
    narrow.split(`${ui}>[data-part='actions']{`)[1]?.split('}')[0] ?? '',
    /flex-basis:100%/,
    'the actions do not take their own line below the breakpoint',
  );
});
