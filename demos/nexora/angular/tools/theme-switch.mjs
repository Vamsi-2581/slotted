// usage: node tools/theme-switch.mjs   (after `pnpm build:demo`; PORT optional; ORIGIN=<url> reads a running server)
// The appearance scenario: one browser session on the built demo, served from `dist` with an SPA
// fallback, on the preferences page. It waits for the runtime theme sheets, then for each of the
// four themes and three brands chooses the candidate in the Appearance section and reads the three
// preview regions (light, dark, high contrast):
// - the region names the theme and the scheme, and paints the scheme's ground (a light surface in
//   light, a dark one in dark);
// - the solid button's background moves with the brand, and its label stands on it at the scheme's
//   floor (4.5:1, 7:1 in high contrast); the contrast table's "Text on solid" cell states the ratio
//   measured on the paint, within 0.05;
// - the button's corner, case and tracking, the badge's case, and the face of a real heading (the
//   region's `slHeading`) and of the alert's title are the theme's: serif under Editorial only;
// - the select opened in the region carries the region's theme, scheme and seed to the end of the
//   body.
// The theme cards draw their own face and case. Meanwhile nothing outside the preview moves: `html`
// keeps `default`, its scheme and its seeds, and a solid button outside every region keeps the
// default's violet, 4px corner and lower case, and the page title its sans face — read as absolute
// values before the first choice and after every theme. Save then moves `html` and that button,
// which proves the outside probe can see a change.
// Prints one PASS or FAIL per check and exits non-zero on a failure. A Chrome that cannot start, or
// that exits during the run, fails the scenario through the same cleanup. CHROME names the binary
// (default `google-chrome`).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)), 'dist/nexora-operations/browser');
/* `ORIGIN=http://localhost:4250` reads a running dev server instead of the build. */
const SERVED = process.env.ORIGIN;
if (SERVED === undefined && !existsSync(join(ROOT, 'index.html'))) {
  console.error(`No build at ${ROOT}: run \`pnpm build:demo\` first.`);
  process.exit(2);
}

const THEMES = [
  { id: 'default', radius: '4px', caps: false, serif: false },
  { id: 'nexora-soft', radius: '8px', caps: false, serif: false },
  { id: 'nexora-sharp', radius: '0px', caps: true, serif: false },
  { id: 'nexora-editorial', radius: '4px', caps: false, serif: true },
];
const BRANDS = ['emerald', 'amber', 'rose'];
const SCHEMES = ['light', 'dark', 'high-contrast'];
const FLOOR = { light: 4.5, dark: 4.5, 'high-contrast': 7 };
/** The ground each scheme paints, as the WCAG luminance of `--slotted-surface`; high contrast is a light scheme. */
const GROUND = {
  light: (l) => l > 0.8,
  dark: (l) => l < 0.2,
  'high-contrast': (l) => l > 0.9,
};
/** What the default theme draws outside the preview before Save: the violet brand seed's solid. */
const DEFAULT_PROBE = { radius: '4px', transform: 'none', spacing: 'normal' };
const SERIF = /^ui-serif\b/;
const SANS = /^"?Geist Variable"?,/;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) file = join(ROOT, 'index.html');
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});

const profile = mkdtempSync(join(tmpdir(), 'slotted-theme-'));
const BROWSER = process.env.CHROME ?? 'google-chrome';
let chrome = null;
const running = (child) => child.pid !== undefined && child.exitCode === null && child.signalCode === null;
/** Ends Chrome: SIGTERM, then SIGKILL after 5 s; never waits on a process that already ended. */
const stopChrome = async () => {
  if (chrome === null || !running(chrome)) return;
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill();
  if ((await Promise.race([exited.then(() => 'exited'), wait(5000).then(() => 'timeout')])) === 'exited') return;
  chrome.kill('SIGKILL');
  await Promise.race([exited, wait(2000)]);
};
let ws = null;
let id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const js = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`${expression.slice(0, 80)}: ${JSON.stringify(result.exceptionDetails).slice(0, 400)}`);
  return result.result?.value;
};
const until = async (expression, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await js(expression)) return true; await wait(150); } return false; };
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };

/*
 * Helpers installed in the page once: a colour of any CSS notation read as sRGB through a canvas,
 * its WCAG luminance, the ratio of two of them, and a probe — a solid button the button family
 * paints by its attributes, appended to the body, outside every preview region.
 */
