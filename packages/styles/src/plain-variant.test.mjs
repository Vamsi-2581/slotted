import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = new URL('.', import.meta.url).pathname;

/**
 * The `plain` variant of a field (SL5): a cell that is only a control while it
 * is being used. At rest it has no edge, no lift and no ground of its own —
 * the row it sits in is the ground — and it keeps exactly the box of the
 * other two variants, so the row does not reflow when the pointer crosses it.
 * Hover answers with the neutral subtle surface, one step, and nothing else;
 * the accent edge the other variants take on hover would draw the cell's
 * outline where there is none. Keyboard focus keeps the theme's ring (R3).
 *
 * Six families ship the variant with the same values; a form with a `plain`
 * text field beside a `plain` select that is lifted by its resting shadow is
 * a form that looks unfinished.
 */
const FAMILIES = [
  'select',
  'combobox',
  'multi-select',
  'text-field',
  'textarea',
  'number-field',
  'currency-field',
];

/** Every innermost `selector { declarations }` pair outside a media query. */
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
        found.push({
          selector: open.selector
            .replace(/\s+/g, ' ')
            .replace(/\(\s+/g, '(')
            .replace(/\s+\)/g, ')')
            .trim(),
          body: css.slice(open.body, index).replace(/\/\*[\s\S]*?\*\//g, ''),
          media: stack.map((frame) => frame.selector).find((s) => s.startsWith('@media')) ?? '',
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

function find(all, selector) {
  const rule = all.find((candidate) => !candidate.media && candidate.selector === selector);
  assert.ok(rule, `no rule for \`${selector}\``);
  return rule;
}

/** The hover rule of a variant: guarded against every stronger state, as the family words it. */
function hover(all, variant) {
  const rule = all.find(
    (candidate) =>
      !candidate.media &&
      candidate.selector.startsWith(`${variant}:hover`) &&
      candidate.selector.includes(':not([data-disabled])') &&
      candidate.selector.includes(':not([data-readonly])') &&
      candidate.selector.includes(':not([data-invalid])'),
  );
  assert.ok(rule, `no guarded hover rule for \`${variant}\``);
  return rule;
}

for (const family of FAMILIES) {
  const css = readFileSync(`${source}${family}/${family}.css`, 'utf8');
  const all = rules(css);
  const root = `[data-ui='${family}'][data-part='root']`;
  const plain = `${root}[data-variant='plain']`;

  test(`${family}: a plain control at rest has no edge, no lift and no ground`, () => {
    const rest = find(all, plain);
    assert.equal(declaration(rest.body, 'border-color'), 'transparent');
    assert.equal(declaration(rest.body, 'box-shadow'), 'none');
    assert.equal(declaration(rest.body, 'background-color'), 'transparent');
  });

  test(`${family}: a plain control answers hover with the neutral subtle surface and nothing else`, () => {
    const rule = hover(all, plain);
    assert.equal(
      declaration(rule.body, 'background-color'),
      `var( --slotted-${family}-plain-hover-background, var(--slotted-tone-secondary-subtle-hover) )`,
    );
    assert.equal(declaration(rule.body, 'border-color'), 'transparent');
    assert.equal(declaration(rule.body, 'box-shadow'), undefined);
  });
}
