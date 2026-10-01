/**
 * Splits CSS into its top-level statements: a block ends at the brace that
 * returns to depth 0, an at-statement at the semicolon. Strings and comments
 * are skipped, so a brace inside `content: "}"` does not end a rule.
 */
export function splitTopLevel(css: string): string[] {
  const statements: string[] = [];
  let depth = 0;
  let start = 0;
  let quote: string | null = null;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index]!;
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2);
      const stop = end === -1 ? css.length : end + 2;
      if (depth === 0) {
        statements.push(css.slice(start, index));
        start = stop;
      }
      index = stop - 1;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        statements.push(css.slice(start, index + 1));
        start = index + 1;
      }
    } else if (char === ';' && depth === 0) {
      statements.push(css.slice(start, index + 1));
      start = index + 1;
    }
  }
  statements.push(css.slice(start));
  return statements.map((statement) => statement.trim()).filter(Boolean);
}

const REFUSED = /^@(import|layer|scope)\b/i;
const HOISTED = /^@(font-face|property)\b/i;
const KEYFRAMES = /^@keyframes\s+([\w-]+)/i;

/**
 * The rules of one theme, ready for the compiler: `@keyframes`, `@font-face`
 * and `@property` leave the scope they cannot live in, and every keyframes
 * name takes the theme's prefix so two themes on one page never collide.
 */
export function processRules(
  themeName: string,
  sources: readonly string[],
): { hoisted: string[]; body: string } {
  const statements = sources.flatMap(splitTopLevel);
  const names = new Map<string, string>();
  for (const statement of statements) {
    const match = KEYFRAMES.exec(statement);
    if (match) names.set(match[1]!, `slotted-${themeName}-${match[1]}`);
  }
  const rename = (statement: string) =>
    statement.replace(
      /(animation(?:-name)?\s*:\s*)([^;}]*)/g,
      (_whole, property: string, value: string) =>
        property + value.replace(/[\w-]+/g, (word) => names.get(word) ?? word),
    );

  const hoisted: string[] = [];
  const body: string[] = [];
  for (const statement of statements) {
    const refused = REFUSED.exec(statement);
    if (refused) {
      throw new Error(
        `${themeName}: @${refused[1]} is written by the compiler; a theme rule cannot carry its own`,
      );
    }
    const keyframes = KEYFRAMES.exec(statement);
    if (keyframes)
      hoisted.push(statement.replace(KEYFRAMES, `@keyframes ${names.get(keyframes[1]!)}`));
    else if (HOISTED.test(statement)) hoisted.push(statement);
    else body.push(rename(statement));
  }
  return { hoisted, body: body.join('\n\n') };
}
