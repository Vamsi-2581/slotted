import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/status-indicator/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./status-indicator.css', import.meta.url), 'utf8');
const fragment = readFileSync(new URL('./status-indicator.harness.html', import.meta.url), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
/** Collapsed rather than stripped, for the reason `badge` records. */
const normalized = declarations
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,:])\s*/g, '$1')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')');

const ui = `[data-ui='${contract.ui}']`;
const root = `${ui}[data-part='root']`;
const { defaults, parts } = contract.members.statusIndicator;

/** One entry per rule, keyed on the whole selector list. See `skeleton`. */
function collectRules(sheet) {
  const collected = [];
  let selector = '';
  for (let index = 0; index < sheet.length; index += 1) {
    const character = sheet[index];
    if (character === '}') {
      selector = '';
      continue;
    }
    if (character !== '{') {
      selector += character;
      continue;
    }
    const close = sheet.indexOf('}', index);
    const nested = sheet.indexOf('{', index + 1);
    if (nested === -1 || nested > close) {
      collected.push({ selector: selector.trim(), body: sheet.slice(index + 1, close) });
      index = close;
    }
    selector = '';
  }
  return collected;
}

const rules = collectRules(normalized);
const rule = (selector) => rules.find((entry) => entry.selector === selector)?.body ?? '';

test('lives in the component layer', () => {
  assert.match(css, /@layer slotted\.components/);
});

test('is selected by the identifier the contract declares', () => {
  assert.ok(normalized.includes(`${root}{`), 'the family has no base rule keyed on data-ui');
});

/**
 * Every part but one. `announcement` carries no paint of this family's: it is
 * clipped by `visually-hidden`, which is the family that owns hiding text, and
 * a second copy of the clip here would be a second answer that goes stale.
 *
 * It is still named once, in a `:has()` that takes the gap back when the label
 * holds nothing else — which is a measurement rather than a paint, and the
 * reason this test asks about declarations instead of about the string.
 */
test('styles every part it paints, and leaves the announcement to the family that clips it', () => {
  for (const part of parts) {
    if (part === 'announcement') continue;
    assert.ok(normalized.includes(`[data-part='${part}']`), `no rule reaches the ${part} part`);
  }
  const announcementRules = rules.filter(({ selector }) =>
    selector.includes(`[data-part='announcement']`),
  );
  assert.equal(announcementRules.length, 1, 'the announcement is painted rather than measured');
  assert.equal(announcementRules[0]?.body, 'margin-inline-start:0;');
});

/**
 * The tone each status speaks in, read from the contract rather than restated.
 * The map is the one fact the stylesheet, both bindings and the contract test
 * all have to agree about, and a rename in one of the five tones would
 * otherwise be a silent repaint here.
 */
test('paints every status in the tone the contract maps it to', () => {
  for (const [status, tone] of Object.entries(contract.statusTones)) {
    const body = rule(`${root}[data-status='${status}']`);
    assert.ok(body.length > 0, `no rule paints the ${status} status`);
    assert.ok(
      body.includes(`--_text:var(--slotted-tone-${tone}-text`),
      `${status} does not speak in ${tone}`,
    );
  }
});

/**
 * The glyph is the family's non-chromatic alternative, so the artwork each
 * status draws is contract rather than a choice made in the sheet.
 */
test('draws the glyph the contract names for every status', () => {
  for (const [status, token] of Object.entries(contract.statusGlyphs)) {
    assert.ok(
      rule(`${root}[data-status='${status}']`).includes(`--_glyph:var(${token})`),
      `${status} draws artwork the contract does not name`,
    );
  }
});

/**
 * `unknown` and `neutral` share a tone, so the mark is the only thing that can
 * tell them apart — and it has to do it without colour, which is what makes
 * the difference survive `high-contrast` and greyscale.
 */
test('tells the two grey statuses apart by shape rather than by colour', () => {
  assert.equal(contract.statusTones.neutral, contract.statusTones.unknown);
  assert.ok(rule(`${root}[data-status='unknown']`).includes('--_solid:transparent'));
  assert.ok(
    rule(`${ui}[data-mark='dot'][data-status='unknown'] [data-part='mark']`).includes(
      'border-style:dashed',
    ),
  );
});

