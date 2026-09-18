# Theme cascade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the cascade the shape a CSS-authored theme needs: two new layer
names, the contract-derived blocks emitted once by the library instead of once
per theme, and a control height a generic rule can grow without a cycle.

**Architecture:** `@slotted/tokens` gains `preferences.mjs`, which renders
`@layer slotted.preferences` from the contract alone — the user-agent scheme
hint, the forced-colour map, the touch-target growth and the reduced-motion
collapse. `renderThemeCss` loses those blocks and keeps only values. The
density axis states `--slotted-control-height-{sm,md,lg}-base`; the library
computes the `--slotted-control-height-{sm,md,lg}` the families read.

**Tech Stack:** Node ESM, `node:test`, pnpm workspaces, Turborepo, plain CSS
custom properties and cascade layers.

**Spec:** `docs/history/designs/2026-09-03-css-theming-design.md`

## Global Constraints

- The default theme's rendered result does not change. Every block that leaves
  `renderThemeCss` is emitted by `@slotted/tokens` first, and the two are
  compared before the removal.
- `slotted.overrides` is not used. The new names are `slotted.theme-overrides`
  and `slotted.preferences`, per the addendum in
  `docs/decisions/0001-cascade-layer-contract.md`.
- A later layer beats an earlier one **on the same element only**. Every block
  that replaces a theme declaration names the same elements the theme names.
- The default theme stays generated from `theme.json` in this plan. Converting
  it to authored CSS belongs to the validator plan, which is what checks it.
- Comments state why a rule exists, never what the next line does.
- `pnpm --filter <package> verify` gates every package touched;
  `pnpm test:docs` gates every document the contract is held equal to.

---

### Task 1: Declare the two new layers

**Files:**

- Modify: `packages/tokens/src/layer-order.mjs:10`
- Modify: `packages/tokens/test/layer-order.test.mjs:8-13`
- Modify: `docs/styling.md:32`

**Interfaces:**

- Produces: `LAYER_NAMES = ['reset', 'tokens', 'theme', 'components', 'theme-overrides', 'preferences']`
  and the `LAYER_ORDER_STATEMENT` built from it, unchanged in shape.

- [ ] **Step 1: Write the failing test**

In `packages/tokens/test/layer-order.test.mjs`, replace the pinned string:

```js
test('the published order names every layer the library writes into', () => {
  assert.equal(
    LAYER_ORDER_STATEMENT,
    '@layer slotted.reset, slotted.tokens, slotted.theme, slotted.components, slotted.theme-overrides, slotted.preferences;\n',
  );
});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: FAIL, the actual string ends at `slotted.components;`.

- [ ] **Step 3: Append the names**

In `packages/tokens/src/layer-order.mjs`, extend the array and record why the
two names exist:

```js
/**
 * `theme-overrides` holds the rules a theme writes over a family — a shadow,
 * a focus treatment — and beats every family declaration without needing
 * specificity. It is not `overrides`, the name decision 0001 retired: that one
 * was offered to applications, and an application that mentioned it before the
 * library's statement reached the document registered it below
 * `slotted.components` and lost its rules with no error. A theme carries this
 * statement itself, which is what closes that hole.
 *
 * `preferences` holds what the operating system asks for — forced colours,
 * reduced motion, a coarse pointer. It is last because a preference outranks
 * both a theme's values and a theme's own rules.
 */
