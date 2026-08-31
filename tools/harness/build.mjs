import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SCHEMES = ['light', 'dark', 'high-contrast'];
export const WIDTHS = [240, 420, 720];
export const DENSITIES = ['comfortable', 'compact', 'dense'];
export const DIRECTIONS = ['ltr', 'rtl'];

const SCENE = /<section data-scene="([^"]+)">([\s\S]*?)<\/section>/g;

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
<html lang="en" dir="ltr" data-slotted-theme="default" data-slotted-density="comfortable">
<meta charset="utf-8">
<title>${family} harness</title>
<style>${themeCss}</style>
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
  if (density) document.documentElement.dataset.slottedDensity = density;
  if (direction) document.documentElement.dir = direction;
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
