import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readdirSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { launch as launchChrome } from './shoot.mjs';

/**
 * One page in one browser engine, for a scenario that reads values and asserts
 * them: `goto(url)` resolves once the page has loaded, `evaluate(expression)`
 * returns the JSON value of an expression (a promise is awaited).
 *
 * - `chrome`: the DevTools protocol of `shoot.mjs`; `CHROME_BIN` names the
 *   binary (default `google-chrome`).
 * - `firefox`: WebDriver BiDi, which Firefox speaks natively, through the
 *   client below. `FIREFOX` names the binary; without it, the newest
 *   `firefox-<revision>` build in the Playwright cache (`PLAYWRIGHT_BROWSERS_PATH`,
 *   default `~/.cache/ms-playwright`).
 * - `webkit`: `playwright-core` 1.63.0, WebKit 26.6. Linux has no WebKit
 *   automation but Playwright's own protocol, which is tied to the build of
 *   the same release.
 * - `webkit-18`: `playwright-core` 1.53.0 under the alias
 *   `playwright-core-webkit18`, WebKit 18.5 — the last release with a WebKit
 *   18, and the published minimum is Safari 18.
 *
 * A WebKit build is installed with
 * `pnpm --filter @slotted/harness exec playwright-core install webkit` (and
 * `node tools/harness/node_modules/playwright-core-webkit18/cli.js install webkit`);
 * its system libraries with `install-deps webkit` (root). Without root, the
 * libraries a headless run loads are extracted from the distribution's
 * packages and named in `LD_LIBRARY_PATH`; on Ubuntu 24.04 these are
 * libavif16, libenchant-2-2, libflite1, libgstreamer-plugins-bad1.0-0,
 * libgstreamer-gl1.0-0, libmanette-0.2-0, libwayland-server0, libwebpdemux2,
 * libwebpmux3, libdav1d7, libgav1-1, librav1e0, libsvtav1enc1d1, libyuv0,
 * libvpx9 and libwoff1. Playwright 1.53 also requires the GTK 4 libraries a
 * headless run does not load; `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`
 * skips that check. An engine that cannot start fails the scenario with the
 * reason.
 */
export const ENGINES = ['chrome', 'firefox', 'webkit', 'webkit-18'];

/** `--engine <name>` from the command line, `chrome` when absent. */
export function engineArgument(argv = process.argv.slice(2)) {
  const at = argv.indexOf('--engine');
  const engine = at === -1 ? 'chrome' : argv[at + 1];
  if (!ENGINES.includes(engine)) {
    throw new Error(`--engine takes one of ${ENGINES.join(', ')}; got ${engine}`);
  }
  return engine;
}

export async function openPage(engine) {
  if (engine === 'chrome') return chromePage();
  if (engine === 'firefox') return firefoxPage(firefoxBinary());
  if (engine === 'webkit') return webkitPage('playwright-core');
  if (engine === 'webkit-18') return webkitPage('playwright-core-webkit18');
  throw new Error(`no engine named ${engine}; one of ${ENGINES.join(', ')}`);
}

async function chromePage() {
  let opened;
  try {
    opened = await launchChrome();
  } catch (error) {
    throw new Error(
      `chrome cannot start (${error.message}); CHROME_BIN names the binary, default google-chrome`,
      { cause: error },
    );
  }
  const { devtools, close } = opened;
  try {
    const { product } = await devtools.send('Browser.getVersion');
    await devtools.send('Page.enable');
    await devtools.send('Runtime.enable');
    await devtools.send('Inspector.enable');
    /* A renderer that crashes answers nothing; the command waiting on it fails instead of hanging. */
    const crashed = devtools.once('Inspector.targetCrashed').then(() => {
      throw new Error(`the page crashed in ${product}`);
    });
    crashed.catch(() => {});
    const unlessCrashed = (promise) => Promise.race([promise, crashed]);
    return {
      version: product,
      async goto(url) {
        const loaded = devtools.once('Page.loadEventFired');
        await unlessCrashed(devtools.send('Page.navigate', { url }));
        await unlessCrashed(loaded);
      },
      async evaluate(expression) {
        const { result, exceptionDetails } = await unlessCrashed(
          devtools.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true,
          }),
        );
        if (exceptionDetails) {
          throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
        }
        return result.value;
      },
      async close() {
        devtools.close();
        await close();
      },
    };
  } catch (error) {
    devtools.close();
    await close();
    throw error;
  }
}

