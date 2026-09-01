import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DENSITIES, DIRECTIONS, SCHEMES, WIDTHS } from './build.mjs';

const AXES = {
  scheme: { values: SCHEMES, fallback: 'light' },
  width: { values: WIDTHS.map(String), fallback: '420' },
  density: { values: DENSITIES, fallback: 'comfortable' },
  dir: { values: DIRECTIONS, fallback: 'ltr' },
};

/** Room for the cell's own padding and caption around the stage. */
const CHROME_MARGIN = 80;

/**
 * One capture per combination rather than one of the whole page: a reader —
 * human or model — judges alignment and rhythm from an image that fills its
 * view, not from a thumbnail of forty cells.
 *
 * The capture is driven through the DevTools protocol rather than through
 * `--screenshot`, which photographs the window and nothing below it. A family
 * with seven scenes ran past the window, so the last scenes were absent from
 * the image the visual loop is required to read, and absent silently.
 */
class Devtools {
  #socket;
  #next = 0;
  #pending = new Map();
  #listeners = new Map();

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(String(data));
      if (message.id !== undefined) {
        this.#pending.get(message.id)?.(message);
        this.#pending.delete(message.id);
        return;
      }
      this.#listeners.get(message.method)?.forEach((resolve) => resolve(message.params));
      this.#listeners.delete(message.method);
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error(`cannot reach ${url}`)), {
        once: true,
      });
    });
    return new Devtools(socket);
  }

  send(method, params = {}) {
    const id = (this.#next += 1);
    return new Promise((resolve, reject) => {
      this.#pending.set(id, (message) =>
        message.error
          ? reject(new Error(`${method}: ${message.error.message}`))
          : resolve(message.result),
      );
      this.#socket.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method) {
    return new Promise((resolve) => {
      this.#listeners.set(method, [...(this.#listeners.get(method) ?? []), resolve]);
    });
  }

  close() {
    this.#socket.close();
  }
}

async function launch() {
  const profile = await mkdtemp(join(tmpdir(), 'slotted-harness-'));
  const chrome = spawn(process.env['CHROME_BIN'] ?? 'google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);

  const port = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(
      () => reject(new Error(`Chrome never opened a port:\n${output}`)),
      20000,
    );
    chrome.stderr.on('data', (chunk) => {
      output += chunk;
      const match = /ws:\/\/127\.0\.0\.1:(\d+)\//.exec(output);
      if (!match) return;
      clearTimeout(timer);
      resolve(Number(match[1]));
    });
    chrome.on('exit', (code) => reject(new Error(`Chrome exited with ${code}:\n${output}`)));
  });

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === 'page');
  if (!page) throw new Error('Chrome opened no page target');

  return {
    devtools: await Devtools.connect(page.webSocketDebuggerUrl),
    async close() {
      chrome.kill();
      await once(chrome, 'exit');
      await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    },
  };
}

export function captureUrl({ family, scheme, width, density, dir, scene }) {
  const page = fileURLToPath(new URL(`out/${family}.html`, import.meta.url));
  if (!existsSync(page)) {
    throw new Error(`${page} does not exist — run: node tools/harness/build.mjs ${family}`);
  }

  const url = pathToFileURL(page);
  url.searchParams.set('scheme', scheme);
  url.searchParams.set('width', width);
  url.searchParams.set('density', density);
  url.searchParams.set('dir', dir);
  if (scene) url.searchParams.set('scene', scene);

  return url;
}

/**
 * A selector is not a file name, so it travels as a slug. Two focus targets in
 * one combination therefore land in two files instead of one overwriting the
 * other, which is the failure a reader cannot see in the image.
 */
export function focusSlug(selector) {
  if (!selector) return undefined;
  const slug = selector
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return `focus-${slug}`;
}

export function captureName({ family, scheme, width, density, dir, scene, focus }) {
  const parts = [family, scene, focusSlug(focus), scheme, density, dir, width];
  return `${parts.filter(Boolean).join('-')}.png`;
}

/**
 * A focus ring, and a rule that reveals content only while focus is inside it,
 * exist in no capture the shooter could take before this: the page is loaded
 * and photographed with focus on the document. The Tab press is dispatched
 * first so Chrome counts the last interaction as a keyboard one and
 * `:focus-visible` matches; the script call then puts focus on the element the
 * reader asked for rather than on whatever Tab happened to reach.
 *
 * The selector is resolved inside the shown cell first, because the page holds
 * one cell per scheme and width and only one of them is the capture.
 */
async function focusElement(devtools, selector) {
  for (const type of ['rawKeyDown', 'keyUp']) {
    await devtools.send('Input.dispatchKeyEvent', {
      type,
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
      nativeVirtualKeyCode: 9,
    });
  }

  const expression = `(() => {
    const selector = ${JSON.stringify(selector)};
    const element =
      document.querySelector('.cell.shown ' + selector) ?? document.querySelector(selector);
    if (!element) throw new Error('no element matches ' + selector);
    element.focus();
    return element.tagName;
  })()`;

  const { exceptionDetails } = await devtools.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  if (exceptionDetails) {
    throw new Error(`--focus ${selector}: ${exceptionDetails.exception?.description ?? 'failed'}`);
  }
}

export async function shoot(options) {
  const { width, outDir } = options;
  const out = join(outDir, captureName(options));
  const { devtools, close } = await launch();

  try {
    await devtools.send('Page.enable');
    await devtools.send('Emulation.setDeviceMetricsOverride', {
      width: Number(width) + CHROME_MARGIN,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    const loaded = devtools.once('Page.loadEventFired');
    await devtools.send('Page.navigate', { url: captureUrl(options).href });
    await loaded;

    if (options.focus) await focusElement(devtools, options.focus);

    const { cssContentSize } = await devtools.send('Page.getLayoutMetrics');
    const { data } = await devtools.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: Number(width) + CHROME_MARGIN,
        height: Math.max(cssContentSize.height, 1),
        scale: 2,
      },
    });

    await writeFile(out, Buffer.from(data, 'base64'));
    devtools.close();
  } finally {
    await close();
  }

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
      'usage: node tools/harness/shoot.mjs <family> [--scheme s] [--width w] [--density d] [--dir ltr|rtl] [--scene name] [--focus selector] [--out dir]',
    );
  }

  const options = {
    family,
    outDir: process.env['TMPDIR'] ?? '/tmp',
    focus: undefined,
    scene: undefined,
  };
  for (const [axis, { fallback }] of Object.entries(AXES)) options[axis] = fallback;

  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index]?.replace(/^--/, '');
    const value = rest[index + 1];
    if (value === undefined) throw new Error(`${rest[index]} needs a value`);

    if (flag === 'out') {
      options.outDir = value;
      continue;
    }
    if (flag === 'scene') {
      options.scene = value;
      continue;
    }
    if (flag === 'focus') {
      options.focus = value;
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
