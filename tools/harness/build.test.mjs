import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DENSITIES,
  DIRECTIONS,
  SCHEMES,
  WIDTHS,
  composedFamilies,
  parseScenes,
  renderHarness,
  scopeControlNames,
} from './build.mjs';
import { captureClip, captureName, parseArguments } from './shoot.mjs';

const fragment = `
<section data-scene="default"><b class="x">one</b></section>
<section data-scene="current"><b class="x">two</b></section>
`;

const render = () =>
  renderHarness({
    family: 'demo',
    fragment,
    familyCss: '.x { color: red }',
    themeCss: '[data-slotted-theme="default"] { --t: 1px }',
  });

test('emits one document carrying both stylesheets', () => {
  const html = render();
  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes('.x { color: red }'), 'the family stylesheet is missing');
  assert.ok(html.includes('--t: 1px'), 'the theme is missing');
});

test('renders every scene in every scheme at every width', () => {
  const html = render();
  for (const scene of ['default', 'current']) {
    for (const scheme of SCHEMES) {
      for (const width of WIDTHS) {
        assert.ok(
          html.includes(`id="${scene}-${scheme}-${width}"`),
          `missing cell ${scene}-${scheme}-${width}`,
        );
      }
    }
  }
});

test('gives a filtered page one column, so the widest stage is not clipped', () => {
  const html = render();
  assert.match(html, /body\[data-only\] main \{ grid-template-columns: 1fr \}/);
  assert.ok(
    html.indexOf('body[data-only] main') > html.indexOf('main { display: grid'),
    'the single-column rule has to come after the review grid to win',
  );
});

test('gives each cell the scheme attribute the theme selects on', () => {
  assert.match(render(), /data-slotted-scheme="dark"/);
});

test('captures the high-contrast scheme, not only light and dark', () => {
  assert.deepEqual(SCHEMES, ['light', 'dark', 'high-contrast']);
  assert.match(render(), /data-slotted-scheme="high-contrast"/);
});

test('applies density and direction to the page rather than to each cell', () => {
  const html = render();
  assert.deepEqual(DENSITIES, ['comfortable', 'compact', 'dense']);
  assert.deepEqual(DIRECTIONS, ['ltr', 'rtl']);
  assert.match(html, /q\.get\('density'\)/);
  assert.match(html, /q\.get\('dir'\)/);
  assert.match(html, /documentElement\.dataset\.slottedDensity = density/);
  assert.match(html, /documentElement\.dir = direction/);
});

/**
 * A capture is evidence only while it says which axes it was taken on. The
 * caption is baked at build time and cannot know them, so two captures of the
 * same scene at two densities carried the same label and the reader had no way
 * to tell them apart inside the image.
 */
test('names the density and the direction in every caption it captions', () => {
  const html = render();
  assert.match(html, /<span data-axes><\/span>/);
  assert.match(html, /querySelectorAll\('\[data-axes\]'\)/);
  assert.match(html, /documentElement\.dataset\.slottedDensity/);
  assert.match(html, /documentElement\.dir/);
});

test('paints each stage on the theme surface it is judged against', () => {
  assert.match(render(), /background: var\(--slotted-surface\)/);
});

test('defaults every axis and names each one in the file it writes', () => {
  const options = parseArguments(['demo']);
  assert.deepEqual(options, {
    family: 'demo',
    outDir: options.outDir,
    active: undefined,
    at: undefined,
    focus: undefined,
    hover: undefined,
    motion: undefined,
    scene: undefined,
    zoom: '100',
    scheme: 'light',
    width: '420',
    density: 'comfortable',
    dir: 'ltr',
  });
  assert.equal(captureName(options), 'demo-light-comfortable-ltr-420.png');
});

test('captures a focused element, because a focus ring is judged from an image', () => {
  const options = parseArguments(['demo', '--focus', '[data-focusable] a']);
  assert.equal(options.focus, '[data-focusable] a');
  assert.equal(captureName(options), 'demo-focus-data-focusable-a-light-comfortable-ltr-420.png');
});