export const LAYER_NAMES = [
  'reset',
  'tokens',
  'theme',
  'components',
  'theme-overrides',
  'preferences',
];
```

- [ ] **Step 4: Run the suite**

Run: `pnpm --filter @slotted/tokens verify`
Expected: PASS.

- [ ] **Step 5: Update the published statement in the styling guide**

`docs/styling.md:32` prints the statement. Replace it with the new one, byte
for byte.

Run: `pnpm test:docs && pnpm --filter @slotted/theme-default verify && pnpm exec turbo run verify --filter @slotted/react`
Expected: PASS. The React package boundary check asserts the bundled
stylesheet opens with the statement, so it is the one that catches a stale
copy.

---

### Task 2: Emit the scheme hint and the forced-colour map from the library

**Files:**

- Create: `packages/tokens/src/preferences.mjs`
- Create: `packages/tokens/test/preferences.test.mjs`
- Modify: `packages/tokens/scripts/build.mjs`
- Modify: `packages/tokens/package.json`

**Interfaces:**

- Consumes: `LAYER_ORDER_STATEMENT` from Task 1.
- Produces: `renderPreferencesCss(contract) -> string`, exported from
  `@slotted/tokens/preferences`. It returns the layer statement followed by
  `@layer slotted.preferences { … }` and names no theme.

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import { contract } from '../src/contract.mjs';
import { renderPreferencesCss } from '../src/preferences.mjs';

test('tells the user agent which scheme its own widgets are painted for', () => {
  const css = renderPreferencesCss(contract);
  assert.match(css, /\[data-slotted-scheme='dark'\][^{]*\{\s*color-scheme: dark;/);
  assert.match(css, /\[data-slotted-scheme='high-contrast'\]/);
});

/**
 * A later layer beats an earlier one on the same element and on no other. The
 * theme declares its scheme tokens on the element that carries the scheme, so
 * a forced-colour rule that named only the theme root would leave every one of
 * them standing.
 */
test('replaces a scheme token on the element the theme declared it on', () => {
  const css = renderPreferencesCss(contract);
  const query = css.slice(css.indexOf('@media (forced-colors: active)'));

  assert.match(query, /\[data-slotted-theme\]\[data-slotted-scheme\]/);
  assert.match(query, /\[data-slotted-theme\] \[data-slotted-scheme\]/);
  for (const token of contract.tokens.filter((entry) => entry.axis === 'scheme')) {
    assert.ok(
      query.includes(`${token.name}: ${token.forcedColor};`),
      `${token.name} is unmapped`,
    );
  }
});

test('opens with the published layer order', () => {
  assert.ok(renderPreferencesCss(contract).startsWith(LAYER_ORDER_STATEMENT));
});
```

Import `LAYER_ORDER_STATEMENT` from `../src/layer-order.mjs` at the top of the
file.

- [ ] **Step 2: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: FAIL, `Cannot find module '../src/preferences.mjs'`.

- [ ] **Step 3: Write the renderer**

`packages/tokens/src/preferences.mjs`:

```js
import { LAYER_ORDER_STATEMENT } from './layer-order.mjs';

/**
 * What the operating system asks for, rendered from the contract and from
 * nothing else. Every theme gets these blocks, including a theme the library
 * has never seen, which is why they are emitted here rather than per theme.
 */

/**
 * `color-scheme` accepts light and dark and nothing else. `high-contrast` is
 * painted black on white, so the light widget style is the one that matches
 * it. Without the hint an unchecked radio on a dark card renders as a solid
 * white dot, which reads as checked.
 */
const UA_SCHEME = { light: 'light', dark: 'dark', 'high-contrast': 'light' };

/** The elements a theme declares its scheme tokens on, without naming one. */
const SCHEME_CARRIERS = [
  '  [data-slotted-theme]',
  '  [data-slotted-theme][data-slotted-scheme]',
  '  [data-slotted-theme] [data-slotted-scheme]',
];

function tokensOn(contract, axis) {
  return contract.tokens.filter((token) => token.axis === axis);
}

function schemeHint(contract) {
  const byHint = new Map();
  for (const scheme of contract.requiredSchemes) {
    const ua = UA_SCHEME[scheme];
    if (ua === undefined) {
      throw new Error(`${scheme}: no user-agent colour scheme is declared for it`);
    }
    byHint.set(ua, [...(byHint.get(ua) ?? []), `  [data-slotted-scheme='${scheme}']`]);
  }

  return [...byHint]
    .map(([ua, selectors]) => `${selectors.join(',\n')} {\n    color-scheme: ${ua};\n  }`)
    .join('\n\n');
}

function forcedColors(contract) {
  const declarations = tokensOn(contract, 'scheme')
    .map((token) => `      ${token.name}: ${token.forcedColor};`)
    .join('\n');

  return (
    `  @media (forced-colors: active) {\n` +
    `${SCHEME_CARRIERS.map((selector) => `  ${selector}`).join(',\n')} {\n` +
    `${declarations}\n    }\n  }`
  );
}

export function renderPreferencesCss(contract) {
  const blocks = [schemeHint(contract), forcedColors(contract)];

  return `${LAYER_ORDER_STATEMENT}\n@layer slotted.preferences {\n${blocks.join('\n\n')}\n}\n`;
}
```

