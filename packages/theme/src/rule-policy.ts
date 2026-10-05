import { scanCssText } from './css-scan';
import { COMPONENT_TOKENS, contract } from './generated/contract';
import hooks from './generated/hooks.json';
import { SEED_NAMES } from './seeds';

/**
 * What a theme rule may select and read (design §10.2, ADR 0004). A rule
 * selects only what a binding renders on purpose — a family by `data-ui`, its
 * parts by `data-part`, and the `data-*` attributes a family or the theme
 * axes set — and reads only tokens. Everything else is an implementation
 * detail of a family stylesheet, which changes without notice.
 *
 * `defineTheme` (every rule given as text) and `slotted-build-theme` (every
 * rule, after lightningcss has parsed it) both call `ruleErrors`, so the two
 * paths hold one policy.
 */

/** One violation: the 1-based line in the rule text, the selector of the rule it sits in, and why. */
export interface RuleError {
  readonly line: number;
  readonly selector: string;
  readonly message: string;
}

const UI: Readonly<Record<string, readonly string[]>> = hooks.ui;
const ATTRIBUTES = new Set<string>([
  ...hooks.attributes,
  'data-ui',
  'data-part',
  'data-slotted-theme',
  'data-slotted-scheme',
  'data-slotted-density',
  'data-slotted-seeds',
]);
const TOKENS = new Set<string>([
  ...contract.tokens.map((token) => token.name),
  ...COMPONENT_TOKENS,
  ...SEED_NAMES.map((seed) => `--slotted-seed-${seed}`),
]);

/** Pseudo-classes that select by place in the document instead of by a public hook. */
const ROOTS = new Set(['root', 'scope', 'host', 'host-context']);
/** Pseudo-classes whose argument is a selector list matching the same element. */
const SAME_ELEMENT = new Set(['is', 'where', 'matches', '-webkit-any', '-moz-any']);
/** At-rules whose block holds no style rule: their preludes are not selectors. */
const NOT_STYLE =
  /^@(?:-[a-z]+-)?(keyframes|font-face|property|page|counter-style|font-feature-values|font-palette-values|view-transition|position-try)\b/i;

type Component =
  | {
      readonly type: 'attribute';
      readonly raw: string;
      readonly name: string;
      readonly value: string | undefined;
    }
  | {
      readonly type: 'class' | 'id' | 'type' | 'universal' | 'nesting' | 'combinator';
      readonly raw: string;
    }
  | {
      readonly type: 'pseudo-class' | 'pseudo-element';
      readonly raw: string;
      readonly name: string;
      readonly argument: string | undefined;
    };

const isNameChar = (char: string) => /[\w-]/.test(char) || char.charCodeAt(0) >= 0x80;

/**
 * Reads a selector list into its complex selectors, each a run of components
 * with explicit combinators (a descendant combinator is `' '`). A functional
 * pseudo-class keeps its argument as text; `selectorErrors` reads the ones
 * that hold selectors. Throws on text that is not a selector.
 */
