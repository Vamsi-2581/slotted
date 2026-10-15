# Theme axis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `data-slotted-theme` a real axis: the renderer and the theme
conformance suite move to `@slotted/tokens`, a second theme package proves the
axis, and both workbenches switch between themes from the toolbar.

**Architecture:** `@slotted/tokens` gains `render-theme.mjs`,
`theme-conformance.mjs` and a `slotted-build-theme` bin. A theme package holds
a `theme.json`, a manifest and a three-line test. `@slotted/theme-aurora`
disagrees with the default on colour, corner, border, spacing, type and
motion, and is held to the same suite.

**Tech Stack:** Node ESM, `node:test`, pnpm workspaces, Turborepo, Storybook 9
(React and Angular), plain CSS custom properties.

**Spec:** `docs/history/designs/2026-09-03-theme-axis-design.md`

## Global Constraints

- Every emitted block stays namespaced by `theme.name`. The renderer is not
  changed to drop the namespace.
- No contract token becomes optional in this plan. A theme states all 348
  entries.
- Comments follow the repository voice: they state why a rule exists, never
  what the next line does.
- `pnpm --filter <package> verify` is the gate for every package touched.
- Rank of a theme package is 11; it may depend on `@slotted/tokens` (10) and
  on nothing else in the workspace.

---

### Task 1: Move the renderer into `@slotted/tokens`

**Files:**
- Create: `packages/tokens/src/render-theme.mjs`
- Create: `packages/tokens/scripts/build-theme-cli.mjs`
- Modify: `packages/tokens/package.json`
- Modify: `packages/theme-default/package.json`
- Delete: `packages/theme-default/scripts/build-theme.mjs`
- Modify: `packages/theme-default/test/build-theme.test.mjs`

**Interfaces:**
- Produces: `renderThemeCss(contract, theme) -> string` from
  `@slotted/tokens/render-theme`.
- Produces: bin `slotted-build-theme`, run from a theme package directory. It
  reads `./src/theme.json`, validates it against the contract, and writes
  `./dist/styles.css`.

- [ ] **Step 1: Create `packages/tokens/src/render-theme.mjs`**

Move `tokenNames`, `reducedMotionNames`, `forcedColorMap`, `declarations`,
`schemeSelectors`, `densitySelectors`, `UA_SCHEME` and `renderThemeCss` out of
`packages/theme-default/scripts/build-theme.mjs` unchanged, including their
comments. Import `LAYER_ORDER_STATEMENT` from `./layer-order.mjs`.

- [ ] **Step 2: Create the CLI**

```js
#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { contract } from '../src/contract.mjs';
import { renderThemeCss } from '../src/render-theme.mjs';
import { assertValidTheme } from '../src/validate-theme.mjs';

/**
 * A theme package owns a `theme.json` and nothing executable. The renderer is
 * one implementation for every theme, so a second theme cannot drift from the
 * first by copying a build script and editing it.
 */
const root = pathToFileURL(`${process.cwd()}/`);
const theme = JSON.parse(await readFile(new URL('src/theme.json', root), 'utf8'));

assertValidTheme(contract, theme);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/styles.css', root), renderThemeCss(contract, theme));
```

- [ ] **Step 3: Declare the export and the bin**

In `packages/tokens/package.json` add `"./render-theme": "./src/render-theme.mjs"`
to `exports`, add `"bin": { "slotted-build-theme": "./scripts/build-theme-cli.mjs" }`,
and add `node --check src/render-theme.mjs && node --check scripts/build-theme-cli.mjs`
to `typecheck`.

- [ ] **Step 4: Point the default theme at the bin**

In `packages/theme-default/package.json` set `"build": "slotted-build-theme"`
and drop the `typecheck` reference to the deleted script, leaving
`"typecheck": "node --check src/theme.json"` replaced by `"typecheck": "true"`
only if no executable file remains. Delete
`packages/theme-default/scripts/build-theme.mjs`.

