# Component Craft Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A manually invoked skill that builds or refines one component family against the token foundation, renders it, looks at it, and hands it to a human before anything is committed.

**Architecture:** Three small tools and one skill. A harness builder turns a family's stylesheet plus a markup fragment into a single browser page showing every scene across both schemes and three container widths. A shooter captures one combination at a time as a PNG the agent can read. A checker reads a family's CSS and reports the mechanical violations. The skill sequences them, and its last two steps are a written self-assessment and a human gate.

**Tech Stack:** Node 24, `node --test`, headless Google Chrome (already at `/usr/bin/google-chrome`). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-31-component-foundation-and-craft-skill-design.md`

## Global Constraints

- The token foundation is already built. `docs/token-foundation.md` is the law; read it before Task 3.
- The checker runs **against one family at a time**, invoked by the skill. It is deliberately not wired into `pnpm check`, and there is no allowlist: it only ever runs against the family being worked on, which is compliant by the time the skill finishes.
- No component stylesheet other than `breadcrumb.css` is touched by this plan.
- Ten files under `apps/storybook-*/.storybook/` are modified and uncommitted and belong to unrelated work. Never stage, commit, revert or stash them.
- `git add` names files, never directories. Never trust an exit status through a pipe.
- Run `npx prettier --write` on changed files before committing; `pnpm format:check` is part of the gate.
- Commit messages: imperative subject under 72 characters, a body explaining *why*, ending with:
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

---

### Task 1: The harness builder

**Files:**
- Create: `tools/harness/build.mjs`
- Create: `tools/harness/build.test.mjs`
- Create: `packages/styles/src/breadcrumb/breadcrumb.harness.html`
- Create: `tools/harness/package.json`
- Modify: `.gitignore` (ignore the generated `tools/harness/out/` page)
- Modify: `pnpm-lock.yaml` (register the new workspace importer)
- Modify: `pnpm-workspace.yaml`

**Interfaces:**
- Produces: `renderHarness({ family, fragment, familyCss, themeCss }) => string` from `tools/harness/build.mjs`. Returns a complete HTML document. Throws when the fragment declares no scene. A CLI entry writes `tools/harness/out/<family>.html`.
- The fragment format is one or more `<section data-scene="NAME"> … </section>` blocks. Task 5 and every later family author one.

- [ ] **Step 1: Write the failing test**

Create `tools/harness/build.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import { renderHarness } from './build.mjs';

const fragment = `
<section data-scene="default"><b class="x">one</b></section>
<section data-scene="current"><b class="x">two</b></section>
`;

const render = () =>
  renderHarness({
    family: 'demo',
    fragment,
    familyCss: '.x { color: red }',
    themeCss: '[data-slotted-theme="default"] { --t: 1px }',
  });

test('emits one document carrying both stylesheets', () => {
  const html = render();
  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes('.x { color: red }'), 'the family stylesheet is missing');
  assert.ok(html.includes('--t: 1px'), 'the theme is missing');
});

test('renders every scene in both schemes at every width', () => {
  const html = render();
  for (const scene of ['default', 'current']) {
    for (const scheme of ['light', 'dark']) {
      for (const width of [240, 420, 720]) {
        assert.ok(
          html.includes(`id="${scene}-${scheme}-${width}"`),
          `missing cell ${scene}-${scheme}-${width}`,
        );
      }
    }
  }
});

test('gives each cell the scheme attribute the theme selects on', () => {
  assert.match(render(), /data-slotted-scheme="dark"/);
});

test('sizes each cell so a container query has something to answer', () => {
  assert.match(render(), /inline-size:\s*240px/);
});

test('refuses a fragment that declares no scene', () => {
  assert.throws(
    () => renderHarness({ family: 'demo', fragment: '<b>no scene</b>', familyCss: '', themeCss: '' }),
    /no scene/i,
  );
});

test('keeps the scene markup verbatim, so the harness shows the real DOM', () => {
  assert.ok(render().includes('<b class="x">one</b>'));
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tools/harness/build.test.mjs`
Expected: FAIL — `Cannot find module './build.mjs'`.

- [ ] **Step 3: Write the builder**

Create `tools/harness/build.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SCHEMES = ['light', 'dark'];
export const WIDTHS = [240, 420, 720];

const SCENE = /<section data-scene="([^"]+)">([\s\S]*?)<\/section>/g;