function parseSelectorList(text: string): Component[][] {
  const list: Component[][] = [];
  let current: Component[] = [];
  let index = 0;

  const fail = (reason: string): never => {
    throw new Error(
      `cannot read the selector at ${JSON.stringify(text.slice(index, index + 20))}: ${reason}`,
    );
  };
  /** An identifier with its escapes decoded (CSS Syntax § 4.3.7). */
  const ident = (): string => {
    let name = '';
    while (index < text.length) {
      const char = text[index]!;
      if (char === '\\') {
        const hex = /^[0-9a-fA-F]{1,6}\s?/.exec(text.slice(index + 1));
        if (hex) {
          name += String.fromCodePoint(Number.parseInt(hex[0].trim(), 16));
          index += 1 + hex[0].length;
        } else if (index + 1 < text.length) {
          name += text[index + 1];
          index += 2;
        } else fail('a dangling escape');
      } else if (isNameChar(char)) {
        name += char;
        index += 1;
      } else break;
    }
    return name;
  };
  const string = (): string => {
    const quote = text[index]!;
    let value = '';
    index += 1;
    while (index < text.length && text[index] !== quote) {
      if (text[index] === '\\') {
        value += text[index + 1] ?? '';
        index += 2;
      } else {
        value += text[index];
        index += 1;
      }
    }
    if (index >= text.length) fail('a string never closed');
    index += 1;
    return value;
  };
  const skipSpace = () => {
    while (/\s/.test(text[index] ?? '')) index += 1;
  };
  /** The text up to the `)` that closes the `(` at `index`, strings and nesting skipped. */
  const argument = (): string => {
    const start = index + 1;
    let depth = 0;
    for (; index < text.length; index += 1) {
      const char = text[index]!;
      if (char === '\\') index += 1;
      else if (char === '"' || char === "'") {
        string();
        index -= 1;
      } else if (char === '(') depth += 1;
      else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          return text.slice(start, index - 1);
        }
      }
    }
    return fail('a parenthesis never closed');
  };
  const push = (component: Component) => {
    const last = current[current.length - 1];
    if (component.type === 'combinator' && (last === undefined || last.type === 'combinator')) {
      // A leading combinator is a relative selector (`:has(> x)`); two in a row are not CSS.
      if (last !== undefined) fail('two combinators in a row');
    }
    current.push(component);
  };

  while (index < text.length) {
    const start = index;
    const char = text[index]!;
    if (/\s/.test(char)) {
      skipSpace();
      const next = text[index];
      const last = current[current.length - 1];
      const explicit =
        next === undefined || ',>+~'.includes(next) || (next === '|' && text[index + 1] === '|');
      if (!explicit && last && last.type !== 'combinator') push({ type: 'combinator', raw: ' ' });
      continue;
    }
    if (char === ',') {
      if (current.length === 0 || current[current.length - 1]!.type === 'combinator')
        fail('an empty selector');
      list.push(current);
      current = [];
      index += 1;
      skipSpace();
      continue;
    }
    if (char === '>' || char === '+' || char === '~' || (char === '|' && text[index + 1] === '|')) {
      index += char === '|' ? 2 : 1;
      push({ type: 'combinator', raw: char === '|' ? '||' : char });
      skipSpace();
      continue;
    }
    if (char === '[') {
      index += 1;
      skipSpace();
      if (text[index] === '*' && text[index + 1] === '|') index += 2;
      else if (text[index] === '|' && text[index + 1] !== '=') index += 1;
      let name = ident();
      if (text[index] === '|' && text[index + 1] !== '=') {
        index += 1;
        name = ident();
      }
      if (!name) fail('an attribute without a name');
      skipSpace();
      let value: string | undefined;
      const operator = /^[~|^$*]?=/.exec(text.slice(index));
      if (operator) {
        index += operator[0].length;
        skipSpace();
        value = text[index] === '"' || text[index] === "'" ? string() : ident();
        skipSpace();
        if (/[a-zA-Z]/.test(text[index] ?? '')) ident();
        skipSpace();
      }
      if (text[index] !== ']') fail('an attribute selector never closed');
      index += 1;
      push({ type: 'attribute', raw: text.slice(start, index), name, value });
      continue;
    }
    if (char === '.' || char === '#') {
      index += 1;
      if (!ident()) fail(`${char} without a name`);
      push({ type: char === '.' ? 'class' : 'id', raw: text.slice(start, index) });
      continue;
    }
    if (char === '&') {
      index += 1;
      push({ type: 'nesting', raw: '&' });
      continue;
    }
    if (char === ':') {
      const element = text[index + 1] === ':';
      index += element ? 2 : 1;
      const name = ident().toLowerCase();
      if (!name) fail('a pseudo-class without a name');
      const value = text[index] === '(' ? argument() : undefined;
      push({
        type: element ? 'pseudo-element' : 'pseudo-class',
        raw: text.slice(start, index),
        name,
        argument: value,
      });
      continue;
    }
    if (char === '*' || char === '|' || isNameChar(char) || char === '\\') {
      // A type or universal selector, with an optional `namespace|` before it.
      let universal = false;
      if (char === '*') {
        index += 1;
        universal = true;
      } else if (char !== '|') ident();
      if (text[index] === '|' && text[index + 1] !== '|' && text[index + 1] !== '=') {
        index += 1;
        if (text[index] === '*') {
          index += 1;
          universal = true;
        } else {
          universal = false;
          if (!ident()) fail('a namespace without an element');
        }
      }
      push({ type: universal ? 'universal' : 'type', raw: text.slice(start, index) });
      continue;
    }
    fail(`unexpected ${JSON.stringify(char)}`);
  }
  if (current.length === 0 || current[current.length - 1]!.type === 'combinator')
    fail('an empty selector');
  list.push(current);
  return list;
}

