// usage: node tools/theme-switch.mjs   (after `pnpm build:demo`; PORT optional; ORIGIN=<url> reads a running server)
// The appearance scenario: one browser session on the built demo, served from `dist` with an SPA
// fallback, on the preferences page, where every choice draws the whole application at once. It
// waits for the runtime theme sheets, then:
// - the colour fields paint their colour in the swatch before any interaction, and a font specimen
//   names its face only once it is scrolled into view, in a box that does not move when it does;
// - for each of the five themes, with the theme's own brand and two presets, in light and dark, it
//   reads `html` and asserts absolute values: the theme and the scheme `html` names and the ground
//   they paint; a probe button's corner, case, face and transition; the page heading's face; the
//   contrast table's badges' corner and case; the first data colour; the label on the solid at the
//   scheme's floor and the contrast table stating the ratio painted; the start page select's layer
//   carrying the theme, scheme and seed of `html`; each face the theme names, loaded; and that the
//   theme cards' specimens draw their own theme without changing the page around them; a text
//   field at rest, under keyboard focus (Tab), invalid, and invalid under focus: Editorial draws it
//   as a ruled line (bottom edge only, no corner or ground; focus thickens the line in the ring's
//   colour with no outline; invalid tints the ground and the line with danger) and gives every
//   control a 1px ring, while every other theme keeps the family's frame (no leak), the default
//   with absolute values;
// - with two strongly tinted greys (Ocean #0e7490, Clay #9c6644) and a grey of the reader's own, the
//   page ground, a table ground and the select's layer carry the grey's hue, and the lines and
//   hovers stay in the ground's family;
// - Save keeps a theme: the application's own pages show it — a stat card's line, shadow and inset
//   on the dashboard, the chart's first series and the table head on the inventory overview, the selected
//   tab on Notifications; Discard and leaving the page return `html` to the saved appearance;
// - every builder axis moves the computed value it names on `html`: corner (a burst compiles one
//   sheet; "Use the theme's" brings it back), both faces (each of the eight families, loaded), type
//   scale, lines, shadows, motion, cards, tabs (the selected tab's corner and ground on
//   Notifications), chart colours and a status colour; Reset returns to the theme as it came;
// - layout, with `html` saved in each of the five themes and in a customised theme in the widest
//   face, at 1440, 1024, 768, 390 and 360 px: in each group of choice tiles (theme, brand, grey, both
//   faces, every builder axis) every tile has the width and the height of the others (±1 px), no
//   label runs onto a second line, no tile or label is cut (scrollWidth ≤ clientWidth), and the page
//   does not scroll sideways.
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

const SCHEMES = ['light', 'dark'];
const FLOOR = { light: 4.5, dark: 4.5 };
/** The ground each scheme paints, as the WCAG luminance of `--slotted-surface`. */
const GROUND = { light: (l) => l > 0.8, dark: (l) => l < 0.2 };
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
const WIDTHS = [1440, 1024, 768, 390, 360];
const PREFERENCES = '/settings/preferences';

/**
 * What each theme draws, as absolute values: the solid button's corner, case, face and transition;
 * the heading's face; a stat card's top line, shadow in light (a part of the computed value) and
 * inline inset; the badge's corner and case; the first data colour per scheme.
 */