/**
 * The page is framework-free on purpose. One authored stylesheet serves both
 * React and Angular, so plain markup carrying the theme and the family's CSS
 * previews both — and it renders in milliseconds, where a Storybook build
 * takes tens of seconds. Refinement needs many iterations, not two.
 */
export function renderHarness({ family, fragment, familyCss, themeCss }) {
  const scenes = [...fragment.matchAll(SCENE)].map(([, name, markup]) => ({ name, markup }));
  if (scenes.length === 0) {
    throw new Error(`${family}: the harness fragment declares no scene`);
  }

  const cells = scenes.flatMap(({ name, markup }) =>
    SCHEMES.flatMap((scheme) =>
      WIDTHS.map(
        (width) => `
      <figure class="cell" data-scheme="${scheme}">
        <figcaption>${name} · ${scheme} · ${width}px</figcaption>
        <div
          class="stage"
          id="${name}-${scheme}-${width}"
          data-slotted-scheme="${scheme}"
          style="inline-size: ${width}px"
        >${markup}</div>
      </figure>`,
      ),
    ),
  );

  return `<!doctype html>
<html lang="en" data-slotted-theme="default" data-slotted-density="comfortable">
<meta charset="utf-8">
<title>${family} harness</title>
<style>${themeCss}</style>
<style>${familyCss}</style>
<style>
  body { margin: 0; font: 12px ui-sans-serif, system-ui, sans-serif; background: #f4f5f7 }
  .cell { margin: 0; padding: 12px }
  .cell[data-scheme="dark"] { background: #0b0b0d; color: #fafafa }
  .cell[data-scheme="light"] { background: #ffffff; color: #0f172a }
  figcaption { font: 11px ui-monospace, monospace; opacity: 0.55; padding-block-end: 8px }
  .stage { border: 1px dashed rgb(128 128 128 / 0.35); padding: 12px; resize: horizontal; overflow: auto }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: #d8dade }
  body[data-only] .cell { display: none }
  body[data-only] .cell.shown { display: block }
</style>
<main>${cells.join('')}</main>
<script>
  /* The shooter asks for one combination so each capture is legible on its own.
     Opened without a query, the page shows everything, which is the review view. */
  const q = new URLSearchParams(location.search);
  const scheme = q.get('scheme');
  const width = q.get('width');
  if (scheme || width) {
    document.body.dataset.only = '';
    for (const cell of document.querySelectorAll('.cell')) {
      const id = cell.querySelector('.stage').id;
      const okScheme = !scheme || id.includes('-' + scheme + '-');
      const okWidth = !width || id.endsWith('-' + width);
      if (okScheme && okWidth) cell.classList.add('shown');
    }
  }
</script>
</html>
`;
}