/** The selector list after `of` in an `:nth-child()` argument, or `undefined`. */
const ofSelector = (argument: string) => /\bof\s+([\s\S]+)$/i.exec(argument)?.[1];

/**
 * The reasons one complex selector breaks the policy. `requireHooks` holds a
 * compound to carrying a public hook itself; inside `:not()`, `:has()` and
 * `:nth-child(of)` a selector only filters an element its outer compound
 * already selects, so its compounds need none, but they still may use only
 * public hooks.
 */
function complexErrors(
  components: readonly Component[],
  requireHooks: boolean,
  report: (message: string) => void,
) {
  let compound: Component[] = [];
  const close = () => {
    if (compound.length > 0) compoundErrors(compound, requireHooks, report);
    compound = [];
  };
  for (const component of components) {
    if (component.type === 'combinator') close();
    else compound.push(component);
  }
  close();
}

function listErrors(text: string, requireHooks: boolean, report: (message: string) => void) {
  let list: Component[][];
  try {
    list = parseSelectorList(text);
  } catch (error) {
    report((error as Error).message);
    return;
  }
  for (const selector of list) complexErrors(selector, requireHooks, report);
}

function compoundErrors(
  compound: readonly Component[],
  requireHooks: boolean,
  report: (message: string) => void,
) {
  let hooked = false;
  /** A component already reported: the compound is not reported again for lacking a hook. */
  let refused = false;
  let ui: string | undefined;
  let part: string | undefined;
  const sameElement: string[] = [];
  for (const component of compound) {
    switch (component.type) {
      case 'class':
        report(`${component.raw}: a class is not a public selector`);
        refused = true;
        break;
      case 'id':
        report(`${component.raw}: an id is not a public selector`);
        refused = true;
        break;
      case 'type':
        report(`${component.raw}: an element type is not a public selector`);
        refused = true;
        break;
      case 'universal':
        report(`${component.raw}: the universal selector is not a public selector`);
        refused = true;
        break;
      case 'nesting':
        hooked = true;
        break;
      case 'attribute': {
        const { name, value, raw } = component;
        hooked = true;
        if (!name.startsWith('data-'))
          report(`${raw}: an attribute outside data-* is not a public selector`);
        else if (name === 'data-ui') {
          if (value !== undefined && !(value in UI)) report(`${raw} names no family`);
          ui = value;
        } else if (name === 'data-part') part = value;
        else if (!ATTRIBUTES.has(name)) report(`${raw} is not an attribute any family sets`);
        break;
      }
      case 'pseudo-class': {
        const { name, argument, raw } = component;
        if (ROOTS.has(name)) {
          report(`${raw}: a document or scoping root is not a public selector`);
          refused = true;
        } else if (argument === undefined) break;
        else if (SAME_ELEMENT.has(name)) sameElement.push(argument);
        else if (name === 'not' || name === 'has') listErrors(argument, false, report);
        else if (/^nth-(last-)?child$/.test(name)) {
          const of = ofSelector(argument);
          if (of !== undefined) listErrors(of, false, report);
        }
        break;
      }
      default:
        break;
    }
  }
  if (ui !== undefined && part !== undefined && !(UI[ui] ?? []).includes(part))
    report(`[data-part='${part}'] is not a part of ${ui}`);
  // `:is()` and `:where()` match the element itself: a compound with no hook of its own is
  // hooked when every selector in them is.
  for (const argument of sameElement) listErrors(argument, requireHooks && !hooked, report);
  if (requireHooks && !hooked && !refused && sameElement.length === 0) {
    report(
      `${compound.map((component) => component.raw).join('')}: a compound selector without data-ui, data-part or a public attribute matches elements no family owns`,
    );
  }
}