const THEMES = [
  {
    id: 'default',
    radius: '4px', transform: 'none', body: 'geist', heading: 'geist', duration: '0.12s',
    statLine: '1px', statShadow: 'none', statInset: '16px',
    badgeRadius: '9999px', badgeCaps: 'normal',
    data: { light: '#2563eb', dark: '#2563eb' },
  },
  {
    id: 'nexora-friendly',
    radius: '9999px', transform: 'none', body: 'nunito', heading: 'nunito', duration: '0.18s',
    statLine: '0px', statShadow: 'rgba(190, 70, 110, 0.22) 0px 10px 24px -8px', statInset: '24px',
    badgeRadius: '9999px', badgeCaps: 'normal',
    data: { light: '#d6336c', dark: '#f06595' },
  },
  {
    id: 'nexora-brutalist',
    radius: '0px', transform: 'uppercase', body: 'inter', heading: 'jetbrains-mono', duration: '0.001s',
    statLine: '2px', statShadow: '3px 3px 0px 0px', statInset: '18px',
    badgeRadius: '0px', badgeCaps: 'normal',
    data: { light: '#111111', dark: '#ffd400' },
  },
  {
    id: 'nexora-editorial',
    radius: '2px', transform: 'none', body: 'source-serif', heading: 'fraunces', duration: '0.16s',
    statLine: '1px', statShadow: 'none', statInset: '25px',
    badgeRadius: '1px', badgeCaps: 'all-small-caps',
    data: { light: '#8a1538', dark: '#d4708a' },
  },
  {
    id: 'nexora-terminal',
    radius: '2px', transform: 'lowercase', body: 'jetbrains-mono', heading: 'jetbrains-mono', duration: '0.08s',
    statLine: '1px', statShadow: 'none', statInset: '12px',
    badgeRadius: '1px', badgeCaps: 'normal',
    data: { light: '#0a8f2a', dark: '#39ff14' },
  },
];
const BRANDS = ['theme', 'emerald', 'rose'];
/** The tinted greys and their OKLCH hue, for the grounds that must carry it; `custom` is typed. */
const GREYS = [{ id: 'ocean', hue: 223 }, { id: 'clay', hue: 52 }, { id: 'custom', value: '#336699', hue: 254 }];

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
 * every theme card, so it answers `html` alone.
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
  /* The first painted ground at or above an element. */
  const ground = (element) => { let node = element; while (node && getComputedStyle(node).backgroundColor === 'rgba(0, 0, 0, 0)') node = node.parentElement; return node ? getComputedStyle(node).backgroundColor : 'none'; };
  const probe = document.createElement('button');
  probe.type = 'button';
  probe.textContent = 'Probe';
  probe.setAttribute('data-ui', 'button');
  probe.setAttribute('data-variant', 'solid');
  probe.setAttribute('data-tone', 'accent');
  probe.setAttribute('data-size', 'md');
  probe.setAttribute('data-theme-probe', '');
  document.body.append(probe);
  window.__theme = { rgb, oklch, luminance, ratio, ground, drafts: 0 };
  document.addEventListener('slotted-themechange', (event) => { if (event.detail.name === 'nexora-custom-draft' && event.detail.applied) window.__theme.drafts += 1; });
  return true;
})()`);

/** What `html` and the page answer, as absolute values: the probe's paint, the faces, the tokens. */
const facts = () => js(`(() => {
  const html = document.documentElement;
  const root = getComputedStyle(html);
  const token = (name) => root.getPropertyValue(name).trim();
  const T = window.__theme;
  const probe = document.querySelector('[data-theme-probe]');
  const style = getComputedStyle(probe);
  const scheme = html.getAttribute('data-slotted-scheme');
  const cell = document.querySelector('[data-contrast] td[data-pair="on-solid"][data-scheme="' + scheme + '"] [data-ratio]');
  const badge = getComputedStyle(document.querySelector('[data-contrast] [data-ui=badge]'));
  const rows = [...document.querySelectorAll('[data-contrast] [data-part=body] > [data-part=row]')];
  return {
    theme: html.getAttribute('data-slotted-theme'),
    scheme,
    ground: T.luminance(token('--slotted-surface')),
    seed: html.style.getPropertyValue('--slotted-seed-accent').trim(),
    neutralSeed: html.style.getPropertyValue('--slotted-seed-neutral').trim(),
    background: T.rgb(style.backgroundColor).join(','),
    ratio: T.ratio(style.color, style.backgroundColor),
    stated: Number.parseFloat(cell?.textContent ?? 'NaN'),
    radius: style.borderTopLeftRadius,
    transform: style.textTransform,
    spacing: style.letterSpacing,
    buttonFace: style.fontFamily,
    duration: style.transitionDuration.split(',')[0].trim(),
    buttonShadow: style.boxShadow,
    fontSize: style.fontSize,
    headingFace: getComputedStyle(document.querySelector('[data-ui=page-header] [data-part=heading]')).fontFamily,
    badgeRadius: badge.borderTopLeftRadius,
    badgeCaps: badge.fontVariantCaps,
    data1: T.rgb(token('--slotted-data-1')).join(','),
    chart1: T.rgb(token('--slotted-chart-color-1') || 'transparent').join(','),
    accentSolid: T.rgb(token('--slotted-tone-accent-solid')).join(','),
    accentSurface: T.rgb(token('--slotted-tone-accent-surface')).join(','),
    dangerSolid: T.rgb(token('--slotted-tone-danger-solid')).join(','),
    fieldLine: getComputedStyle(document.querySelector('[data-brand-custom] [data-ui=text-field]')).borderTopWidth,
    card: { line: token('--slotted-card-border-width'), shadow: token('--slotted-card-shadow'), ground: token('--slotted-card-background') },
    shadowMd: token('--slotted-shadow-md'),
    sunkenToken: token('--slotted-surface-sunken'),
    stripe: rows[1] ? T.rgb(getComputedStyle(rows[1]).backgroundColor).join(',') : '',
    stripeExpected: T.rgb('color-mix(in oklab, ' + token('--slotted-border-subtle') + ' 45%, ' + token('--slotted-surface') + ')').join(','),
    plainRow: rows[0] ? T.rgb(T.ground(rows[0])).join(',') : '',
  };
})()`);

/**
 * Waits until the page has settled: the button family transitions its colours, and a value read
 * mid-transition is neither the old colour nor the new one. Settled is no running transition, and the
 * theme `html` names and the probe's paint reading the same twice, a frame apart.
 */
const settle = async (label) => {
  const settled = await until(`new Promise((resolve) => {
    const probe = document.querySelector('[data-theme-probe]');
    const read = () => document.documentElement.getAttribute('data-slotted-theme') + document.documentElement.getAttribute('data-slotted-scheme') + getComputedStyle(probe).backgroundColor + getComputedStyle(probe).borderTopLeftRadius;
    const first = read();
    const running = document.getAnimations().some((a) => a.playState === 'running' && a instanceof CSSTransition);
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(!running && read() === first)));
  })`, 5000);
  if (!settled) throw new Error(`${label}: the page did not settle in 5 s`);
};
/** Chooses a candidate by its native radio, then waits for the page to settle. */
const choose = async (name, value) => {
  const found = await js(`(() => { const input = document.querySelector('input[name="${name}"][value="${value}"]'); if (!input) return false; input.click(); return true; })()`);
  if (!found) throw new Error(`no radio ${name}=${value}`);
  await settle(`${name}=${value}`);
};
/** Waits until `html` names `theme`: a sheet loads, and a builder change compiles after its pause. */
const htmlNames = (theme) => until(`document.documentElement.getAttribute('data-slotted-theme') === '${theme}'`, 8000);
/** Waits until a face of `family` has loaded — a theme sheet and the font picker may each declare one — and says which state it reached. */
const loaded = (family) => js(`(async () => {
  await document.fonts.ready;
  const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === ${JSON.stringify(family)});
  if (faces.length === 0) return 'undeclared';
  const end = Date.now() + 10000;
  while (Date.now() < end && !faces.some((f) => f.status === 'loaded')) await new Promise((r) => setTimeout(r, 100));
  return faces.some((f) => f.status === 'loaded') ? 'loaded' : faces.map((f) => f.status).join('/');
})()`);
const button = (text) => js(`(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}); if (!b) return false; b.click(); return true; })()`);
/** The preferences page, drawn and done waiting. */
const preferencesReady = `!!document.querySelector('input[name="theme"]') && document.querySelectorAll('[data-contrast] [data-ratio]').length === 21 && !document.querySelector('[data-appearance]').hasAttribute('aria-busy')`;
/** Moves the router to `path` without a reload, then waits for `ready`. */
const go = async (path, ready) => {
  await js(`(() => { history.pushState(history.state, '', ${JSON.stringify(path)}); dispatchEvent(new PopStateEvent('popstate', { state: history.state })); return true; })()`);
  return until(ready, 20000);
};
const save = async (theme) => {
  if (!(await button('Save preferences'))) throw new Error('no Save button');
  if (!(await htmlNames(theme))) throw new Error(`Save: html does not name ${theme}`);
  await settle('save');
};

/** Opens the start page select, reads the layer it portals to the body's end, and closes it. */
const overlay = async () => {
  await js(`document.querySelector('[data-preferences-section=workspace] sl-select [data-part=trigger]').click()`);
  const opened = await until(`!!document.querySelector('[data-slotted-portal] [role=listbox]')`, 5000);
  const read = opened
    ? await js(`(() => {
        const listbox = document.querySelector('[data-slotted-portal] [role=listbox]');
        const layer = listbox.closest('[data-slotted-theme]');
        const style = getComputedStyle(listbox);
        return {
          theme: layer?.getAttribute('data-slotted-theme') ?? null,
          scheme: layer?.getAttribute('data-slotted-scheme') ?? null,
          solidToken: style.getPropertyValue('--slotted-tone-accent-solid').trim(),
          htmlSolid: getComputedStyle(document.documentElement).getPropertyValue('--slotted-tone-accent-solid').trim(),
          solid: window.__theme.rgb(style.getPropertyValue('--slotted-tone-accent-solid').trim()).join(','),
          ground: window.__theme.ground(listbox),
        };
      })()`)
    : null;
  await js(`document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await until(`!document.querySelector('[data-slotted-portal] [role=listbox]')`, 5000);
  return read;
};