async function main() {
  const family = process.argv[2];
  if (!family) throw new Error('usage: node tools/harness/build.mjs <family>');

  const root = new URL('../../', import.meta.url);
  const read = (path) => readFile(new URL(path, root), 'utf8');

  const html = renderHarness({
    family,
    fragment: await read(`packages/styles/src/${family}/${family}.harness.html`),
    familyCss: await read(`packages/styles/src/${family}/${family}.css`),
    themeCss: await read('packages/themes/default/dist/styles.css'),
  });

  const out = new URL('tools/harness/out/', root);
  await mkdir(out, { recursive: true });
  await writeFile(new URL(`${family}.html`, out), html);
  console.log(fileURLToPath(new URL(`${family}.html`, out)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
```

- [ ] **Step 4: Run the tests**

Run: `node --test tools/harness/build.test.mjs`
Expected: PASS, six tests.

- [ ] **Step 5: Write the Breadcrumb fragment**

Create `packages/styles/src/breadcrumb/breadcrumb.harness.html`:

```html
<section data-scene="default">
  <nav class="slotted-breadcrumb" data-part="root" aria-label="Breadcrumb">
    <ol data-part="list">
      <li data-part="item"><a data-part="link" href="#">Home</a></li>
      <li data-part="item"><a data-part="link" href="#">Projects</a></li>
      <li data-part="item">
        <a data-part="link" href="#" data-current aria-current="page">slotted</a>
      </li>
    </ol>
  </nav>
</section>

<section data-scene="deep">
  <nav class="slotted-breadcrumb" data-part="root" aria-label="Breadcrumb">
    <ol data-part="list">
      <li data-part="item"><a data-part="link" href="#">Home</a></li>
      <li data-part="item"><a data-part="link" href="#">Workspace settings</a></li>
      <li data-part="item"><a data-part="link" href="#">Members and access</a></li>
      <li data-part="item">
        <a data-part="link" href="#" data-current aria-current="page">Invitations</a>
      </li>
    </ol>
  </nav>
</section>
```

- [ ] **Step 6: Build the page and open it**

```bash
pnpm --filter @slotted/theme-default build
node tools/harness/build.mjs breadcrumb
```

Expected: prints an absolute path. Open it and confirm the current Breadcrumb renders — separators as `/`, no responsive behaviour. That unrefined state is what Task 5 corrects.

- [ ] **Step 7: Register the workspace and commit**

Create `tools/harness/package.json`:

```json
{
  "name": "@slotted/harness",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test build.test.mjs",
    "verify": "pnpm test"
  }
}
```

Add `tools/*` to the `packages` list in `pnpm-workspace.yaml`, which currently holds
`apps/*`, `packages/*` and `packages/themes/*` and does not cover `tools/`. Then:

```bash
git add .gitignore docs/superpowers/plans/2026-08-31-component-craft-skill.md \
        tools/harness/build.mjs tools/harness/build.test.mjs tools/harness/package.json \
        packages/styles/src/breadcrumb/breadcrumb.harness.html pnpm-lock.yaml pnpm-workspace.yaml
git commit -F - <<'EOF'
feat(harness): render a family into a page that can be looked at

Thirty families shipped through a process that never rendered them. The
checklist passed and the components were poor, because a checklist does
not detect ugly.

The harness is framework-free, which is faithful rather than a
compromise: one authored stylesheet serves both frameworks, so plain
markup carrying the theme and the family's CSS previews both. It renders
in milliseconds where a Storybook build takes tens of seconds, and
refinement needs many iterations rather than two.

Every scene is emitted in both schemes at three container widths, so a
container query has something to answer and a reviewer can see it
answer.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: The shooter

**Files:**
- Create: `tools/harness/shoot.mjs`
- Modify: `docs/superpowers/plans/2026-08-31-component-craft-skill.md` (use a `file:` URL for the capture)

**Interfaces:**
- Consumes: the page written by Task 1 at `tools/harness/out/<family>.html`.
- Produces: a CLI. `node tools/harness/shoot.mjs <family> <scheme> <width> [outDir]` writes `<outDir>/<family>-<scheme>-<width>.png` and prints its path. Default `outDir` is `$TMPDIR` or `/tmp`.

- [ ] **Step 1: Write the shooter**

Create `tools/harness/shoot.mjs`:

```js
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);

/**
 * One capture per combination rather than one of the whole page: a reader —
 * human or model — judges alignment and rhythm from an image that fills its
 * view, not from a thumbnail of forty cells.
 */
export async function shoot({ family, scheme, width, outDir }) {
  const page = fileURLToPath(new URL(`out/${family}.html`, import.meta.url));
  if (!existsSync(page)) {
    throw new Error(`${page} does not exist — run: node tools/harness/build.mjs ${family}`);
  }

  const out = join(outDir, `${family}-${scheme}-${width}.png`);
  const capture = pathToFileURL(page);
  capture.searchParams.set('scheme', scheme);
  capture.searchParams.set('width', width);

  await run('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    `--window-size=${Number(width) + 80},900`,
    `--screenshot=${out}`,
    capture.href,
  ]);

  return out;
}

const [family, scheme, width, outDir = process.env.TMPDIR ?? '/tmp'] = process.argv.slice(2);
if (!family || !scheme || !width) {
  throw new Error('usage: node tools/harness/shoot.mjs <family> <scheme> <width> [outDir]');
}
console.log(await shoot({ family, scheme, width, outDir }));
```

- [ ] **Step 2: Prove it produces a readable image**

```bash
node tools/harness/shoot.mjs breadcrumb light 420
node tools/harness/shoot.mjs breadcrumb dark 240
```

Open both PNGs. Expected: the Breadcrumb, legible, on a white ground and on a near-black one. A blank image means the query filter hid everything — check that the `id` pattern in `build.mjs` and the filter in the page script agree. An `ERR_FILE_NOT_FOUND` image means Chrome received a path with a query instead of a `file:` URL; its PNG can be larger than 2 KB, so size alone does not prove the capture is readable.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-08-31-component-craft-skill.md tools/harness/shoot.mjs
git commit -F - <<'EOF'
feat(harness): capture one combination at a time

A single capture of the whole page is a thumbnail of forty cells, which
is not something alignment or rhythm can be judged from. The shooter
takes one scheme at one width, at twice the device scale, so the image
fills the reader's view — and the reader here is as often a model as a
person.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: The family checker

**Files:**
- Create: `tools/harness/check.mjs`
- Create: `tools/harness/check.test.mjs`
- Modify: `tools/harness/package.json` (add the test file to the `test` script)

**Interfaces:**
- Produces: `checkFamily({ family, css }) => string[]` from `tools/harness/check.mjs`, returning one message per violation and an empty array when clean. A CLI prints them and exits `1` when any is found.

- [ ] **Step 1: Write the failing test**

Create `tools/harness/check.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import { checkFamily } from './check.mjs';

const check = (css) => checkFamily({ family: 'demo', css });

test('accepts a stylesheet that reaches only for tokens', () => {
  assert.deepEqual(
    check(`.slotted-demo { gap: var(--slotted-demo-gap, var(--slotted-space-4)) }`),
    [],
  );
});

test('refuses a literal fallback', () => {
  const errors = check(`.slotted-demo { gap: var(--slotted-demo-gap, 0.625rem) }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /--slotted-demo-gap.*0\.625rem/);
});

test('allows the keywords a scale cannot express', () => {
  for (const value of ['0', 'none', 'auto', '100%', 'transparent', 'currentColor', 'inherit']) {
    assert.deepEqual(check(`.slotted-demo { x: var(--slotted-demo-x, ${value}) }`), []);
  }
});

test('refuses a character used as an icon', () => {
  const errors = check(`.slotted-demo::before { content: var(--slotted-demo-separator, '/') }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /content/);
});

test('accepts an empty content, which is what a mask needs', () => {
  assert.deepEqual(check(`.slotted-demo::before { content: '' }`), []);
});

test('refuses a duration or easing written by hand', () => {
  assert.equal(check(`.slotted-demo { transition: color 120ms ease }`).length, 1);
  assert.deepEqual(
    check(
      `.slotted-demo { transition: color var(--slotted-duration-short) var(--slotted-easing-standard) }`,
    ),
    [],
  );
});

test('refuses a looping animation with no reduced-motion rule', () => {
  const spinning = `.slotted-demo { animation: spin 1s linear infinite }`;
  assert.equal(check(spinning).length, 1);
  assert.deepEqual(
    check(`${spinning} @media (prefers-reduced-motion: reduce) { .slotted-demo { animation: none } }`),
    [],
  );
});

test('refuses a container query from a stylesheet that declares no container', () => {
  const errors = check(`@container (min-width: 20rem) { .slotted-demo { gap: 0 } }`);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /container-type/);
});

