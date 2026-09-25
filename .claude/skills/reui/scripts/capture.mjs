/**
 * One ReUI preview page, captured as evidence the dossier can cite.
 *
 * The scenario is fixed: the public preview route of one registry item, at one
 * base, style, theme and width. The routes are `/preview/<base>/<name>` for a
 * block and `/preview/<base>/example/<name>` for a `c-*` example; each sets
 * `html[data-preview-ready]` after the item has painted. A primitive has no
 * preview of its own and is captured through its `c-*` examples. It writes a full-page picture, a specimen of the
 * computed styles of every part the page renders, and — for the elements a
 * selector names — the computed delta and a picture of each forced state.
 *
 * With `--family <name>` the same readings are taken from the Slotted harness
 * page of that family (built by tools/harness/build.mjs), so both sides of a
 * comparison carry the same property list.
 *
 * Exit status 1 when the route does not answer 200, when the page renders the
 * not-found page (the route answers 200 for an unknown name), when the ready
 * marker is absent after 20 seconds, or when the state selector matches no
 * rendered element.
 */
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { WIDTHS } from '../../../../tools/harness/build.mjs';
import { READY_EXPRESSION, captureUrl, launch } from '../../../../tools/harness/shoot.mjs';

const REPO = resolve(fileURLToPath(import.meta.url), '../../../../..');
const READY_TIMEOUT = 20000;

const PROPERTIES = [
  'display',
  'width',
  'height',
  'min-height',
  'padding-block-start',
  'padding-inline-end',
  'padding-block-end',
  'padding-inline-start',
  'gap',
  'column-gap',
  'row-gap',
  'border-top-width',
  'border-bottom-width',
  'border-inline-start-width',
  'border-inline-end-width',
  'border-top-style',
  'border-top-color',
  'border-bottom-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'color',
  'background-color',
  'background-image',
  'box-shadow',
  'opacity',
  'transform',
  'rotate',
  'translate',
  'scale',
  'filter',
  'backdrop-filter',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-decoration-line',
  'text-decoration-color',
  'text-decoration-thickness',
  'text-underline-offset',
  'font-variant-numeric',
  'cursor',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'content',
  'inset',
];

const STATES = {
  hover: ['hover'],
  active: ['hover', 'active'],
  focus: ['focus', 'focus-visible'],
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    family: { type: 'string' },
    motion: { type: 'string', default: 'no-preference' },
    'forced-colors': { type: 'string', default: 'none' },
    density: { type: 'string', default: 'comfortable' },
    dir: { type: 'string', default: 'ltr' },
    base: { type: 'string', default: 'base' },
    style: { type: 'string', default: 'nova' },
    theme: { type: 'string', default: 'light' },
    width: { type: 'string', default: '1280' },
    click: { type: 'string', multiple: true, default: [] },
    states: { type: 'string' },
    limit: { type: 'string', default: '6' },
    out: { type: 'string' },
  },
});

const [item] = positionals;
if (!item && !values.family) {
  console.error(
    'usage: capture.mjs (<item> | --family <slotted-family> [--density comfortable|compact|dense] [--dir ltr|rtl]) [--base base|radix] [--style nova] [--theme light|dark|high-contrast] [--width 1280] [--motion no-preference|reduce] [--forced-colors none|active] [--click <selector>]... [--states <selector>] [--limit 6] [--out <dir>]',
  );
  process.exit(1);
}

const kind = values.family ? 'slotted' : item.startsWith('c-') ? 'example' : 'block';
const route = kind === 'example' ? 'example/' : '';
const url = values.family
  ? captureUrl({
      family: values.family,
      scheme: values.theme,
      width: values.width,
      density: values.density,
      dir: values.dir,
    }).href
  : `https://reui.io/preview/${values.base}/${route}${item}?embed=1&style=${values.style}&theme=${values.theme}`;
const outDir = resolve(values.out ?? join(REPO, 'tools/harness/out/reui', values.family ?? item));
/*
 * Every axis that changes the picture is in the name, so two runs never
 * overwrite each other. A selector is shortened for reading and hashed for
 * uniqueness: two selectors that share a prefix still land in two files.
 */