- [ ] **Step 5: Repoint the test import**

In `packages/theme-default/test/build-theme.test.mjs` replace
`import { renderThemeCss } from '../scripts/build-theme.mjs';` with
`import { renderThemeCss } from '@slotted/tokens/render-theme';`.

- [ ] **Step 6: Verify**

Run: `pnpm --filter @slotted/tokens verify && pnpm --filter @slotted/theme-default verify`
Expected: both pass, and `packages/theme-default/dist/styles.css` is
unchanged against `git diff`.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens packages/theme-default
git commit -m "refactor(tokens): own the theme renderer"
```

---

### Task 2: Extract the conformance suite

**Files:**
- Create: `packages/tokens/src/theme-conformance.mjs`
- Create: `packages/theme-default/test/theme.test.mjs`
- Create: `packages/theme-default/test/default-theme.test.mjs`
- Delete: `packages/theme-default/test/build-theme.test.mjs`
- Delete: `packages/theme-default/test/contrast.test.mjs`
- Delete: `packages/theme-default/test/glyphs.test.mjs`
- Modify: `packages/tokens/package.json`

**Interfaces:**
- Produces: `themeConformance({ contract, theme, distUrl })` from
  `@slotted/tokens/theme-conformance`. It registers `node:test` cases. `distUrl`
  is a `URL` for the built stylesheet; when absent the built-file case is
  skipped.
- Produces: `contrast(first, second) -> number`, exported from the same module
  so a theme package can assert its own ratios.

- [ ] **Step 1: Write the suite**

Carry over, unchanged in substance and comment, every case from the three
deleted files that reads only `contract` and `theme`:

From `build-theme.test.mjs`: independent scopes, `color-scheme` per scheme,
reduced-motion block position and content, coarse-pointer growth, forced-colour
mapping, layer-order prefix, built-file layer-order prefix.

From `contrast.test.mjs`: per-scheme solid ratios, text on every surface,
inverse surface, border and focus ring at 3:1, control edge lighter than the
surface separator, tinted ground readable, disabled text legible, one corner
token for controls.

From `glyphs.test.mjs`: complete encoded payload, black-or-none alpha
geometry, shared `viewBox`.

Replace the exact-value assertion on `theme.reducedMotion` with the rule it
stands for: every collapsed duration parses as a positive duration of at most
`1ms`.

- [ ] **Step 2: Leave the default theme's identity in its own file**

`packages/theme-default/test/default-theme.test.mjs` keeps the assertions
that state what the default theme chose: `SHADOW_VALUES`, `Z_INDEX_VALUES`,
`REDUCED_MOTION_VALUES`, white on accent, success and danger solids, and the
neutral secondary palette in `light` and `dark`.

- [ ] **Step 3: Write the theme's three-line suite entry**

```js
import { contract } from '@slotted/tokens/contract';
import { themeConformance } from '@slotted/tokens/theme-conformance';

import theme from '../src/theme.json' with { type: 'json' };

themeConformance({
  contract,
  theme,
  distUrl: new URL('../dist/styles.css', import.meta.url),
});
```

- [ ] **Step 4: Declare the export**

Add `"./theme-conformance": "./src/theme-conformance.mjs"` to
`packages/tokens/package.json` exports and to its `typecheck`.

- [ ] **Step 5: Verify**

Run: `pnpm --filter @slotted/theme-default verify`
Expected: the same number of assertions as before the split, all passing.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens packages/theme-default
git commit -m "refactor(tokens): own the theme conformance suite"
```

---

### Task 3: Make the theme axis switchable

**Files:**
- Modify: `tools/storybook-workbench/src/globals.tsx`
- Modify: `tools/storybook-workbench/src/globals.test.ts`

**Interfaces:**
- Produces: `THEMES` — a readonly tuple of theme names, and `WorkbenchTheme`.
- Produces: `resolveWorkbenchGlobals(globals).theme` — one of `THEMES`,
  falling back to `default`.