/** The custom brand colour's text field: a colour field draws its value in a `text-field`. */
const FIELD = '[data-brand-custom] [data-ui=text-field]';
/** A key pressed and released through the browser's input pipeline, as a keyboard would. */
const press = async (key, code, keyCode) => {
  for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
};
/** Waits until the field's frame runs no transition and reads the same twice, a frame apart. */
const fieldSettled = () => until(`new Promise((resolve) => {
  const root = document.querySelector('${FIELD}');
  const read = () => { const s = getComputedStyle(root); return s.borderBottomColor + s.boxShadow + s.backgroundColor + s.outlineStyle; };
  const first = read();
  const running = root.getAnimations().some((a) => a.playState === 'running');
  requestAnimationFrame(() => requestAnimationFrame(() => resolve(!running && read() === first)));
})`, 5000);
/** The field's frame as painted, the tokens it is checked against, and the probe button's focus ring. */
const fieldFacts = () => js(`(() => {
  const T = window.__theme;
  const root = document.querySelector('${FIELD}');
  const input = root.querySelector('[data-part=input]');
  const style = getComputedStyle(root);
  const token = (name) => T.rgb(style.getPropertyValue(name).trim()).join(',');
  const probe = document.querySelector('[data-theme-probe]');
  return {
    widths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].join(' '),
    radius: style.borderTopLeftRadius,
    transparent: style.backgroundColor === 'rgba(0, 0, 0, 0)',
    background: T.rgb(style.backgroundColor).join(','),
    bottom: T.rgb(style.borderBottomColor).join(','),
    top: T.rgb(style.borderTopColor).join(','),
    outline: style.outlineStyle + ' ' + style.outlineWidth,
    shadow: style.boxShadow,
    shadowColor: T.rgb((style.boxShadow.match(/(?:rgba?|oklch|oklab|lab|lch|color)\\([^)]*\\)/) ?? ['transparent'])[0]).join(','),
    ring: token('--slotted-focus-ring-color'),
    dangerSurface: token('--slotted-tone-danger-surface'),
    dangerSolid: token('--slotted-tone-danger-solid'),
    dangerBorder: token('--slotted-tone-danger-border'),
    control: token('--slotted-control-surface'),
    invalid: root.hasAttribute('data-invalid'),
    focused: document.activeElement === input && input.matches(':focus-visible'),
    probeRing: probe.matches(':focus-visible') ? getComputedStyle(probe).outlineWidth : 'unfocused',
  };
})()`);
/**
 * The field at rest; invalid with a draft that is no colour; invalid under keyboard focus (Tab from
 * the swatch before it); under keyboard focus with its value back; and the probe button's ring once
 * keyboard focus moves to it. Focus then leaves, so the field commits the value it already had and
 * the page stays as it was.
 */
const fieldStates = async () => {
  const draft = (value) => js(`(() => { const input = document.querySelector('${FIELD} [data-part=input]'); const before = input.value; input.value = ${JSON.stringify(value)}; input.dispatchEvent(new Event('input', { bubbles: true })); return before; })()`);
  const rest = await fieldFacts();
  const kept = await draft('#zz');
  await until(`document.querySelector('${FIELD}').hasAttribute('data-invalid')`, 3000);
  await fieldSettled();
  const invalid = await fieldFacts();
  await js(`document.querySelector('${FIELD} [data-ui=color-picker][data-part=trigger]').focus()`);
  await press('Tab', 'Tab', 9);
  await fieldSettled();
  const invalidFocus = await fieldFacts();
  await draft(kept);
  await until(`!document.querySelector('${FIELD}').hasAttribute('data-invalid')`, 3000);
  await fieldSettled();
  const focus = await fieldFacts();
  await js(`document.querySelector('[data-theme-probe]').focus()`);
  await fieldSettled();
  const probe = await fieldFacts();
  await js(`document.querySelector('[data-theme-probe]').blur()`);
  await fieldSettled();
  return { rest, invalid, invalidFocus, focus, probeRing: probe.probeRing };
};

/** The theme cards' specimens: each one's own theme, its title's face and its accent. */
const samples = () => js(`[...document.querySelectorAll('[data-theme-sample]')].map((sample) => ({
  id: sample.getAttribute('data-theme-sample'),
  theme: sample.getAttribute('data-slotted-theme'),
  face: getComputedStyle(sample.querySelector('.sample-title')).fontFamily,
}))`);

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

/** The colour fields' swatches as first painted: the colour of the field's text, not a bare button. */
const swatches = () => js(`[...document.querySelectorAll('[data-appearance] [data-ui=text-field] [data-ui=color-picker][data-part=trigger]')].map((trigger) => {
  const style = getComputedStyle(trigger);
  const value = trigger.closest('[data-ui=text-field]').querySelector('input').value;
  return { value, image: style.backgroundImage, expected: 'rgb(' + window.__theme.rgb(value).join(', ') + ')', appearance: style.appearance, width: trigger.offsetWidth, height: trigger.offsetHeight };
})`);

