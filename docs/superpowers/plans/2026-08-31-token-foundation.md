# Token Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `@slotted/tokens` and `@slotted/theme-default` the scales the library has never had — space, type, radius, motion, shadow, stacking, control geometry and intrinsic glyphs — without renaming a token, removing a token, or changing a single rendered pixel.

**Architecture:** Every scale is added to `packages/tokens/src/contract.json` and `packages/themes/default/src/theme.json` in lockstep, because the validator requires exact correspondence in both directions. The four existing tokens that carry literals are redefined as `var()` references to the scale step holding the identical value, so the emitted CSS resolves to what it resolves to today. A new `reducedMotion` contract section and a matching branch in `renderThemeCss` collapse the duration tokens under one media query, which is what lets every family honour the preference without writing a rule.

**Tech Stack:** Plain JSON contract + theme, a Node build script emitting CSS, `node --test` for verification. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-31-component-foundation-and-craft-skill-design.md`

## Global Constraints

- No existing token is renamed or removed. Tokens carrying literals are redefined as `var(<scale step>)` holding the identical value.
- **Plan 1 changes no pixel.** Every redefinition is value-preserving, and Task 1 builds the test that proves it.
- Contract and theme are edited together in every task. `validateTheme` errors on a token present in one and absent in the other, in both directions.
- Space, type and radius are expressed in `rem`. Control geometry stays in `px`, as today.
- `contract.schemaVersion` goes from `1` to `2` in Task 1 and is not touched again.
- No component stylesheet is edited by this plan. Consuming the scales is the craft skill's work, family by family.
- Commit messages follow the repository style: imperative subject under 72 characters, a body explaining _why_, ending with:
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

---

### Task 1: The value-preservation harness and the rhythm scales

Adds space, radius, type and weight, redefines the two existing tokens whose values those scales now hold, and builds the test that makes "no pixel changed" checkable rather than asserted.

**Files:**

- Create: `packages/tokens/test/resolve.test.mjs`
- Create: `packages/tokens/src/resolve.mjs`
- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/themes/default/src/theme.json`
- Modify: `packages/tokens/package.json` (add the new test to the `test` script)

**Interfaces:**

- Produces: `resolveTokens(values: Record<string,string>) => Record<string,string>` from `packages/tokens/src/resolve.mjs`. Expands `var(--name)` and `var(--name, fallback)` references _within the same map_, repeatedly, until no reference remains. Throws `Error` on a reference cycle and on a reference to a name absent from the map with no fallback. Tasks 2 and 4 reuse it.

- [ ] **Step 1: Write the failing test**

Create `packages/tokens/test/resolve.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveTokens } from '../src/resolve.mjs';

const theme = JSON.parse(
  await readFile(new URL('../../themes/default/src/theme.json', import.meta.url), 'utf8'),
);

/**
 * What every one of these tokens resolved to before the scales existed.
 * A scale step is only allowed to replace a literal if it holds the same
 * value, so this table is what makes "the foundation changed no pixel"
 * a fact rather than a claim. Entries are added, never edited.
 */
const UNCHANGED = {
  '--slotted-control-font-family': 'ui-sans-serif, system-ui, sans-serif',
  '--slotted-control-font-weight': '600',
  '--slotted-control-line-height': '1',
  '--slotted-control-letter-spacing': '0',
  '--slotted-control-border-width': '1px',
  '--slotted-control-radius': '4px',
  '--slotted-control-shadow': 'none',
  '--slotted-control-transition-duration': '120ms',
  '--slotted-control-transition-easing': 'cubic-bezier(0.2, 0, 0, 1)',
  '--slotted-focus-ring-width': '2px',
  '--slotted-focus-ring-offset': '2px',
  '--slotted-button-gap': '0.5rem',
  '--slotted-button-radius-sm': '7px',
  '--slotted-button-radius-md': '6px',
  '--slotted-button-radius-lg': '5px',
};

test('expands a reference to another token in the same map', () => {
  assert.deepEqual(resolveTokens({ '--a': 'var(--b)', '--b': '4px' }), {
    '--a': '4px',
    '--b': '4px',
  });
});

test('expands repeated references to the same token', () => {
  assert.equal(resolveTokens({ '--a': 'var(--b) var(--b)', '--b': '1px' })['--a'], '1px 1px');
});

test('expands more than one hundred sibling references', () => {
  const count = 101;
  const references = Array(count).fill('var(--b)').join(' ');

  assert.equal(
    resolveTokens({ '--a': references, '--b': 'x' })['--a'],
    Array(count).fill('x').join(' '),
  );
});

test('expands a chain of references', () => {
  assert.equal(resolveTokens({ '--a': 'var(--b)', '--b': 'var(--c)', '--c': '2px' })['--a'], '2px');
});

test('keeps the surrounding text of a reference', () => {
  assert.equal(
    resolveTokens({ '--a': 'calc(-1 * var(--b))', '--b': '1px' })['--a'],
    'calc(-1 * 1px)',
  );
});

test('takes the fallback when the name is absent', () => {
  assert.equal(resolveTokens({ '--a': 'var(--missing, 8px)' })['--a'], '8px');
});

test('refuses a reference that cannot be resolved', () => {
  assert.throws(() => resolveTokens({ '--a': 'var(--missing)' }), /--missing/);
});

test('refuses a cycle rather than looping', () => {
  assert.throws(() => resolveTokens({ '--a': 'var(--b)', '--b': 'var(--a)' }), /cycle/i);
});

test('every token that predates the scales still resolves to its old value', () => {
  const resolved = resolveTokens(theme.base);
  for (const [name, expected] of Object.entries(UNCHANGED)) {
    assert.equal(resolved[name], expected, `${name} changed value`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test packages/tokens/test/resolve.test.mjs`
Expected: FAIL — `Cannot find module '../src/resolve.mjs'`.

- [ ] **Step 3: Write the resolver**

Create `packages/tokens/src/resolve.mjs`:

```js
const REFERENCE = /var\(\s*(--[a-z0-9-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/i;

/**
 * Expands `var()` references a token map makes to itself.
 *
 * The theme is authored with scale steps referenced by the tokens that
 * predate them, so the file no longer states what a token resolves to. This
 * puts that back, so a test can hold the emitted values to the ones the
 * library shipped before the scales existed.
 *
 * It is not a CSS engine: it resolves within one map, which is what the
 * theme's own blocks are.
 */
export function resolveTokens(values) {
  const resolved = { ...values };

  for (const name of Object.keys(resolved)) {
    resolved[name] = resolveValue(values, values[name], name, new Set([name]));
  }

  return resolved;
}

function resolveValue(values, value, name, path) {
  while (REFERENCE.test(value)) {
    value = value.replace(REFERENCE, (whole, reference, fallback) => {
      if (reference in values) {
        if (path.has(reference)) throw new Error(`Reference cycle at ${reference}`);
        return resolveValue(values, values[reference], name, new Set([...path, reference]));
      }
      if (fallback !== undefined) return fallback.trim();
      throw new Error(`${name} references ${reference}, which the map does not hold`);
    });
  }

  return value;
}
```