test('answers every value of every axis that has a paint', () => {
  for (const [axis, values] of Object.entries(contract.axes)) {
    if (axis === 'live') continue;
    for (const value of values) {
      const answered =
        normalized.includes(`[data-${axis}='${value}']`) ||
        (defaults[axis] === value && normalized.includes(`${root}{`));
      assert.ok(answered, `Missing ${axis} ${value}`);
    }
  }
});

test('leaves the announcement policy to the accessibility tree', () => {
  assert.ok(!normalized.includes('[data-live='), 'live decides a role, not a paint');
});

/**
 * The dot is one cap tall — the height of the letters beside it — and rimmed
 * with the tone's own darkest step, which the theme's contrast test holds to
 * the reading ratio and which therefore clears WCAG 2.2 1.4.11's 3:1 with room
 * over. A neutral rim was read at 250% first, and it took the saturation out
 * of the four tones whose fill already cleared the ratio on its own.
 */
test('sizes the disc on the cap height and rims it in the tone’s own darkest step', () => {
  assert.ok(rule(root).includes('--_dot-size:1cap'));
  assert.ok(
    rule(root).includes('--_rim:var(--slotted-status-indicator-mark-border-color,var(--_text'),
  );
  const dot = rule(`${ui}[data-mark='dot'] [data-part='mark']`);
  assert.ok(dot.includes('background-color:var(--_solid'));
  assert.ok(dot.includes('border:var(--_rim-width) solid var(--_rim'));
});

/**
 * The mark sits on the first line rather than in the middle of a wrapped
 * label, and `1lh` is what says so without a number: the unit resolves against
 * the indicator's own line box, so it answers every type size and every
 * density.
 */
test('puts the mark on the first line, however far the label runs', () => {
  assert.ok(rule(root).includes('align-items:flex-start'));
  assert.ok(rule(root).includes('--_pulse-inset:calc((1lh - var(--_mark-size)) / 2)'));
  assert.ok(rule(`${ui} [data-part='mark']`).includes('margin-block-start:var(--_pulse-inset)'));
});

/**
 * The opposite of `badge`, which clips its label to one line. A status is
 * often a sentence, and half a sentence is a wrong instruction rather than a
 * shorter one.
 *
 * `break-word` and never `anywhere`: both break the unbreakable token, and
 * only `anywhere` also reports a min-content size of one character, which
 * collapsed “Build 4821 failed” into fourteen lines of one letter inside an
 * auto-sized grid column on the reference page.
 */
test('wraps the label and breaks the token nothing else can', () => {
  const label = rule(`${ui} [data-part='label']`);
  assert.ok(label.includes('overflow-wrap:break-word'));
  assert.ok(!/overflow-wrap:anywhere/.test(normalized), 'anywhere collapses an auto-sized column');
  assert.ok(label.includes('min-inline-size:0'));
  assert.ok(
    rule(root).includes('min-inline-size:0'),
    'a long token would size the container’s track instead of breaking',
  );
  assert.ok(!/text-overflow|white-space:nowrap/.test(label), 'a status label is never clipped');
});

/**
 * A mark with no visible words still carries its own word, out of flow — so a
 * gap in front of an empty label puts a bare dot off the centre of the cell it
 * was meant to sit in.
 */
test('takes the gap back when the label holds nothing a reader can see', () => {
  assert.ok(
    normalized.includes(
      `${ui} [data-part='label']:has(> [data-part='announcement']){margin-inline-start:0`,
    ),
  );
});

/**
 * The ring hangs off the root rather than off the mark, and the reason is a
 * defect that was photographed: an icon mark carries a `mask-image`, a mask
 * clips the element's pseudo-elements with it, and the ring was cut into the
 * shape of the triangle it was supposed to leave.
 */