const GROUPS = ['theme', 'brand', 'neutral', 'font-body', 'font-heading', 'axis-scale', 'axis-border', 'axis-shadow', 'axis-motion', 'axis-cards', 'axis-tabs', 'axis-chart'];
/** Scrolls each font group into view, so every specimen has named its face, and back to the top. */
const revealFonts = async () => {
  await js(`(async () => { for (const name of ['font-body', 'font-heading']) { document.querySelector('input[name="' + name + '"]').closest('[data-ui=radio-group]').scrollIntoView({ block: 'center' }); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); } window.scrollTo(0, 0); return true; })()`);
  return until(`[...document.querySelectorAll('.specimen')].every((s) => s.textContent.trim() !== '')`, 5000);
};
/** The layout of every group of choice tiles at the current width. */
const layout = () => js(`(() => {
  const lines = (node) => { const range = document.createRange(); range.selectNodeContents(node); return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size; };
  const cut = (element) => element.scrollWidth > element.clientWidth + 0.5;
  const groups = {};
  for (const name of ${JSON.stringify(GROUPS)}) {
    const tiles = [...document.querySelectorAll('input[name="' + name + '"]')].map((input) => input.closest('[data-part=item]'));
    const labels = tiles.flatMap((tile) => [...tile.querySelectorAll('.tile-label')]);
    groups[name] = {
      count: tiles.length,
      widths: tiles.map((tile) => tile.getBoundingClientRect().width),
      heights: tiles.map((tile) => tile.getBoundingClientRect().height),
      wrapped: labels.filter((label) => lines(label) > 1).map((label) => label.textContent.trim()),
      cut: [...tiles.filter(cut), ...labels.filter(cut), ...tiles.flatMap((tile) => [...tile.querySelectorAll('[data-part=label]')]).filter(cut)].map((node) => node.textContent.trim().slice(0, 24)),
    };
  }
  return { groups, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
})()`);
const spread = (values) => Math.max(...values) - Math.min(...values);
const checkLayout = async (label) => {
  const read = await layout();
  for (const [name, group] of Object.entries(read.groups)) {
    check(
      `${label}: the ${name} tiles share one width and one height, every label on one line and uncut`,
      group.count >= 3 && spread(group.widths) <= 1 && spread(group.heights) <= 1 && group.wrapped.length === 0 && group.cut.length === 0,
      `${group.count} tiles · w ${Math.min(...group.widths).toFixed(1)}–${Math.max(...group.widths).toFixed(1)} · h ${Math.min(...group.heights).toFixed(1)}–${Math.max(...group.heights).toFixed(1)}${group.wrapped.length ? ' · wrapped ' + group.wrapped.join(', ') : ''}${group.cut.length ? ' · cut ' + group.cut.join(', ') : ''}`,
    );
  }
  check(`${label}: the page does not scroll sideways`, read.overflow <= 0, `${read.overflow}px`);
};