/**
 * Hover and press exist in no capture the shooter could take before this: a
 * headless page has no pointer, so a family could paint a hover fill nobody
 * ever looked at. The pseudo-class is forced through the protocol instead of
 * simulated with a mouse, because a moved pointer also scrolls, hovers whatever
 * it passes over, and cannot reach `:active` at all without holding a button
 * down for the length of the capture.
 */
test('captures hover and press, which a headless page has no pointer to produce', () => {
  const hovered = parseArguments(['demo', '--hover', "[data-ui='card']"]);
  assert.equal(hovered.hover, "[data-ui='card']");
  assert.equal(captureName(hovered), 'demo-hover-data-ui-card-light-comfortable-ltr-420.png');

  const pressed = parseArguments(['demo', '--active', "[data-ui='card']"]);
  assert.equal(pressed.active, "[data-ui='card']");
  assert.equal(captureName(pressed), 'demo-active-data-ui-card-light-comfortable-ltr-420.png');
});

test('keeps a hovered capture and a pressed capture of one element apart', () => {
  const hovered = parseArguments(['demo', '--hover', 'a']);
  const pressed = parseArguments(['demo', '--active', 'a']);
  assert.notEqual(captureName(hovered), captureName(pressed));
});

/**
 * A page is photographed the instant it loads, so every animation on it sits at
 * the start of its first cycle — and the start of a cycle is where an expanding
 * ring, a sweep or a pulse is indistinguishable from nothing at all.
 * `status-indicator` produced three captures of an invisible pulse for that
 * reason, and no reader of those images could have told the animation apart
 * from an unimplemented one.
 */
test('captures a moment inside an animation, which loading the page cannot reach', () => {
  const options = parseArguments(['demo', '--at', '800']);
  assert.equal(options.at, '800');
  assert.equal(captureName(options), 'demo-light-comfortable-ltr-420-at800ms.png');
});

test('keeps two moments of one animation in two files, and the default out of both', () => {
  const early = parseArguments(['demo', '--at', '200']);
  const late = parseArguments(['demo', '--at', '900']);
  assert.notEqual(captureName(early), captureName(late));
  assert.equal(captureName(parseArguments(['demo'])), 'demo-light-comfortable-ltr-420.png');
});

/**
 * Headless Chrome answers `prefers-reduced-motion: reduce` by default, so every
 * capture taken before this axis existed was taken by a reader who had asked
 * for stillness — and the foundation requires every infinite animation to be
 * guarded by exactly that query. Both answers have to be reachable, and neither
 * of them may be whatever the browser happens to say.
 */
test('states the reader’s motion preference instead of inheriting the browser’s', () => {
  const still = parseArguments(['demo', '--motion', 'reduce']);
  assert.equal(still.motion, 'reduce');
  assert.equal(captureName(still), 'demo-light-comfortable-ltr-420-motion-reduce.png');

  const moving = parseArguments(['demo', '--motion', 'no-preference']);
  assert.equal(captureName(moving), 'demo-light-comfortable-ltr-420-motion-no-preference.png');
  assert.throws(() => parseArguments(['demo', '--motion', 'off']), /reduce, no-preference/);
});

test('refuses a moment that is not a whole number of milliseconds', () => {
  assert.throws(() => parseArguments(['demo', '--at', 'halfway']), /whole number of milliseconds/);
  assert.throws(() => parseArguments(['demo', '--at', '1.5']), /whole number of milliseconds/);
});

test('keeps two focus targets in the same combination in two files', () => {
  const first = parseArguments(['demo', '--focus', 'a']);
  const second = parseArguments(['demo', '--focus', 'button']);
  assert.notEqual(captureName(first), captureName(second));
});