- [ ] **Step 4: Run the resolver tests**

Run: `node --test packages/tokens/test/resolve.test.mjs`
Expected: the eight unit tests PASS; the last test PASSES too, because no token references a scale yet.

- [ ] **Step 5: Add the scales to the contract**

In `packages/tokens/src/contract.json`, set `"schemaVersion": 2` and insert these names at the **start** of the `base` array, before `--slotted-control-font-family`:

```
"--slotted-space-1", "--slotted-space-2", "--slotted-space-3", "--slotted-space-4",
"--slotted-space-5", "--slotted-space-6", "--slotted-space-7", "--slotted-space-8",
"--slotted-space-9", "--slotted-space-10", "--slotted-space-11", "--slotted-space-12",
"--slotted-radius-xs", "--slotted-radius-sm", "--slotted-radius-md", "--slotted-radius-lg",
"--slotted-radius-full",
"--slotted-font-size-xs", "--slotted-font-size-sm", "--slotted-font-size-md",
"--slotted-font-size-lg", "--slotted-font-size-xl",
"--slotted-line-height-xs", "--slotted-line-height-sm", "--slotted-line-height-md",
"--slotted-line-height-lg", "--slotted-line-height-xl",
"--slotted-font-weight-regular", "--slotted-font-weight-medium", "--slotted-font-weight-semibold"
```

- [ ] **Step 6: Add the same names to the theme, and redefine two existing tokens**

In `packages/themes/default/src/theme.json`, insert at the start of `base`:

```json
"--slotted-space-1": "0.125rem",
"--slotted-space-2": "0.25rem",
"--slotted-space-3": "0.375rem",
"--slotted-space-4": "0.5rem",
"--slotted-space-5": "0.75rem",
"--slotted-space-6": "1rem",
"--slotted-space-7": "1.25rem",
"--slotted-space-8": "1.5rem",
"--slotted-space-9": "2rem",
"--slotted-space-10": "2.5rem",
"--slotted-space-11": "3rem",
"--slotted-space-12": "4rem",
"--slotted-radius-xs": "2px",
"--slotted-radius-sm": "4px",
"--slotted-radius-md": "6px",
"--slotted-radius-lg": "8px",
"--slotted-radius-full": "9999px",
"--slotted-font-size-xs": "0.75rem",
"--slotted-font-size-sm": "0.8125rem",
"--slotted-font-size-md": "0.875rem",
"--slotted-font-size-lg": "1rem",
"--slotted-font-size-xl": "1.125rem",
"--slotted-line-height-xs": "1.4",
"--slotted-line-height-sm": "1.45",
"--slotted-line-height-md": "1.5",
"--slotted-line-height-lg": "1.5",
"--slotted-line-height-xl": "1.45",
"--slotted-font-weight-regular": "400",
"--slotted-font-weight-medium": "500",
"--slotted-font-weight-semibold": "600",
```

Then change exactly two existing entries in `base`:

```json
"--slotted-control-font-weight": "var(--slotted-font-weight-semibold)",
"--slotted-control-radius": "var(--slotted-radius-sm)",
```

`--slotted-control-shadow` keeps its literal `none`: `none` is a keyword, not a scale step, and the scales hold no `shadow-none`.

- [ ] **Step 7: Register the test**

In `packages/tokens/package.json`, change the `test` script so it also runs the new file. If the script is `node --test test/validate-theme.test.mjs`, it becomes:

```
node --test test/validate-theme.test.mjs test/resolve.test.mjs
```

- [ ] **Step 8: Verify**

Run: `node --test packages/tokens/test/resolve.test.mjs && pnpm --filter @slotted/theme-default verify`
Expected: PASS. The last resolve test now traverses two `var()` chains and still finds `600` and `4px`, which is the point of the task.

- [ ] **Step 9: Commit**

```bash
git add packages/tokens/src/resolve.mjs packages/tokens/test/resolve.test.mjs \
        packages/tokens/src/contract.json packages/tokens/package.json \
        packages/themes/default/src/theme.json
git commit -F - <<'EOF'
feat(tokens): add the space, radius and type scales

The library had a mature colour system and no scale for anything else,
so every component family invented its own literals as fallbacks and a
theme could retune colour and nothing more.

The two existing tokens that held a value a scale now holds are
redefined as references to it. They keep their names and their resolved
values, which is what the new resolver exists to prove: it expands the
var() chains the theme now contains and holds every pre-existing token
to the value it shipped with. The foundation changes no pixel, and that
is checkable rather than claimed.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: Motion, and reduced motion resolved once

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/tokens/src/validate-theme.mjs`
- Modify: `packages/themes/default/src/theme.json`
- Modify: `packages/themes/default/scripts/build-theme.mjs`
- Modify: `packages/themes/default/test/build-theme.test.mjs`
- Modify: `packages/tokens/test/validate-theme.test.mjs`

**Interfaces:**

- Consumes: `resolveTokens` from Task 1.
- Produces: `contract.reducedMotion: string[]` — token names redefined under `@media (prefers-reduced-motion: reduce)`. `theme.reducedMotion` holds their values. `renderThemeCss` emits one extra block for them, last.

- [ ] **Step 1: Write the failing tests**

The existing theme-builder test file does not load the contract or theme. Before
appending the tests below, add JSON fixtures for both files (using `readFile`)
so the tests exercise the actual default theme and fail for the intended missing
`reducedMotion` feature rather than with an undefined test variable.

Its existing isolated `renderThemeCss` fixture must also add an empty
`reducedMotion: []` contract section and `reducedMotion: {}` theme section. The
new renderer intentionally reads this required interface unconditionally.

Append to `packages/themes/default/test/build-theme.test.mjs`:

```js
const REDUCED_MOTION_TOKENS = [
  '--slotted-duration-instant',
  '--slotted-duration-short',
  '--slotted-duration-medium',
  '--slotted-duration-long',
];
const REDUCED_MOTION_VALUES = {
  '--slotted-duration-instant': '1ms',
  '--slotted-duration-short': '1ms',
  '--slotted-duration-medium': '1ms',
  '--slotted-duration-long': '1ms',
};

function expectedReducedMotionBlock(themeName) {
  const declarations = REDUCED_MOTION_TOKENS.map((name) => `      ${name}: 1ms;`).join('\n');
  return (
    `  @media (prefers-reduced-motion: reduce) {\n` +
    `    [data-slotted-theme="${themeName}"] {\n` +
    `${declarations}\n` +
    `    }\n` +
    `  }`
  );
}

test('defines the exact reduced-motion duration tokens and non-zero collapsed values', () => {
  assert.deepEqual(contract.reducedMotion, REDUCED_MOTION_TOKENS);
  assert.deepEqual(theme.reducedMotion, REDUCED_MOTION_VALUES);
});

test('collapses every duration under the default theme selector', () => {
  const css = renderThemeCss(contract, theme);
  const queryStart = css.indexOf('@media (prefers-reduced-motion: reduce)');

  assert.notEqual(queryStart, -1, 'The theme emits no reduced-motion block');
  assert.equal(
    css.slice(queryStart - 2, queryStart - 2 + expectedReducedMotionBlock(theme.name).length),
    expectedReducedMotionBlock(theme.name),
  );
});

test('emits the reduced-motion block after the block it overrides', () => {
  const css = renderThemeCss(contract, theme);
  assert.ok(
    css.indexOf('@media (prefers-reduced-motion: reduce)') >
      css.indexOf('--slotted-duration-short'),
    'A media query adds no specificity, so source order is what makes the override win',
  );
});

test('emits the reduced-motion block as the final theme content', () => {
  const css = renderThemeCss(contract, theme);
  const queryStart = css.indexOf('@media (prefers-reduced-motion: reduce)');

  assert.notEqual(queryStart, -1, 'The theme emits no reduced-motion block');
  assert.equal(
    css.slice(queryStart),
    `${expectedReducedMotionBlock(theme.name).slice(2)}\n}\n`,
    'No later theme block may override reduced motion',
  );
});
```

Append to `packages/tokens/test/validate-theme.test.mjs`:

```js
test('reports a reduced-motion token the theme does not hold', () => {
  const contract = {
    base: [],
    scheme: [],
    density: [],
    reducedMotion: ['--slotted-duration-short'],
    requiredSchemes: [],
    requiredDensities: [],
  };
  const errors = validateTheme(contract, {
    base: {},
    schemes: {},
    densities: {},
    reducedMotion: {},
  });
  assert.deepEqual(errors, ['reducedMotion is missing --slotted-duration-short']);
});

test('reports a reduced-motion token outside the contract', () => {
  const contract = {
    base: [],
    scheme: [],
    density: [],
    reducedMotion: ['--slotted-duration-short'],
    requiredSchemes: [],
    requiredDensities: [],
  };
  const errors = validateTheme(contract, {
    base: {},
    schemes: {},
    densities: {},
    reducedMotion: {
      '--slotted-duration-short': '1ms',
      '--slotted-duration-long': '1ms',
    },
  });
  assert.deepEqual(errors, ['reducedMotion contains unknown token --slotted-duration-long']);
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test packages/themes/default/test/build-theme.test.mjs packages/tokens/test/validate-theme.test.mjs`
Expected: FAIL — `contract.reducedMotion` is `undefined`.

- [ ] **Step 3: Add the motion scale to the contract**

In `contract.json`, append to `base`:

```
"--slotted-duration-instant", "--slotted-duration-short",
"--slotted-duration-medium", "--slotted-duration-long",
"--slotted-easing-standard", "--slotted-easing-enter",
"--slotted-easing-exit", "--slotted-easing-emphasized"
```

and add a new top-level key after `base`:

```json
"reducedMotion": [
  "--slotted-duration-instant",
  "--slotted-duration-short",
  "--slotted-duration-medium",
  "--slotted-duration-long"
]
```

- [ ] **Step 4: Add the values to the theme**

In `theme.json` `base`, append:

```json
"--slotted-duration-instant": "1ms",
"--slotted-duration-short": "120ms",
"--slotted-duration-medium": "200ms",
"--slotted-duration-long": "320ms",
"--slotted-easing-standard": "cubic-bezier(0.2, 0, 0, 1)",
"--slotted-easing-enter": "cubic-bezier(0.05, 0.7, 0.1, 1)",
"--slotted-easing-exit": "cubic-bezier(0.3, 0, 0.8, 0.15)",
"--slotted-easing-emphasized": "cubic-bezier(0.3, 0, 0, 1.3)",
```

Redefine the two existing motion tokens:

```json
"--slotted-control-transition-duration": "var(--slotted-duration-short)",
"--slotted-control-transition-easing": "var(--slotted-easing-standard)",
```

Add a new top-level key after `base`:

```json
"reducedMotion": {
  "--slotted-duration-instant": "1ms",
  "--slotted-duration-short": "1ms",
  "--slotted-duration-medium": "1ms",
  "--slotted-duration-long": "1ms"
},
```

- [ ] **Step 5: Teach the validator about the section**

In `packages/tokens/src/validate-theme.mjs`, inside `validateTheme`, after the `base` check:

```js
checkTokenMap(errors, 'reducedMotion', contract.reducedMotion ?? [], theme.reducedMotion);
```

- [ ] **Step 6: Emit the block**

In `packages/themes/default/scripts/build-theme.mjs`, inside `renderThemeCss`, after the density loop and before the `return`:

```js
/**
 * One query collapses every duration token, so a family honours the
 * preference by reaching for a token rather than by writing its own rule.
 * It is emitted last because a media query adds no specificity: source
 * order is what makes it win.
 *
 * An animation that loops forever needs more than a short duration — it
 * needs to stop — so those families keep their own rule.
 */
blocks.push(
  `  @media (prefers-reduced-motion: reduce) {\n` +
    `    [data-slotted-theme="${theme.name}"] {\n` +
    `${contract.reducedMotion.map((name) => `      ${name}: ${theme.reducedMotion[name]};`).join('\n')}\n` +
    `    }\n  }`,
);
```

- [ ] **Step 7: Verify**

Run: `node --test packages/themes/default/test/build-theme.test.mjs packages/tokens/test/validate-theme.test.mjs packages/tokens/test/resolve.test.mjs`
Expected: PASS. The Task 1 preservation test still finds `120ms` and `cubic-bezier(0.2, 0, 0, 1)`.

- [ ] **Step 8: Commit**