- [ ] **Step 1: Write the failing test**

```ts
it('resolves a theme the toolbar offers and falls back to the default', () => {
  expect(resolveWorkbenchGlobals({ theme: 'aurora' })).toMatchObject({ theme: 'aurora' });
  expect(resolveWorkbenchGlobals({ theme: 'sepia' })).toMatchObject({ theme: 'default' });
  expect(GLOBAL_TYPES.theme.toolbar.items).toEqual([...THEMES]);
});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter @slotted/storybook-workbench test -- globals`
Expected: FAIL — `theme` resolves to `default` for `aurora`.

- [ ] **Step 3: Implement**

Add `export const THEMES = ['default', 'aurora'] as const;`, type
`WorkbenchTheme`, set `items: [...THEMES] as string[]`, and replace the
literal in the resolver with `oneOf(THEMES, globals?.['theme'], 'default')`.
Record in a comment that the attribute value is what selects the theme's
block, so a name the stylesheet does not carry leaves the subtree unthemed.

- [ ] **Step 4: Run the suite**

Run: `pnpm --filter @slotted/storybook-workbench test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tools/storybook-workbench
git commit -m "feat(workbench): switch themes from the toolbar"
```

---

### Task 4: Add `@slotted/theme-aurora`

**Files:**
- Create: `packages/themes/aurora/package.json`
- Create: `packages/themes/aurora/src/theme.json`
- Create: `packages/themes/aurora/test/theme.test.mjs`

**Interfaces:**
- Consumes: `slotted-build-theme` and `themeConformance` from Tasks 1 and 2.
- Produces: `@slotted/theme-aurora/styles.css`, emitting
  `[data-slotted-theme="aurora"]`.

- [ ] **Step 1: Write the manifest**

Copy `packages/theme-default/package.json`, renaming to
`@slotted/theme-aurora`.

- [ ] **Step 2: Author the theme**

`name` is `aurora`. It states all 348 entries. It differs from the default on
every axis a theme can move: a violet accent, a warm neutral secondary, a
serif family, `--slotted-control-radius` at `var(--slotted-radius-full)`,
2px control borders, a wider space scale, and durations of 180ms, 280ms and
420ms on emphasized easing curves. Icon payloads and stacking indices are
carried over unchanged.

- [ ] **Step 3: Write the suite entry**

The three-line file from Task 2 Step 3, unchanged.

- [ ] **Step 4: Verify**

Run: `pnpm --filter @slotted/theme-aurora verify`
Expected: PASS. A contrast failure is a palette defect, not a suite defect:
fix the palette.

- [ ] **Step 5: Confirm the emitted namespace**

Run: `head -4 packages/themes/aurora/dist/styles.css`
Expected: the layer statement, then `[data-slotted-theme="aurora"] {`.

- [ ] **Step 6: Commit**

```bash
git add packages/themes/aurora
git commit -m "feat(theme-aurora): add a second theme"
```

---

### Task 5: Register the theme across the workspace

**Files:**
- Modify: `scripts/verify-package-layers.mjs`
- Modify: `scripts/verify-package-layers.test.mjs`
- Modify: `turbo.json`
- Modify: `package.json`
- Modify: `apps/storybook-react/package.json`
- Modify: `apps/storybook-react/.storybook/preview.tsx`
- Modify: `apps/storybook-angular/package.json`
- Modify: `apps/storybook-angular/.storybook/preview.ts`
- Modify: `tools/harness/build.mjs`

**Interfaces:**
- Consumes: `@slotted/theme-aurora/styles.css` from Task 4.

- [ ] **Step 1: Rank theme packages by name**

In `scripts/verify-package-layers.mjs`, resolve an unlisted
`@slotted/theme-*` package to rank 11 rather than leaving it unranked, so a
theme added later is checked without being enumerated. Add the case to
`scripts/verify-package-layers.test.mjs`.