test('reads every axis by name', () => {
  const options = parseArguments([
    'demo',
    '--scheme',
    'high-contrast',
    '--density',
    'dense',
    '--dir',
    'rtl',
    '--width',
    '240',
    '--out',
    '/somewhere',
  ]);
  assert.equal(options.scheme, 'high-contrast');
  assert.equal(options.density, 'dense');
  assert.equal(options.dir, 'rtl');
  assert.equal(options.width, '240');
  assert.equal(options.outDir, '/somewhere');
});

test('narrows a capture to one scene and says so in the file name', () => {
  const options = parseArguments(['demo', '--scene', 'emphasis']);
  assert.equal(options.scene, 'emphasis');
  assert.equal(captureName(options), 'demo-emphasis-light-comfortable-ltr-420.png');
  assert.match(render(), /q\.get\('scene'\)/);
  assert.match(render(), /dataset\.scene === scene/);
});

test('refuses an axis value the harness cannot render', () => {
  assert.throws(() => parseArguments(['demo', '--density', 'roomy']), /density must be one of/);
  assert.throws(() => parseArguments(['demo', '--scheme']), /needs a value/);
  assert.throws(() => parseArguments(['--scheme', 'dark']), /usage/);
});

test('sizes each cell so a container query has something to answer', () => {
  assert.match(render(), /inline-size:\s*240px/);
});

test('refuses a fragment that declares no scene', () => {
  assert.throws(
    () =>
      renderHarness({ family: 'demo', fragment: '<b>no scene</b>', familyCss: '', themeCss: '' }),
    /no scene/i,
  );
});

test('keeps the scene markup verbatim, so the harness shows the real DOM', () => {
  assert.ok(render().includes('<b class="x">one</b>'));
});

test('photographs the page once, at the scale the emulation already set', () => {
  const clip = captureClip({ width: '420', contentHeight: 553 });
  assert.equal(clip.scale, 1, 'a second scale factor repeats the top of the page below the fold');
  assert.equal(clip.width, 500);
  assert.equal(clip.height, 553);
});

test('clips to the content, not to the viewport floor a short page never reaches', () => {
  assert.equal(captureClip({ width: '420', contentHeight: 553.4 }).height, 554);
  assert.equal(captureClip({ width: '420', contentHeight: 0 }).height, 1);
});

/**
 * A family whose subject is how it composes with another cannot be looked at
 * alone. `button-group` joins buttons into one shape, repaints one seam of a
 * solid one and raises the focused one over its neighbour; with only its own
 * stylesheet on the page, every capture shows unstyled markup and there is
 * nothing to judge. The fragment already names the families it renders, in the
 * same `data-ui` that is the public identifier, so nothing new has to be
 * declared for the page to carry them.
 */
test('names the other families a fragment renders', () => {
  const composed = composedFamilies(
    `<section data-scene="s">
       <div data-ui="button-group"><button data-ui='button'></button></div>
       <div data-ui="button-group"></div>
     </section>`,
    'button-group',
  );
  assert.deepEqual(composed, ['button']);
});

test('carries a composed family stylesheet, before the family that composes it', () => {
  const html = renderHarness({
    family: 'demo',
    fragment,
    familyCss: '.x { color: red }',
    composedCss: '.y { color: blue }',
    themeCss: '',
  });
  assert.ok(html.includes('.y { color: blue }'), 'the composed stylesheet is missing');
  assert.ok(
    html.indexOf('.y { color: blue }') < html.indexOf('.x { color: red }'),
    'the family under review has to be able to override what it composes',
  );
});

/**
 * A control whose edges are drawn by two coincident borders looks correct at
 * 100% and comes apart at 110%: the browser snaps each border box to device
 * pixels on its own, so one boundary lands on a single column and the next
 * lands across two, and a bar of equal dividers renders with one of them twice
 * as thick. That defect reached a human review because no capture could show
 * it — the axis exists so the visual loop can.
 */
test('photographs the page at the reader\u2019s own zoom', () => {
  const zoomed = parseArguments(['demo', '--zoom', '150']);
  assert.equal(zoomed.zoom, '150');
  assert.equal(captureName(zoomed), 'demo-light-comfortable-ltr-420-zoom150.png');
});