const install = () => js(`(() => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const rgb = (color) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const luminance = (color) => {
    const [r, g, b] = rgb(color).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const probe = document.createElement('button');
  probe.type = 'button';
  probe.textContent = 'Probe';
  probe.setAttribute('data-ui', 'button');
  probe.setAttribute('data-variant', 'solid');
  probe.setAttribute('data-tone', 'accent');
  probe.setAttribute('data-size', 'md');
  probe.setAttribute('data-theme-probe', '');
  document.body.append(probe);
  window.__theme = { rgb, luminance, ratio };
  return true;
})()`);

/** What must not move while only the preview changes, as absolute values. */
const outside = async () => JSON.parse(await js(`(() => {
  const html = document.documentElement;
  const probe = getComputedStyle(document.querySelector('[data-theme-probe]'));
  const heading = document.querySelector('[data-ui=page-header] [data-part=heading]');
  return JSON.stringify({
    theme: html.getAttribute('data-slotted-theme'),
    scheme: html.getAttribute('data-slotted-scheme'),
    seeds: html.style.cssText,
    background: window.__theme.rgb(probe.backgroundColor).join(','),
    radius: probe.borderTopLeftRadius,
    transform: probe.textTransform,
    spacing: probe.letterSpacing,
    heading: heading ? getComputedStyle(heading).fontFamily : '',
  });
})()`));
const sameOutside = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const defaultOutside = (facts, violet) =>
  facts.theme === 'default' &&
  /--slotted-seed-accent:\s*#7c3aed/.test(facts.seeds) &&
  facts.background === violet &&
  facts.radius === DEFAULT_PROBE.radius &&
  facts.transform === DEFAULT_PROBE.transform &&
  facts.spacing === DEFAULT_PROBE.spacing &&
  SANS.test(facts.heading);

/**
 * Chooses a candidate and waits until the regions have settled: the button family transitions its
 * colours, and a value read mid-transition is neither the old colour nor the new one. Settled is no
 * running animation inside a region, and the solids reading the same twice, a frame apart.
 */
const choose = async (name, value) => {
  await js(`document.querySelector('input[name="${name}"][value="${value}"]').click()`);
  const settled = await until(`new Promise((resolve) => {
    const read = () => [...document.querySelectorAll('[data-preview-solid]')].map((b) => getComputedStyle(b).backgroundColor).join();
    const first = read();
    const running = document.getAnimations().some((a) => a.playState === 'running' && a.effect?.target?.closest?.('[data-preview-scheme]'));
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(!running && read() === first)));
  })`, 5000);
  if (!settled) throw new Error(`${name}=${value}: the preview did not settle in 5 s`);
};

/** One region's facts: its attributes and ground, the solid button's paint, the faces and the table's cell. */
const region = (scheme) => js(`(() => {
  const region = document.querySelector('[data-preview-scheme="${scheme}"]');
  const button = region.querySelector('[data-preview-solid]');
  const style = getComputedStyle(button);
  const badge = getComputedStyle(region.querySelector('[data-ui=badge]'));
  const cell = document.querySelector('[data-contrast] td[data-pair="on-solid"][data-scheme="${scheme}"] [data-ratio]');
  return {
    theme: region.getAttribute('data-slotted-theme'),
    scheme: region.getAttribute('data-slotted-scheme'),
    ground: window.__theme.luminance(getComputedStyle(region).getPropertyValue('--slotted-surface').trim()),
    groundPainted: window.__theme.rgb(getComputedStyle(region).backgroundColor).join(','),
    seed: getComputedStyle(region).getPropertyValue('--slotted-seed-accent').trim(),
    solidToken: getComputedStyle(region).getPropertyValue('--slotted-tone-accent-solid').trim(),
    background: window.__theme.rgb(style.backgroundColor).join(','),
    ratio: window.__theme.ratio(style.color, style.backgroundColor),
    stated: Number.parseFloat(cell?.textContent ?? 'NaN'),
    radius: style.borderTopLeftRadius,
    transform: style.textTransform,
    spacing: style.letterSpacing,
    badgeTransform: badge.textTransform,
    headingFont: getComputedStyle(region.querySelector('h4[data-ui=typography]')).fontFamily,
    titleFont: getComputedStyle(region.querySelector('[data-ui=alert] [data-part=title]')).fontFamily,
  };
})()`);

