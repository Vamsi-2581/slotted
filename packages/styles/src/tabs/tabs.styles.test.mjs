import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(new URL('../../../../specs/components/tabs/contract.json', import.meta.url), 'utf8'),
);
const css = readFileSync(new URL('./tabs.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./tabs.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const member = contract.members.tabs;
const part = (name) => `${ui} [data-part='${name}']`;

function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${ui}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const declared of member.parts) {
    if (declared === 'root') continue;
    assert.ok(
      normalized.includes(`[data-part='${declared}']`),
      `no rule reaches the ${declared} part`,
    );
  }
});

test('renders every part the contract declares, in at least one scene', () => {
  for (const declared of member.parts) {
    assert.match(
      fragment,
      new RegExp(`data-part="${declared}"`),
      `${declared} appears in no scene`,
    );
  }
});

/**
 * The roles are the pattern's, and the fragment is the third place the DOM is
 * written. A scene that forgot one would photograph a row of buttons that
 * happens to look like a tab list.
 */
test('writes the pattern roles in every scene', () => {
  for (const [part, role] of Object.entries(contract.roles)) {
    assert.match(fragment, new RegExp(`role="${role}"`), `${part} carries no role in any scene`);
  }
  const tabs = [...fragment.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(([tag]) => tag);
  assert.ok(tabs.length > 0, 'the fragment renders no tab');
  for (const tag of tabs) {
    assert.match(tag, /aria-controls="/, `a tab names no panel: ${tag}`);
    assert.match(tag, /aria-selected="(true|false)"/, `a tab states no selection: ${tag}`);
  }
});

/**
 * Four columns and two rows, and every part in a cell. An overlaid paging
 * control would need a gradient the width of the control, mirrored for a
 * right-to-left document, and it would cover the hairline it sits on.
 */
test('places every part in a grid cell rather than over one', () => {
  assert.match(rule(ui), /grid-template-columns:auto minmax\(0,1fr\) auto auto/);
  assert.match(rule(part('list')), /grid-column:2/);
  assert.match(rule(`${part('scroll')}[data-direction='start']`), /grid-column:1/);
  assert.match(rule(`${part('scroll')}[data-direction='end']`), /grid-column:3/);
  assert.match(rule(part('actions')), /grid-column:4/);
  assert.match(rule(part('panel')), /grid-column:1 \/ -1/);
  /* The one thing positioned over a cell is the marker, which is a
     pseudo-element on the item rather than a part of its own. */
  const positioned = [...normalized.matchAll(/([^{}]+)\{[^{}]*position:absolute/g)].map(
    ([, selector]) => selector.trim(),
  );
  assert.deepEqual(positioned, [`${part('item')}::after`]);
});

/**
 * `md` is the base rule rather than a rule of its own, so a family that states
 * no size still reads the middle step of every control scale.
 */
test('answers every size the contract declares from the control scales', () => {
  for (const size of contract.axes.size.filter((step) => step !== 'md')) {
    assert.ok(normalized.includes(`${ui}[data-size='${size}']{`), `no rule answers ${size}`);
  }
  assert.ok(!normalized.includes(`${ui}[data-size='md']{`), 'md is the base, not a second rule');
  assert.match(rule(ui), /--_height:var\(--slotted-control-height-md/);
  assert.match(rule(`${ui}[data-size='sm']`), /--_height:var\(--slotted-control-height-sm/);
  assert.match(rule(`${ui}[data-size='lg']`), /--_height:var\(--slotted-control-height-lg/);
});

/**
 * Carbon states the rule for the whole field: horizontal tabs "should not wrap
 * to multiple lines or stack on top of each other; instead, they should scroll
 * horizontally". A wrapped tab list is two rows of tabs with one marker.
 */
test('scrolls a list that does not fit instead of wrapping it', () => {
  assert.match(rule(part('list')), /overflow-x:auto/);
  assert.doesNotMatch(rule(part('list')), /flex-wrap:wrap/);
  assert.match(rule(`${ui}[data-fit='equal'] [data-part='label']`), /text-overflow:ellipsis/);
});

/**
 * The platform's scrollbar is the affordance until the family draws its own,
 * and `data-overflowing` is the only signal the family has that a script is
 * running at all.
 */
test('keeps a scrollbar until the paging controls replace it', () => {
  assert.match(rule(part('list')), /scrollbar-width:thin/);
  assert.match(rule(`${ui}[data-overflowing] [data-part='list']`), /scrollbar-width:none/);
});

/**
 * The marker is on every item and scaled to nothing, because a mark that
 * appears has nothing to transition from, and it is pulled over the track by
 * exactly the track's own width so the two lines are one line.
 */
test('draws the marker on every item and moves it with the direction of travel', () => {
  const marker = rule(`${part('item')}::after`);
  assert.match(marker, /transform:scale\(0,1\)/);
  assert.match(marker, /transform-origin:var\(--_marker-origin\) 50%/);
  assert.match(marker, /inset-block-end:calc\(-1 \* var\(--_track-size\)\)/);
  assert.match(rule(`${part('item')}[data-selected]::after`), /transform:scale\(1,1\)/);
  for (const direction of contract.marker.directions.filter((value) => value !== 'none')) {
    assert.ok(
      normalized.includes(`${ui}[data-activation-direction='${direction}']{`),
      `no origin answers ${direction}`,
    );
  }
});

/** `transform-origin` takes no logical keyword, so this pair is mirrored by hand. */
test('mirrors the one rule that cannot be written logically', () => {
  assert.ok(normalized.includes(`${ui}[data-activation-direction='forward']:dir(rtl){`));
  assert.ok(normalized.includes(`${ui}[data-activation-direction='backward']:dir(rtl){`));
  assert.doesNotMatch(declarations, /margin-left|margin-right|padding-left|padding-right/);
});

/**
 * The `high-contrast` scheme paints every surface `Canvas`, so a contained
 * selection said with a fill alone would be invisible in exactly the scheme
 * that exists for the people who need it most.
 */
test('says the selection with a mark as well as with a fill', () => {
  const selected = rule(`${ui}[data-variant='contained'] [data-part='item'][data-selected]`);
  assert.match(selected, /background-color:var\(--slotted-tabs-contained-selected-background/);
  assert.match(rule(`${part('item')}[data-selected]::after`), /opacity:1/);
  assert.match(declarations, /@media \(forced-colors: active\)/);
});

test('holds hover and press back for a disabled control and for the selected tab', () => {
  for (const selector of normalized.split('}').map((block) => block.split('{')[0])) {
    if (selector.includes('@')) continue;
    if (!/:hover|:active(?![-\w])/.test(selector)) continue;
    assert.ok(selector.includes(':not(:disabled)'), `${selector} answers a disabled control`);
  }
  assert.ok(
    normalized.includes(`${part('tab')}:not(:disabled):not([aria-selected='true']):hover{`),
    'a selected tab answers hover as if it were not selected',
  );
});

/**
 * At the dense step with `size="sm"` the glyph is twelve pixels, under the
 * twenty-four WCAG 2.2 SC 2.5.8 asks for. The box around it is the target.
 */
test('gives the two glyph controls the target their glyphs are too small to be', () => {
  /* The paging control is as tall as the row it pages; the closing control is
     the mark with a step of air around it, never below the minimum target. */
  assert.match(
    rule(part('scroll')),
    /inline-size:max\(var\(--slotted-target-min,24px\),var\(--_height\)\)/,
  );
  assert.match(
    rule(ui),
    /--_dismiss-size:max\(var\(--slotted-target-min,24px\),calc\(var\(--_icon-size\) \+ 2 \* var\(--slotted-space-2,0\.25rem\)\)\)/,
  );
  const dismiss = rule(part('dismiss'));
  assert.match(dismiss, /inline-size:var\(--_dismiss-size\)/);
  assert.match(dismiss, /block-size:var\(--_dismiss-size\)/);
});

/**
 * The box overhangs the mark on every side, so a box set flush against the
 * label leaves a hole where the overhang is. Both margins take the overhang
 * back, which puts the mark one inner gap from the last letter and the tab's
 * own inset from the end of the item.
 */
test('aligns the closing control by its mark rather than by its box', () => {
  const dismiss = rule(part('dismiss'));
  assert.match(dismiss, /align-self:center/);
  assert.match(
    dismiss,
    /margin-inline-end:calc\(var\(--_padding-inline\) - var\(--_dismiss-overhang\)\)/,
  );
  assert.match(
    dismiss,
    /margin-inline-start:max\(0px,calc\(var\(--_inner-gap\) - var\(--_dismiss-overhang\)\)\)/,
  );
  assert.match(
    rule(`${ui} [data-part='item']:has([data-part='dismiss']) [data-part='tab']`),
    /padding-inline-end:0/,
  );
});

/**
 * The closing control keeps the library's outward ring: it is shorter than the
 * item and centred in it, so nothing about the ring reaches the edge the
 * scroller clips at, and an inset ring on a twenty-four pixel box would be
 * drawn through the mark.
 */
test('rings the closing control from outside and the tab from inside', () => {
  assert.match(
    rule(`${part('dismiss')}:focus-visible`),
    /outline-offset:var\(--slotted-focus-ring-offset,2px\)/,
  );
  assert.match(
    rule(`${part('tab')}:focus-visible`),
    /outline-offset:calc\(-1 \* \(var\(--slotted-focus-ring-offset,2px\) \+ var\(--_marker-size\)\)\)/,
  );
});

/**
 * A list standing on a line the page already drew: two hairlines a pixel apart
 * read as one smudge, and no surveyed implementation offers a way out —
 * Cloudscape ships a whole `container` variant for the same case.
 */
test('can stand on a line the page already drew', () => {
  assert.ok(normalized.includes(`${ui}[data-variant='line'][data-track='line'] [data-part='list']{`));
  assert.match(
    rule(`${ui}[data-track='none'] [data-part='item']::after`),
    /inset-block-end:0/,
  );
  assert.match(fragment, /data-track="none"/);
});

test('draws both glyphs as masks from the scale, never as characters', () => {
  assert.match(rule(`${part('dismiss')}::before`), /mask-image:var\(--slotted-icon-x\)/);
  assert.match(rule(`${part('scroll')}::before`), /mask-image:var\(--slotted-icon-chevron-right\)/);
  /* An empty `content` materialises a box; what is refused is a character
     standing in for artwork, so the pattern is a string with something in it. */
  assert.doesNotMatch(declarations, /content:\s*['"][^'"]/);
});

/** One glyph, turned. A chevron is symmetrical about the axis it is flipped on. */
test('points each paging control along the reading direction', () => {
  assert.match(rule(`${part('scroll')}[data-direction='start']::before`), /transform:scaleX\(-1\)/);
  assert.ok(
    normalized.includes(`${ui}:dir(rtl) [data-part='scroll'][data-direction='start']::before{`),
  );
  assert.ok(
    normalized.includes(`${ui}:dir(rtl) [data-part='scroll'][data-direction='end']::before{`),
  );
});

/**
 * `[hidden]` carries `display: none` at a specificity any rule here would beat,
 * so the attribute is restated rather than relied on.
 */
test('hides a panel with the attribute the platform already understands', () => {
  assert.match(rule(`${part('panel')}[hidden]`), /display:none/);
  assert.match(fragment, /data-part="panel"[^>]*hidden/);
});

test('transitions what the eye has to follow, and takes every duration from the scale', () => {
  assert.match(rule(`${part('item')}::after`), /transition:/);
  assert.match(rule(part('tab')), /transition:/);
  assert.match(
    rule(`${part('panel')}:not([hidden])`),
    /animation:slotted-tabs-panel-in var\(--slotted-duration-short\)/,
  );
  assert.doesNotMatch(declarations, /\d+m?s(?![\w-])/);
  assert.doesNotMatch(declarations, /\binfinite\b/);
});

/** A vertical list turns the track, the marker and the grid a quarter. */
test('turns the whole family for a vertical list rather than rearranging it', () => {
  assert.match(
    rule(`${ui}[data-orientation='vertical']`),
    /grid-template-columns:auto minmax\(0,1fr\)/,
  );
  assert.match(
    rule(`${ui}[data-orientation='vertical'] [data-part='list']`),
    /flex-direction:column/,
  );
  assert.match(rule(`${ui}[data-orientation='vertical'] [data-part='scroll']`), /display:none/);
  assert.match(
    rule(`${ui}[data-orientation='vertical'] [data-part='item']::after`),
    /transform:scale\(1,0\)/,
  );
});
