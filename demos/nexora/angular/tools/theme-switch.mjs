// usage: node tools/theme-switch.mjs   (after `pnpm build:demo`; PORT optional; ORIGIN=<url> reads a running server)
// The appearance scenario: one browser session on the built demo, served from `dist` with an SPA
// fallback, on the preferences page. It waits for the runtime theme sheets, then:
// - layout, at 1440 and at the compact width (390): no segmented option clips its label; in each
//   group of choice cards (theme, brand, grey, text face, heading face) every card has the width
//   and the height of the others, and no label runs onto a second line;
// - the colour fields paint their colour in the swatch before any interaction;
// - for each of the five themes, with the theme's own brand and two presets, it reads the three
//   preview regions (light, dark, high contrast) and asserts absolute values: the region's theme,
//   scheme and ground; the button's corner, case, face and transition; the heading's face; the
//   card's line, shadow and inset; the badge's corner and case; the chart's first series in the
//   theme's palette; the label on the solid at the scheme's floor and the contrast table stating
//   the ratio painted; the select's layer carrying the region's theme, scheme and seed; and that
//   each face the theme names is loaded;
// - with two strongly tinted greys (Ocean #0e7490, Clay #9c6644), a card, the table and the select's
//   layer carry the grey's hue in light and dark, in every theme;
// - every builder axis moves the computed value it names: corner, both faces (each of the eight
//   families, loaded), type scale, lines, shadows, motion, cards, chart colours and a status colour,
//   and a burst of corner changes compiles one sheet; Reset returns to the theme as it came;
// - nothing outside the preview moves while only the preview changes — `html` keeps `default`, its
//   scheme and its seeds, a probe button outside every region keeps the default's violet, 4px corner
//   and lower case, and the page title its Geist face — read as absolute values before the first
//   choice and after every theme. Save then moves `html` and the probe.
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

const SCHEMES = ['light', 'dark', 'high-contrast'];
const FLOOR = { light: 4.5, dark: 4.5, 'high-contrast': 7 };
/** The ground each scheme paints, as the WCAG luminance of `--slotted-surface`; high contrast is a light scheme. */
const GROUND = { light: (l) => l > 0.8, dark: (l) => l < 0.2, 'high-contrast': (l) => l > 0.9 };
const FACE = {
  geist: 'Geist Variable',
  inter: 'Inter Variable',
  nunito: 'Nunito Variable',
  'source-sans': 'Source Sans 3 Variable',
  outfit: 'Outfit Variable',
  'source-serif': 'Source Serif 4 Variable',
  fraunces: 'Fraunces Variable',
  'jetbrains-mono': 'JetBrains Mono Variable',
};
/** The first family of a computed `font-family`, unquoted. */
const first = (stack) => stack.split(',')[0].trim().replace(/^["']|["']$/g, '');

/**
 * What each theme draws, as absolute values: the solid button's corner, case, face and transition;
 * the heading's face; the card's top line, shadow (a prefix of the computed value, per light/dark)
 * and inline inset; the badge's corner and case; the first data colour per scheme.
 */
const THEMES = [
  {
    id: 'default',
    radius: '4px', transform: 'none', body: 'geist', heading: 'geist', duration: '0.12s',
    cardLine: '1px', cardShadow: { light: 'none', dark: 'none' }, inset: '16px',
    badgeRadius: '9999px', badgeCaps: 'normal',
    data: { light: '#2563eb', dark: '#2563eb', 'high-contrast': '#1d4ed8' },
  },
  {
    id: 'nexora-friendly',
    radius: '9999px', transform: 'none', body: 'nunito', heading: 'nunito', duration: '0.18s',
    cardLine: '0px', cardShadow: { light: 'rgba(190, 70, 110, 0.22) 0px 10px 24px -8px', dark: 'rgba(0, 0, 0, 0.65) 0px 14px 30px -10px' }, inset: '24px',
    badgeRadius: '9999px', badgeCaps: 'normal',
    data: { light: '#d6336c', dark: '#f06595', 'high-contrast': '#a61e4d' },
  },
  {
    id: 'nexora-brutalist',
    radius: '0px', transform: 'uppercase', body: 'inter', heading: 'jetbrains-mono', duration: '0.001s',
    cardLine: '2px', cardShadow: { light: '5px 5px 0px 0px', dark: '5px 5px 0px 0px' }, inset: '18px',
    badgeRadius: '0px', badgeCaps: 'normal',
    data: { light: '#111111', dark: '#ffd400', 'high-contrast': '#000000' },
  },
  {
    id: 'nexora-editorial',
    radius: '2px', transform: 'none', body: 'source-serif', heading: 'fraunces', duration: '0.16s',
    cardLine: '1px', cardShadow: { light: 'none', dark: 'none' }, inset: '30px',
    badgeRadius: '1px', badgeCaps: 'all-small-caps',
    data: { light: '#8a1538', dark: '#d4708a', 'high-contrast': '#6b0f28' },
  },
  {
    id: 'nexora-terminal',
    radius: '2px', transform: 'lowercase', body: 'jetbrains-mono', heading: 'jetbrains-mono', duration: '0.08s',
    cardLine: '1px', cardShadow: { light: 'none', dark: 'none' }, inset: '12px',
    badgeRadius: '1px', badgeCaps: 'normal',
    data: { light: '#0a8f2a', dark: '#39ff14', 'high-contrast': '#005c00' },
  },
];
const BRANDS = ['theme', 'emerald', 'rose'];
/** The two tinted greys and their OKLCH hue, for the grounds that must carry it. */
const GREYS = [{ id: 'ocean', hue: 223 }, { id: 'clay', hue: 52 }];
const DEFAULT_PROBE = { radius: '4px', transform: 'none', spacing: 'normal' };

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
const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });

/*
 * Helpers installed in the page once: a colour of any CSS notation read as sRGB through a canvas,
 * its OKLCH, its WCAG luminance, the ratio of two of them, a counter of compiled draft sheets, and a
 * probe — a solid button the button family paints by its attributes, appended to the body, outside
 * every preview region.
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
  const linear = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = (color) => { const [r, g, b] = rgb(color).map(linear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const oklch = (color) => {
    const [r, g, b] = rgb(color).map(linear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
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
  window.__theme = { rgb, oklch, luminance, ratio, drafts: 0 };
  document.addEventListener('slotted-themechange', (event) => { if (event.detail.name === 'nexora-custom-draft' && event.detail.applied) window.__theme.drafts += 1; });
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
  facts.theme === 'default' && /--slotted-seed-accent:\s*#7c3aed/.test(facts.seeds) && facts.background === violet &&
  facts.radius === DEFAULT_PROBE.radius && facts.transform === DEFAULT_PROBE.transform && facts.spacing === DEFAULT_PROBE.spacing &&
  first(facts.heading) === FACE.geist;

/**
 * Waits until the regions have settled: the button family transitions its colours, and a value read
 * mid-transition is neither the old colour nor the new one. Settled is no running animation inside a
 * region, and the solids and the regions' themes reading the same twice, a frame apart.
 */
const settle = async (label) => {
  const settled = await until(`new Promise((resolve) => {
    const read = () => [...document.querySelectorAll('[data-preview-scheme]')].map((r) => r.getAttribute('data-slotted-theme') + getComputedStyle(r.querySelector('[data-preview-solid]')).backgroundColor + getComputedStyle(r.querySelector('[data-preview-card]')).boxShadow).join();
    const first = read();
    const running = document.getAnimations().some((a) => a.playState === 'running' && a.effect?.target?.closest?.('[data-preview-scheme]'));
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(!running && read() === first)));
  })`, 5000);
  if (!settled) throw new Error(`${label}: the preview did not settle in 5 s`);
};
/** Chooses a candidate by its native radio, then waits for the preview to settle. */
const choose = async (name, value) => {
  const found = await js(`(() => { const input = document.querySelector('input[name="${name}"][value="${value}"]'); if (!input) return false; input.click(); return true; })()`);
  if (!found) throw new Error(`no radio ${name}=${value}`);
  await settle(`${name}=${value}`);
};
/** Waits until the regions name `theme`: a builder change compiles after its pause. */
const regionsName = (theme) => until(`[...document.querySelectorAll('[data-preview-scheme]')].every((r) => r.getAttribute('data-slotted-theme') === '${theme}')`, 8000);
/** Waits until a face of `family` has loaded — a theme sheet and the font picker may each declare one — and says which state it reached. */
const loaded = (family) => js(`(async () => {
  await document.fonts.ready;
  const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === ${JSON.stringify(family)});
  if (faces.length === 0) return 'undeclared';
  const end = Date.now() + 10000;
  while (Date.now() < end && !faces.some((f) => f.status === 'loaded')) await new Promise((r) => setTimeout(r, 100));
  return faces.some((f) => f.status === 'loaded') ? 'loaded' : faces.map((f) => f.status).join('/');
})()`);