- [ ] **Step 2: Build both themes**

Add `@slotted/theme-aurora#build` to the `dependsOn` list in `turbo.json` and
`--filter @slotted/theme-aurora` to `build:tokens` in the root `package.json`.

- [ ] **Step 3: Load both stylesheets**

Add `@slotted/theme-aurora` to both Storybook manifests and
`import '@slotted/theme-aurora/styles.css';` beside the existing theme import
in both previews. Both stylesheets carry disjoint selectors, so loading both
is what lets the toolbar switch without a reload.

- [ ] **Step 4: Let the harness take a theme**

In `tools/harness/build.mjs`, read the theme name from a `--theme` argument,
defaulting to `default`, and read
`packages/themes/<name>/dist/styles.css`.

- [ ] **Step 5: Verify**

Run: `pnpm install && pnpm build:tokens && pnpm verify`
Expected: PASS.

- [ ] **Step 6: Switch themes in the workbench**

Run: `pnpm --filter @slotted/storybook-react storybook`
Expected: the paintbrush toolbar offers `default` and `aurora`; selecting
`aurora` repaints every family — violet accent, rounded controls, serif type,
slower motion — with no grey and no stopped animation.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(workbench): register the aurora theme"
```

---

## Execution record

Executed 3 September 2026 on `foundation/wave-0`, in place rather than in a
worktree, because the branch carries unrelated uncommitted work on
`progress-indicator`.

Deviations from the plan as written:

- The renderer's own unit cases moved to `packages/tokens/test/render-theme.test.mjs`
  rather than into the conformance suite. They hold the renderer against a
  contract it has never seen, which is not a rule about a theme.
- `scripts/verify-package-layers.mjs` gained `rankOf`, and
  `@slotted/theme-default` left the `LAYERS` map: every `@slotted/theme-*`
  package now takes rank 11 from its name.
- `tools/storybook-workbench/src/globals.test.ts` gained a case that reads
  `packages/themes/*/src/theme.json` and holds `THEMES` to the names the
  workspace publishes, so neither list can drift from the other.
- `renderHarness` gained a `theme` parameter, covered by a new case in
  `tools/harness/build.test.mjs`.
- No commits were made.
- `@slotted/theme-aurora` was removed after it had served its purpose,
  along with its entries in `turbo.json`, both Storybook manifests, both
  previews and the workbench theme list. What it measured is recorded in
  `docs/history/designs/2026-09-03-css-theming-design.md`, which
  replaces the JSON theme with a CSS one.

Results:

- `@slotted/tokens` 77 pass, `@slotted/theme-default` 42 pass,
  `@slotted/theme-aurora` 35 pass, `@slotted/storybook-workbench` 41 pass,
  `tools/harness` 37 pass, `pnpm test:contracts` 633 pass,
  `pnpm test:package-layers` 12 pass, `pnpm test:docs` 15 pass.
- `packages/theme-default/dist/styles.css` is byte-identical to the file the
  deleted build script produced.
- `node tools/harness/build.mjs button --theme=aurora` emits a page scoped to
  `aurora`.

Failing before this work and still failing, in families this plan does not
touch: `pnpm lint` (6 errors in `angular/breadcrumb`, `angular/stepper`,
`react/pagination`, `react/stepper`, `react/tabs`), `pnpm typecheck`
(4 errors in `toolbar`), `@slotted/styles` (1 failure — `progress-indicator`
`tokens.json` disagrees with its stylesheets), and `pnpm format:check`
(3 files).

## Self-review

- Spec coverage: the six blockers in the spec's table map to Tasks 1, 2, 3, 5
  (rank), 5 (harness) and 5 (previews). The second theme is Task 4.
- The customization-surface measurement the spec defers is recorded there, not
  implemented here, and no task changes `contract.json`.
- `renderThemeCss`, `themeConformance`, `THEMES` and `slotted-build-theme` are
  named identically wherever they appear.
