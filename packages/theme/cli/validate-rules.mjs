import { transform } from 'lightningcss';

import { ruleErrors } from '../dist/index.js';

const at = (filename, loc) => `${filename}:${(loc?.line ?? 0) + 1}:${loc?.column ?? 0}`;

/**
 * The errors of one file of theme rules, each naming the file, the line and
 * the selector of the rule at fault. lightningcss reads the text first, so a
 * syntax error is reported with its column; what a rule may select and read
 * is `ruleErrors`, the check `defineTheme` runs on every rule at runtime.
 */
export function validateRules(css, filename) {
  try {
    transform({ filename, code: Buffer.from(css), errorRecovery: false });
  } catch (error) {
    return [`${at(filename, error.loc)} ${error.message}`];
  }
  return ruleErrors(css).map(
    ({ line, selector, message }) => `${filename}:${line} ${selector}: ${message}`,
  );
}
