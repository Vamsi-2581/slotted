// usage: node tools/theme-switch.mjs   (after `pnpm build:demo`; PORT optional; ORIGIN=<url> reads a running server)
// The appearance scenario: one browser session on the built demo, served from `dist` with an SPA
// fallback, on the preferences page. For each of the four themes and three brands it chooses the
// candidate in the Appearance section and reads the three preview regions (light, dark, high
// contrast): the region names the theme and the scheme; the solid button's background moves with
// the brand; its label stands on it at the scheme's floor (4.5:1, 7:1 in high contrast); its corner
// and case, and the alert title's face, are the theme's; the select opened in the region carries the region's theme, scheme and seed to
// the end of the body. Meanwhile nothing outside the preview moves: `html` keeps its attributes
// and seeds, and a solid button outside every region keeps its colour, corner and case. Save then
// moves `html` and that button, which proves the outside probe can see a change.
// Prints one PASS or FAIL per check and exits non-zero on a failure.
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
  { id: 'default', radius: '4px', transform: 'none', serif: false },
  { id: 'nexora-soft', radius: '8px', transform: 'none', serif: false },
  { id: 'nexora-sharp', radius: '0px', transform: 'uppercase', serif: false },
  { id: 'nexora-editorial', radius: '4px', transform: 'none', serif: true },
];
const BRANDS = ['emerald', 'amber', 'rose'];
const FLOOR = { light: 4.5, dark: 4.5, 'high-contrast': 7 };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) file = join(ROOT, 'index.html');
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
if (SERVED === undefined) {
  await new Promise((resolve) => server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', resolve));
}
const ORIGIN = SERVED ?? `http://127.0.0.1:${server.address().port}`;

const profile = mkdtempSync(join(tmpdir(), 'slotted-theme-'));
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' });
let targets = null;
for (let i = 0; i < 30 && targets === null; i++) {
  await new Promise((r) => setTimeout(r, 500));
  try {
    const port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {
    targets = null;
  }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
await new Promise((r) => (ws.onopen = r));
await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `try { if (!sessionStorage.getItem('t')) { localStorage.clear(); localStorage.setItem('nexora:demo', JSON.stringify({ persona: 'marcus-lee', scenario: 'healthy', scale: 'light' })); sessionStorage.setItem('t', '1'); } } catch {}`,
});
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

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
 * the WCAG ratio of two of them, and a probe — a solid button the button family paints by its
 * attributes, appended to the body, outside every preview region.
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
  window.__theme = { rgb, ratio };
  return true;
})()`);

/** What must not move while only the preview changes. */
const outside = () => js(`(() => {
  const html = document.documentElement;
  const probe = getComputedStyle(document.querySelector('[data-theme-probe]'));
  const heading = document.querySelector('[data-ui=page-header] [data-part=heading]');
  return JSON.stringify({
    theme: html.getAttribute('data-slotted-theme'),
    scheme: html.getAttribute('data-slotted-scheme'),
    seeds: html.style.cssText,
    probe: [probe.backgroundColor, probe.borderTopLeftRadius, probe.textTransform],
    heading: heading ? getComputedStyle(heading).fontFamily : null,
  });
})()`);

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

/** One region's facts: its attributes, and the solid button's paint and label ratio. */
const region = (scheme) => js(`(() => {
  const region = document.querySelector('[data-preview-scheme="${scheme}"]');
  const button = region.querySelector('[data-preview-solid]');
  const style = getComputedStyle(button);
  return {
    theme: region.getAttribute('data-slotted-theme'),
    scheme: region.getAttribute('data-slotted-scheme'),
    seed: getComputedStyle(region).getPropertyValue('--slotted-seed-accent').trim(),
    solidToken: getComputedStyle(region).getPropertyValue('--slotted-tone-accent-solid').trim(),
    background: window.__theme.rgb(style.backgroundColor).join(','),
    ratio: window.__theme.ratio(style.color, style.backgroundColor),
    radius: style.borderTopLeftRadius,
    transform: style.textTransform,
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

let exitCode = 1;
try {
  await send('Page.navigate', { url: `${ORIGIN}/settings/preferences` });
  const loaded = await until(`document.querySelectorAll('[data-preview-scheme] [data-preview-solid]').length === 3 && !!document.querySelector('input[name="brand"][value="amber"]')`, 40000);
  check('the preferences page draws three preview regions', loaded, loaded ? '' : await js(`location.pathname`));
  await install();
  await wait(300);
  const before = await outside();

  for (const theme of THEMES) {
    await choose('theme', theme.id);
    const backgrounds = { light: new Set(), dark: new Set(), 'high-contrast': new Set() };
    for (const brand of BRANDS) {
      await choose('brand', brand);
      for (const scheme of ['light', 'dark', 'high-contrast']) {
        const facts = await region(scheme);
        const name = `${theme.id} × ${brand} × ${scheme}`;
        backgrounds[scheme].add(facts.background);
        check(`${name}: the region names the theme and the scheme`, facts.theme === theme.id && facts.scheme === scheme, `${facts.theme} ${facts.scheme}`);
        check(`${name}: the label stands on the solid at ${FLOOR[scheme]}:1`, facts.ratio >= FLOOR[scheme], `${facts.ratio.toFixed(2)}:1 on rgb(${facts.background})`);
        check(`${name}: the corner and the case are the theme's`, facts.radius === theme.radius && facts.transform === theme.transform, `${facts.radius} ${facts.transform}`);
        check(`${name}: the alert's title is set in the theme's face`, facts.titleFont.startsWith('ui-serif') === theme.serif && /Geist/.test(facts.titleFont) !== theme.serif, facts.titleFont);
        const layer = await overlay(scheme);
        check(
          `${name}: the select's layer carries the region's theme, scheme and seed`,
          layer !== null && layer.outsideRegion && layer.theme === theme.id && layer.scheme === scheme && layer.seed === facts.seed && layer.solidToken === facts.solidToken,
          layer === null ? 'no layer opened' : `${layer.theme} ${layer.scheme} ${layer.seed}`,
        );
      }
    }
    for (const scheme of ['light', 'dark', 'high-contrast']) {
      check(`${theme.id} × ${scheme}: the solid moves with the brand`, backgrounds[scheme].size === BRANDS.length, [...backgrounds[scheme]].map((c) => `rgb(${c})`).join(' | '));
    }
    const now = await outside();
    check(`${theme.id}: nothing outside the preview moved`, now === before, now === before ? '' : `${before} → ${now}`);
  }

  // Save: the same choice now reaches html, and the outside probe sees it.
  await choose('theme', 'nexora-sharp');
  await choose('brand', 'amber');
  await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Save preferences').click()`);
  await wait(500);
  const saved = JSON.parse(await outside());
  const first = JSON.parse(before);
  check('Save writes the theme and the seed onto html', saved.theme === 'nexora-sharp' && /--slotted-seed-accent:\s*#d97706/.test(saved.seeds), `${saved.theme} ${saved.seeds}`);
  check('Save repaints the outside probe', saved.probe[0] !== first.probe[0] && saved.probe[1] === '0px' && saved.probe[2] === 'uppercase', `${first.probe.join(' ')} → ${saved.probe.join(' ')}`);
  exitCode = results.every(Boolean) ? 0 : 1;
  console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
} catch (error) {
  console.log(`FAIL ${error.message}`);
} finally {
  ws.close();
  chrome.kill();
  await new Promise((resolve) => (chrome.exitCode === null ? chrome.once('exit', resolve) : resolve()));
  if (SERVED === undefined) server.close();
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
process.exit(exitCode);