```bash
git add packages/tokens/src/contract.json packages/tokens/src/validate-theme.mjs \
        packages/tokens/test/validate-theme.test.mjs \
        packages/themes/default/src/theme.json \
        packages/themes/default/scripts/build-theme.mjs \
        packages/themes/default/test/build-theme.test.mjs
git commit -F - <<'EOF'
feat(tokens): add the motion scale and collapse it once for reduced motion

Six families of roughly thirty handled prefers-reduced-motion, each with
its own block, which meant the other twenty-four honoured the preference
not at all.

The theme now redefines every duration token inside a single query, so a
family respects the preference by reaching for a token — there is
nothing left to forget. The block is emitted last because a media query
adds no specificity and source order is what makes the override win.

Durations collapse to 1ms rather than to zero: a zero-duration
transition fires no transitionend, and callers wait for it.

An animation that loops forever is not covered by a shorter duration; it
has to stop. Spinner and Skeleton keep their own rule, and Plan 2 adds
the test that requires one wherever `infinite` appears.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: Shadow and stacking

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/themes/default/src/theme.json`
- Modify: `packages/themes/default/test/build-theme.test.mjs`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: `--slotted-shadow-{xs,sm,md,lg}` in every scheme; `--slotted-z-index-{sticky,overlay,popover,toast}` in `base`.

- [ ] **Step 1: Lock the exact scale values in a focused test**

Before editing the configuration, add a focused `build-theme` test that
asserts the four shadow names and exact light and dark values, plus the four
z-index names and exact base values. If a new shadow or z-index value is
missing or `undefined`, the test must fail with an assertion diff.

```js
assert.deepEqual(
  contract.base.filter((token) => token.startsWith('--slotted-z-index-')),
  Z_INDEX_TOKENS,
);
```

Filter the z-index family before asserting its exact names and order; later
base-token families must not invalidate the stacking-scale regression.

Mutation check: temporarily change or remove one shadow and one z-index entry,
run `pnpm --filter @slotted/theme-default exec node --test test/build-theme.test.mjs`,
and record the expected RED assertion before restoring both mutations.

- [ ] **Step 2: Add to the contract**

Append to `contract.scheme`:

```
"--slotted-shadow-xs", "--slotted-shadow-sm", "--slotted-shadow-md", "--slotted-shadow-lg"
```

Append to `contract.base`:

```
"--slotted-z-index-sticky", "--slotted-z-index-overlay",
"--slotted-z-index-popover", "--slotted-z-index-toast"
```

- [ ] **Step 3: RED — run the validator after the contract edit**

Run: `pnpm --filter @slotted/theme-default verify`

Expected: FAIL with `base is missing --slotted-z-index-sticky` as the first
relevant error, followed by the remaining missing z-index and shadow entries
(not formatting or syntax errors). Record the failure before editing the
theme.

- [ ] **Step 4: Add the values to both schemes and to base**

In `theme.json` `schemes.light`, append:

```json
"--slotted-shadow-xs": "0 1px 2px rgb(15 23 42 / 0.06)",
"--slotted-shadow-sm": "0 1px 3px rgb(15 23 42 / 0.10), 0 1px 2px rgb(15 23 42 / 0.06)",
"--slotted-shadow-md": "0 4px 12px rgb(15 23 42 / 0.10)",
"--slotted-shadow-lg": "0 12px 32px rgb(15 23 42 / 0.14)",
```

In `schemes.dark`, append:

```json
"--slotted-shadow-xs": "0 1px 2px rgb(0 0 0 / 0.40)",
"--slotted-shadow-sm": "0 1px 3px rgb(0 0 0 / 0.50), 0 1px 2px rgb(0 0 0 / 0.40)",
"--slotted-shadow-md": "0 4px 12px rgb(0 0 0 / 0.55)",
"--slotted-shadow-lg": "0 12px 32px rgb(0 0 0 / 0.65)",
```

In `base`, append:

```json
"--slotted-z-index-sticky": "100",
"--slotted-z-index-overlay": "1000",
"--slotted-z-index-popover": "1100",
"--slotted-z-index-toast": "1200",
```

- [ ] **Step 5: Verify**

Run: `pnpm --filter @slotted/theme-default exec node --test test/build-theme.test.mjs && pnpm --filter @slotted/theme-default verify && pnpm --filter @slotted/tokens verify`
Expected: PASS. A missing entry in either scheme fails with `scheme dark is missing --slotted-shadow-xs`.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/contract.json packages/themes/default/src/theme.json
git commit -F - <<'EOF'
feat(tokens): add the shadow and stacking scales

Shadow sits in the scheme layer rather than in base, because a shadow
tuned for a light ground disappears on a dark one — the dark values are
darker and deeper rather than the same values reused.

Stacking is --slotted-z-index-* and not --slotted-layer-*, which would
have collided with the @layer slotted.components the stylesheets already
use. Nothing consumes it yet; Dialog is the first overlay and it is
cheaper to name the scale now than to have the first overlay invent one.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: Generalise the control geometry

Turns the Button-scoped density layer into a control-scoped one, which is the change that makes a Button and an Input the same height.

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/themes/default/src/theme.json`
- Modify: `packages/tokens/test/resolve.test.mjs`

**Interfaces:**

- Consumes: `resolveTokens` from Task 1.
- Produces: `--slotted-control-{height,padding-inline,font-size,icon-size,gap}-{sm,md,lg}` in the density layer. Every `--slotted-button-{height,padding-inline,font-size,icon-size}-{sm,md,lg}` becomes `var()` of its control counterpart.

- [ ] **Step 1: Write the failing test**

Append to `packages/tokens/test/resolve.test.mjs`:

```js
const DENSITY_UNCHANGED = {
  comfortable: {
    '--slotted-button-height-sm': '30px',
    '--slotted-button-height-md': '34px',
    '--slotted-button-height-lg': '38px',
    '--slotted-button-padding-inline-sm': '10px',
    '--slotted-button-padding-inline-md': '13px',
    '--slotted-button-padding-inline-lg': '16px',
    '--slotted-button-font-size-sm': '12px',
    '--slotted-button-font-size-md': '13px',
    '--slotted-button-font-size-lg': '14px',
    '--slotted-button-icon-size-sm': '14px',
    '--slotted-button-icon-size-md': '16px',
    '--slotted-button-icon-size-lg': '18px',
  },
  compact: {
    '--slotted-button-height-sm': '26px',
    '--slotted-button-height-md': '28px',
    '--slotted-button-height-lg': '32px',
    '--slotted-button-padding-inline-sm': '8px',
    '--slotted-button-padding-inline-md': '10px',
    '--slotted-button-padding-inline-lg': '12px',
    '--slotted-button-font-size-sm': '12px',
    '--slotted-button-font-size-md': '12px',
    '--slotted-button-font-size-lg': '13px',
    '--slotted-button-icon-size-sm': '13px',
    '--slotted-button-icon-size-md': '14px',
    '--slotted-button-icon-size-lg': '16px',
  },
};