test('accepts a container query when the family declares its own container', () => {
  assert.deepEqual(
    check(
      `.slotted-demo { container-type: inline-size; container-name: slotted-demo }
       @container slotted-demo (min-width: 20rem) { .slotted-demo { gap: 0 } }`,
    ),
    [],
  );
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test tools/harness/check.test.mjs`
Expected: FAIL — `Cannot find module './check.mjs'`.

- [ ] **Step 3: Write the checker**

Create `tools/harness/check.mjs`:

```js
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/** Values no scale can express, so a literal is the honest answer. */
const KEYWORDS = new Set([
  '0',
  'none',
  'auto',
  '100%',
  'transparent',
  'currentColor',
  'inherit',
  'unset',
  'initial',
  '1',
]);

const FALLBACK = /var\(\s*(--slotted-[a-z0-9-]+)\s*,\s*([^;]*?)\)(?=[;\s}])/g;
const CONTENT = /content:\s*([^;}]+)/g;
const DURATION = /(?<![\w-])\d+(?:\.\d+)?m?s(?![\w-])/;
const EASING = /(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|cubic-bezier|steps)\s*\(?/;

export function checkFamily({ family, css }) {
  const errors = [];
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const [, token, fallback] of source.matchAll(FALLBACK)) {
    const value = fallback.trim();
    if (value.startsWith('var(') || KEYWORDS.has(value)) continue;
    errors.push(
      `${family}: ${token} falls back to the literal ${value}. Reach for a scale step instead.`,
    );
  }

  for (const [, raw] of source.matchAll(CONTENT)) {
    const value = raw.trim();
    if (value === "''" || value === '""' || value.startsWith('var(')) continue;
    errors.push(
      `${family}: content is ${value}. A character is never an icon — use a glyph token as a mask.`,
    );
  }

  for (const declaration of source.matchAll(/(transition|animation)(?:-[a-z-]+)?:\s*([^;}]+)/g)) {
    const value = declaration[2];
    const outsideVar = value.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '');
    if (DURATION.test(outsideVar) || EASING.test(outsideVar)) {
      errors.push(
        `${family}: ${declaration[1]} writes its own timing in "${value.trim()}". Use the motion scale.`,
      );
    }
  }

  if (/animation[^;}]*\binfinite\b/.test(source) && !source.includes('prefers-reduced-motion')) {
    errors.push(
      `${family}: an animation loops forever with no reduced-motion rule. Collapsing a duration is not enough — it has to stop.`,
    );
  }

  if (source.includes('@container') && !source.includes('container-type')) {
    errors.push(`${family}: uses @container without declaring container-type on its own root.`);
  }

  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const family = process.argv[2];
  if (!family) throw new Error('usage: node tools/harness/check.mjs <family>');
  const css = await readFile(
    new URL(`../../packages/styles/src/${family}/${family}.css`, import.meta.url),
    'utf8',
  );
  const errors = checkFamily({ family, css });
  for (const error of errors) console.error(`- ${error}`);
  console.log(errors.length === 0 ? `${family}: clean` : `${family}: ${errors.length} to fix`);
  process.exitCode = errors.length === 0 ? 0 : 1;
}
```

- [ ] **Step 4: Run the tests**

Run: `node --test tools/harness/check.test.mjs`
Expected: PASS, nine tests.

- [ ] **Step 5: Point it at the real Breadcrumb**

Run: `node tools/harness/check.mjs breadcrumb; echo "EXIT=$?"`
Expected: `EXIT=1`, listing the `/` separator and the literal fallbacks. That output is Task 5's worklist.

- [ ] **Step 6: Commit**

```bash
git add tools/harness/check.mjs tools/harness/check.test.mjs tools/harness/package.json
git commit -F - <<'EOF'
feat(harness): report what a family gets mechanically wrong