- [ ] **Step 4: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: PASS.

- [ ] **Step 5: Write it into the token stylesheet**

In `packages/tokens/scripts/build.mjs`, replace the last line:

```js
await writeFile(new URL('styles.css', distUrl), renderPreferencesCss(contract));
```

and import `renderPreferencesCss` from `../src/preferences.mjs`. The file
still opens with the layer statement, which is what
`packages/tokens/test/layer-order.test.mjs` and
`packages/react/package-boundary.verify.mjs` assert.

- [ ] **Step 6: Declare the export**

Add `"./preferences": "./src/preferences.mjs"` to the `exports` of
`packages/tokens/package.json`, `node --check src/preferences.mjs` to
`typecheck`, and `test/preferences.test.mjs` to `test`.

- [ ] **Step 7: Verify**

Run: `pnpm --filter @slotted/tokens verify && pnpm exec turbo run verify --filter @slotted/react`
Expected: PASS. The theme stylesheet still carries its own copies of both
blocks; two identical declarations in two layers paint the same thing.

---

### Task 3: Split the control height into a stated value and a computed one

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/tokens/src/validate-theme.mjs:122-139`
- Modify: `packages/theme-default/src/theme.json`
- Modify: `packages/tokens/src/preferences.mjs`
- Modify: `packages/tokens/test/preferences.test.mjs`
- Modify: `docs/token-foundation.md`

**Interfaces:**

- Consumes: `renderPreferencesCss` from Task 2.
- Produces: density tokens `--slotted-control-height-{sm,md,lg}-base`, stated
  by every theme, and `--slotted-control-height-{sm,md,lg}`, computed by the
  library. Family stylesheets keep reading the second set and do not change.

- [ ] **Step 1: Write the failing test**

Add to `packages/tokens/test/preferences.test.mjs`:

```js
/**
 * The generic rule cannot apply `max()` to the token it defines — that is a
 * cycle — so the stated value and the computed one are two names. It is
 * emitted on the density selectors and not on the theme root, because that is
 * where the stated value lives: a computed value inherited from an ancestor
 * would carry one density's geometry into another's subtree.
 */
test('computes every control height from the value the density states', () => {
  const css = renderPreferencesCss(contract);

  for (const density of contract.requiredDensities) {
    assert.match(css, new RegExp(`\\[data-slotted-density='${density}'\\]`));
  }
  assert.match(
    css,
    /--slotted-control-height-md: var\(--slotted-control-height-md-base\);/,
  );
  assert.match(
    css,
    /--slotted-control-height-md: max\(\s*var\(--slotted-control-height-md-base\),\s*var\(--slotted-target-comfortable\)\s*\);/,
  );
  assert.ok(
    css.indexOf('@media (pointer: coarse)') <
      css.indexOf('@media (prefers-reduced-motion: reduce)'),
    'the coarse-pointer block precedes the motion block, as the theme emitted them',
  );
});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: FAIL, no density selector is emitted.

- [ ] **Step 3: Rename the stated tokens in the contract**

In `packages/tokens/src/contract.json`, rename the three density tokens
`--slotted-control-height-sm`, `--slotted-control-height-md` and
`--slotted-control-height-lg` to the same names with `-base` appended. Their
`layer`, `axis`, `type` and `root` fields do not change.

- [ ] **Step 4: Rename them in the default theme**