/** One region's facts: its attributes and ground, the samples' paint, the faces and the table's cell. */
const region = (scheme) => js(`(() => {
  const region = document.querySelector('[data-preview-scheme="${scheme}"]');
  const css = (selector, from = region) => getComputedStyle(from.querySelector(selector));
  const button = region.querySelector('[data-preview-solid]');
  const style = getComputedStyle(button);
  const badge = css('[data-ui=badge]');
  const card = css('[data-preview-card]');
  const edge = getComputedStyle(region.querySelector('[data-preview-card]'), '::before');
  const header = css('[data-preview-card] [data-part=header]');
  const cell = document.querySelector('[data-contrast] td[data-pair="on-solid"][data-scheme="${scheme}"] [data-ratio]');
  const fills = [...region.querySelectorAll('[data-preview-chart] svg path, [data-preview-chart] svg rect')]
    .map((shape) => shape.getAttribute('fill')).filter((fill) => fill && fill !== 'none' && !fill.startsWith('url'))
    .map((fill) => window.__theme.rgb(fill).join(','));
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
    buttonFace: style.fontFamily,
    duration: style.transitionDuration.split(',')[0].trim(),
    buttonShadow: style.boxShadow,
    badgeRadius: badge.borderTopLeftRadius,
    badgeCaps: badge.fontVariantCaps,
    headingFace: css('h4[data-ui=typography]').fontFamily,
    bodyFace: css('[data-preview-figure] [data-part=label]').fontFamily,
    bodySize: css('[data-ui=alert] [data-part=description]').fontSize,
    cardLine: edge.borderTopWidth,
    cardShadow: card.boxShadow,
    cardRadius: card.borderTopLeftRadius,
    cardGround: window.__theme.rgb(card.backgroundColor).join(','),
    sunken: window.__theme.rgb(getComputedStyle(region).getPropertyValue('--slotted-surface-sunken').trim()).join(','),
    inset: header.paddingLeft,
    fieldLine: css('[data-ui=text-field]').borderTopWidth,
    tabItem: (() => { const item = region.querySelector('[data-preview-tabs] [data-part=item][data-selected]'); const s = getComputedStyle(item); return { background: s.backgroundColor, radius: s.borderTopLeftRadius, before: getComputedStyle(item.querySelector('[data-part=label]'), '::before').content }; })(),
    head: (() => { const h = css('[data-preview-table] [data-part=column-header]'); return { background: window.__theme.rgb(h.backgroundColor).join(','), color: h.color, transform: h.textTransform }; })(),
    fills,
    accentSolid: window.__theme.rgb(getComputedStyle(region).getPropertyValue('--slotted-tone-accent-solid').trim()).join(','),
    dangerSolid: window.__theme.rgb(getComputedStyle(region.querySelector('[data-ui=button][data-tone=danger]')).backgroundColor).join(','),
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
        let ground = listbox;
        while (ground && getComputedStyle(ground).backgroundColor === 'rgba(0, 0, 0, 0)') ground = ground.parentElement;
        return {
          outsideRegion: !region.contains(listbox),
          theme: layer?.getAttribute('data-slotted-theme') ?? null,
          scheme: layer?.getAttribute('data-slotted-scheme') ?? null,
          seed: style.getPropertyValue('--slotted-seed-accent').trim(),
          solidToken: getComputedStyle(listbox).getPropertyValue('--slotted-tone-accent-solid').trim(),
          ground: ground ? getComputedStyle(ground).backgroundColor : 'none',
        };
      })()`)
    : null;
  await js(`document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await until(`!document.querySelector('[data-slotted-portal] [role=listbox]')`, 5000);
  return facts;
};

/** The layout of the builder and the choice cards at the current width. */
const layout = () => js(`(() => {
  const clipped = [...document.querySelectorAll('[data-appearance] [data-ui=segmented-control] [data-part=item]')]
    .filter((item) => { const label = item.querySelector('[data-part=label]'); return item.scrollWidth > item.clientWidth + 0.5 || (label && label.scrollWidth > label.clientWidth + 0.5); })
    .map((item) => item.textContent.trim());
  const lines = (node) => { const range = document.createRange(); range.selectNodeContents(node); return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size; };
  const groups = {};
  for (const name of ['theme', 'brand', 'neutral', 'font-body', 'font-heading']) {
    const tiles = [...document.querySelectorAll('input[name="' + name + '"]')].map((input) => input.closest('[data-part=item]'));
    const texts = tiles.flatMap((tile) => { const walker = document.createTreeWalker(tile, NodeFilter.SHOW_TEXT); const found = []; while (walker.nextNode()) { const node = walker.currentNode; if (node.textContent.trim() && !node.parentElement.closest('[aria-hidden=true]')) found.push(node); } return found; });
    groups[name] = {
      count: tiles.length,
      widths: [...new Set(tiles.map((tile) => tile.offsetWidth))],
      heights: [...new Set(tiles.map((tile) => tile.offsetHeight))],
      wrapped: texts.filter((node) => lines(node) > 1).map((node) => node.textContent.trim()),
    };
  }
  return { clipped, segments: document.querySelectorAll('[data-appearance] [data-ui=segmented-control] [data-part=item]').length, groups, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
})()`);
const spread = (values) => Math.max(...values) - Math.min(...values);
const checkLayout = async (width) => {
  const facts = await layout();
  check(`${width}px: no segmented option clips its label`, facts.segments >= 18 && facts.clipped.length === 0, `${facts.segments} options${facts.clipped.length ? ' · clipped ' + facts.clipped.join(', ') : ''}`);
  for (const [name, group] of Object.entries(facts.groups)) {
    check(
      `${width}px: the ${name} cards share one width and one height, and no label wraps`,
      group.count >= 5 && spread(group.widths) <= 1 && spread(group.heights) <= 1 && group.wrapped.length === 0,
      `${group.count} cards · widths ${group.widths.join('/')} · heights ${group.heights.join('/')}${group.wrapped.length ? ' · wrapped ' + group.wrapped.join(', ') : ''}`,
    );
  }
  check(`${width}px: the page does not scroll sideways`, facts.overflow <= 0, `${facts.overflow}px`);
};

/** The colour fields' swatches as first painted: the colour of the field's text, not a bare button. */
const swatches = () => js(`[...document.querySelectorAll('[data-appearance] [data-ui=text-field] [data-ui=color-picker][data-part=trigger]')].map((trigger) => {
  const style = getComputedStyle(trigger);
  const value = trigger.closest('[data-ui=text-field]').querySelector('input').value;
  return { value, image: style.backgroundImage, expected: 'rgb(' + window.__theme.rgb(value).join(', ') + ')', appearance: style.appearance, width: trigger.offsetWidth, height: trigger.offsetHeight };
})`);

/** A colour typed into one of the section's colour fields and committed with Enter. */
const typeColour = (selector, value) => js(`(() => {
  const input = document.querySelector('${selector} [data-ui=text-field] input');
  input.focus();
  input.value = '${value}';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return true;
})()`);

/** The `--slotted-tone-*-solid` a seed derives to under a theme and scheme, read from a scope of its own. */
const derived = (theme, scheme, seed, value, tone) => js(`(() => {
  const scope = document.createElement('div');
  scope.setAttribute('data-slotted-theme', '${theme}');
  scope.setAttribute('data-slotted-scheme', '${scheme}');
  scope.style.setProperty('--slotted-seed-${seed}', '${value}');
  document.body.append(scope);
  const color = window.__theme.rgb(getComputedStyle(scope).getPropertyValue('--slotted-tone-${tone}-solid').trim()).join(',');
  scope.remove();
  return color;
})()`);

const near = (hue, target, within) => { const d = Math.abs(hue - target) % 360; return Math.min(d, 360 - d) <= within; };

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
  await viewport(1440, 900);

  await send('Page.navigate', { url: `${ORIGIN}/settings/preferences` });
  const loadedPage = await until(`document.querySelectorAll('[data-preview-scheme] [data-preview-solid]').length === 3 && !!document.querySelector('input[name="brand"][value="amber"]')`, 40000);
  check('the preferences page draws three preview regions', loadedPage, loadedPage ? '' : await js(`location.pathname`));
  const ready = await until(`document.querySelectorAll('style[data-slotted-theme-sheet]').length >= 4 && !document.querySelector('[data-appearance]').hasAttribute('aria-busy')`, 15000);
  check('the four runtime sheets arrive and the section stops waiting', ready, await js(`[...document.querySelectorAll('style[data-slotted-theme-sheet]')].map((s) => s.getAttribute('data-slotted-theme-sheet')).join(' ')`));
  await install();
  await wait(300);

  // The colour fields, before anything is touched.
  const fields = await swatches();
  check(
    'every colour field paints its colour in its swatch on first render',
    fields.length === 4 && fields.every((field) => field.image.includes(field.expected) && field.appearance === 'none' && Math.abs(field.width - field.height) <= 1),
    fields.map((field) => `${field.value} ${field.width}×${field.height} ${field.image.slice(0, 48)}`).join(' | '),
  );

  await checkLayout(1440);

  const violet = await derived('default', await js(`document.documentElement.getAttribute('data-slotted-scheme')`), 'accent', '#7c3aed', 'accent');
  const before = await outside();
  check('before any choice, html and the outside probe are the default theme in violet', defaultOutside(before, violet), JSON.stringify(before));

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
        if (brand !== 'theme') continue;
        check(
          `${name}: the button's corner, case, face and motion are the theme's`,
          facts.radius === theme.radius && facts.transform === theme.transform && first(facts.buttonFace) === FACE[theme.body] && facts.duration === theme.duration,
          `${facts.radius} ${facts.transform} ${first(facts.buttonFace)} ${facts.duration}`,
        );
        check(
          `${name}: the heading and the text are set in the theme's faces`,
          first(facts.headingFace) === FACE[theme.heading] && first(facts.bodyFace) === FACE[theme.body],
          `${first(facts.headingFace)} · ${first(facts.bodyFace)}`,
        );
        if (scheme !== 'high-contrast') {
          check(
            `${name}: the card's line, shadow and inset are the theme's`,
            facts.cardLine === theme.cardLine && (theme.cardShadow[scheme] === 'none' ? facts.cardShadow === 'none' : facts.cardShadow.includes(theme.cardShadow[scheme])) && facts.inset === theme.inset,
            `${facts.cardLine} · ${facts.cardShadow.slice(0, 60)} · ${facts.inset}`,
          );
        }
        check(`${name}: the badge's corner and case are the theme's`, facts.badgeRadius === theme.badgeRadius && facts.badgeCaps === theme.badgeCaps, `${facts.badgeRadius} ${facts.badgeCaps}`);
        const series = await js(`window.__theme.rgb('${theme.data[scheme]}').join(',')`);
        check(`${name}: the chart's first series is the theme's ${theme.data[scheme]}`, facts.fills.includes(series), `${facts.fills.length} shapes · ${[...new Set(facts.fills)].slice(0, 4).map((c) => `rgb(${c})`).join(' ')}`);
        if (theme.id === 'nexora-friendly') {
          check(`${name}: the selected tab is a pill on the accent's surface`, facts.tabItem.radius === '9999px' && facts.tabItem.background !== 'rgba(0, 0, 0, 0)', `${facts.tabItem.radius} ${facts.tabItem.background}`);
        }
        if (theme.id === 'nexora-brutalist') {
          check(`${name}: the table's head is a band of the accent's solid, in its ink and capitals`, facts.head.background === facts.accentSolid && facts.head.transform === 'uppercase', `rgb(${facts.head.background}) ${facts.head.color} ${facts.head.transform}`);
          if (scheme === 'light') check(`${name}: the accent is a yellow solid under dark ink`, facts.background === '255,212,0' && facts.ratio >= 4.5, `rgb(${facts.background}) ${facts.ratio.toFixed(2)}:1`);
        }
        if (theme.id === 'nexora-terminal') {
          check(`${name}: the selected tab reads as a prompt`, facts.tabItem.before === '"> "', facts.tabItem.before);
        }
        const layer = await overlay(scheme);
        check(
          `${name}: the select's layer carries the region's theme, scheme and seed`,
          layer !== null && layer.outsideRegion && layer.theme === theme.id && layer.scheme === scheme && layer.seed === facts.seed && layer.solidToken === facts.solidToken,
          layer === null ? 'no layer opened' : `${layer.theme} ${layer.scheme} ${layer.seed || '(theme’s own)'}`,
        );
      }
    }
    for (const scheme of SCHEMES) {
      check(`${theme.id} × ${scheme}: the solid moves with the brand`, backgrounds[scheme].size === BRANDS.length, [...backgrounds[scheme]].map((c) => `rgb(${c})`).join(' | '));
    }
    for (const family of new Set([theme.body, theme.heading])) {
      const state = await loaded(FACE[family]);
      check(`${theme.id}: ${FACE[family]} is loaded`, state === 'loaded', state);
    }

    // The tinted greys: a card, the table and the select's layer carry the grey's hue, and the lines
    // and hovers stay in the ground's family (±20° of its hue, wherever its chroma reaches 0.01).
    await choose('brand', 'theme');
    const grounds = {};
    for (const grey of [{ id: 'theme', hue: null }, ...GREYS]) {
      if (grey.id !== 'theme') await choose('neutral', grey.id);
      for (const scheme of ['light', 'dark']) {
        const family = await js(`(() => {
          const style = getComputedStyle(document.querySelector('[data-preview-scheme="${scheme}"]'));
          const read = (token) => ({ token, ...window.__theme.oklch(style.getPropertyValue(token).trim()) });
          return { ground: read('--slotted-surface'), others: ['--slotted-border-subtle', '--slotted-tone-secondary-subtle-hover', '--slotted-control-border-color'].map(read) };
        })()`);
        if (family.ground.c >= 0.01) {
          check(
            `${theme.id} × ${grey.id} grey × ${scheme}: lines and hovers carry the ground's hue`,
            family.others.every((other) => near(other.h, family.ground.h, 20)),
            `ground h${family.ground.h.toFixed(0)} c${family.ground.c.toFixed(3)} · ${family.others.map((o) => `${o.token.replace('--slotted-', '')} h${o.h.toFixed(0)}`).join(' ')}`,
          );
        }
        if (grey.id === 'theme') continue;
        const facts = await js(`(() => {
          const region = document.querySelector('[data-preview-scheme="${scheme}"]');
          const read = (element) => { const color = getComputedStyle(element).backgroundColor; return { color, ...window.__theme.oklch(color) }; };
          return { card: read(region.querySelector('[data-preview-card]')), table: read(region.querySelector('[data-preview-table] [data-part=row]')), figure: read(region.querySelector('[data-preview-figure]')) };
        })()`);
        const layer = await overlay(scheme);
        const listbox = layer ? await js(`window.__theme.oklch(${JSON.stringify(layer.ground)})`) : null;
        const all = { ...facts, layer: listbox ? { color: layer.ground, ...listbox } : null };
        grounds[`${grey.id} ${scheme}`] = all;
        const tinted = Object.values(all).every((ground) => ground !== null && ground.c >= 0.004 && near(ground.h, grey.hue, 35));
        check(
          `${theme.id} × ${grey.id} × ${scheme}: card, table, stat card and select layer carry the grey's hue`,
          tinted,
          Object.entries(all).map(([part, g]) => (g ? `${part} ${g.color} h${g.h.toFixed(0)} c${g.c.toFixed(3)}` : `${part} none`)).join(' · '),
        );
      }
    }
    for (const scheme of ['light', 'dark']) {
      check(`${theme.id} × ${scheme}: the card's ground differs between the two greys`, grounds[`ocean ${scheme}`].card.color !== grounds[`clay ${scheme}`].card.color, `${grounds[`ocean ${scheme}`].card.color} | ${grounds[`clay ${scheme}`].card.color}`);
    }
    await choose('neutral', 'theme');

    const now = await outside();
    check(`${theme.id}: nothing outside the preview moved, and it is still the default in violet`, sameOutside(now, before) && defaultOutside(now, violet), sameOutside(now, before) ? '' : `${JSON.stringify(before)} → ${JSON.stringify(now)}`);
  }

  // The builder, over Standard: each axis moves the value it names, in the light region.
  await choose('theme', 'default');
  const base = await region('light');
  /** Polls the light region until `expect` holds or 8 s pass: a builder change compiles after its pause. */
  const awaitRegion = async (expect) => {
    const end = Date.now() + 8000;
    let facts = await region('light');
    while (Date.now() < end && !(facts.theme === 'nexora-custom-draft' && expect(facts))) {
      await wait(150);
      facts = await region('light');
    }
    return facts;
  };
  const axis = async (name, value, read, expect, describe) => {
    await choose(name, value);
    const facts = await awaitRegion((f) => expect(read(f), f));
    check(`builder ${name}=${value}: ${describe}`, facts.theme === 'nexora-custom-draft' && expect(read(facts), facts), `${facts.theme} · ${read(facts)}`);
    await choose(name, 'theme');
    await regionsName('default');
  };
  await axis('axis-scale', '112', (f) => f.bodySize, (size) => Math.abs(Number.parseFloat(size) - Number.parseFloat(base.bodySize) * 1.12) < 0.05, `the type is 112% of the library's (${base.bodySize} before)`);
  await axis('axis-border', '2', (f) => `${f.cardLine} ${f.fieldLine}`, (v) => v === '2px 2px', 'cards and fields draw a 2px line');
  await axis('axis-shadow', 'none', (f) => f.buttonShadow, (v) => v === 'none', 'the button stands on no shadow');
  await axis('axis-shadow', 'strong', (f) => f.buttonShadow, (v) => v.includes('rgba(15, 23, 42, 0.14) 0px 2px 4px'), 'the button stands on the strong shadow');
  await axis('axis-motion', 'off', (f) => f.duration, (v) => v === '0.001s', 'transitions take 1ms');
  await axis('axis-motion', 'reduced', (f) => f.duration, (v) => v === '0.06s', 'transitions take 60ms');
  await axis('axis-cards', 'elevated', (f) => `${f.cardLine} ${f.cardShadow}`, (v) => v.startsWith('0px rgba(15, 23, 42, 0.08) 0px 4px 6px -1px'), 'a card has no line and the medium shadow');
  await axis('axis-cards', 'flat', (f) => `${f.cardLine} ${f.cardShadow} rgb(${f.cardGround})`, (v, f) => f.cardLine === '0px' && f.cardShadow === 'none' && f.cardGround === f.sunken, 'a card is a sunken fill');
  await axis('axis-chart', 'accent', (f) => f.fills.includes(f.accentSolid), (v) => v === true, 'the first series is the accent solid');

  // Both faces: each of the eight families, set and loaded.
  for (const [picker, read] of [['font-body', (f) => first(f.bodyFace) + ' / ' + first(f.buttonFace)], ['font-heading', (f) => first(f.headingFace)]]) {
    for (const [family, face] of Object.entries(FACE)) {
      await choose(picker, family);
      const facts = await awaitRegion((f) => read(f).split(' / ').every((one) => one === face));
      const state = await loaded(face);
      const value = read(facts);
      check(
        `builder ${picker}=${family}: the ${picker === 'font-body' ? 'text and the controls are' : 'heading is'} set in ${face}, loaded`,
        facts.theme === 'nexora-custom-draft' && value.split(' / ').every((one) => one === face) && state === 'loaded',
        `${value} · ${state}`,
      );
    }
    await choose(picker, 'theme');
  }

  // The corner: a burst of steps compiles one sheet, with the last value.
  await choose('axis-cards', 'theme');
  await regionsName('default');
  /* Twelve steps, one every 40 ms, as a held arrow key repeats: inside the 200 ms pause of the compile. */
  await js(`(async () => { window.__theme.drafts = 0; const thumb = document.querySelector('[data-axis=radius] input[type=range]'); thumb.focus(); for (let i = 0; i < 12; i++) { thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await new Promise((r) => setTimeout(r, 40)); } return true; })()`);
  await until(`getComputedStyle(document.querySelector('[data-preview-scheme="light"] [data-preview-card]')).borderTopLeftRadius === '24px'`, 8000);
  await wait(600);
  const corner = await region('light');
  const compiled = await js(`window.__theme.drafts`);
  check('builder corner: twelve steps compile one sheet, at 24px', compiled === 1 && corner.cardRadius === '24px' && corner.radius === '12px', `${compiled} compile(s) · card ${corner.cardRadius} · button ${corner.radius}`);

  // A status colour is a seed: the danger button derives its solid from it.
  await typeColour('[data-status=danger]', '#be123c');
  await until(`getComputedStyle(document.querySelector('[data-preview-scheme="light"]')).getPropertyValue('--slotted-seed-danger').trim() === '#be123c'`, 5000);
  await settle('danger');
  const danger = await region('light');
  const expectedDanger = await derived('nexora-custom-draft', 'light', 'danger', '#be123c', 'danger');
  check('builder danger=#be123c: the danger button paints the solid the seed derives to', danger.dangerSolid === expectedDanger, `rgb(${danger.dangerSolid}) vs rgb(${expectedDanger})`);

  const changes = await js(`document.querySelector('[data-changes]')?.textContent.trim() ?? ''`);
  await js(`document.querySelector('[data-reset]').click()`);
  await settle('reset');
  const reset = await region('light');
  check('Reset returns the preview to the theme as it came', changes === '2 changes' && reset.theme === 'default' && reset.cardRadius === base.cardRadius && reset.dangerSolid === base.dangerSolid && !(await js(`!!document.querySelector('[data-changes]')`)), `${changes} → ${reset.theme} ${reset.cardRadius}`);

  const now = await outside();
  check('after the builder, nothing outside the preview moved', sameOutside(now, before) && defaultOutside(now, violet), sameOutside(now, before) ? '' : `${JSON.stringify(before)} → ${JSON.stringify(now)}`);

  // Save: the same choice now reaches html, and the outside probe sees it.
  await choose('theme', 'nexora-brutalist');
  await choose('brand', 'amber');
  await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Save preferences').click()`);
  await until(`document.documentElement.getAttribute('data-slotted-theme') === 'nexora-brutalist'`, 5000);
  await wait(500);
  const saved = await outside();
  check('Save writes the theme and the seed onto html', saved.theme === 'nexora-brutalist' && /--slotted-seed-accent:\s*#d97706/.test(saved.seeds), `${saved.theme} ${saved.seeds}`);
  check(
    'Save repaints the outside probe from the default in violet to Brutalist in amber',
    saved.background !== before.background && saved.radius === '0px' && saved.transform === 'uppercase' && first(saved.heading) === FACE['jetbrains-mono'],
    `rgb(${before.background}) ${before.radius} ${before.transform} → rgb(${saved.background}) ${saved.radius} ${saved.transform} ${first(saved.heading)}`,
  );
  await choose('axis-cards', 'flat');
  await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Save preferences').click()`);
  const custom = await until(`document.documentElement.getAttribute('data-slotted-theme') === 'nexora-custom'`, 8000);
  const customSheet = await js(`document.querySelector('style[data-slotted-theme-sheet="nexora-custom"]')?.textContent.includes('--slotted-card-background: var(--slotted-surface-sunken)') ?? false`);
  check('Save of a customised theme names the compiled nexora-custom on html', custom && customSheet, await js(`document.documentElement.getAttribute('data-slotted-theme')`));

  // The compact width: the builder and the cards hold their layout.
  await viewport(390, 844);
  await wait(600);
  await checkLayout(390);

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
