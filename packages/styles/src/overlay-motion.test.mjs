import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * R7 — an anchored layer arrives along the axis it opens on. `opacity` 0→1
 * with `translate` 0 −4px → 0 when it opens downward, 0 4px → 0 when it opens
 * upward, and never a movement along the inline axis; a `scale` from the
 * corner the positioner named as origin moved the far edge by four per cent
 * of the width and read as an entrance from the left (SL2, CB2, M1). A menu
 * placed beside its anchor — every submenu — is the one lateral case and
 * slides one step along the inline axis it opens on.
 *
 * The entrance is a keyframe animation, because a transition starts from the
 * style the browser computed last and the positioner writes `data-side` in
 * the same style update as the family opens the layer: a transition set out
 * from the closed style of the side the layer had before it had one. The exit
 * is a transition on the closed rule, so it leaves from wherever the layer
 * is. Only a layer the positioner placed — it writes `data-positioned` with
 * the side — arrives; a layer written open in static markup is simply there.
 * Reduced motion keeps the fade and drops the movement.
 *
 * The distance is one step of the space scale, so a theme retunes it where it
 * retunes every other gap.
 */
const LAYERS = [
  { family: 'select', layer: '[data-ui-select][data-part-positioner]', lateral: 'fade' },
  { family: 'combobox', layer: '[data-ui-combobox][data-part-positioner]', lateral: 'fade' },
  {
    family: 'multi-select',
    layer: '[data-ui-multi-select][data-part-positioner]',
    lateral: 'fade',
  },
  {
    family: 'entity-picker',
    layer: '[data-ui-entity-picker][data-part-positioner]',
    lateral: 'fade',
  },
  { family: 'menu', layer: '[data-ui-menu]', lateral: 'slide' },
  { family: 'popover', layer: '[data-ui-popover]', lateral: 'fade' },
  { family: 'tooltip', layer: '[data-ui-tooltip]', lateral: 'fade' },
  /** The flyout beside a rail is placed at the row's inline end, so it slides like a submenu. */
  {
    family: 'side-navigation',
    layer: '[data-ui-side-navigation][data-part-flyout]',
    lateral: 'slide',
  },
];

const DISTANCE = 'var(--_enter-distance)';
const REDUCED = '@media (prefers-reduced-motion: reduce)';

/** Every innermost `selector { declarations }` pair, tagged with the at-rules it sits in. */
function rules(css) {
  const found = [];
  const stack = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      stack.push({
        selector: css
          .slice(start, index)
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim(),
        body: index + 1,
      });
      start = index + 1;
    } else if (char === '}') {
      const open = stack.pop();
      if (open && !open.selector.startsWith('@')) {
        const parents = stack.map((frame) => frame.selector);
        found.push({
          selector: open.selector
            .replace(/\s+/g, ' ')
            .replace(/\(\s+/g, '(')
            .replace(/\s+\)/g, ')')
            .trim(),
          body: css.slice(open.body, index).replace(/\/\*[\s\S]*?\*\//g, ''),
          media: parents.find((s) => s.startsWith('@media')) ?? '',
          keyframes:
            parents.find((s) => s.startsWith('@keyframes'))?.slice('@keyframes '.length) ?? '',
        });
      }
      start = index + 1;
    }
  }
  return found;
}

function declaration(body, property) {
  const match = body.match(new RegExp(`(?:^|;|\\n)\\s*${property}\\s*:\\s*([^;]+);`));
  return match ? match[1].replace(/\s+/g, ' ').trim() : undefined;
}

/** A selector list split on the commas outside any parenthesis. */
function selectors(list) {
  return list.split(/,(?![^(]*\))/).map((s) => s.trim());
}

function find(all, selector, media = '') {
  const rule = all.find(
    (candidate) =>
      !candidate.keyframes &&
      selectors(candidate.selector).includes(selector) &&
      candidate.media.startsWith(media),
  );
  assert.ok(rule, `no rule for \`${selector}\`${media ? ` inside ${media}` : ''}`);
  return rule;
}

function keyframe(all, name, step) {
  const rule = all.find((candidate) => candidate.keyframes === name && candidate.selector === step);
  assert.ok(rule, `no \`${step}\` step in @keyframes ${name}`);
  return rule;
}