Five rules, each one a defect the library actually shipped: a literal
fallback where a scale step belongs, a character used as an icon, timing
written by hand, a looping animation with no reduced-motion rule, and a
container query from a stylesheet that declares no container.

It runs against one family, invoked by the skill, and is deliberately
not wired into the repository gate. A permanent gate would need a
dispensation list holding all thirty unrefined families, and the list
would be machinery for a problem the skill's human gate already answers.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: The skill

**Files:**
- Create: `.claude/skills/component/SKILL.md`
- Create: `.claude/skills/component/references/rubric.md`
- Create: `.claude/skills/component/references/harness.md`
- Create: `.claude/skills/component/references/frameworks.md`
- Create: `.claude/skills/component/references/patterns.md`

**Interfaces:**
- Consumes: `tools/harness/build.mjs`, `shoot.mjs`, `check.mjs` from Tasks 1–3; `docs/token-foundation.md` from the foundation plan.
- Produces: the skill invoked as `/component <family> [ideas…]`.

- [ ] **Step 1: Write `SKILL.md`**

Frontmatter exactly:

```markdown
---
name: component
description: Build or refine one slotted component family, or a tightly related pair, against the token foundation — with a render-and-look loop and a human gate. Use ONLY when explicitly invoked as /component <family>; never infer it from a request to change component code.
---
```

