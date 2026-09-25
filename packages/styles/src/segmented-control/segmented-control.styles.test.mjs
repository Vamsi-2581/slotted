import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(
  readFileSync(
    new URL('../../../../specs/components/segmented-control/contract.json', import.meta.url),
    'utf8',
  ),
);
const css = readFileSync(new URL('./segmented-control.css', import.meta.url), 'utf8');
const harness = readFileSync(new URL('./segmented-control.harness.html', import.meta.url), 'utf8');
/** The sheet with its prose removed: a comment is not a rule. */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
/** The same sheet with every space taken out, so a reflow cannot break a match. */
const dense = rules.replace(/\s+/g, '');

test('paints every part the contract declares, and no part it does not', () => {
  const painted = new Set(
    [...rules.matchAll(/\[data-part=['"]([a-z-]+)['"]\]/g)].map(([, part]) => part),
  );
  for (const part of contract.members.segmentedControl.parts) {
    assert.ok(painted.has(part), `the stylesheet never selects the ${part} part`);
    assert.match(harness, new RegExp(`data-part="${part}"`), `no scene renders the ${part} part`);
  }
  for (const part of painted) {
    assert.ok(
      contract.members.segmentedControl.parts.includes(part),
      `the stylesheet paints ${part}, which the contract does not declare`,
    );
  }
});

/**
 * The thumb's place is the checked index times its own width, and its width is
 * one of the equal columns. Nothing is read from layout, so the first
 * server-rendered paint is already right — Mantine and Ark both measure the
 * checked node and paint it in the wrong place until hydration.
 */
test('places the thumb by arithmetic and never by measuring', () => {
  for (const property of contract.indicator.customProperties) {
    assert.match(dense, new RegExp(property.replace(/-/g, '\\-')), `never reads ${property}`);
  }
  assert.match(dense, /translate:calc\(var\(--_index\)\*100%\)/);
  assert.match(dense, /inline-size:calc\(\(100%-var\(--_inset\)\*2\)\/var\(--_count\)\)/);
  assert.equal(contract.indicator.measured, false);
});

/** The reading direction is which way "the next segment" is. */
test('mirrors the thumb in a right-to-left document', () => {
  assert.match(
    dense,
    /\[data-part='indicator'\]:dir\(rtl\)\{translate:calc\(var\(--_index\)\*-100%\)/,
  );
  assert.match(
    dense,
    /\[data-orientation='vertical'\]\[data-part='indicator'\]\{[^}]*translate:0calc\(var\(--_index\)\*100%\)/,
  );
});

/**
 * The movement is the one thing here a reader's eye follows: it says which
 * segment was left. A fill appearing in a new place says only that something
 * changed.
 *
 * It takes one step above the control's own interaction feedback, because a
 * thing that travels needs longer than a thing that changes colour; every step
 * on the scale collapses to a single frame under `prefers-reduced-motion`.
 */
test('moves the thumb a step slower than a colour changes', () => {
  assert.match(dense, /--_travel:var\(--slotted-duration-medium/);
  assert.match(dense, /translatevar\(--_travel\)var\(--slotted-easing-standard\)/);
  assert.match(dense, /opacityvar\(--slotted-control-transition-duration\)/);
});

/**
 * ── The control is exactly as tall as a control ───────────────────────
 *
 * A segmented control is put in forms beside a text field and a select, so a
 * family that added its padding to the control height would stand two or six
 * pixels prouder than every other control on the row. `--_inner` is what is
 * left for the thumb once the track has taken its edge and its ring, and the
 * segments take it.
 */
test('measures its segments back from the control height', () => {
  assert.match(
    dense,
    /--_inner:calc\(var\(--_height\)-\(var\(--_inset\)\+var\(--_border-width\)\)\*2\)/,
  );
  assert.match(dense, /\[data-part='item'\]\{[^}]*block-size:var\(--_inner\)/);
  assert.match(dense, /\[data-part='root'\]\{[^}]*padding:var\(--_inset\)/);
});

/**
 * The thumb is shorter than the control it lives in, so at the smallest step
 * and the tightest density it is eighteen pixels tall. The radio reaches the
 * track's own edge, and the segment is never narrower than the WCAG minimum,
 * so the target is the control's height in one axis and at least the minimum
 * in the other.
 */
test('keeps the target at the control’s own height rather than the thumb’s', () => {
  assert.match(
    dense,
    /\[data-part='control'\]\{[^}]*inset-block:calc\(-1\*\(var\(--_inset\)\+var\(--_border-width\)\)\)/,
  );
  assert.match(dense, /min-inline-size:max\(var\(--_inner\),var\(--slotted-target-min/);
});

/**
 * A track of words with nothing between them reads as a sentence. The rule is
 * what says the control is divided — Mantine ships it on by default, Apple
 * draws it, Carbon draws it — and it gives way around the thumb, because a
 * grey line touching the accent edge is the "border inside a border" this pair
 * had to correct in the other family.
 */
test('rules between two segments, and gives way around the thumb', () => {
  assert.match(dense, /\[data-part='item'\]\+\[data-part='item'\]::before\{/);
  assert.match(dense, /--slotted-segmented-control-divider-color/);
  assert.match(
    dense,
    /\[data-part='item'\]\[data-checked\]::before,[^{]*\[data-part='item'\]::before\{opacity:0/,
  );
  assert.match(dense, /::before\{[^}]*transition:opacityvar\(--_travel\)/);
});

/**
 * `container-type: inline-size` contains the inline axis, so an element that
 * declares it is sized as though it had no contents — and a control that
 * shrinks to its labels shrinks to nothing. It is declared on the one shape
 * that has a width of its own to be asked about.
 */
test('makes only the condensing shape a query container, and gives it a width', () => {
  const container = dense.match(/\[data-condense='icons'\]\{([^}]*)\}/);
  assert.ok(container, 'no rule sets up the condensing shape');
  assert.match(container[1], /container-type:inline-size/);
  assert.match(container[1], /inline-size:100%/);
  assert.equal((dense.match(/container-type:inline-size/g) ?? []).length, 1);
  assert.equal(contract.container.value, 'icons');
});

/** A container breakpoint is a literal: `var()` is invalid in the condition. */
test('states its container breakpoint as a literal, in the logical axis', () => {
  assert.match(rules, /@container slotted-segmented-control \(max-inline-size: \d+rem\)/);
  assert.ok(
    !/@container[^{]*var\(/.test(rules),
    'a container condition cannot hold a custom property',
  );
});

/** Hidden, not removed: the accessible name of a segment is the same at every width. */
test('hides a condensed label without taking it out of the document', () => {
  assert.ok(!/display:none/.test(dense.split('@containerslotted')[1] ?? ''), 'a label was removed');
  assert.match(dense, /clip-path:inset\(50%\)/);
});

/**
 * "On" is one colour across the system: the accent ground inside the accent
 * edge, which is the pair `docs/token-foundation.md` names for the chosen row,
 * card, option and toggle, and the pair `button` and `toggle-group` both paint.
 */
test('paints the thumb with the foundation pair, and lifts it off the track', () => {
  assert.match(
    dense,
    /\[data-part='indicator'\]\{[^}]*box-shadow:var\(--slotted-control-shadow,none\)/,
  );
  assert.match(
    dense,
    /background:var\(--slotted-segmented-control-indicator-background,var\(--slotted-tone-accent-subtle-active/,
  );
  assert.match(dense, /var\(--slotted-tone-accent-border/);
  assert.match(
    dense,
    /color:var\(--slotted-segmented-control-checked-color,var\(--slotted-tone-accent-text/,
  );
});

/**
 * The element that holds focus is the radio and the ring belongs around the
 * segment, so the ring the browser draws where focus actually is has to be put
 * out — the rule `checkbox`, `switch` and `radio-group` each record.
 */
test('moves the ring to the segment and puts out the one the browser draws', () => {
  assert.match(dense, /\[data-part='control'\]:focus-visible\{outline:none;\}/);
  assert.match(
    dense,
    /\[data-part='item'\]:has\(\[data-part='control'\]:focus-visible\)\{outline:var\(--slotted-focus-ring-width/,
  );
  assert.match(
    dense,
    /:has\(\[data-part='control'\]:focus-visible\)\{[^}]*outline-offset:calc\(-1\*var\(--slotted-focus-ring-width/,
  );
});

/**
 * The track is the ground the thumb is read against, so an unavailable control
 * keeps it. Painting the track in the disabled ground too made the thumb the
 * same colour as what it sits on, and the reader could no longer tell which of
 * the three had been chosen.
 */
test('keeps the track when the whole control is unavailable', () => {
  const disabled = dense.match(/\[data-part='root'\]\[data-disabled\]\{([^}]*)\}/);
  assert.ok(disabled, 'no rule paints an unavailable control');
  assert.ok(
    !/background:/.test(disabled[1]),
    'the track took the disabled ground, which hides the thumb standing on it',
  );
  assert.match(disabled[1], /border-color:/);
});

/**
 * A segment that is not checked is a live control and takes the page's own
 * ink. The muted step put an available segment within a hair of an unavailable
 * one — `#5b6b7f` against `#64748b`.
 */
test('inks an unchecked segment darker than an unavailable one', () => {
  assert.match(dense, /color:var\(--slotted-segmented-control-color,var\(--slotted-text,/);
  assert.match(
    dense,
    /color:var\(--slotted-segmented-control-disabled-color,var\(--slotted-disabled-foreground/,
  );
});

/** A read-only control keeps its colours; only a disabled one loses them. */
test('does not paint read-only the way it paints disabled', () => {
  const readonly = dense.match(/\[data-readonly\]\[data-part='item'\],[^{]*\{([^}]*)\}/);
  assert.ok(readonly, 'no rule paints a read-only control');
  assert.equal(readonly[1], 'cursor:default;');
});

/** Every density the theme states, read from the control scale and not restated. */
test('answers every density through the control scale', () => {
  for (const step of ['sm', 'md', 'lg']) {
    assert.match(dense, new RegExp(`--slotted-control-height-${step}`));
    assert.match(dense, new RegExp(`--slotted-control-padding-inline-${step}`));
    assert.match(dense, new RegExp(`--slotted-control-font-size-${step}`));
    assert.match(dense, new RegExp(`--slotted-control-icon-size-${step}`));
  }
  assert.match(dense, /--_inner:calc\(var\(--_height\)/);
});

/**
 * A segmented control stands in a row of fields and buttons, and it is a
 * control like them: the track takes the field's fill, edge and lift. The
 * sunken surface it had read as a hole in a row of raised controls, beside a
 * text field painted `--slotted-control-surface` (Nexora's list toolbar).
 */
test('paints the track as a control, with the fill, edge and lift of a field', () => {
  const root = dense.slice(dense.indexOf("[data-ui='segmented-control'][data-part='root']{"));
  const body = root.slice(0, root.indexOf('}'));
  assert.match(
    body,
    /background:var\(--slotted-segmented-control-background,var\(--slotted-control-surface,Field\)\)/,
  );
  assert.match(
    body,
    /border:var\(--_border-width\)solidvar\(--slotted-segmented-control-border-color,var\(--slotted-control-border-color,ButtonBorder\)\)/,
  );
  assert.match(
    body,
    /box-shadow:var\(--slotted-segmented-control-shadow,var\(--slotted-control-shadow,none\)\)/,
  );
});

/**
 * A segment with an icon and no words is square, and the icon sits in its
 * middle. The Angular binding always renders the label's span, empty when the
 * segment has no words, so the icon-only rule never matched and the flex gap
 * after the icon put four pixels more on its end side than on its start
 * (measured: 8 against 12). An empty label is not a label.
 */
test('treats an empty label as no label, so an icon-only segment centres its icon', () => {
  assert.match(
    dense,
    /\[data-ui='segmented-control'\]\[data-part='label'\]:empty\{display:none;\}|\[data-ui='segmented-control'\]\[data-part='label'\]:empty\{[^}]*display:none/,
  );
  assert.match(
    dense,
    /\[data-ui='segmented-control'\]\[data-part='item'\]:not\(:has\(\[data-part='label'\]:not\(:empty\)\)\)\{padding-inline:0;\}/,
  );
});