const playwrightCache = () =>
  process.env['PLAYWRIGHT_BROWSERS_PATH'] ?? join(homedir(), '.cache', 'ms-playwright');

function firefoxBinary() {
  const named = process.env['FIREFOX'];
  if (named) {
    if (!existsSync(named)) throw new Error(`FIREFOX names ${named}, which does not exist`);
    return named;
  }
  const cache = playwrightCache();
  const builds = existsSync(cache)
    ? readdirSync(cache)
        .map((entry) => /^firefox-(\d+)$/.exec(entry))
        .filter(Boolean)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map((match) => join(cache, match[0], 'firefox', 'firefox'))
        .filter((binary) => existsSync(binary))
    : [];
  if (builds.length === 0) {
    throw new Error(
      `firefox is not available: no firefox-<revision> build in ${cache}. Set FIREFOX to a ` +
        'Firefox binary, or run: pnpm --filter @slotted/harness exec playwright-core install firefox',
    );
  }
  return builds[0];
}

/**
 * The few WebDriver BiDi commands a scenario needs, over the global
 * `WebSocket`. Firefox prints the port it listens on once it is ready.
 */
async function firefoxPage(binary) {
  const profile = await mkdtemp(join(tmpdir(), 'slotted-firefox-'));
  const firefox = spawn(
    binary,
    ['--headless', '--no-remote', '--profile', profile, '--remote-debugging-port=0', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const stop = async () => {
    if (firefox.exitCode === null && firefox.signalCode === null) {
      firefox.kill();
      await once(firefox, 'exit');
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  };

  let socket;
  try {
    const url = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(
        () => reject(new Error(`firefox never opened WebDriver BiDi:\n${output}`)),
        30000,
      );
      firefox.on('error', (error) => {
        clearTimeout(timer);
        reject(new Error(`firefox cannot start (${binary}): ${error.message}`));
      });
      firefox.on('exit', (code) => {
        clearTimeout(timer);
        reject(new Error(`firefox exited with ${code}:\n${output}`));
      });
      firefox.stderr.on('data', (chunk) => {
        output += chunk;
        const match = /WebDriver BiDi listening on (ws:\/\/\S+)/.exec(output);
        if (!match) return;
        clearTimeout(timer);
        resolve(match[1]);
      });
    });
    socket = new WebSocket(`${url.replace(/\/$/, '')}/session`);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error(`cannot reach ${url}`)), {
        once: true,
      });
    });
  } catch (error) {
    await stop();
    throw error;
  }

  let next = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(String(data));
    if (message.id === undefined) return;
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = (next += 1);
      pending.set(id, (message) =>
        message.type === 'error'
          ? reject(new Error(`${method}: ${message.error}: ${message.message}`))
          : resolve(message.result),
      );
      socket.send(JSON.stringify({ id, method, params }));
    });

  try {
    const session = await send('session.new', { capabilities: {} });
    const { contexts } = await send('browsingContext.getTree', {});
    const context = contexts[0].context;
    return {
      version: `Firefox ${session.capabilities.browserVersion}`,
      async goto(url) {
        await send('browsingContext.navigate', { context, url, wait: 'complete' });
      },
      async evaluate(expression) {
        const result = await send('script.evaluate', {
          expression: `(async () => JSON.stringify(await (${expression})))()`,
          target: { context },
          awaitPromise: true,
        });
        if (result.type === 'exception') throw new Error(result.exceptionDetails.text);
        return JSON.parse(result.result.value);
      },
      async close() {
        await send('browser.close').catch(() => {});
        socket.close();
        await stop();
      },
    };
  } catch (error) {
    socket.close();
    await stop();
    throw error;
  }
}

async function webkitPage(driver) {
  let browser;
  try {
    const { webkit } = await import(driver);
    browser = await webkit.launch();
  } catch (error) {
    throw new Error(
      `webkit (${driver}) cannot start: ${error.message.split('\n').slice(0, 8).join('\n')}\n` +
        "Install the build with the driver's `install webkit` and its libraries with " +
        '`install-deps webkit`, or name extracted libraries in LD_LIBRARY_PATH.',
      { cause: error },
    );
  }
  try {
    const page = await browser.newPage();
    return {
      version: `WebKit ${browser.version()}`,
      async goto(url) {
        await page.goto(url, { waitUntil: 'load' });
      },
      async evaluate(expression) {
        return JSON.parse(
          await page.evaluate(`(async () => JSON.stringify(await (${expression})))()`),
        );
      },
      async close() {
        await browser.close();
      },
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