test('every button geometry token still resolves to its old value', () => {
  for (const [density, expected] of Object.entries(DENSITY_UNCHANGED)) {
    const resolved = resolveTokens(theme.densities[density]);
    for (const [name, value] of Object.entries(expected)) {
      assert.equal(resolved[name], value, `${name} changed in ${density}`);
    }
  }
});

test('button geometry tokens alias control geometry, so a theme retunes controls once', () => {
  for (const [density, buttonGeometry] of Object.entries(DENSITY_UNCHANGED)) {
    for (const buttonToken of Object.keys(buttonGeometry)) {
      const controlToken = buttonToken.replace('--slotted-button-', '--slotted-control-');

      assert.equal(
        theme.densities[density][buttonToken],
        `var(${controlToken})`,
        `${density} ${buttonToken} must alias ${controlToken}`,
      );
    }
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test packages/tokens/test/resolve.test.mjs`
Expected: the alias test FAILS — each Button geometry token is still a literal rather
than the exact `var(--slotted-control-...)` alias. The first failure is
`comfortable --slotted-button-height-sm` with `30px`.

- [ ] **Step 3: Add the control geometry to the contract**

Insert at the **start** of `contract.density`, before the button names:

```
"--slotted-control-height-sm", "--slotted-control-height-md", "--slotted-control-height-lg",
"--slotted-control-padding-inline-sm", "--slotted-control-padding-inline-md",
"--slotted-control-padding-inline-lg",
"--slotted-control-font-size-sm", "--slotted-control-font-size-md",
"--slotted-control-font-size-lg",
"--slotted-control-icon-size-sm", "--slotted-control-icon-size-md",
"--slotted-control-icon-size-lg",
"--slotted-control-gap-sm", "--slotted-control-gap-md", "--slotted-control-gap-lg"
```

- [ ] **Step 4: Move the values and alias the button tokens**

Replace `theme.densities.comfortable` entirely with:

```json
{
  "--slotted-control-height-sm": "30px",
  "--slotted-control-height-md": "34px",
  "--slotted-control-height-lg": "38px",
  "--slotted-control-padding-inline-sm": "10px",
  "--slotted-control-padding-inline-md": "13px",
  "--slotted-control-padding-inline-lg": "16px",
  "--slotted-control-font-size-sm": "12px",
  "--slotted-control-font-size-md": "13px",
  "--slotted-control-font-size-lg": "14px",
  "--slotted-control-icon-size-sm": "14px",
  "--slotted-control-icon-size-md": "16px",
  "--slotted-control-icon-size-lg": "18px",
  "--slotted-control-gap-sm": "6px",
  "--slotted-control-gap-md": "8px",
  "--slotted-control-gap-lg": "8px",
  "--slotted-button-height-sm": "var(--slotted-control-height-sm)",
  "--slotted-button-height-md": "var(--slotted-control-height-md)",
  "--slotted-button-height-lg": "var(--slotted-control-height-lg)",
  "--slotted-button-padding-inline-sm": "var(--slotted-control-padding-inline-sm)",
  "--slotted-button-padding-inline-md": "var(--slotted-control-padding-inline-md)",
  "--slotted-button-padding-inline-lg": "var(--slotted-control-padding-inline-lg)",
  "--slotted-button-font-size-sm": "var(--slotted-control-font-size-sm)",
  "--slotted-button-font-size-md": "var(--slotted-control-font-size-md)",
  "--slotted-button-font-size-lg": "var(--slotted-control-font-size-lg)",
  "--slotted-button-icon-size-sm": "var(--slotted-control-icon-size-sm)",
  "--slotted-button-icon-size-md": "var(--slotted-control-icon-size-md)",
  "--slotted-button-icon-size-lg": "var(--slotted-control-icon-size-lg)"
}
```

Replace `theme.densities.compact` entirely with:

```json
{
  "--slotted-control-height-sm": "26px",
  "--slotted-control-height-md": "28px",
  "--slotted-control-height-lg": "32px",
  "--slotted-control-padding-inline-sm": "8px",
  "--slotted-control-padding-inline-md": "10px",
  "--slotted-control-padding-inline-lg": "12px",
  "--slotted-control-font-size-sm": "12px",
  "--slotted-control-font-size-md": "12px",
  "--slotted-control-font-size-lg": "13px",
  "--slotted-control-icon-size-sm": "13px",
  "--slotted-control-icon-size-md": "14px",
  "--slotted-control-icon-size-lg": "16px",
  "--slotted-control-gap-sm": "4px",
  "--slotted-control-gap-md": "6px",
  "--slotted-control-gap-lg": "6px",
  "--slotted-button-height-sm": "var(--slotted-control-height-sm)",
  "--slotted-button-height-md": "var(--slotted-control-height-md)",
  "--slotted-button-height-lg": "var(--slotted-control-height-lg)",
  "--slotted-button-padding-inline-sm": "var(--slotted-control-padding-inline-sm)",
  "--slotted-button-padding-inline-md": "var(--slotted-control-padding-inline-md)",
  "--slotted-button-padding-inline-lg": "var(--slotted-control-padding-inline-lg)",
  "--slotted-button-font-size-sm": "var(--slotted-control-font-size-sm)",
  "--slotted-button-font-size-md": "var(--slotted-control-font-size-md)",
  "--slotted-button-font-size-lg": "var(--slotted-control-font-size-lg)",
  "--slotted-button-icon-size-sm": "var(--slotted-control-icon-size-sm)",
  "--slotted-button-icon-size-md": "var(--slotted-control-icon-size-md)",
  "--slotted-button-icon-size-lg": "var(--slotted-control-icon-size-lg)"
}
```

- [ ] **Step 5: Verify**

Run: `node --test packages/tokens/test/resolve.test.mjs && pnpm --filter @slotted/theme-default verify`
Expected: PASS. The resolver expands each alias and finds the same pixel values the library shipped.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/contract.json packages/themes/default/src/theme.json \
        packages/tokens/test/resolve.test.mjs
git commit -F - <<'EOF'
feat(tokens): generalise the control geometry out of Button

The density layer already had the right shape and the wrong scope: it
held a height, a padding, a font size and an icon size, all named for
Button alone. Every other control invented its own — which is why an
Input is 36px tall beside a 34px Button today.

The geometry becomes control-scoped and the twelve Button tokens become
aliases of it, so they keep their names, keep their values, and a theme
retunes every control once instead of per family. A test resolves each
alias and holds it to the pixel value it shipped with.

A gap joins them, which Button carried in base as a rem value density
never reached.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: The intrinsic glyphs

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/themes/default/src/theme.json`
- Create: `packages/themes/default/test/glyphs.test.mjs`
- Modify: `packages/themes/default/package.json` (add the test to the `test` script)

**Interfaces:**

- Produces: `--slotted-icon-{check,minus,dot,x,chevron-right,chevron-down}` in `base`, each a `url("data:image/svg+xml,…")` usable as a `mask-image`.

- [ ] **Step 1: Write the failing test**

Create `packages/themes/default/test/glyphs.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const theme = JSON.parse(await readFile(new URL('../src/theme.json', import.meta.url), 'utf8'));

const GLYPHS = [
  '--slotted-icon-check',
  '--slotted-icon-minus',
  '--slotted-icon-dot',
  '--slotted-icon-x',
  '--slotted-icon-chevron-right',
  '--slotted-icon-chevron-down',
];

function payloadFor(name) {
  const value = theme.base[name];
  assert.ok(value !== undefined, `${name} is missing`);

  const match = /^url\("data:image\/svg\+xml,([^"]*)"\)$/.exec(value);
  assert.ok(match, `${name} is not a complete SVG data URI`);
  return match[1];
}

test('every glyph has a fully encoded, complete SVG payload a mask can use', () => {
  for (const name of GLYPHS) {
    const payload = payloadFor(name);
    assert.doesNotMatch(payload, /[<>#]/, `${name} leaves SVG syntax unencoded`);

    const svg = decodeURIComponent(payload);
    assert.match(svg, /^<svg\b[^>]*>[\s\S]*<\/svg>$/, `${name} is not a complete SVG document`);
  }
});

test('every glyph uses black or none only for its mask alpha geometry', () => {
  for (const name of GLYPHS) {
    const svg = decodeURIComponent(payloadFor(name));
    const attributes = [...svg.matchAll(/\b(fill|stroke)=['"]([^'"]+)['"]/g)];
    assert.ok(attributes.length > 0, `${name} has no fill or stroke alpha geometry`);

    for (const [, attribute, value] of attributes) {
      assert.ok(
        value === 'black' || value === 'none',
        `${name} uses ${value} for ${attribute}, not black or none mask alpha geometry`,
      );
    }
  }
});

test('every glyph declares the same viewBox, so one size rule fits all', () => {
  for (const name of GLYPHS) {
    const svg = decodeURIComponent(payloadFor(name));
    assert.ok(svg.includes("viewBox='0 0 24 24'"), `${name} has a foreign viewBox`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test packages/themes/default/test/glyphs.test.mjs`
Expected: FAIL — `--slotted-icon-check is missing`.

- [ ] **Step 3: Add the names to the contract**

Append to `contract.base`:

```
"--slotted-icon-check", "--slotted-icon-minus", "--slotted-icon-dot",
"--slotted-icon-x", "--slotted-icon-chevron-right", "--slotted-icon-chevron-down"
```

- [ ] **Step 4: Add the geometry to the theme**

Append to `theme.json` `base`. The paths are Lucide's; `black` and `none` define alpha geometry only because a mask reads alpha while the element's `background-color` supplies the visible colour. The test requires every `fill` and `stroke` attribute to use only one of those two values, with a fully encoded payload that decodes to one complete SVG document:

```json
"--slotted-icon-check": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")",
"--slotted-icon-minus": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E\")",
"--slotted-icon-dot": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3C/svg%3E\")",
"--slotted-icon-x": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M18 6 6 18M6 6l12 12'/%3E%3C/svg%3E\")",
"--slotted-icon-chevron-right": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E\")",
"--slotted-icon-chevron-down": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
```

`check` and `minus` carry `stroke-width='3'` rather than Lucide's `2`: both are drawn small inside a filled box, where a two-unit stroke reads thin. That is a deliberate departure and the only one.

- [ ] **Step 5: Register the test and verify**

Add `test/glyphs.test.mjs` to the `test` script in `packages/themes/default/package.json`, then run:

`pnpm --filter @slotted/theme-default verify`
Expected: PASS.

- [ ] **Step 6: Prove one glyph renders, rather than assuming it**

Write `/tmp/glyph-check.html` reading the built theme, or reuse the probe shape:

```bash
node -e "
const t=require('./packages/themes/default/src/theme.json');
const url=t.base['--slotted-icon-check'];
require('node:fs').writeFileSync('/tmp/glyph-check.html',
  '<!doctype html><body style=\"margin:0;background:#fff\">'+
  '<i style=\"display:block;inline-size:48px;block-size:48px;background-color:#1d4ed8;'+
  '-webkit-mask:'+url+' center/contain no-repeat;mask:'+url+' center/contain no-repeat\"></i>');
"
google-chrome --headless --disable-gpu --no-sandbox --screenshot=/tmp/glyph-check.png --window-size=48,48 /tmp/glyph-check.html
```

Open `/tmp/glyph-check.png` and confirm a blue check mark. A blank image means the data URI is malformed — most likely an unescaped `<`, `>` or `#`.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens/src/contract.json packages/themes/default/src/theme.json \
        packages/themes/default/test/glyphs.test.mjs packages/themes/default/package.json
git commit -F - <<'EOF'
feat(tokens): add the glyphs a component owns

The existing icon design answers icons the consumer supplies, which is
right for a Button's leading glyph and leaves nothing for a Checkbox's
check — asking a consumer to supply that is like asking them to supply
the border. Breadcrumb drew its separator as the character "/" and Field
drew its required marker as "*" for exactly this reason.

The glyphs are masks in the theme, so both frameworks receive the same
drawing with no duplicated markup, the colour comes from currentColor,
and a theme substitutes one by pointing the token elsewhere. They are
named for the drawing rather than the use, because one chevron serves
Breadcrumb, Select and Accordion.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 6: Resolve the inherited naming collision

**Files:**

- Modify: `packages/tokens/src/contract.json`
- Modify: `packages/themes/default/src/theme.json`
- Modify: `packages/styles/src/button/button.css`
- Modify: `packages/styles/src/button/button.tokens.json`
- Modify: `packages/tokens/test/resolve.test.mjs`
- Modify: `packages/styles/src/button/button.styles.test.mjs`
- Modify: `docs/superpowers/plans/2026-08-31-token-foundation.md`
- Modify: `docs/superpowers/specs/2026-08-31-component-foundation-and-craft-skill-design.md`

**Interfaces:**

- Consumes: `--slotted-control-icon-size-{sm,md,lg}` from Task 4.
- Produces: `--slotted-button-icon-size` removed from `base`; the stylesheet reads the density-scoped names with a direct `1em` fallback instead.

- [ ] **Step 1: Find every use**

Run: `rg -n --fixed-strings -- '--slotted-button-icon-size' packages/tokens/src/contract.json packages/themes/default/src/theme.json packages/styles/src/button/button.css packages/styles/src/button/button.tokens.json packages/tokens/test/resolve.test.mjs packages/styles/src/button/button.styles.test.mjs`

Expected: the unsized base token appears in contract, theme, `button.css`, and `button.tokens.json`; the three CSS size rules use nested fallbacks. Density-scoped `sm`, `md`, and `lg` names are legitimate and remain.

- [ ] **Step 2: Write focused failing tests**

In `packages/tokens/test/resolve.test.mjs`, assert that `theme.base['--slotted-button-icon-size']` is absent, with a naming-collision message. In `packages/styles/src/button/button.styles.test.mjs`, derive every size from `contract.axes.size` and assert its matching size rule has this exact declaration:

```
--_button-icon-size: var(--slotted-button-icon-size-{size}, 1em);
```

- [ ] **Step 3: Run the tests and watch them fail**

Run: `node --test packages/tokens/test/resolve.test.mjs packages/styles/src/button/button.styles.test.mjs`

Expected: FAIL because `theme.base['--slotted-button-icon-size']` equals `1em`, and the `sm` size rule lacks the exact declaration `--_button-icon-size: var(--slotted-button-icon-size-sm, 1em);` because it contains the nested unsized fallback.

- [ ] **Step 4: Point each size rule at its size-scoped token**

In `packages/styles/src/button/button.css`, replace the current nested declaration in each matching size rule with a direct fallback: `var(--slotted-button-icon-size-sm, 1em)` in `sm`, and likewise for `md` and `lg`. Do not introduce nested duplicate fallbacks. No declaration outside a size rule changes.

- [ ] **Step 5: Remove the ambiguous token**

Delete `"--slotted-button-icon-size"` from `contract.base` and from `theme.base`. The twelve size-scoped names stay.

- [ ] **Step 6: Regenerate the token list**

```bash
node -e "
const { readFileSync, writeFileSync } = require('node:fs');
const css = [
  readFileSync('packages/styles/src/button/button.css', 'utf8'),
  readFileSync('packages/styles/src/button/button-group.css', 'utf8'),
].join('\n');
const tokens = [...new Set([...css.matchAll(/var\(\s*(--slotted-[a-z0-9-]+)/g)].map((m) => m[1]))].sort();
writeFileSync('packages/styles/src/button/button.tokens.json', JSON.stringify(tokens, null, 2) + '\n');
"
```

- [ ] **Step 7: Correct the design-spec history**

Update `docs/superpowers/specs/2026-08-31-component-foundation-and-craft-skill-design.md` to describe the naming collision in past tense, its removal, and the direct density-scoped fallback in every Button size rule.

- [ ] **Step 8: Verify the focused tests and full repository**

Run: `node --test packages/tokens/test/resolve.test.mjs packages/styles/src/button/button.styles.test.mjs`

Expected: PASS.

Run: `pnpm check:full`
Expected: exit 0. If a Button visual test fails, the substitution in Step 4 put a density-scoped value where `1em` belonged; revisit that line.

- [ ] **Step 9: Commit**

```bash
git add packages/tokens/src/contract.json packages/themes/default/src/theme.json \
        packages/styles/src/button/button.css packages/styles/src/button/button.tokens.json \
        packages/tokens/test/resolve.test.mjs \
        packages/styles/src/button/button.styles.test.mjs \
        docs/superpowers/plans/2026-08-31-token-foundation.md \
        docs/superpowers/specs/2026-08-31-component-foundation-and-craft-skill-design.md
git commit -F - <<'EOF'
fix(tokens): remove the icon-size name that meant two things

--slotted-button-icon-size held 1em in base while
--slotted-button-icon-size-{sm,md,lg} held pixel values in density. The
same prefix meant "follow the text" in one place and "this many pixels"
in another, which is a name that cannot be read correctly.

The stylesheet now says which one it means at each use, and the
ambiguous token is gone. It is removed rather than renamed because the
package is unpublished and nothing outside the repository reads it.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 7: Document the foundation for the skill to cite

**Files:**

- Create: `docs/token-foundation.md`
- Create: `scripts/verify-token-foundation.test.mjs`
- Modify: `docs/BUILD-LOG.md`
- Modify: `package.json`

**Interfaces:**

- Produces: the document `references/foundation.md` in Plan 3 links to, so the law lives in the repository rather than inside a skill.

- [ ] **Step 1: Write the focused foundation test and observe RED**

Create `scripts/verify-token-foundation.test.mjs`. It reads the final contract,
default theme, foundation reference, and Build Log. Data-drive every foundation
group from the contract and theme, then assert exact token/name/value parity in
the appropriate documentation context: base space, radius, type, motion,
stacking, and glyph values; light and dark shadow values; comfortable and
compact control geometry with legacy Button aliases; and reduced-motion values.
It must verify required contract names and preserve scheme and density context,
so swapped values cannot pass. Its parity is bidirectional: each table has the
source-derived cardinality exactly, with no stale or duplicate token rows, and
variant tables assert their `Token`/scheme/density headers. It also holds the
migration scope and precise reduced-motion law: newly created or refined
families are bound, existing unrefined families may still contain literals and
ad-hoc motion, only the four motion-scale duration tokens collapse, existing
family-specific durations are not automatic, and infinite animations stop or
disable rather than shorten.

Run `node --test scripts/verify-token-foundation.test.mjs`. On a fresh base,
the initial RED is the missing/ENOENT `docs/token-foundation.md`; the later
review hardening proves the absent migration scope and precise reduced-motion
wording after the reference exists. The data-parity assertions then pass.

- [ ] **Step 2: Write the reference and make the test GREEN**

Create `docs/token-foundation.md` holding one table per scale — the token names, their values, and one sentence on what each answers — plus these four rules stated explicitly:

1. A component token's fallback is another token, never a literal. Exempt: `0`, `none`, `auto`, `100%`, `transparent`, `currentColor`, `inherit`.
2. For newly created or refined families, durations and easings come only from the motion scale. A motion-scale duration token honors `prefers-reduced-motion`; only the four motion-scale duration tokens collapse, and infinite animations stop or disable rather than shorten. Existing unrefined families may still have literal or family-specific motion until migrated.
3. An icon the component owns is a mask from a glyph token. A character is never an icon.
4. A container breakpoint cannot be a token, because `@container (min-width: var(--x))` is invalid CSS. A family that reflows declares `container-type: inline-size` and its own `container-name`, and writes its breakpoints literally.

- [ ] **Step 3: Record the entry**

Append an entry to `docs/BUILD-LOG.md` before the "Where the queue stands" section, naming: the scales added, the value-preservation property and the test that holds it, the scoped reduced-motion collapse, the glyph masks, and the fact that no component stylesheet consumes any of it yet.

- [ ] **Step 4: Register, verify, and commit**

Add `scripts/verify-token-foundation.test.mjs` beside
`scripts/verify-docs-snippets.test.mjs` in `package.json`'s `test:docs` command
without removing the existing test. Run the focused test, `pnpm check`, and
`pnpm check:full`.

Format exactly the changed files and stage exactly:
`docs/token-foundation.md`, `docs/BUILD-LOG.md`,
`scripts/verify-token-foundation.test.mjs`, `package.json`, and this plan.

```bash
git add docs/token-foundation.md docs/BUILD-LOG.md \
  scripts/verify-token-foundation.test.mjs package.json \
  docs/superpowers/plans/2026-08-31-token-foundation.md
git commit -F - <<'EOF'
docs: write down the token foundation the skill will enforce

The law belongs in the repository rather than inside a skill, so a
reader who never invokes the skill still finds it and the skill has
something to cite instead of restate.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 8: Enforce exact theme variants and frozen resolver inputs

This task was added after final independent review found the plan's exact contract/theme lockstep claim was incomplete for variant-map names: `validateTheme` compared tokens inside required maps but never compared the scheme and density map names themselves.

**Files:**

- Modify: `packages/tokens/src/validate-theme.mjs`
- Modify: `packages/tokens/test/validate-theme.test.mjs`
- Modify: `packages/tokens/test/resolve.test.mjs`
- Modify: `docs/superpowers/plans/2026-08-31-token-foundation.md`

**Interfaces:**

- `validateTheme(contract, theme)` requires scheme and density variant names to correspond exactly to `contract.requiredSchemes` and `contract.requiredDensities`. Missing names return `scheme is missing required variant <name>` or `density is missing required variant <name>`; extras return `scheme contains unknown variant <name>` or `density contains unknown variant <name>`. Every base, reduced-motion, variant-container, and required variant token map accepts only a non-null, non-array object; absent, null, primitive, and array values normalize to an empty map while preserving the existing scope-specific missing errors and their order.
- `resolveTokens(values)` reads frozen authored maps without mutating them.

- [ ] **Step 1: Test-first RED**

In `packages/tokens/test/validate-theme.test.mjs`, clone the valid theme. Add `schemes.typo` and assert exactly `scheme contains unknown variant typo`; add `densities.typo` and assert exactly `density contains unknown variant typo`. Delete `schemes.dark` and assert exactly `scheme is missing required variant dark`; delete `densities.compact` and assert exactly `density is missing required variant compact`. Table-drive absent, undefined, null, string, number, and array scheme/density containers separately, keeping the other container valid; each scheme case must return `scheme is missing required variant light` then `scheme is missing required variant dark`, and each density case must return `density is missing required variant comfortable` then `density is missing required variant compact`, with no thrown `TypeError`. Reuse the malformed-value table for base, reduced-motion, `schemes.light`, and `densities.comfortable`: assert only `base is missing --base`, `reducedMotion is missing --slotted-duration-short`, `scheme light is missing --scheme`, or `density comfortable is missing --density`, respectively. Preserve missing-required-variant errors for actually deleted required maps.

In `packages/tokens/test/resolve.test.mjs`, freeze shallow clones of `theme.base` and one real density map, snapshot both, resolve them, assert representative resolved values, and assert both frozen maps still deep-equal their snapshots.

Run: `node --test packages/tokens/test/validate-theme.test.mjs`

Expected RED: unknown variants currently return `[]`, missing whole maps currently produce token-missing errors rather than missing-required-variant errors, primitive containers throw from the `in` operator, and arrays add an unknown index error after the missing errors.

Mutation-proof the resolver test by temporarily changing `resolveTokens` to operate on `values` rather than its clone. Run `node --test packages/tokens/test/resolve.test.mjs` and observe the frozen-map test throw on assignment. Restore the resolver; do not commit a `resolve.mjs` change.

- [ ] **Step 2: Minimal implementation**

In `packages/tokens/src/validate-theme.mjs`, add one shared helper that normalizes any null, primitive, or array value to `{}`; only a non-null, non-array object is a map. Use it in both `checkTokenMap` and `checkVariantMaps`, so base, reduced-motion, outer variants, and nested required maps aggregate scoped missing errors rather than throwing or treating array indexes as unknown names. Iterate required variants in contract order: emit the exact missing-required-variant error when absent, otherwise call existing `checkTokenMap` with its existing scoped label, preserving token-level semantics. Then iterate actual map keys in object-key order and emit the exact unknown-variant error for every key outside the required set. `assertValidTheme` then prevents `renderThemeCss` from emitting unknown maps; no builder change is required.

- [ ] **Step 3: GREEN and full gate**

Run:

```bash
node --test packages/tokens/test/validate-theme.test.mjs packages/tokens/test/resolve.test.mjs
pnpm --filter @slotted/tokens verify
pnpm --filter @slotted/theme-default verify
prettier --write packages/tokens/src/validate-theme.mjs packages/tokens/test/validate-theme.test.mjs packages/tokens/test/resolve.test.mjs docs/superpowers/plans/2026-08-31-token-foundation.md
pnpm check
pnpm check:full
```

Expected GREEN: all commands exit 0. Re-run the extra-variant and primitive-container reproductions; confirm extras return the new unknown-variant errors and malformed base, reduced-motion, and nested maps return their existing ordered scoped missing errors without throwing.

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/src/validate-theme.mjs packages/tokens/test/validate-theme.test.mjs packages/tokens/test/resolve.test.mjs docs/superpowers/plans/2026-08-31-token-foundation.md
git commit -m "fix(tokens): reject unknown theme variants" -m "The validator compared every token inside the required scheme and density maps but never compared the map names themselves. A misspelled or stale variant therefore passed validation and the theme builder emitted it as a selector outside the contract.

Scheme and density names now correspond in both directions: required variants must exist, unknown variants are rejected, and token checking inside each valid map keeps its existing scoped errors.

The resolver harness also proves it can read frozen authored maps without mutating them, so value-preservation checks do not depend on writable inputs.

This task was added after the final independent review found the written plan's exact contract/theme lockstep claim was incomplete for variant map names.

Quality review then found primitive and array containers could throw or leak unknown index errors instead of aggregating validation errors, so the validator, tests, and plan now normalize them before checking variants.

Repeat final review found the same gap in base, reduced-motion, and nested required maps, so one shared normalizer now keeps every token-map boundary on the aggregation path.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## What this plan does not do

No component stylesheet consumes a scale when this plan finishes, except Button's one-line correction in Task 6. That is deliberate: consuming the scales is a visual change to a shipped component, and every such change goes through the craft skill's human gate.

Plan 2 adds the five tests and `unrefined.json`. Plan 3 builds the harness and the skill, and proves both by refining Breadcrumb.
