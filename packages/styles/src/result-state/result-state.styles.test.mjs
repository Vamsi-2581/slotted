import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/result-state/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./result-state.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./result-state.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/**
 * Whitespace is collapsed rather than removed: a descendant selector and a
 * multi-word value both lose their meaning when every space goes. Parentheses
 * are collapsed too, because the formatter breaks a long value across lines and
 * leaves `var( --token`, which no assertion here spells.
 */
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:>])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const member = contract.members.resultState;

/** The declarations of the first rule whose selector starts with `selector`. */
function rule(selector) {
  return normalized.split(`${selector}{`)[1]?.split('}')[0] ?? '';
}

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

test('styles every part the contract declares', () => {
  for (const part of member.parts) {
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
});

/**
 * The layout decision the anatomy rests on. `content` is the live region, so
 * the mark, the actions and the footer cannot be inside it — they are placed as
 * its siblings, and a stylesheet that nested them would be describing a
 * different family from the one the contract declares.
 */
test('places the mark, the actions and the footer outside the region that announces', () => {
  for (const part of ['media', 'content', 'actions', 'footer']) {
    assert.ok(
      normalized.includes(`${ui}>[data-part='${part}']`),
      `${part} is not placed as a child of the root`,
    );
  }
});

/**
 * The mark is a mask from a glyph token, per status, which is what makes the
 * seven distinguishable in greyscale and under forced colours. A character is
 * never an icon, and `content` here would be one.
 */
test('draws every status as a mask from the glyph the contract names', () => {
  for (const [status, glyph] of Object.entries(contract.statusGlyphs)) {
    const selector = `${root}[data-status='${status}']`;
    assert.ok(normalized.includes(`${selector}{`), `${status} has no rule`);
    assert.ok(rule(selector).includes(glyph), `${status} does not reach ${glyph}`);
  }
  assert.match(rule(`${ui}>[data-part='media']`), /mask-image:var\(--slotted-result-state-media/);
});

/**
 * Every status paints in the tone role the contract maps it to, and in nothing
 * else. The tone's `text` role is the pair
 * `packages/themes/default/test/contrast.test.mjs` measures against the three
 * neutral surfaces this family is placed on, so the family never invents a
 * colour and never mixes a ground the theme holds with a foreground it does
 * not.
 */
test('paints every status in a tone role the theme already measures', () => {
  for (const [status, tone] of Object.entries(contract.statusTones)) {
    assert.ok(
      rule(`${root}[data-status='${status}']`).includes(`--slotted-tone-${tone}-text`),
      `${status} does not paint with the ${tone} tone`,
    );
  }
});

/**
 * A silhouette repeated is a status that cannot be told from another one when
 * the colour is gone, which is the whole reading `forced-colors` and WCAG 2.2
 * SC 1.4.1 ask for.
 */
test('gives no two statuses the same mark', () => {
  const glyphs = Object.values(contract.statusGlyphs);
  assert.equal(new Set(glyphs).size, glyphs.length);
});

/**
 * The family reflows on its own inline size — the actions stack, and the
 * `inline` row becomes a column — so it owns a named container. The anonymous
 * form would resolve against whichever ancestor happened to be a container
 * first, which for a result state inside a card inside a page is not the box
 * the decision is about.
 */
test('owns a named container and states its own width', () => {
  const base = rule(root);
  assert.match(base, /container-name:slotted-result-state/);
  assert.match(base, /container-type:inline-size/);
  assert.match(base, /inline-size:100%/);
  assert.match(normalized, /@container slotted-result-state \(max-width:20rem\)/);
});

/**
 * At `inline` reach the mark, the words and the controls share one line, and
 * all three are held to it by the same rule: a box exactly one line box tall,
 * with the content centred inside it. The root carries the title's own type so
 * that `1lh` on any child resolves against the line the title draws.
 *
 * Both halves were reported from the picture. `1lh` read on the mark itself
 * resolved against the mark's inherited twelve pixels rather than the title's
 * thirteen, and the mark sat two and a half pixels above its own line. The
 * controls were worse: a control taller than a line made the grid row thirty
 * pixels deep, so the mark and the words sat at the top of it while the control
 * sat in the middle. `align-content` rather than `align-items` is what centres
 * the control, because the row is allowed to wrap and a wrapping flex container
 * aligns its lines.
 */
test('puts the mark, the words and the controls on one line at inline reach', () => {
  const base = rule(root);
  assert.match(base, /font-size:var\(--_title-font-size\)/);
  assert.match(base, /line-height:var\(--_title-line-height\)/);

  const media = rule(`${ui}[data-reach='inline']>[data-part='media']`);
  assert.match(media, /block-size:1lh/);
  assert.match(media, /align-self:start/);

  const actions = rule(`${ui}[data-reach='inline']>[data-part='actions']`);
  assert.match(actions, /block-size:1lh/);
  assert.match(actions, /align-self:start/);
  assert.match(actions, /align-content:center/);

  /* Below the breakpoint the controls leave that line, so the box goes back to
     its own height rather than squashing them into one. */
  assert.match(
    normalized.split('@container slotted-result-state (max-width:20rem){')[1] ?? '',
    /\[data-reach='inline'\]>\[data-part='actions'\]\{block-size:auto/,
  );
});

/**
 * Measure belongs to `container` and to it alone —
 * `docs/build-briefing.md`. Polaris caps its empty state at four hundred pixels
 * and Atlassian ships a `width: narrow`; a second family answering the same
 * question is what that decision exists to prevent.
 */
test('caps no measure of its own', () => {
  assert.doesNotMatch(normalized, /max-inline-size:(?!100%)/);
});

/**
 * Prose from the type scale, the mark from the control scale. The ladder is two
 * steps of the type scale between the title and the description at every reach,
 * and it is checked here because the first draft shipped one step at `section`
 * and read as a single block of text with one line in bold.
 */
test('steps the type by reach, and takes every step from one scale', () => {
  assert.match(rule(root), /--slotted-font-size-xl/);
  assert.match(rule(root), /--slotted-font-size-md/);
  assert.match(rule(`${root}[data-reach='inline']`), /--slotted-font-size-sm/);
  assert.match(rule(`${root}[data-reach='inline']`), /--slotted-font-size-xs/);
  assert.match(rule(`${root}[data-reach='page']`), /--slotted-font-size-3xl/);
  assert.match(rule(`${root}[data-reach='page']`), /--slotted-font-size-lg/);
  assert.doesNotMatch(
    normalized,
    /--_title-font-size:var\(--slotted-result-state-title-font-size,var\(--slotted-control-font-size/,
  );
});

/**
 * Density reaches this family through the mark, because control geometry is the
 * only size scale the theme restates per density. `page` takes a proportion of
 * that box rather than a sixth step on a scale, which is the rule Avatar's own
 * scale is written under.
 */
test('answers density through the mark rather than through the words', () => {
  assert.match(rule(root), /--slotted-control-height-md/);
  assert.match(rule(`${root}[data-reach='inline']`), /--slotted-control-icon-size-md/);
  assert.match(
    rule(`${root}[data-reach='page']`),
    /calc\(var\(--slotted-control-height-lg[^)]*\) \* 1\.5\)/,
  );
});

/**
 * The one state the family paints. The root carries `tabindex="-1"` so an
 * application that has just emptied a table can send the reader to the message,
 * and a reader who arrives has to see where they are.
 */
test('paints focus and nothing else', () => {
  assert.match(normalized, /\[data-ui='result-state'\]\[data-part='root'\]:focus-visible\{/);
  /* `:active` is excluded only where it selects: `forced-colors:active` is a
     media feature, not a state the family paints. */
  for (const state of [/:hover/, /:active[{,]/, /\[data-disabled/, /\[data-loading/]) {
    assert.doesNotMatch(normalized, state);
  }
  assert.deepEqual(member.states, ['default', 'focus-visible']);
});

/**
 * The family animates nothing. There is no state change here for an eye to
 * follow: a focus indicator that fades in is a focus indicator that is not
 * there yet, and every other change to this region is the consumer replacing
 * its content.
 */
test('animates nothing, and says so rather than leaving a duration out by accident', () => {
  assert.doesNotMatch(normalized, /transition:/);
  assert.doesNotMatch(normalized, /animation:/);
});

/**
 * The fragment is the third place this family's DOM is written and it drifts.
 * Every part has to appear in it, and the two structural facts have to be
 * visible rather than described.
 */
test('exercises every part in the harness fragment', () => {
  for (const part of member.parts) {
    assert.ok(fragment.includes(`data-part="${part}"`), `the fragment never renders ${part}`);
  }
  for (const status of contract.axes.status) {
    assert.ok(fragment.includes(`data-status="${status}"`), `the fragment never renders ${status}`);
  }
  for (const reach of contract.axes.reach) {
    assert.ok(fragment.includes(`data-reach="${reach}"`), `the fragment never renders ${reach}`);
  }
  for (const align of contract.axes.align) {
    assert.ok(fragment.includes(`data-align="${align}"`), `the fragment never renders ${align}`);
  }
});

test('writes the live role on the text and on nothing else in the fragment', () => {
  for (const [live, role] of Object.entries(contract.liveRoles)) {
    if (role === null) continue;
    assert.ok(
      fragment.includes(`data-live="${live}"`),
      `the fragment never renders the ${live} region`,
    );
    assert.ok(fragment.includes(`role="${role}"`), `the fragment never writes role="${role}"`);
  }
  for (const match of fragment.matchAll(/role="(status|alert)"/g)) {
    const before = fragment.slice(0, match.index).lastIndexOf('data-part=');
    assert.ok(
      fragment.slice(before, match.index).includes('data-part="content"'),
      'a live role is written on a part other than content',
    );
  }
});

/**
 * The mark carries no information a reader needs, because the title and the
 * description already say what it says. An illustration that adds information
 * is not decorative, and what it adds belongs in the description.
 */
test('hides the mark from assistive technology in the fragment', () => {
  for (const match of fragment.matchAll(/data-part="media"([^>]*)>/g)) {
    assert.match(match[1] ?? '', /aria-hidden="true"/, 'a media box is exposed to a reader');
  }
});