test('keeps every capture taken before the axis existed named as it was', () => {
  assert.equal(parseArguments(['demo']).zoom, '100');
  assert.equal(captureName(parseArguments(['demo'])), 'demo-light-comfortable-ltr-420.png');
});

test('refuses a zoom that is not a percentage', () => {
  assert.throws(() => parseArguments(['demo', '--zoom', '1.5']), /percentage/);
  assert.throws(() => parseArguments(['demo', '--zoom', '0']), /percentage/);
});

/**
 * A family whose own root is a `section` — `alert`, whose box is a landmark
 * rather than a live region — closed the scene around it when scenes were read
 * with a single non-greedy pattern. The first alert rendered correctly and
 * every one after it vanished, which is a defect no reader of the capture could
 * have told apart from a fragment that only declared one.
 */
test('reads a scene whose markup nests sections of its own', () => {
  const nested = `
<section data-scene="messages">
  <section data-ui="alert" data-part="root">first</section>
  <section data-ui="alert" data-part="root">second</section>
</section>
<section data-scene="after"><b>tail</b></section>
`;
  const scenes = parseScenes(nested);

  assert.deepEqual(
    scenes.map((scene) => scene.name),
    ['messages', 'after'],
  );
  assert.ok(scenes[0].markup.includes('first'), 'the first nested section is missing');
  assert.ok(scenes[0].markup.includes('second'), 'the scene closed at the first nested section');
  assert.ok(!scenes[0].markup.includes('tail'), 'the scene swallowed the one after it');
});

test('refuses a scene that is never closed rather than emitting half a page', () => {
  assert.throws(() => parseScenes('<section data-scene="open"><b>x</b>'), /never closed/);
});

/**
 * Nine copies of one scene on one page were nine copies of one radio group,
 * because a radio group with no `form` around it is scoped to the document. The
 * last `checked` won and eight cells photographed an empty set — a wrong
 * picture that no assertion about the markup could see.
 */
test('gives each cell its own radio group, so a checked radio survives every copy', () => {
  const html = renderHarness({
    family: 'demo',
    fragment: `<section data-scene="pick"><input type="radio" name="p" checked></section>`,
    familyCss: '',
    themeCss: '',
  });
  const names = [...html.matchAll(/name="([^"]+)"/g)].map(([, value]) => value);
  assert.equal(names.length, SCHEMES.length * WIDTHS.length);
  assert.equal(new Set(names).size, names.length, 'two cells share one radio group');
  assert.ok(
    names.every((value) => value.startsWith('p--')),
    'the consumer name is not kept as the stem',
  );
});

test('rewrites the name of a control and nothing else on the element', () => {
  const scoped = scopeControlNames(
    '<input data-part="control" type="radio" name="plan" id="plan-1" checked />',
    'light-420',
  );
  assert.match(scoped, /name="plan--light-420"/);
  assert.match(scoped, /id="plan-1"/);
  assert.match(scoped, /data-part="control"/);
});

test('leaves a name outside a control alone', () => {
  assert.equal(scopeControlNames('<a name="anchor"></a>', 'light-420'), '<a name="anchor"></a>');
});

/**
 * The filter read the scene out of the stage id and matched it by prefix, so
 * `--scene tile` also showed `tile-states` and `tile-row`: a capture that named
 * one scene and photographed three.
 */
test('narrows to the scene named and not to every scene whose name starts with it', () => {
  const html = renderHarness({
    family: 'demo',
    fragment: `<section data-scene="tile"><b>a</b></section>
<section data-scene="tile-states"><b>b</b></section>`,
    familyCss: '',
    themeCss: '',
  });
  assert.match(html, /data-scene="tile"/);
  assert.match(html, /data-scene="tile-states"/);
  assert.ok(
    html.includes('dataset.scene === scene'),
    'the filter still matches the scene by prefix',
  );
});