const slug = (text) =>
  `${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/, '')}-${createHash('sha1').update(text).digest('hex').slice(0, 6)}`;
const stem = [
  values.family ? 'slotted' : values.style,
  values.theme,
  values.width,
  values.family && values.density !== 'comfortable' ? values.density : undefined,
  values.family && values.dir !== 'ltr' ? values.dir : undefined,
  values.motion !== 'no-preference' ? `motion-${values.motion}` : undefined,
  values['forced-colors'] !== 'none' ? 'forced' : undefined,
  values.click.length > 0 ? `click-${slug(values.click.join(' '))}` : undefined,
  values.states ? slug(values.states) : undefined,
]
  .filter(Boolean)
  .join('-');
/* The harness draws one cell per stage width and pads it with 80 pixels of chrome. */
if (values.family && !WIDTHS.includes(Number(values.width))) {
  console.error(`--family needs --width in ${WIDTHS.join(', ')}`);
  process.exit(1);
}
const width = Number(values.width) + (values.family ? 80 : 0);

if (!values.family) {
  const response = await fetch(url, { redirect: 'follow' });
  if (response.status !== 200) {
    console.error(`${url} answered ${response.status}`);
    process.exit(1);
  }
}

await mkdir(outDir, { recursive: true });

/*
 * Tailwind v4 wraps every hover: variant in @media (hover: hover), and headless
 * Chrome reports hover: none; Emulation.setEmulatedMedia does not override it.
 * The harness launcher takes its binary from CHROME_BIN, so a wrapper adds the
 * Blink settings of a mouse without changing the shared launcher.
 */
const wrapper = join(await mkdtemp(join(tmpdir(), 'slotted-reui-')), 'chrome.sh');
await writeFile(
  wrapper,
  `#!/bin/sh\nexec ${process.env['CHROME_BIN'] ?? 'google-chrome'} --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 "$@"\n`,
);
await chmod(wrapper, 0o755);
process.env['CHROME_BIN'] = wrapper;
const { devtools, close } = await launch();

async function evaluate(expression) {
  const { result, exceptionDetails } = await devtools.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? expression);
  return result.value;
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function screenshot(file, clip) {
  const { data } = await devtools.send('Page.captureScreenshot', {
    format: 'png',
    ...(clip ? { clip: { ...clip, scale: 1 } } : {}),
  });
  await writeFile(join(outDir, file), Buffer.from(data, 'base64'));
  return join(outDir, file);
}

/* Reads the listed properties of every element a selector matches, inside the page. */
const readStyles = (selector) => `(() => {
  const properties = ${JSON.stringify(PROPERTIES)};
  return [...document.querySelectorAll(${JSON.stringify(selector)})].map((element) => {
    const computed = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      tag: element.tagName.toLowerCase(),
      slot: element.getAttribute('data-slot'),
      role: element.getAttribute('role'),
      aria: Object.fromEntries([...element.attributes].filter((a) => a.name.startsWith('aria-') || a.name.startsWith('data-')).map((a) => [a.name, a.value])),
      text: (element.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 60),
      class: typeof element.className === 'string' ? element.className : element.getAttribute('class'),
      /* tabindex="-1" counts: a part focused from script still paints its focus state. */
      focusable: element.matches('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable=""], [contenteditable="true"]') && !element.matches(':disabled'),
      /* The first opaque background behind the element: the colour a focus ring or a hover step is read against. */
      ground: (() => {
        /* Opaque means no alpha channel in the serialisation: rgb(...), or a colour function without ' / α'. */
        const opaque = (colour) => colour && colour !== 'transparent' && !colour.startsWith('rgba(') && !colour.includes(' / ');
        for (let node = element.parentElement; node; node = node.parentElement) {
          const colour = getComputedStyle(node).backgroundColor;
          if (opaque(colour)) return colour;
        }
        /* No opaque ancestor: the page paints the canvas from the theme's --background. */
        return getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || 'Canvas';
      })(),
      rect: { x: Math.round(rect.x * 100) / 100, y: Math.round(rect.y * 100) / 100, width: Math.round(rect.width * 100) / 100, height: Math.round(rect.height * 100) / 100 },
      style: Object.fromEntries(properties.map((name) => [name, computed.getPropertyValue(name)])),
      /* A pseudo-element that paints (content other than none) carries a hit area, a halo or an indicator. */
      pseudo: Object.fromEntries(['::before', '::after'].flatMap((pseudo) => {
        const styles = getComputedStyle(element, pseudo);
        return ['none', 'normal'].includes(styles.content) ? [] : [[pseudo, Object.fromEntries(properties.map((name) => [name, styles.getPropertyValue(name)]))]];
      })),
    };
  }).filter((entry) => entry.rect.width > 0 && entry.rect.height > 0);
})()`;

