import { readFileSync } from 'node:fs';

import { transform } from 'lightningcss';

import { COMPONENT_TOKENS, contract, SEED_NAMES } from '../dist/index.js';

/**
 * A theme rule may select only what a binding renders on purpose — a family by
 * `data-ui`, its parts by `data-part`, and the attributes a family or the
 * theme axes set — and may read only tokens. Everything else is an
 * implementation detail of a family stylesheet, which changes without notice.
 */
const hooks = JSON.parse(
  readFileSync(new URL('../src/generated/hooks.json', import.meta.url), 'utf8'),
);
const ATTRIBUTES = new Set([
  ...hooks.attributes,
  'data-ui',
  'data-part',
  'data-slotted-theme',
  'data-slotted-scheme',
  'data-slotted-density',
  'data-slotted-seeds',
]);
const TOKENS = new Set([
  ...contract.tokens.map((token) => token.name),
  ...COMPONENT_TOKENS,
  ...SEED_NAMES.map((seed) => `--slotted-seed-${seed}`),
]);

const at = (filename, loc) => `${filename}:${(loc?.line ?? 0) + 1}:${loc?.column ?? 0}`;
const atLine = (filename, loc) => `${filename}:${(loc?.line ?? 0) + 1}`;

/** Reconstructs the selector text lightningcss parsed, for error messages only. */
function selectorText(components) {
  let text = '';
  for (const component of components) {
    switch (component.type) {
      case 'attribute': {
        const operation = component.operation;
        text += operation
          ? `[${component.name}${operation.operator === 'equal' ? '=' : operation.operator}'${operation.value}']`
          : `[${component.name}]`;
        break;
      }
      case 'class':
        text += `.${component.name}`;
        break;
      case 'id':
        text += `#${component.name}`;
        break;
      case 'type':
        text += component.name;
        break;
      case 'pseudo-class':
      case 'pseudo-element':
        text += component.selectors
          ? `:${component.kind}(${component.selectors.map((nested) => selectorText(nested)).join(', ')})`
          : `:${component.kind}`;
        break;
      case 'combinator':
        text +=
          { child: ' > ', 'next-sibling': ' + ', 'later-sibling': ' ~ ' }[component.value] ?? ' ';
        break;
      case 'nesting':
        text += '&';
        break;
      default:
        break;
    }
  }
  return text;
}

function checkSelector(components, report) {
  let ui = null;
  let part = null;
  const closeCompound = () => {
    if (ui && part && !(hooks.ui[ui] ?? []).includes(part)) {
      report(`[data-part='${part}'] is not a part of ${ui}`);
    }
    ui = null;
    part = null;
  };
  for (const component of components) {
    if (component.type === 'combinator') {
      closeCompound();
      continue;
    }
    if (component.type === 'class') report(`.${component.name}: a class is not a public selector`);
    if (component.type === 'attribute') {
      const value = component.operation?.value;
      if (component.name === 'data-ui') {
        if (value !== undefined && !(value in hooks.ui))
          report(`[data-ui='${value}'] names no family`);
        ui = value ?? null;
      } else if (component.name === 'data-part') {
        part = value ?? null;
      } else if (component.name.startsWith('data-') && !ATTRIBUTES.has(component.name)) {
        report(`[${component.name}] is not an attribute any family sets`);
      }
    }
    for (const nested of component.selectors ?? []) checkSelector(nested, report);
  }
  closeCompound();
}

export function validateRules(css, filename) {
  const errors = [];
  // A stack, not a single slot: CSS nesting (`&`) lets a rule directly contain
  // another rule, and a `var()` after the nested rule belongs to an implicit
  // `nested-declarations` block lightningcss inserts for it — its own line,
  // its own place in the tree, but no selector of its own, so it inherits the
  // nearest enclosing style rule's. The top of the stack is always the rule
  // that directly contains whatever the visitor is looking at right now.
  const context = [];
  try {
    transform({
      filename,
      code: Buffer.from(css),
      errorRecovery: false,
      visitor: {
        // The generic (unkeyed) Rule/RuleExit hooks, not `Rule: { style(rule) {} }`:
        // lightningcss 1.33 never calls a type-keyed RuleExit for a style rule, so a
        // keyed Rule visitor has no matching exit to pop the stack with.
        Rule(rule) {
          if (rule.type === 'style') {
            const where = atLine(filename, rule.value.loc);
            const text = rule.value.selectors.map((selector) => selectorText(selector)).join(', ');
            context.push({ where, text });
            for (const selector of rule.value.selectors) {
              const selectorOwnText = selectorText(selector);
              checkSelector(selector, (message) =>
                errors.push(`${where} ${selectorOwnText}: ${message}`),
              );
            }
          } else {
            const parent = context[context.length - 1];
            context.push({ where: atLine(filename, rule.value?.loc), text: parent?.text ?? '' });
          }
          // No return, from either branch: lightningcss round-trips a returned rule
          // back into its Rust AST, which fails to deserialize a value's `var()`
          // once it has passed through JS. The visitor only inspects the rule.
        },
        RuleExit() {
          context.pop();
        },
        Variable(variable) {
          const name = variable.name.ident;
          const top = context[context.length - 1];
          const where = top ? `${top.where} ${top.text}:` : filename;
          if (name.startsWith('--_'))
            errors.push(`${where} var(${name}) reads a private property of a family`);
          else if (name.startsWith('--slotted-') && !TOKENS.has(name))
            errors.push(`${where} var(${name}) is not a token`);
          // No return: the visitor only inspects the variable reference, and lightningcss
          // requires a `TokenOrValue`-shaped return (not the bare `Variable`) to rewrite one.
        },
      },
    });
  } catch (error) {
    errors.push(`${at(filename, error.loc)} ${error.message}`);
  }
  return errors;
}