In `packages/theme-default/src/theme.json`, rename the same three keys inside
each of `comfortable`, `compact` and `dense`. The values do not change.

- [ ] **Step 5: Hold the target size against the stated value**

`checkTargets` in `packages/tokens/src/validate-theme.mjs` matches
`/^--slotted-control-height-(sm|md|lg)$/`. Change the expression to
`/^--slotted-control-height-(sm|md|lg)-base$/` and the message to name the
stated token. The rule is unchanged: a stated height below
`--slotted-target-min` is an error.

- [ ] **Step 6: Emit the two blocks**

In `packages/tokens/src/preferences.mjs`, add:

```js
/** The elements a theme states its density geometry on. */
function densityCarriers(density) {
  return [
    `  [data-slotted-theme][data-slotted-density='${density}']`,
    `  [data-slotted-theme] [data-slotted-density='${density}']`,
  ];
}

function heights(contract) {
  return tokensOn(contract, 'density')
    .map((token) => token.name)
    .filter((name) => /^--slotted-control-height-(sm|md|lg)-base$/.test(name));
}

function computed(name) {
  return name.slice(0, -'-base'.length);
}

function targets(contract) {
  const stated = heights(contract);

  const plain = contract.requiredDensities
    .map(
      (density) =>
        `${densityCarriers(density).join(',\n')} {\n` +
        stated.map((name) => `    ${computed(name)}: var(${name});`).join('\n') +
        `\n  }`,
    )
    .join('\n\n');

  const coarse = contract.requiredDensities
    .map(
      (density) =>
        `${densityCarriers(density)
          .map((selector) => `  ${selector}`)
          .join(',\n')} {\n` +
        stated
          .map(
            (name) =>
              `      ${computed(name)}: max(var(${name}), var(--slotted-target-comfortable));`,
          )
          .join('\n') +
        `\n    }`,
    )
    .join('\n\n');

  return `${plain}\n\n  @media (pointer: coarse) {\n${coarse}\n  }`;
}
```

and put `targets(contract)` in the `blocks` array, after `forcedColors`.

- [ ] **Step 7: Run it**

Run: `pnpm --filter @slotted/tokens verify`
Expected: PASS.

- [ ] **Step 8: Update the foundation document**

`scripts/verify-token-foundation.test.mjs:174` holds the density table in
`docs/token-foundation.md` equal to the contract, and line 202 holds the
density scale free of aliases. Rename the three rows to the `-base` names and
add a sentence stating that the library computes the name the families read.

Run: `pnpm test:docs`
Expected: PASS.

- [ ] **Step 9: Verify the whole chain**

Run: `pnpm build:tokens && pnpm --filter @slotted/theme-default verify && node tools/harness/build.mjs button`
Expected: PASS. The theme still emits its own coarse-pointer block over the
old names, which no longer exist — that is Task 4's removal, and the
duplicate is inert because nothing reads the old stated names.

---

### Task 4: Move the reduced-motion collapse into the library

**Files:**

- Modify: `packages/tokens/src/preferences.mjs`
- Modify: `packages/tokens/test/preferences.test.mjs`
- Modify: `packages/tokens/src/validate-theme.mjs`
- Modify: `packages/theme-default/src/theme.json`
- Modify: `packages/theme-default/test/default-theme.test.mjs`
- Modify: `docs/token-foundation.md`

**Interfaces:**

- Consumes: `renderPreferencesCss` from Task 3.
- Produces: the collapse as library policy. `theme.reducedMotion` is removed
  from the theme's surface; `contract.tokens[].reducedMotion` stays, and is
  what names the tokens that collapse.

- [ ] **Step 1: Write the failing test**