/** The reasons a selector list breaks the policy, each naming the part of the selector at fault. */
export function selectorErrors(selector: string): string[] {
  const errors: string[] = [];
  listErrors(selector, true, (message) => errors.push(message));
  return errors;
}

/** The reason a `var()` reads a property no theme may read, or `undefined`. */
export function tokenReadError(name: string): string | undefined {
  if (name.startsWith('--_')) return `var(${name}) reads a private property of a family`;
  if (name.startsWith('--slotted-') && !TOKENS.has(name)) return `var(${name}) is not a token`;
  return undefined;
}

interface Block {
  /** The selector reported for what the block holds: its own, or the nearest enclosing rule's. */
  readonly selector: string;
  /** `false` inside an at-rule whose block holds no style rule, such as `@keyframes`. */
  readonly styles: boolean;
}

/**
 * Every policy violation in a theme's CSS text: each style rule's selector,
 * nested rules and rules in conditional groups included, and every `var()`
 * the text reads, outside strings and comments. The text is taken to be
 * balanced; `splitTopLevel` refuses one that is not.
 */
export function ruleErrors(css: string): RuleError[] {
  const errors: RuleError[] = [];
  const lineAt = (index: number) => css.slice(0, index).split('\n').length;
  const comments: [number, number][] = [];
  const stack: Block[] = [];
  let start = 0;

  const prelude = (end: number) => {
    let text = '';
    let at = start;
    for (const [from, to] of comments) {
      if (to <= start || from >= end) continue;
      text += `${css.slice(at, Math.max(at, from))} `;
      at = Math.max(at, to);
    }
    text += css.slice(at, end);
    const leading = text.length - text.trimStart().length;
    return { text: text.trim().replace(/\s+/g, ' '), line: lineAt(start + leading) };
  };
  const varReads: { index: number; block: Block | undefined }[] = [];

  scanCssText(css, {
    onComment(from, to) {
      comments.push([from, to]);
    },
    onCodeChar(char, index) {
      if (
        char === '(' &&
        css.slice(index - 3, index).toLowerCase() === 'var' &&
        !isNameChar(css[index - 4] ?? ' ')
      )
        varReads.push({ index, block: stack[stack.length - 1] });
      if (char === '{') {
        const { text, line } = prelude(index);
        const parent = stack[stack.length - 1];
        if (parent && !parent.styles) stack.push(parent);
        else if (text.startsWith('@')) {
          stack.push({ selector: parent?.selector ?? text, styles: !NOT_STYLE.test(text) });
        } else if (text.startsWith('--')) {
          stack.push({ selector: parent?.selector ?? text, styles: false });
        } else {
          for (const message of selectorErrors(text))
            errors.push({ line, selector: text, message });
          stack.push({ selector: text, styles: true });
        }
        start = index + 1;
      } else if (char === '}') {
        stack.pop();
        start = index + 1;
      } else if (char === ';') start = index + 1;
    },
  });

  for (const { index, block } of varReads) {
    const name = /^\(\s*(--[\w-]+)/.exec(css.slice(index))?.[1];
    const message = name === undefined ? undefined : tokenReadError(name);
    if (message !== undefined)
      errors.push({ line: lineAt(index), selector: block?.selector ?? '', message });
  }
  return errors.sort((a, b) => a.line - b.line);
}