/** A saved theme on the application's own pages: a stat card, the chart and the table head, the selected tab. */
const tour = async (theme, scheme) => {
  const out = {};
  const dashboard = await go('/dashboard', `!!document.querySelector('[data-ui=stat-card]') && !document.querySelector('[data-ui=stat-card] [data-ui=skeleton][data-loading]')`);
  if (dashboard) await wait(300);
  out.card = dashboard
    ? await js(`(() => { const card = document.querySelector('[data-ui=stat-card]'); const style = getComputedStyle(card); return { line: getComputedStyle(card, '::before').borderTopWidth, shadow: style.boxShadow, inset: style.paddingLeft }; })()`)
    : null;
  const overview = await go('/inventory/overview', `!!document.querySelector('[data-ui=chart] svg path, [data-ui=chart] svg rect') && !!document.querySelector('[data-ui=table] [data-part=column-header]')`);
  out.overview = overview
    ? await js(`(() => {
        const fills = [...document.querySelectorAll('[data-ui=chart] svg path, [data-ui=chart] svg rect')].map((s) => s.getAttribute('fill')).filter((f) => f && f !== 'none' && !f.startsWith('url')).map((f) => window.__theme.rgb(f).join(','));
        const head = getComputedStyle(document.querySelector('[data-ui=table] [data-part=column-header]'));
        return { fills, head: { ground: window.__theme.rgb(window.__theme.ground(document.querySelector('[data-ui=table] [data-part=column-header]'))).join(','), transform: head.textTransform } };
      })()`)
    : null;
  const notifications = await go('/notifications', `!!document.querySelector('[data-ui=tabs] [data-part=item][data-selected]')`);
  if (notifications) await wait(300);
  out.tab = notifications
    ? await js(`(() => { const item = document.querySelector('[data-ui=tabs] [data-part=item][data-selected]'); const style = getComputedStyle(item); return { radius: style.borderTopLeftRadius, ground: style.backgroundColor, before: getComputedStyle(item.querySelector('[data-part=label]'), '::before').content }; })()`)
    : null;
  out.html = await js(`({ theme: document.documentElement.getAttribute('data-slotted-theme'), scheme: document.documentElement.getAttribute('data-slotted-scheme'), solid: window.__theme.rgb(getComputedStyle(document.documentElement).getPropertyValue('--slotted-tone-accent-solid').trim()).join(','), surface: window.__theme.rgb(getComputedStyle(document.documentElement).getPropertyValue('--slotted-tone-accent-surface').trim()).join(',') })`);
  const back = await go(PREFERENCES, preferencesReady);
  if (!back) throw new Error(`${theme}: the preferences page did not come back`);
  await settle('back');
  return out;
};

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

  await send('Page.navigate', { url: `${ORIGIN}${PREFERENCES}` });
  const loadedPage = await until(`!!document.querySelector('input[name="brand"][value="amber"]')`, 40000);
  check('the preferences page draws its choices', loadedPage, loadedPage ? '' : await js(`location.pathname`));
  const ready = await until(`document.querySelectorAll('style[data-slotted-theme-sheet]').length >= 4 && ${preferencesReady}`, 15000);
  check('the four runtime sheets arrive and the section stops waiting', ready, await js(`[...document.querySelectorAll('style[data-slotted-theme-sheet]')].map((s) => s.getAttribute('data-slotted-theme-sheet')).join(' ')`));
  await install();
  await settle('install');

  // The colour fields, before anything is touched.
  const fields = await swatches();
  check(
    'every colour field paints its colour in its swatch on first render',
    fields.length === 5 && fields.every((field) => field.image.includes(field.expected) && field.appearance === 'none' && Math.abs(field.width - field.height) <= 1),
    fields.map((field) => `${field.value} ${field.width}×${field.height} ${field.image.slice(0, 48)}`).join(' | '),
  );

  // A specimen names its face only once it is seen, in a box that does not move when it does.
  const boxes = () => js(`[...document.querySelectorAll('.specimen')].map((s) => { const r = s.closest('[data-part=item]').getBoundingClientRect(); return [s.textContent.trim() !== '', Math.round(r.width * 10), Math.round(r.height * 10)]; })`);
  const unseen = await boxes();
  const revealed = await revealFonts();
  const seen = await boxes();
  check(
    'a font specimen names its face only once it is in view, and its tile keeps its box',
    unseen.length === 18 && unseen.every(([drawn]) => !drawn) && revealed && JSON.stringify(unseen.map(([, w, h]) => [w, h])) === JSON.stringify(seen.map(([, w, h]) => [w, h])),
    `${unseen.filter(([drawn]) => drawn).length}/${unseen.length} drawn before · ${seen.filter(([drawn]) => drawn).length} after`,
  );

  const violet = await derived('default', await js(`document.documentElement.getAttribute('data-slotted-scheme')`), 'accent', '#7c3aed', 'accent');
  const start = await facts();
  check('before any choice, html is the default theme in violet', start.theme === 'default' && /#7c3aed/.test(start.seed) && start.background === violet && start.radius === '4px', `${start.theme} ${start.seed} rgb(${start.background}) ${start.radius}`);

  for (const theme of THEMES) {
    await choose('theme', theme.id);
    const named = await htmlNames(theme.id);
    check(`${theme.id}: html names the theme as soon as it is chosen, before Save`, named, await js(`document.documentElement.getAttribute('data-slotted-theme')`));

    // The theme cards draw their own themes; the page around them answers html alone.
    const cards = await samples();
    const around = await facts();
    check(
      `${theme.id}: each theme card draws its own theme and face, and the page around them stays ${theme.id}`,
      cards.length === 5 && cards.every((card) => card.theme === card.id && first(card.face) === FACE[THEMES.find((t) => t.id === card.id).heading]) &&
        around.theme === theme.id && around.radius === theme.radius && first(around.headingFace) === FACE[theme.heading],
      cards.map((card) => `${card.id}→${card.theme} ${first(card.face)}`).join(' · ') + ` · page ${around.radius} ${first(around.headingFace)}`,
    );

    const backgrounds = { light: new Set(), dark: new Set() };
    for (const brand of BRANDS) {
      await choose('brand', brand);
      for (const scheme of SCHEMES) {
        await choose('scheme', scheme);
        const read = await facts();
        const name = `${theme.id} × ${brand} × ${scheme}`;
        backgrounds[scheme].add(read.background);
        check(`${name}: html names the theme and the scheme, and paints the scheme's ground`, read.theme === theme.id && read.scheme === scheme && GROUND[scheme](read.ground), `${read.theme} ${read.scheme} L=${read.ground.toFixed(3)}`);
        check(`${name}: the label stands on the solid at ${FLOOR[scheme]}:1`, read.ratio >= FLOOR[scheme], `${read.ratio.toFixed(2)}:1 on rgb(${read.background})`);
        check(`${name}: the contrast table states the ratio painted`, Math.abs(read.stated - read.ratio) <= 0.05, `table ${read.stated.toFixed(2)} · paint ${read.ratio.toFixed(2)}`);
        const layer = await overlay();
        check(
          `${name}: the select's layer carries the theme, scheme and accent of html`,
          layer !== null && layer.theme === theme.id && layer.scheme === scheme && layer.solidToken === layer.htmlSolid,
          layer === null ? 'no layer opened' : `${layer.theme} ${layer.scheme} rgb(${layer.solid})`,
        );
        if (brand !== 'theme') continue;
        check(
          `${name}: the button's corner, case, face and motion are the theme's`,
          read.radius === theme.radius && read.transform === theme.transform && first(read.buttonFace) === FACE[theme.body] && read.duration === theme.duration,
          `${read.radius} ${read.transform} ${first(read.buttonFace)} ${read.duration}`,
        );
        check(`${name}: the page heading is set in the theme's heading face`, first(read.headingFace) === FACE[theme.heading], first(read.headingFace));
        check(`${name}: the badge's corner and case are the theme's`, read.badgeRadius === theme.badgeRadius && read.badgeCaps === theme.badgeCaps, `${read.badgeRadius} ${read.badgeCaps}`);
        const series = await js(`window.__theme.rgb('${theme.data[scheme]}').join(',')`);
        check(`${name}: the first data colour is the theme's ${theme.data[scheme]}`, read.data1 === series, `rgb(${read.data1})`);
        const field = await fieldStates();
        const frame = (state) => `${state.widths} · r ${state.radius} · ${state.transparent ? 'no ground' : `rgb(${state.background})`} · outline ${state.outline} · line rgb(${state.bottom})`;
        if (theme.id === 'nexora-editorial') {
          check(
            `${name}: a text field is a ruled line — the bottom edge alone, no corner, no ground`,
            field.rest.widths === '0px 0px 1px 0px' && field.rest.radius === '0px' && field.rest.transparent,
            frame(field.rest),
          );
          check(
            `${name}: keyboard focus thickens the field's line in the ring's colour, with no outline`,
            field.focus.focused && field.focus.outline.startsWith('none') && field.focus.shadow.includes('inset') && field.focus.shadowColor === field.focus.ring && field.focus.bottom === field.focus.ring,
            `${field.focus.focused ? 'focus-visible' : 'not focus-visible'} · ${frame(field.focus)} · ${field.focus.shadow} · ring rgb(${field.focus.ring})`,
          );
          check(
            `${name}: an invalid field takes the danger tint under a danger line`,
            field.invalid.invalid && !field.invalid.transparent && field.invalid.background === field.invalid.dangerSurface && field.invalid.bottom === field.invalid.dangerSolid,
            `${frame(field.invalid)} · danger surface rgb(${field.invalid.dangerSurface}) solid rgb(${field.invalid.dangerSolid})`,
          );
          check(
            `${name}: keyboard focus on an invalid field draws its line in the invalid ring's colour`,
            field.invalidFocus.focused && field.invalidFocus.invalid && field.invalidFocus.bottom === field.invalidFocus.ring && field.invalidFocus.shadowColor === field.invalidFocus.ring && field.invalidFocus.ring !== field.focus.ring,
            `${field.invalidFocus.focused ? 'focus-visible' : 'not focus-visible'} · ${frame(field.invalidFocus)} · ${field.invalidFocus.shadow} · ring rgb(${field.invalidFocus.ring}) · valid ring rgb(${field.focus.ring})`,
          );
          check(`${name}: every control's focus ring is a hairline`, field.probeRing === '1px', `probe button ${field.probeRing}`);
        } else {
          const edges = field.rest.widths.split(' ');
          check(
            `${name}: no field rule leaks — four equal edges, an outline ring under keyboard focus, the field's own ground when invalid`,
            new Set(edges).size === 1 && edges[0] !== '0px' && field.focus.focused && field.focus.outline.startsWith('solid') && !field.focus.shadow.includes('inset') &&
              field.invalid.invalid && field.invalid.background === field.rest.background && field.invalid.background !== field.invalid.dangerSurface && field.invalid.top === field.invalid.bottom,
            `rest ${frame(field.rest)} · focus ${frame(field.focus)} · invalid ${frame(field.invalid)}`,
          );
          if (theme.id === 'default') {
            check(
              `${name}: the field is the family's own — 1px on four edges, 4px corner, the control ground, a 2px ring, a danger edge when invalid`,
              field.rest.widths === '1px 1px 1px 1px' && field.rest.radius === '4px' && field.rest.background === field.rest.control && field.focus.outline === 'solid 2px' &&
                field.invalid.top === field.invalid.dangerBorder && field.invalid.bottom === field.invalid.dangerBorder && field.probeRing === '2px',
              `rest ${frame(field.rest)} · focus ${frame(field.focus)} · invalid ${frame(field.invalid)} · danger border rgb(${field.invalid.dangerBorder}) · probe ${field.probeRing}`,
            );
          }
        }
        if (theme.id === 'nexora-terminal') {
          check(`${name}: a striped table bands its rows in a ground mixed from the theme's line`, read.stripe === read.stripeExpected && read.stripe !== read.plainRow, `stripe rgb(${read.stripe}) · expected rgb(${read.stripeExpected}) · plain rgb(${read.plainRow})`);
        }
      }
    }
    for (const scheme of SCHEMES) {
      check(`${theme.id} × ${scheme}: the solid moves with the brand`, backgrounds[scheme].size === BRANDS.length, [...backgrounds[scheme]].map((c) => `rgb(${c})`).join(' | '));
    }
    for (const family of new Set([theme.body, theme.heading])) {
      const state = await loaded(FACE[family]);
      check(`${theme.id}: ${FACE[family]} is loaded`, state === 'loaded', state);
    }

    // The tinted greys: the page ground, a table ground and the select's layer carry the grey's hue,
    // and the lines and hovers stay in the ground's family (±20° of its hue, wherever its chroma reaches 0.01).
    await choose('brand', 'theme');
    for (const grey of [{ id: 'theme', hue: null }, ...GREYS]) {
      if (grey.id === 'custom') {
        /* The field keeps the colour once typed: a later theme chooses it by its tile, as a reader would. */
        const kept = await js(`document.querySelector('[data-neutral-custom] input').value.toLowerCase() === '${grey.value}'`);
        if (kept) await choose('neutral', 'custom');
        else await typeColour('[data-neutral-custom]', grey.value);
        const typed = await until(`document.documentElement.style.getPropertyValue('--slotted-seed-neutral').trim() === '${grey.value}'`, 5000);
        check(`${theme.id}: a grey of the reader's own becomes the neutral seed on html`, typed, await js(`document.documentElement.style.getPropertyValue('--slotted-seed-neutral')`));
        await settle('custom grey');
      } else if (grey.id !== 'theme') await choose('neutral', grey.id);
      for (const scheme of SCHEMES) {
        await choose('scheme', scheme);
        const family = await js(`(() => {
          const style = getComputedStyle(document.documentElement);
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
        const grounds = await js(`(() => {
          const read = (color) => ({ color, ...window.__theme.oklch(color) });
          return { page: read(getComputedStyle(document.documentElement).getPropertyValue('--slotted-surface').trim()), table: read(window.__theme.ground(document.querySelector('[data-contrast] [data-part=body] [data-part=cell]'))) };
        })()`);
        const layer = await overlay();
        const all = { ...grounds, layer: layer ? { color: layer.ground, ...(await js(`window.__theme.oklch(${JSON.stringify(layer.ground)})`)) } : null };
        check(
          `${theme.id} × ${grey.id} grey × ${scheme}: the page, a table and the select's layer carry the grey's hue`,
          Object.values(all).every((ground) => ground !== null && ground.c >= 0.004 && near(ground.h, grey.hue, 35)),
          Object.entries(all).map(([part, g]) => (g ? `${part} ${g.color} h${g.h.toFixed(0)} c${g.c.toFixed(3)}` : `${part} none`)).join(' · '),
        );
      }
    }
    await choose('neutral', 'theme');
    await choose('scheme', 'light');

    // Save keeps the theme, and the application's own pages draw it.
    await save(theme.id);
    const seenOn = await tour(theme.id, 'light');
    check(`${theme.id}: after Save the other pages keep the theme`, seenOn.html.theme === theme.id && seenOn.html.scheme === 'light', `${seenOn.html.theme} ${seenOn.html.scheme}`);
    check(
      `${theme.id}: a stat card on the dashboard draws the theme's line, shadow and inset`,
      seenOn.card !== null && seenOn.card.line === theme.statLine && (theme.statShadow === 'none' ? seenOn.card.shadow === 'none' : seenOn.card.shadow.includes(theme.statShadow)) && seenOn.card.inset === theme.statInset,
      seenOn.card === null ? 'no stat card' : `${seenOn.card.line} · ${seenOn.card.shadow.slice(0, 60)} · ${seenOn.card.inset}`,
    );
    const series = await js(`window.__theme.rgb('${theme.data.light}').join(',')`);
    check(`${theme.id}: the inventory chart's first series is the theme's ${theme.data.light}`, seenOn.overview !== null && seenOn.overview.fills.includes(series), seenOn.overview === null ? 'no chart' : `${seenOn.overview.fills.length} shapes · ${[...new Set(seenOn.overview.fills)].slice(0, 4).map((c) => `rgb(${c})`).join(' ')}`);
    if (theme.id === 'nexora-brutalist') {
      check(`${theme.id}: the inventory table's head is a band of the accent's solid, in capitals`, seenOn.overview !== null && seenOn.overview.head.ground === seenOn.html.solid && seenOn.overview.head.transform === 'uppercase', seenOn.overview === null ? 'no table' : `rgb(${seenOn.overview.head.ground}) ${seenOn.overview.head.transform}`);
    }
    if (theme.id === 'nexora-friendly') {
      check(`${theme.id}: the selected tab on Notifications is a pill on the accent's surface`, seenOn.tab !== null && seenOn.tab.radius === '9999px' && seenOn.tab.ground !== 'rgba(0, 0, 0, 0)' && (await js(`window.__theme.rgb(${JSON.stringify(seenOn.tab?.ground ?? 'transparent')}).join(',')`)) === seenOn.html.surface, seenOn.tab === null ? 'no tabs' : `${seenOn.tab.radius} ${seenOn.tab.ground}`);
    }
    if (theme.id === 'nexora-terminal') {
      check(`${theme.id}: the selected tab reads as a prompt, out of its accessible name`, seenOn.tab !== null && seenOn.tab.before === '"> " / ""', seenOn.tab === null ? 'no tabs' : seenOn.tab.before);
    }
  }

  // Discard and leaving the page return html to the saved appearance (Terminal, saved last).
  await choose('theme', 'nexora-friendly');
  await choose('brand', 'rose');
  const candidate = await facts();
  await button('Discard');
  await settle('discard');
  const discarded = await facts();
  check('Discard returns html from the candidate to the saved appearance', candidate.theme === 'nexora-friendly' && discarded.theme === 'nexora-terminal' && discarded.radius === '2px' && discarded.seed === '', `${candidate.theme} ${candidate.seed} → ${discarded.theme} ${discarded.seed || '(theme’s own)'}`);
  await choose('theme', 'nexora-editorial');
  const left = await go('/dashboard', `!location.pathname.startsWith('/settings')`);
  await wait(300);
  const away = await js(`document.documentElement.getAttribute('data-slotted-theme')`);
  check('leaving the page with a candidate unsaved returns html to the saved appearance', left && away === 'nexora-terminal', away);
  await go(PREFERENCES, preferencesReady);
  await settle('back');

  // The builder, over Standard: each axis moves the value it names on html.
  await choose('theme', 'default');
  await save('default');
  const base = await facts();
  /** Polls `html` until `expect` holds or 8 s pass: a builder change compiles after its pause. */
  const awaitHtml = async (expect) => {
    const end = Date.now() + 8000;
    let read = await facts();
    while (Date.now() < end && !(read.theme === 'nexora-custom-draft' && expect(read))) {
      await wait(150);
      read = await facts();
    }
    return read;
  };
  const axis = async (name, value, read, expect, describe) => {
    await choose(name, value);
    const after = await awaitHtml((f) => expect(read(f), f));
    check(`builder ${name}=${value}: ${describe}`, after.theme === 'nexora-custom-draft' && expect(read(after), after), `${after.theme} · ${read(after)}`);
    await choose(name, 'theme');
    await htmlNames('default');
  };
  await axis('axis-scale', '112', (f) => f.fontSize, (size) => Math.abs(Number.parseFloat(size) - Number.parseFloat(base.fontSize) * 1.12) < 0.05, `the controls' type is 112% of the library's (${base.fontSize} before)`);
  await axis('axis-border', '2', (f) => f.fieldLine, (v) => v === '2px', 'a field draws a 2px line');
  await axis('axis-shadow', 'none', (f) => f.buttonShadow, (v) => v === 'none', 'the button stands on no shadow');
  await axis('axis-shadow', 'strong', (f) => f.buttonShadow, (v) => v.includes('rgba(15, 23, 42, 0.14) 0px 2px 4px'), 'the button stands on the strong shadow');
  await axis('axis-motion', 'off', (f) => f.duration, (v) => v === '0.001s', 'transitions take 1ms');
  await axis('axis-motion', 'reduced', (f) => f.duration, (v) => v === '0.06s', 'transitions take 60ms');
  await axis('axis-cards', 'elevated', (f) => `${f.card.line} ${f.card.shadow}`, (v, f) => f.card.line === '0px' && f.card.shadow === f.shadowMd, 'a card has no line and the medium shadow');
  await axis('axis-cards', 'flat', (f) => `${f.card.line} ${f.card.shadow} ${f.card.ground}`, (v, f) => f.card.line === '0px' && f.card.shadow === 'none' && f.card.ground === f.sunkenToken, 'a card is a sunken fill');
  await axis('axis-chart', 'accent', (f) => f.chart1 === f.accentSolid, (v) => v === true, 'the first series is the accent solid');

  // Both faces: each of the eight families, set and loaded.
  for (const [picker, read] of [['font-body', (f) => first(f.buttonFace)], ['font-heading', (f) => first(f.headingFace)]]) {
    for (const [family, face] of Object.entries(FACE)) {
      await choose(picker, family);
      const after = await awaitHtml((f) => read(f) === face);
      const state = await loaded(face);
      check(
        `builder ${picker}=${family}: the ${picker === 'font-body' ? 'controls are' : 'page heading is'} set in ${face}, loaded`,
        after.theme === 'nexora-custom-draft' && read(after) === face && state === 'loaded',
        `${read(after)} · ${state}`,
      );
    }
    await choose(picker, 'theme');
  }
  await htmlNames('default');

  // The corner: a burst of steps compiles one sheet, with the last value; "Use the theme's" brings it back.
  /* Twelve steps, one every 40 ms, as a held arrow key repeats: inside the 200 ms pause of the compile. */
  await js(`(async () => { window.__theme.drafts = 0; const thumb = document.querySelector('[data-axis=radius] input[type=range]'); thumb.focus(); for (let i = 0; i < 12; i++) { thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await new Promise((r) => setTimeout(r, 40)); } return true; })()`);
  await until(`getComputedStyle(document.querySelector('[data-theme-probe]')).borderTopLeftRadius === '12px'`, 8000);
  await wait(600);
  const corner = await facts();
  const compiled = await js(`window.__theme.drafts`);
  check('builder corner: twelve steps compile one sheet, at 24px', compiled === 1 && corner.theme === 'nexora-custom-draft' && corner.radius === '12px', `${compiled} compile(s) · ${corner.theme} · button ${corner.radius}`);
  await js(`document.querySelector('[data-radius-value] button').click()`);
  await htmlNames('default');
  await settle('corner reset');
  const ownCorner = await facts();
  check('builder corner: "Use the theme’s" returns the corner, and html, to the theme’s own', ownCorner.theme === 'default' && ownCorner.radius === base.radius, `${ownCorner.theme} ${ownCorner.radius}`);

  // A status colour is a seed: html's danger solid derives from it.
  await choose('axis-cards', 'flat');
  await typeColour('[data-status=danger]', '#be123c');
  await until(`document.documentElement.style.getPropertyValue('--slotted-seed-danger').trim() === '#be123c'`, 5000);
  await htmlNames('nexora-custom-draft');
  await settle('danger');
  const danger = await facts();
  const expectedDanger = await derived('nexora-custom-draft', danger.scheme, 'danger', '#be123c', 'danger');
  check('builder danger=#be123c: html paints the danger solid the seed derives to', danger.dangerSolid === expectedDanger, `rgb(${danger.dangerSolid}) vs rgb(${expectedDanger})`);

  const changes = await js(`document.querySelector('[data-changes]')?.textContent.trim() ?? ''`);
  await js(`document.querySelector('[data-reset]').click()`);
  await htmlNames('default');
  await settle('reset');
  const reset = await facts();
  check('Reset returns html to the theme as it came', changes === '2 changes' && reset.theme === 'default' && reset.dangerSolid === base.dangerSolid && !(await js(`!!document.querySelector('[data-changes]')`)), `${changes} → ${reset.theme} rgb(${reset.dangerSolid})`);

  // Tabs: a pill over Standard, an underline over Friendly, on the selected tab of Notifications.
  await choose('axis-tabs', 'pill');
  await htmlNames('nexora-custom-draft');
  await save('nexora-custom');
  const pill = await tour('custom pill', 'light');
  check('builder tabs=pill: the selected tab is a pill on the accent’s surface', pill.tab !== null && pill.tab.radius === '9999px' && (await js(`window.__theme.rgb(${JSON.stringify(pill.tab?.ground ?? 'transparent')}).join(',')`)) === pill.html.surface, pill.tab === null ? 'no tabs' : `${pill.tab.radius} ${pill.tab.ground}`);
  await choose('theme', 'nexora-friendly');
  await choose('axis-tabs', 'underline');
  await htmlNames('nexora-custom-draft');
  await save('nexora-custom');
  const underline = await tour('custom underline', 'light');
  check('builder tabs=underline over Friendly: the selected tab is underlined, with no pill', underline.tab !== null && underline.tab.radius === '0px' && underline.tab.ground === 'rgba(0, 0, 0, 0)', underline.tab === null ? 'no tabs' : `${underline.tab.radius} ${underline.tab.ground}`);
  await js(`document.querySelector('[data-reset]').click()`);
  await choose('theme', 'nexora-brutalist');
  await choose('brand', 'amber');
  await save('nexora-brutalist');
  const saved = await facts();
  check('Save writes the theme and the seed onto html', saved.theme === 'nexora-brutalist' && /#d97706/.test(saved.seed), `${saved.theme} ${saved.seed}`);
  check('Save repaints the probe from the default in violet to Brutalist in amber', saved.background !== start.background && saved.radius === '0px' && saved.transform === 'uppercase' && first(saved.headingFace) === FACE['jetbrains-mono'], `rgb(${start.background}) ${start.radius} → rgb(${saved.background}) ${saved.radius} ${saved.transform}`);
  await choose('axis-cards', 'flat');
  await button('Save preferences');
  const custom = await htmlNames('nexora-custom');
  const customSheet = await js(`document.querySelector('style[data-slotted-theme-sheet="nexora-custom"]')?.textContent.includes('--slotted-card-background: var(--slotted-surface-sunken)') ?? false`);
  check('Save of a customised theme names the compiled nexora-custom on html', custom && customSheet, await js(`document.documentElement.getAttribute('data-slotted-theme')`));
  await js(`document.querySelector('[data-reset]').click()`);
  await choose('brand', 'theme');

  // Layout: html saved in each theme, and in a customised theme in the widest face, at every width.
  const states = [
    ...THEMES.map((theme) => ({ label: theme.id, theme: theme.id, axes: [] })),
    { label: 'custom (Friendly, JetBrains Mono at 112%)', theme: 'nexora-friendly', axes: [['font-body', 'jetbrains-mono'], ['font-heading', 'jetbrains-mono'], ['axis-scale', '112']], html: 'nexora-custom' },
  ];
  for (const state of states) {
    await viewport(1440, 900);
    await choose('theme', state.theme);
    for (const [name, value] of state.axes) await choose(name, value);
    if (state.axes.length > 0) await htmlNames('nexora-custom-draft');
    await save(state.html ?? state.theme);
    for (const width of WIDTHS) {
      await viewport(width, 900);
      await wait(400);
      await revealFonts();
      await checkLayout(`${state.label} @ ${width}px`);
    }
    if (state.axes.length > 0) await js(`document.querySelector('[data-reset]').click()`);
  }

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
