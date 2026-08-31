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