test('draws the pulse on the root, because a mask would clip it off the mark', () => {
  assert.ok(rule(`${ui}[data-pulse]::after`).includes('animation:slotted-status-indicator-pulse'));
  assert.ok(!normalized.includes(`[data-pulse] [data-part='mark']::after`));
  assert.ok(rule(`${ui}[data-mark='icon'] [data-part='mark']`).includes('mask-image:var('));
});

/** The ring is the tone's text role: the one step every status has. */
test('paints the ring in a colour every status owns', () => {
  assert.ok(
    rule(`${ui}[data-pulse]::after`).includes('border:var(--_rim-width) solid var(--_text'),
  );
});

test('takes its duration from the motion scale rather than stating one', () => {
  assert.ok(!/\d+(\.\d+)?m?s(?![\w-])/.test(css), 'a literal duration escapes reduced motion');
  assert.ok(css.includes('--slotted-duration-loop-slow'));
});

/**
 * Stopped and removed, not slowed. A ring halted halfway through an expansion
 * is a rendering fault rather than a state, which is what `button` recorded
 * about its own loading band.
 */
test('withdraws the endless ring under reduced motion rather than shortening it', () => {
  const query = normalized.slice(normalized.indexOf('@media (prefers-reduced-motion:reduce)'));
  assert.ok(query.startsWith(`@media (prefers-reduced-motion:reduce){${ui}[data-pulse]::after{`));
  assert.ok(query.includes('animation:none'));
  assert.ok(query.includes('content:none'));
});

/**
 * The system replaces every author colour, so the six statuses become one mark
 * and the only question left is whether it is visible. A masked glyph over a
 * forced `Canvas` background is not — the defect `link` found on its own
 * external mark.
 */
test('keeps the mark visible under forced colours and withdraws the ring', () => {
  const query = normalized.slice(normalized.indexOf('@media (forced-colors:active)'));
  assert.ok(query.includes(`${ui} [data-part='mark']{background-color:CanvasText`));
  assert.ok(
    query.includes(
      `${ui}[data-mark='dot'][data-status='unknown'] [data-part='mark']{background-color:Canvas`,
    ),
  );
  assert.ok(query.includes(`${ui}[data-pulse]::after{content:none`));
});

/** A status is furniture. Nothing in the sheet may answer a pointer. */
test('answers no pointer at all', () => {
  assert.ok(!/:hover/.test(css), 'a status is not a control');
  assert.ok(!/:active(?![-\w])/.test(css), 'a status is not a control');
});

/**
 * The ring is painted anyway, because `render` and an Angular host element
 * both let a consumer make the root a link — the decision `badge` took first.
 */
test('paints the focus ring for a root the consumer made focusable', () => {
  assert.ok(rule(`${root}:focus-visible`).includes('outline:var(--slotted-focus-ring-width'));
});

/** The fragment is a third place the DOM is written, and it can drift. */
test('renders every part and every painted axis value in the harness fragment', () => {
  for (const part of parts) {
    assert.match(fragment, new RegExp(`data-part="${part}"`), `no scene renders the ${part} part`);
  }
  for (const [axis, values] of Object.entries(contract.axes)) {
    if (axis === 'live') continue;
    for (const value of values) {
      assert.match(
        fragment,
        new RegExp(`data-${axis}="${value}"`),
        `no scene renders ${axis}="${value}"`,
      );
    }
  }
  assert.match(fragment, /data-pulse=""/, 'no scene renders the pulse');
});

/**
 * The family's own rule, held against the place it is likeliest to be
 * contradicted: a nameless dot in a harness teaches the opposite of what the
 * reference pages say. Every indicator whose label holds no words carries the
 * clipped one instead.
 */
test('never renders a mark without a word, visible or clipped', () => {
  const labels = [...fragment.matchAll(/data-part="label"[^>]*>([\s\S]*?)<\/span/g)];
  assert.ok(labels.length >= 20, `only ${labels.length} labels found in the fragment`);
  for (const [, held] of labels) {
    const words = held.replace(/<[^>]*>/g, '').trim();
    assert.ok(
      words.length > 0 || /data-part="announcement"/.test(held),
      `a mark is rendered with no name at all: ${held.slice(0, 60)}`,
    );
  }
});