try {
  await devtools.send('Page.enable');
  await devtools.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await devtools.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [
      { name: 'prefers-reduced-motion', value: values.motion },
      { name: 'prefers-color-scheme', value: values.theme === 'dark' ? 'dark' : 'light' },
      { name: 'forced-colors', value: values['forced-colors'] },
    ],
  });

  /* A cold preview chunk can miss the first window; one reload is the whole retry policy. */
  let ready = 'timeout';
  for (let attempt = 0; attempt < 2 && ready === 'timeout'; attempt += 1) {
    const loaded = devtools.once('Page.loadEventFired');
    await devtools.send('Page.navigate', { url });
    await loaded;
    ready = values.family
      ? (await evaluate(READY_EXPRESSION))
        ? 'ready'
        : 'timeout'
      : await evaluate(`new Promise((done) => {
      const started = performance.now();
      const poll = () => document.documentElement.hasAttribute('data-preview-ready')
        ? done('ready')
        : /This page could not be found/.test(document.body?.innerText ?? '') ? done('not-found')
        : performance.now() - started > ${READY_TIMEOUT} ? done('timeout') : setTimeout(poll, 100);
      poll();
    })`);
  }
  if (ready === 'not-found')
    throw new Error(`${url} rendered the not-found page: unknown ${kind} name`);
  if (ready === 'timeout')
    throw new Error(`${url} never set data-preview-ready within ${READY_TIMEOUT}ms, twice`);
  await evaluate('document.fonts.ready.then(() => true)');

  /*
   * The ready marker fires when the item commits, and icon components can still
   * swap placeholders for glyphs after it. The page counts as painted when the
   * node count, the svg count and the number of complete images hold for two
   * consecutive 250ms windows, within 5 seconds.
   */
  async function settle() {
    let previous = '';
    let stable = 0;
    for (let tick = 0; tick < 20 && stable < 2; tick += 1) {
      await wait(250);
      const now = await evaluate(
        `[document.querySelectorAll('*').length, document.querySelectorAll('svg').length, [...document.images].filter((i) => i.complete).length].join()`,
      );
      stable = now === previous ? stable + 1 : 0;
      previous = now;
    }
  }
  await settle();

  /* A state behind an interaction — an open menu, a second step — is reached by real clicks, in order. */
  for (const target of values.click) {
    const point = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(target)});
      if (!element) return null;
      element.scrollIntoView({ block: 'center' });
      const r = element.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`);
    if (!point) throw new Error(`--click ${target}: no element matches`);
    await devtools.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    for (const type of ['mousePressed', 'mouseReleased']) {
      await devtools.send('Input.dispatchMouseEvent', {
        type,
        ...point,
        button: 'left',
        clickCount: 1,
      });
    }
    await settle();
  }

  const height = await evaluate('Math.ceil(document.documentElement.scrollHeight)');
  await devtools.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: false,
  });
  const page = await screenshot(`${stem}.png`);

  const tokens = await evaluate(`(() => {
    const computed = getComputedStyle(document.documentElement);
    return Object.fromEntries([...computed].filter((name) => name.startsWith('--')).map((name) => [name, computed.getPropertyValue(name).trim()]));
  })()`);
  const parts = await evaluate(
    readStyles(
      '[data-slot], [data-ui], [data-part], :is([data-slot], [data-ui], [data-part]) > *, svg, a, button, input, select, textarea, [role], [tabindex]',
    ),
  );
  const keyframes = await evaluate(
    `[...document.styleSheets].flatMap((sheet) => { try { return [...sheet.cssRules]; } catch { return []; } }).filter((rule) => rule instanceof CSSKeyframesRule).map((rule) => rule.cssText)`,
  );

  const specimen = {
    url,
    item: item ?? values.family,
    kind,
    base: values.base,
    style: values.style,
    theme: values.theme,
    width,
    picture: page,
    tokens,
    keyframes,
    parts,
    states: [],
  };

  if (values.states) {
    const selector = values.states;
    const rest = (await evaluate(readStyles(selector))).slice(0, Number(values.limit));
    if (rest.length === 0) throw new Error(`--states ${selector}: no rendered element matches`);

    /* Final values are read with transitions stopped; the rest entry keeps the declared transitions. */
    await evaluate(`(() => {
      const s = document.createElement('style');
      s.textContent = '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important}';
      document.head.append(s);
      [...document.querySelectorAll(${JSON.stringify(selector)})]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
        .forEach((e, i) => e.setAttribute('data-reui-capture', String(i)));
      return true;
    })()`);
    await devtools.send('DOM.enable');
    await devtools.send('CSS.enable');

    /* A client-rendered preview may replace nodes between calls, so each node id is resolved when used. */
    async function nodeAt(index) {
      const { root } = await devtools.send('DOM.getDocument', { depth: 0 });
      const { nodeId } = await devtools.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: `[data-reui-capture="${index}"]`,
      });
      if (!nodeId) throw new Error(`--states ${selector}: element ${index} left the page`);
      return nodeId;
    }

    for (const [index, entry] of rest.entries()) {
      const marked = `[data-reui-capture="${index}"]`;
      const clip = {
        x: Math.max(entry.rect.x - 16, 0),
        y: Math.max(entry.rect.y - 16, 0),
        width: entry.rect.width + 32,
        height: entry.rect.height + 32,
      };
      const record = {
        index,
        rest: entry,
        pictures: { rest: await screenshot(`${stem}-${index}-rest.png`, clip) },
        deltas: {},
      };

      for (const [state, forced] of Object.entries(STATES)) {
        /* Forcing :focus on a span paints a state no reader can reach; it is recorded as absent. */
        if (state === 'focus' && !entry.focusable) {
          record.deltas.focus = null;
          continue;
        }
        if (state === 'focus') {
          for (const type of ['rawKeyDown', 'keyUp']) {
            await devtools.send('Input.dispatchKeyEvent', {
              type,
              key: 'Tab',
              code: 'Tab',
              windowsVirtualKeyCode: 9,
              nativeVirtualKeyCode: 9,
            });
          }
          await evaluate(`(document.querySelector(${JSON.stringify(marked)})?.focus(), true)`);
        }
        const nodeId = await nodeAt(index);
        await devtools.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: forced });
        await wait(50);
        const [now] = await evaluate(readStyles(marked));
        const changed = (before = {}, after = {}, prefix = '') =>
          PROPERTIES.filter(
            (name) => !/^(transition|animation)-/.test(name) && before[name] !== after[name],
          ).map((name) => [`${prefix}${name}`, [before[name], after[name]]]);
        record.deltas[state] = Object.fromEntries([
          ...changed(entry.style, now.style),
          ...['::before', '::after'].flatMap((pseudo) =>
            entry.pseudo[pseudo] || now.pseudo[pseudo]
              ? changed(entry.pseudo[pseudo], now.pseudo[pseudo], `${pseudo} `)
              : [],
          ),
        ]);
        record.pictures[state] = await screenshot(`${stem}-${index}-${state}.png`, clip);
        await devtools.send('CSS.forcePseudoState', {
          nodeId: await nodeAt(index),
          forcedPseudoClasses: [],
        });
        if (state === 'focus') await evaluate('(document.activeElement?.blur(), true)');
      }
      specimen.states.push(record);
    }
  }

  const file = join(outDir, `${stem}.json`);
  await writeFile(file, JSON.stringify(specimen, null, 2));
  console.log(`picture  ${page}`);
  console.log(`specimen ${file}`);
  console.log(
    `parts ${specimen.parts.length}, tokens ${Object.keys(tokens).length}, keyframes ${keyframes.length}, states ${specimen.states.length}`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await close();
}
