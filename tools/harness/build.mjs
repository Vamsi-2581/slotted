import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SCHEMES = ['light', 'dark', 'high-contrast'];
export const WIDTHS = [240, 420, 720];
export const DENSITIES = ['comfortable', 'compact', 'dense'];
export const DIRECTIONS = ['ltr', 'rtl'];

const SCENE_OPEN = /<section\s+data-scene="([^"]+)"\s*>/g;
const SECTION_TAG = /<section\b|<\/section\s*>/g;
const IDENTIFIER = /data-ui=['"]([a-z0-9-]+)['"]/g;

/**
 * The scenes a fragment declares, read by counting `section` tags rather than
 * by stopping at the first closing one.
 *
 * A single non-greedy pattern was enough while no family's own root was a
 * `section`. `alert`'s is — a message with a name is a `region` landmark, which
 * is the answer Primer's Banner reaches and the reason the family does not
 * write a live role on its box — so the first alert in a scene closed the scene
 * around it, and every alert after it disappeared from the page. Nothing in the
 * capture said so: the picture was a correct rendering of one alert.
 */
export function parseScenes(fragment) {
  const scenes = [];
  SCENE_OPEN.lastIndex = 0;

  for (let open = SCENE_OPEN.exec(fragment); open !== null; open = SCENE_OPEN.exec(fragment)) {
    const start = open.index + open[0].length;
    SECTION_TAG.lastIndex = start;

    let depth = 1;
    let end = -1;
    for (let tag = SECTION_TAG.exec(fragment); tag !== null; tag = SECTION_TAG.exec(fragment)) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        end = tag.index;
        break;
      }
    }

    if (end === -1) throw new Error(`the scene "${open[1]}" is never closed`);
    scenes.push({ name: open[1], markup: fragment.slice(start, end) });
    SCENE_OPEN.lastIndex = end;
  }

  return scenes;
}

/**
 * The other families a fragment renders, read from the fragment itself.
 *
 * A family whose subject is how it composes with another cannot be looked at
 * alone: `button-group` joins buttons into one shape, repaints one seam of a
 * solid one and raises the focused one over its neighbour, and with only its
 * own stylesheet on the page every capture shows unstyled markup. Nothing new
 * has to be declared for the page to carry them, because the fragment already
 * names them in the same `data-ui` that is the public identifier.
 */
export function composedFamilies(fragment, family) {
  return [...new Set([...fragment.matchAll(IDENTIFIER)].map(([, name]) => name))]
    .filter((name) => name !== family)
    .sort();
}

/**
 * The page is framework-free on purpose. One authored stylesheet serves both
 * React and Angular, so plain markup carrying the theme and the family's CSS
 * previews both — and it renders in milliseconds, where a Storybook build
 * takes tens of seconds. Refinement needs many iterations, not two.
 *
 * Scheme and width multiply the cells, because a reader compares them side by
 * side. Density and direction are applied to the whole page instead: they are
 * axes a capture is taken *in*, and multiplying every cell by six would make
 * the review view unreadable to reach the same coverage.
 */
/**
 * A radio group is scoped to its form owner, and a fragment with no `form` of
 * its own owns the document. The builder emits every scene nine times, so nine
 * copies of one scene were nine copies of one radio group: the last `checked`
 * in the page won and the eight cells above it photographed an empty set. The
 * `name` is therefore made per cell.
 *
 * It is the one identifier rewritten. `id` and `for` stay verbatim, because a
 * duplicated `id` costs a screenshot nothing — the shooter scopes `--focus` and
 * the pointer to the cell it is capturing — and rewriting them would edit the
 * DOM the harness exists to show. Wrapping each stage in a `form` was the other
 * way to scope the group and is not open: two fragments already declare a
 * `form`, and a nested one is dropped by the parser.
 */
export function scopeControlNames(markup, suffix) {
  return markup.replace(/<input\b[^>]*>/g, (tag) =>
    tag.replace(/\bname="([^"]*)"/g, (_, value) => `name="${value}--${suffix}"`),
  );
}