for (const { family, layer, lateral } of LAYERS) {
  const css = readFileSync(`${source}${family}/${family}.css`, 'utf8');
  const all = rules(css);
  const name = `slotted-${family}`;

  test(`${family}: the closed layer rests one step from its place along the axis it opens on`, () => {
    const closed = find(all, layer);
    assert.equal(declaration(closed.body, 'opacity'), '0');
    assert.equal(declaration(closed.body, 'scale'), undefined, `${family} scales its layer`);
    assert.equal(declaration(closed.body, 'translate'), `0 calc(-1 * ${DISTANCE})`);
    assert.equal(
      declaration(closed.body, '--_enter-distance'),
      'var(--slotted-space-2, 0.25rem)',
      `${family} takes the distance from somewhere other than the space scale`,
    );
    assert.equal(
      declaration(find(all, `${layer}[data-side='top']`).body, 'translate'),
      `0 ${DISTANCE}`,
    );
    if (lateral === 'slide') {
      assert.equal(
        declaration(find(all, `${layer}[data-side='right']`).body, 'translate'),
        `calc(-1 * ${DISTANCE}) 0`,
      );
      assert.equal(
        declaration(find(all, `${layer}[data-side='left']`).body, 'translate'),
        `${DISTANCE} 0`,
      );
    } else {
      const sides = find(all, `${layer}:is([data-side='left'], [data-side='right'])`);
      assert.equal(declaration(sides.body, 'translate'), '0 0');
    }
  });

  test(`${family}: the layer leaves on the exit duration, from wherever it is`, () => {
    const transition = declaration(find(all, layer).body, 'transition');
    assert.match(
      transition,
      /opacity var\(--slotted-duration-short\) var\(--slotted-easing-exit\)/,
    );
    assert.match(
      transition,
      /translate var\(--slotted-duration-short\) var\(--slotted-easing-exit\)/,
    );
    assert.doesNotMatch(transition, /\bscale\b/);
  });

  test(`${family}: the layer arrives by a keyframe that states where it starts`, () => {
    const open = find(all, `${layer}[data-open]`);
    assert.equal(declaration(open.body, 'opacity'), '1');
    assert.equal(declaration(open.body, 'translate'), '0 0');
    assert.equal(declaration(open.body, 'scale'), undefined);
    assert.equal(declaration(open.body, 'transition'), 'none');
    assert.equal(
      declaration(open.body, 'animation'),
      undefined,
      'a layer written open in static markup must not enter',
    );
    assert.equal(
      declaration(find(all, `${layer}[data-open][data-positioned]`).body, 'animation'),
      `${name}-enter-down var(--slotted-duration-medium) var(--slotted-easing-enter)`,
    );
    assert.equal(
      declaration(
        find(all, `${layer}[data-open][data-positioned][data-side='top']`).body,
        'animation-name',
      ),
      `${name}-enter-up`,
    );

    const down = keyframe(all, `${name}-enter-down`, 'from');
    assert.equal(declaration(down.body, 'opacity'), '0');
    assert.equal(declaration(down.body, 'translate'), `0 calc(-1 * ${DISTANCE})`);
    const up = keyframe(all, `${name}-enter-up`, 'from');
    assert.equal(declaration(up.body, 'opacity'), '0');
    assert.equal(declaration(up.body, 'translate'), `0 ${DISTANCE}`);
  });

  test(`${family}: a lateral side ${lateral === 'slide' ? 'slides along the inline axis it opens on' : 'only fades'}`, () => {
    if (lateral === 'slide') {
      assert.equal(
        declaration(
          find(all, `${layer}[data-open][data-positioned][data-side='right']`).body,
          'animation-name',
        ),
        `${name}-enter-from-start`,
      );
      assert.equal(
        declaration(
          find(all, `${layer}[data-open][data-positioned][data-side='left']`).body,
          'animation-name',
        ),
        `${name}-enter-from-end`,
      );
      const start = keyframe(all, `${name}-enter-from-start`, 'from');
      assert.equal(declaration(start.body, 'translate'), `calc(-1 * ${DISTANCE}) 0`);
      const end = keyframe(all, `${name}-enter-from-end`, 'from');
      assert.equal(declaration(end.body, 'translate'), `${DISTANCE} 0`);
    } else {
      assert.equal(
        declaration(
          find(
            all,
            `${layer}[data-open][data-positioned]:is([data-side='left'], [data-side='right'])`,
          ).body,
          'animation-name',
        ),
        `${name}-fade`,
      );
    }
    const fade = keyframe(all, `${name}-fade`, 'from');
    assert.equal(declaration(fade.body, 'opacity'), '0');
    assert.equal(declaration(fade.body, 'translate'), undefined);
  });

  test(`${family}: reduced motion keeps the fade and drops the movement`, () => {
    for (const selector of [
      layer,
      `${layer}[data-side='top']`,
      `${layer}[data-side='left']`,
      `${layer}[data-side='right']`,
    ]) {
      const still = find(all, selector, REDUCED);
      assert.equal(declaration(still.body, 'translate'), '0 0');
      assert.equal(
        declaration(still.body, 'transition'),
        'opacity var(--slotted-duration-short) var(--slotted-easing-exit)',
      );
    }
    for (const selector of [
      `${layer}[data-open][data-positioned]`,
      `${layer}[data-open][data-positioned][data-side='top']`,
      `${layer}[data-open][data-positioned][data-side='left']`,
      `${layer}[data-open][data-positioned][data-side='right']`,
    ]) {
      assert.equal(
        declaration(find(all, selector, REDUCED).body, 'animation-name'),
        `${name}-fade`,
      );
    }
  });
}