/** Opens the region's select, reads the layer it portals to the body's end, and closes it. */
const overlay = async (scheme) => {
  await js(`document.querySelector('[data-preview-scheme="${scheme}"] sl-select [data-part=trigger]').click()`);
  const opened = await until(`!!document.querySelector('[data-slotted-portal] [role=listbox]')`, 5000);
  const facts = opened
    ? await js(`(() => {
        const listbox = document.querySelector('[data-slotted-portal] [role=listbox]');
        const layer = listbox.closest('[data-slotted-theme]');
        const region = document.querySelector('[data-preview-scheme="${scheme}"]');
        const style = getComputedStyle(layer);
        return {
          outsideRegion: !region.contains(listbox),
          theme: layer?.getAttribute('data-slotted-theme') ?? null,
          scheme: layer?.getAttribute('data-slotted-scheme') ?? null,
          seed: style.getPropertyValue('--slotted-seed-accent').trim(),
          solidToken: getComputedStyle(listbox).getPropertyValue('--slotted-tone-accent-solid').trim(),
        };
      })()`)
    : null;
  await js(`document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await until(`!document.querySelector('[data-slotted-portal] [role=listbox]')`, 5000);
  return facts;
};

/** The theme cards: each sample draws its theme's heading face and badge case. */
const cards = () => js(`[...document.querySelectorAll('[data-theme-sample]')].map((sample) => ({
  id: sample.getAttribute('data-theme-sample'),
  theme: sample.getAttribute('data-slotted-theme'),
  titleFont: getComputedStyle(sample.querySelector('.sample-title')).fontFamily,
  badgeTransform: getComputedStyle(sample.querySelector('[data-ui=badge]')).textTransform,
}))`);

let exitCode = 1;
try {
  if (SERVED === undefined) {
    await new Promise((resolve) => server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', resolve));
  }
  const ORIGIN = SERVED ?? `http://127.0.0.1:${server.address().port}`;
  chrome = spawn(BROWSER, ['--headless=new', '--no-sandbox', '--disable-gpu', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' });
  /* 'error' without a listener would end the process before `finally`; it fails the run instead. */
  await new Promise((resolve, reject) => {
    chrome.once('spawn', resolve);
    chrome.once('error', (error) => reject(new Error(`Chrome did not start (${BROWSER}): ${error.message}`)));
  });
  chrome.on('error', (error) => console.log(`FAIL Chrome: ${error.message}`));
  let targets = null;
  for (let i = 0; i < 30 && targets === null; i++) {
    await wait(500);
    if (!running(chrome)) throw new Error(`Chrome exited before it exposed a page (${chrome.exitCode ?? chrome.signalCode})`);
    try {
      const port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    } catch {
      targets = null;
    }
  }
  const page = targets?.find((t) => t.type === 'page');
  if (!page) throw new Error('Chrome exposed no page target in 15 s');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('the DevTools socket did not open')); });
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { if (!sessionStorage.getItem('t')) { localStorage.clear(); localStorage.setItem('nexora:demo', JSON.stringify({ persona: 'marcus-lee', scenario: 'healthy', scale: 'light' })); sessionStorage.setItem('t', '1'); } } catch {}`,
  });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  await send('Page.navigate', { url: `${ORIGIN}/settings/preferences` });
  const loaded = await until(`document.querySelectorAll('[data-preview-scheme] [data-preview-solid]').length === 3 && !!document.querySelector('input[name="brand"][value="amber"]')`, 40000);
  check('the preferences page draws three preview regions', loaded, loaded ? '' : await js(`location.pathname`));
  const ready = await until(`document.querySelectorAll('style[data-slotted-theme-sheet]').length === 3 && !document.querySelector('[data-appearance]').hasAttribute('aria-busy')`, 10000);
  check('the three runtime sheets arrive and the section stops waiting', ready, await js(`[...document.querySelectorAll('style[data-slotted-theme-sheet]')].map((s) => s.getAttribute('data-slotted-theme-sheet')).join(' ')`));
  await install();
  await wait(300);

  const violet = await js(`(() => {
    const scope = document.createElement('div');
    scope.setAttribute('data-slotted-theme', 'default');
    scope.setAttribute('data-slotted-scheme', document.documentElement.getAttribute('data-slotted-scheme'));
    scope.style.setProperty('--slotted-seed-accent', '#7c3aed');
    document.body.append(scope);
    const color = window.__theme.rgb(getComputedStyle(scope).getPropertyValue('--slotted-tone-accent-solid').trim()).join(',');
    scope.remove();
    return color;
  })()`);
  const before = await outside();
  check('before any choice, html and the outside probe are the default theme in violet', defaultOutside(before, violet), JSON.stringify(before));

  const faces = await cards();
  for (const card of faces) {
    const theme = THEMES.find((entry) => entry.id === card.id);
    check(
      `the ${card.id} card draws its theme's heading face and badge case`,
      card.theme === card.id && SERIF.test(card.titleFont) === theme.serif && SANS.test(card.titleFont) !== theme.serif && (card.badgeTransform === 'uppercase') === theme.caps,
      `${card.theme} ${card.titleFont.split(',')[0]} ${card.badgeTransform}`,
    );
  }

  for (const theme of THEMES) {
    await choose('theme', theme.id);
    const backgrounds = { light: new Set(), dark: new Set(), 'high-contrast': new Set() };
    for (const brand of BRANDS) {
      await choose('brand', brand);
      for (const scheme of SCHEMES) {
        const facts = await region(scheme);
        const name = `${theme.id} × ${brand} × ${scheme}`;
        backgrounds[scheme].add(facts.background);
        check(`${name}: the region names the theme and the scheme, and paints the scheme's ground`, facts.theme === theme.id && facts.scheme === scheme && GROUND[scheme](facts.ground), `${facts.theme} ${facts.scheme} L=${facts.ground.toFixed(3)} rgb(${facts.groundPainted})`);
        check(`${name}: the label stands on the solid at ${FLOOR[scheme]}:1`, facts.ratio >= FLOOR[scheme], `${facts.ratio.toFixed(2)}:1 on rgb(${facts.background})`);
        check(`${name}: the contrast table states the ratio painted`, Math.abs(facts.stated - facts.ratio) <= 0.05, `table ${facts.stated.toFixed(2)} · paint ${facts.ratio.toFixed(2)}`);
        check(
          `${name}: the corner, the case and the tracking are the theme's`,
          facts.radius === theme.radius && (facts.transform === 'uppercase') === theme.caps && (facts.badgeTransform === 'uppercase') === theme.caps && (facts.spacing !== 'normal' && facts.spacing !== '0px') === theme.caps,
          `${facts.radius} ${facts.transform} ${facts.spacing} · badge ${facts.badgeTransform}`,
        );
        check(
          `${name}: the region's heading and the alert's title are set in the theme's face`,
          [facts.headingFont, facts.titleFont].every((font) => SERIF.test(font) === theme.serif && SANS.test(font) !== theme.serif),
          `${facts.headingFont.split(',')[0]} · ${facts.titleFont.split(',')[0]}`,
        );
        const layer = await overlay(scheme);
        check(
          `${name}: the select's layer carries the region's theme, scheme and seed`,
          layer !== null && layer.outsideRegion && layer.theme === theme.id && layer.scheme === scheme && layer.seed === facts.seed && layer.solidToken === facts.solidToken,
          layer === null ? 'no layer opened' : `${layer.theme} ${layer.scheme} ${layer.seed}`,
        );
      }
    }
    for (const scheme of SCHEMES) {
      check(`${theme.id} × ${scheme}: the solid moves with the brand`, backgrounds[scheme].size === BRANDS.length, [...backgrounds[scheme]].map((c) => `rgb(${c})`).join(' | '));
    }
    const now = await outside();
    check(`${theme.id}: nothing outside the preview moved, and it is still the default in violet`, sameOutside(now, before) && defaultOutside(now, violet), sameOutside(now, before) ? '' : `${JSON.stringify(before)} → ${JSON.stringify(now)}`);
  }

  // Save: the same choice now reaches html, and the outside probe sees it.
  await choose('theme', 'nexora-sharp');
  await choose('brand', 'amber');
  await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Save preferences').click()`);
  await until(`document.documentElement.getAttribute('data-slotted-theme') === 'nexora-sharp'`, 5000);
  await wait(500);
  const saved = await outside();
  check('Save writes the theme and the seed onto html', saved.theme === 'nexora-sharp' && /--slotted-seed-accent:\s*#d97706/.test(saved.seeds), `${saved.theme} ${saved.seeds}`);
  check(
    'Save repaints the outside probe from the default in violet to Sharp in amber',
    defaultOutside(before, violet) && saved.background !== before.background && saved.radius === '0px' && saved.transform === 'uppercase' && SANS.test(saved.heading),
    `rgb(${before.background}) ${before.radius} ${before.transform} → rgb(${saved.background}) ${saved.radius} ${saved.transform}`,
  );
  exitCode = results.every(Boolean) ? 0 : 1;
  console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
} catch (error) {
  console.log(`FAIL ${error.message}`);
} finally {
  ws?.close();
  await stopChrome();
  if (server.listening) server.close();
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
process.exit(exitCode);