export function renderHarness({ family, fragment, familyCss, composedCss = '', themeCss }) {
  const scenes = parseScenes(fragment);
  if (scenes.length === 0) {
    throw new Error(`${family}: the harness fragment declares no scene`);
  }

  const cells = scenes.flatMap(({ name, markup }) =>
    SCHEMES.flatMap((scheme) =>
      WIDTHS.map(
        (width) => `
      <figure class="cell" data-scheme="${scheme}">
        <figcaption>${name} · ${scheme} · ${width}px<span data-axes></span></figcaption>
        <div
          class="stage"
          id="${name}-${scheme}-${width}"
          data-scene="${name}"
          data-slotted-scheme="${scheme}"
          style="inline-size: ${width}px"
        >${scopeControlNames(markup, `${scheme}-${width}`)}</div>
      </figure>`,
      ),
    ),
  );

  return `<!doctype html>
<html lang="en" dir="ltr" data-slotted-theme="default" data-slotted-density="comfortable">
<meta charset="utf-8">
<title>${family} harness</title>
<style>${themeCss}</style>
<style>${composedCss}</style>
<style>${familyCss}</style>
<style>
  body { margin: 0; font: 12px ui-sans-serif, system-ui, sans-serif; background: #f4f5f7 }
  .cell { margin: 0; padding: 12px }
  .cell[data-scheme="dark"] { background: #0b0b0d; color: #fafafa }
  .cell[data-scheme="light"] { background: #ffffff; color: #0f172a }
  .cell[data-scheme="high-contrast"] { background: #ffffff; color: #000000 }
  figcaption { font: 11px ui-monospace, monospace; opacity: 0.55; padding-block-end: 8px }
  .stage {
    border: 1px dashed rgb(128 128 128 / 0.35);
    padding: 12px;
    resize: horizontal;
    overflow: auto;
    background: var(--slotted-surface);
    color: var(--slotted-text);
  }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: #d8dade }
  /* A filtered page is one capture, so it is one column. The review view packs
     cells side by side to compare them, and the same packing at the widest step
     put two 720-pixel stages in two 400-pixel tracks: the stage overflowed its
     track and the shooter clipped every line of text at the viewport edge. A
     capture the reader cannot read is worse than no capture. */
  body[data-only] main { grid-template-columns: 1fr }
  body[data-only] .cell { display: none }
  body[data-only] .cell.shown { display: block }
</style>
<main>${cells.join('')}</main>
<script>
  /* The shooter asks for one combination so each capture is legible on its own.
     Opened without a query, the page shows everything, which is the review view.
     Density and direction are page-wide: they change how a cell renders, not
     which cells exist. */
  const q = new URLSearchParams(location.search);
  const scheme = q.get('scheme');
  const width = q.get('width');
  const density = q.get('density');
  const direction = q.get('dir');
  const scene = q.get('scene');
  if (density) document.documentElement.dataset.slottedDensity = density;
  if (direction) document.documentElement.dir = direction;
  /* Baked at build time, the caption could not know the two axes the page
     applies to itself, so a dense RTL capture and a comfortable LTR one carried
     the same label. The reader compares images, not file names. */
  for (const axes of document.querySelectorAll('[data-axes]')) {
    axes.textContent =
      ' · ' + document.documentElement.dataset.slottedDensity + ' · ' + document.documentElement.dir;
  }
  if (scheme || width || scene) {
    document.body.dataset.only = '';
    for (const cell of document.querySelectorAll('.cell')) {
      const id = cell.querySelector('.stage').id;
      const okScheme = !scheme || id.includes('-' + scheme + '-');
      const okWidth = !width || id.endsWith('-' + width);
      const okScene = !scene || cell.querySelector('.stage').dataset.scene === scene;
      if (okScheme && okWidth && okScene) cell.classList.add('shown');
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

  const fragment = await read(`packages/styles/src/${family}/${family}.harness.html`);
  const composed = await Promise.all(
    composedFamilies(fragment, family).map((name) =>
      read(`packages/styles/src/${name}/${name}.css`).catch(() => ''),
    ),
  );

  const html = renderHarness({
    family,
    fragment,
    familyCss: await read(`packages/styles/src/${family}/${family}.css`),
    composedCss: composed.join('\n'),
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
