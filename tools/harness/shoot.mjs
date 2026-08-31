import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DENSITIES, DIRECTIONS, SCHEMES, WIDTHS } from './build.mjs';

const run = promisify(execFile);

const AXES = {
  scheme: { values: SCHEMES, fallback: 'light' },
  width: { values: WIDTHS.map(String), fallback: '420' },
  density: { values: DENSITIES, fallback: 'comfortable' },
  dir: { values: DIRECTIONS, fallback: 'ltr' },
};

/**
 * One capture per combination rather than one of the whole page: a reader —
 * human or model — judges alignment and rhythm from an image that fills its
 * view, not from a thumbnail of forty cells.
 *
 * The file name states every axis, so two captures of the same family cannot
 * be confused and a correction can be compared against the picture it replaces.
 */
export async function shoot({ family, scheme, width, density, dir, outDir }) {
  const page = fileURLToPath(new URL(`out/${family}.html`, import.meta.url));
  if (!existsSync(page)) {
    throw new Error(`${page} does not exist — run: node tools/harness/build.mjs ${family}`);
  }

  const out = join(outDir, `${family}-${scheme}-${density}-${dir}-${width}.png`);
  const capture = pathToFileURL(page);
  capture.searchParams.set('scheme', scheme);
  capture.searchParams.set('width', width);
  capture.searchParams.set('density', density);
  capture.searchParams.set('dir', dir);

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

/**
 * `<family> --scheme dark --density dense`. Every axis is named, because four
 * positional arguments in a row are read wrong exactly once and the mistake is
 * invisible in the resulting image.
 */
export function parseArguments(argv) {
  const [family, ...rest] = argv;
  if (!family || family.startsWith('--')) {
    throw new Error(
      'usage: node tools/harness/shoot.mjs <family> [--scheme s] [--width w] [--density d] [--dir ltr|rtl] [--out dir]',
    );
  }

  const options = { family, outDir: process.env.TMPDIR ?? '/tmp' };
  for (const [axis, { fallback }] of Object.entries(AXES)) options[axis] = fallback;

  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index]?.replace(/^--/, '');
    const value = rest[index + 1];
    if (value === undefined) throw new Error(`${rest[index]} needs a value`);

    if (flag === 'out') {
      options.outDir = value;
      continue;
    }

    const axis = AXES[flag];
    if (axis === undefined) throw new Error(`unknown option ${rest[index]}`);
    if (!axis.values.includes(value)) {
      throw new Error(`${flag} must be one of ${axis.values.join(', ')}, received ${value}`);
    }
    options[flag] = value;
  }

  return options;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(await shoot(parseArguments(process.argv.slice(2))));
}