The body holds, in this order:

1. **The law, loaded first.** Read `docs/token-foundation.md`, `references/rubric.md`, and — when the family is a form control — `docs/superpowers/specs/2026-08-31-field-aware-controls-design.md`. Before reading any component code.
2. **Mode.** `specs/components/<family>/` exists → refine. Otherwise → create.
3. **Weigh the request.** If the invocation carried features, behaviours or ideas, judge each against `PROJECT-PRD.md`: composition over configuration, platform first, no internal DOM promises, YAGNI. Write **adopt / adapt / decline** with one sentence of reason for each, and **present it before writing any code**. An idea is not adopted because it was asked for, and not declined because it is unfamiliar.
4. **Source the pattern.** Look the WAI-ARIA Authoring Practices pattern up. Do not recall it. In refine mode, also run `node tools/harness/check.mjs <family>` and read the family's CSS against the rubric, and write the defect list.
5. **Design.** Only where an architectural question arises. Then it is a document in `docs/superpowers/specs/`.
6. **Contract and its test**, test first.
7. **Stylesheet against the foundation.** `node tools/harness/check.mjs <family>` exits 0 before moving on.
8. **The visual loop.** `node tools/harness/build.mjs <family>`, then `shoot.mjs` for at least `light 420`, `dark 420` and `light 240`. **Read every image.** Judge alignment, rhythm, optical balance, and whether the narrow width holds. Correct and repeat. Do not leave this step because the code is finished; leave it because the picture is right.
9. **Both frameworks**, following `references/frameworks.md`.
10. **Reference pages** for both Storybooks.
11. **Gates.** `pnpm check` exits 0.
12. **Self-assessment.** All eight rubric dimensions, written, with anything below the bar fixed before continuing.
13. **The human gate.** Hand over the harness path, the weighing from step 3, the self-assessment, and anything still uncertain. Wait. Iterate on what comes back.
14. **Commit**, one per step of substance, only after approval.

State plainly, near the top: **step 8 is the reason this skill exists.** The library already had a rigorous checklist; it passed while the components were poor.

- [ ] **Step 2: Write `references/rubric.md`**

Eight dimensions. For each: what it means, how it is verified, and what fails it.

1. **Icons** — real geometry, never a character or emoji, and present wherever the component needs one. Verified by `check.mjs` and by the eye on the capture.
2. **Motion** — every state change that benefits from one has a transition, taken from the motion scale, and nothing loops without a reduced-motion rule. Fails when a control snaps between states with no reason.
3. **Responsiveness** — the component answers its own width, not the viewport's. Verified at 240, 420 and 720. Fails when content overflows or wraps badly at 240.
4. **Refinement** — alignment, spacing rhythm, type sizes, optical balance. Verified by the eye. Fails on a half-pixel misalignment, a gap that does not match a scale step, or text that sits off the optical centre.
5. **Tokens** — every visual decision is themeable, correctly scoped and honestly named. Verified by `check.mjs` and by reading the names.
6. **Patterns** — the APG pattern, item by item; the platform before ARIA; composition over configuration.
7. **Accessibility** — name, role, state, keyboard, visible focus, `forced-colors`, reduced motion.
8. **Native API** — modern idioms in both frameworks, and no capability the consumer loses by using the component.

- [ ] **Step 3: Write `references/harness.md`**

The three commands, the fragment format (`<section data-scene="NAME">`), the rule that every `data-part` in the contract appears in the fragment and every declared state is exercised, and the note that the fragment is a third place the DOM is written — after React and Angular — so it drifts and must be re-read whenever either component's markup changes.

- [ ] **Step 4: Write `references/frameworks.md`**

What "modern API" means here, drawn from what the library already does:

- **React** — function components, `useId` for identifiers, context for family state, a `render` prop where an element must be substituted, native props passed through, `exactOptionalPropertyTypes` respected. A shared state is `undefined` by default so unset can defer.
- **Angular** — standalone, `input()` / `model()` / `output()` signals, `computed` for derived state, `host` bindings rather than `@HostBinding`, `ViewEncapsulation.None`, `exportAs` where a template needs the instance, `inject()` over constructor parameters. One entry point reaches another only by `@slotted/angular/<name>`.
- Both: the consumer's explicit value always wins.

- [ ] **Step 5: Write `references/patterns.md`**

How to source a pattern: fetch the APG page for the component, list its keyboard table and its required attributes, and check them one by one against the implementation. Recording "checked against APG" without the list is not checking. Where the library deliberately departs — Switch is a `button`, not a checkbox — the departure is written down with its cost.

- [ ] **Step 6: Verify the skill loads**

Run: `/component` with no argument in a fresh session, or confirm the frontmatter parses by reading the file back. Expected: `name` and `description` present, description stating explicit invocation only.

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/component/SKILL.md .claude/skills/component/references/rubric.md \
        .claude/skills/component/references/harness.md \
        .claude/skills/component/references/frameworks.md \
        .claude/skills/component/references/patterns.md
git commit -F - <<'EOF'
feat(skill): add the component craft skill

Fourteen steps, of which one is the reason the skill exists: the
component is rendered, captured, and looked at, and the loop is left
when the picture is right rather than when the code is finished. The
library already had a rigorous checklist — contract first, tests first,
both frameworks, a green gate — and it passed while the components were
poor.

Two steps answer things the process never had. Ideas handed to the skill
are weighed in writing, adopt or adapt or decline with a reason, before
any code exists. And nothing is committed until a person has opened the
harness in a real browser, where hover, focus, keyboard and resizing
behave.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: Prove it on Breadcrumb

This task is executed **by invoking the skill**, not by writing the CSS in this plan. A plan that dictated the refined stylesheet would prove the plan, not the skill.

**Files:**
- Modify: `packages/styles/src/breadcrumb/breadcrumb.css`, `breadcrumb.tokens.json`, `breadcrumb.styles.test.mjs`
- Modify: `specs/components/breadcrumb/contract.json` and its test, if the refinement changes the contract
- Modify: the React and Angular Breadcrumb families, if their markup changes
- Modify: `packages/styles/src/breadcrumb/breadcrumb.harness.html`, if a scene is missing

- [ ] **Step 1: Invoke the skill**

```
/component breadcrumb
```

- [ ] **Step 2: Hold it to these outcomes**

The refinement is not done until all of these hold:

- `node tools/harness/check.mjs breadcrumb` exits 0.
- The separator is a mask from `--slotted-icon-chevron-right`, not the character `/`, and it flips or is replaced for a right-to-left document.
- Every literal in the stylesheet is a scale step: the `0.8125rem`, the two `0.375rem`, the `1.45`, the `4px` and the `600` all resolve through tokens.
- The link's colour change is a transition from the motion scale, not a snap.
- At 240px the deep trail does something deliberate — truncating, wrapping or collapsing — rather than overflowing. Whatever it does is a container query, and the family declares its own container.
- `pnpm check` exits 0.
- The eight rubric dimensions are self-assessed in writing.

- [ ] **Step 3: The human gate**

Present the harness path, the self-assessment, and the container-width behaviour chosen for 240px, since that is a design decision rather than a repair. Wait for approval. Iterate.

- [ ] **Step 4: Commit after approval**

Commits follow the skill's own step 14: one per step of substance, in the repository's style.

- [ ] **Step 5: Record the entry**

Append to `docs/BUILD-LOG.md`: what the skill changed, what the checker caught that the eye did not, what the eye caught that the checker did not, and how many visual iterations it took. That last number is the honest measure of whether step 8 is doing work.

---

## What this plan does not do

Twenty-nine families remain unrefined. Refining them is what the skill exists for, one at a time, each with its own human gate. Nothing in this plan makes that automatic, and nothing should.