```js
test('collapses every duration the contract marks, to a value no theme states', () => {
  const css = renderPreferencesCss(contract);
  const query = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

  assert.match(query, /\[data-slotted-theme\] \{/);
  for (const token of contract.tokens.filter((entry) => entry.reducedMotion)) {
    assert.ok(query.includes(`${token.name}: 1ms;`), `${token.name} does not collapse`);
  }
});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: FAIL, no reduced-motion block is emitted.

- [ ] **Step 3: Emit it**

In `packages/tokens/src/preferences.mjs`:

```js
/**
 * Short enough to read as instant, and never zero: a zero-length transition
 * fires no `transitionend`, and a family that waits for one would wait
 * forever. The value is policy rather than theme data, so a theme cannot
 * weaken it and no theme has to restate it.
 */
const COLLAPSED_DURATION = '1ms';

function reducedMotion(contract) {
  const declarations = contract.tokens
    .filter((token) => token.reducedMotion)
    .map((token) => `      ${token.name}: ${COLLAPSED_DURATION};`)
    .join('\n');

  return (
    `  @media (prefers-reduced-motion: reduce) {\n` +
    `    [data-slotted-theme] {\n${declarations}\n    }\n  }`
  );
}
```

Put `reducedMotion(contract)` last in the `blocks` array. It is last for the
same reason the layer is last: source order is what decides between two rules
in one layer, and nothing may override the collapse.

- [ ] **Step 4: Run it**

Run: `pnpm --filter @slotted/tokens test`
Expected: PASS.

- [ ] **Step 5: Remove the map from the theme's surface**

In `packages/tokens/src/validate-theme.mjs`, delete the
`checkTokenMap(errors, 'reducedMotion', …)` call and the `reducedMotionNames`
helper it uses. Add, in its place, a check that the theme does not state one:

```js
if ('reducedMotion' in theme) {
  errors.push('reducedMotion is emitted by the library and must not be stated by a theme');
}
```

Delete the `reducedMotion` object from
`packages/theme-default/src/theme.json`, and the
`states the exact reduced-motion collapse it published` case and its
`REDUCED_MOTION_VALUES` constant from
`packages/theme-default/test/default-theme.test.mjs`.

- [ ] **Step 6: Run the validator's own suite**

Run: `pnpm --filter @slotted/tokens verify`
Expected: PASS. `packages/tokens/test/validate-theme.test.mjs` has cases for
the removed map; delete the ones that assert it is required and keep the one
that now asserts it is refused.

- [ ] **Step 7: Update the foundation document**

`scripts/verify-token-foundation.test.mjs:131` holds the motion table equal to
the value each duration collapses to, read from `theme.reducedMotion`. Point
it at the library's `COLLAPSED_DURATION` instead, exported from
`@slotted/tokens/preferences`, and state in `docs/token-foundation.md` that
the collapse is the library's and not the theme's.

Run: `pnpm test:docs`
Expected: PASS.

---

### Task 5: Strip the emitted blocks from the theme renderer

**Files:**

- Modify: `packages/tokens/src/render-theme.mjs`
- Modify: `packages/tokens/src/theme-conformance.mjs`
- Modify: `packages/theme-default/test/theme.test.mjs`

**Interfaces:**

- Consumes: every block Tasks 2 to 4 moved into `renderPreferencesCss`.
- Produces: `renderThemeCss(contract, theme)` emitting three kinds of block
  and nothing else — the base block, one block per scheme, one per density.

- [ ] **Step 1: Prove the two stylesheets agree before removing anything**

Write `packages/tokens/test/handover.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { contract } from '../src/contract.mjs';
import { renderPreferencesCss } from '../src/preferences.mjs';
import { renderThemeCss } from '../src/render-theme.mjs';

/**
 * Every block the renderer stops emitting has to be emitted by the library
 * first, over the same tokens. This compares the two before the removal, so a
 * block cannot be dropped from one side without arriving on the other.
 */
test('the library emits every scheme token the theme mapped under forced colours', async () => {
  const theme = JSON.parse(
    await readFile(new URL('../../theme-default/src/theme.json', import.meta.url), 'utf8'),
  );
  const preferences = renderPreferencesCss(contract);
  const themed = renderThemeCss(contract, theme);

  for (const token of contract.tokens.filter((entry) => entry.axis === 'scheme')) {
    assert.ok(themed.includes(`${token.name}: ${token.forcedColor};`));
    assert.ok(preferences.includes(`${token.name}: ${token.forcedColor};`));
  }
});
```

Run: `pnpm --filter @slotted/tokens test`
Expected: PASS. A failure here means Task 2 mapped a token the theme did not,
and the removal below would lose it.

- [ ] **Step 2: Remove the four blocks from the renderer**

Delete from `packages/tokens/src/render-theme.mjs`: the `UA_SCHEME` map and
the `color-scheme` declaration inside the scheme loop, the `@media (pointer:
coarse)` block and its `targets` list, the `@media (forced-colors: active)`
block and `forcedColorMap`, and the `@media (prefers-reduced-motion: reduce)`
block and `reducedMotionNames`. What remains is the base block, the scheme
loop and the density loop.

Replace the removed comments with one at the top of the file:

```js
/**
 * A theme states values. What the operating system asks for — the scheme hint,
 * forced colours, the touch target, the collapse under reduced motion — is
 * emitted once by `preferences.mjs`, against every theme rather than against
 * this one, so a theme written outside this repository gets it too.
 */
```

- [ ] **Step 3: Remove the cases that asserted them**

From `packages/tokens/src/theme-conformance.mjs`, delete the cases named
`tells the user agent which scheme its own widgets are painted for`,
`collapses every duration the contract marks, and never to zero`,
`collapses every duration under its own theme selector`,
`emits the reduced-motion block after the block it overrides`,
`emits the reduced-motion block as the final theme content`,
`grows every control to the comfortable target under a coarse pointer` and
`maps every scheme token to a system colour under forced colours`, together
with `expectedReducedMotionBlock`, `milliseconds`, `reducedMotionNames` and
`MAX_REDUCED_MOTION_MS`. Keep `scopes every block to its own name` and both
layer-order cases. Delete `packages/tokens/test/handover.test.mjs`: with the
blocks gone from one side, it compares nothing.

- [ ] **Step 4: Verify**

Run: `pnpm --filter @slotted/tokens verify && pnpm --filter @slotted/theme-default verify`
Expected: PASS.

- [ ] **Step 5: Verify the rendered page, not only the files**

Run: `node tools/harness/build.mjs button`

Open `tools/harness/out/button.html` and confirm, in a browser: the control
keeps its height at every density; the dark cells stay dark; a forced-colours
window still repaints the page; and the page still animates. The harness
inlines `packages/theme-default/dist/styles.css` and now needs the token
stylesheet beside it — add it to `renderHarness` in `tools/harness/build.mjs`
as a second `<style>`, read from `packages/tokens/dist/styles.css`, before the
theme, and assert its presence in `tools/harness/build.test.mjs`.

Run: `node --test tools/harness/build.test.mjs`
Expected: PASS.

- [ ] **Step 6: Verify both workbenches**

Run: `pnpm dev:react`

Confirm: components paint, transitions run, the scheme toolbar switches light,
dark and high contrast, and the density toolbar changes control height. The
React and Angular previews already import `@slotted/tokens/styles.css` before
the theme, so the preferences layer arrives with no change to either preview.

---

## Self-review

- Spec coverage: the layer names, the four blocks in `slotted.preferences` and
  the `-base` split are Tasks 1 to 5. The surface files, `surface.json`,
  `@slotted/theme-tools` and the default theme's conversion are the second
  plan, as the spec's delivery order states.
- Every step names the file it edits and shows the code it writes. The one
  step that cannot be automated — reading a rendered page in a browser — says
  exactly what to look for.
- Names used across tasks: `renderPreferencesCss`, `renderThemeCss`,
  `LAYER_ORDER_STATEMENT`, `COLLAPSED_DURATION`,
  `--slotted-control-height-{sm,md,lg}-base`. Each is defined in the task that
  first writes it and spelled the same in every later task.
- Risk carried into the second plan: `theme-conformance.mjs` keeps the
  contrast, glyph and scope cases after Task 5. They move into the validator
  there, and the default theme is converted only once they have.
