import { LAYER_DEPTH } from './contract.mjs';
import { resolveTokens } from './resolve.mjs';

/**
 * A theme is valid when it states every token the contract declares, on the
 * axis the contract puts it on, and when the values it states obey the two
 * rules the layering exists to enforce: a token never reaches for a deeper
 * layer, and a token that is not a scale root composes its value from another
 * token instead of restating a literal.
 */

const REFERENCE = /var\(\s*(--[a-z0-9-]+)/g;

/** The keywords `forced-colors` may map a token to, plus the two absences. */
const SYSTEM_COLORS = new Set([
  'AccentColor',
  'AccentColorText',
  'ActiveText',
  'ButtonBorder',
  'ButtonFace',
  'ButtonText',
  'Canvas',
  'CanvasText',
  'Field',
  'FieldText',
  'GrayText',
  'Highlight',
  'HighlightText',
  'LinkText',
  'Mark',
  'MarkText',
  'SelectedItem',
  'SelectedItemText',
  'VisitedText',
  'none',
  'transparent',
]);

function namesOn(contract, axis) {
  return (contract.tokens ?? []).filter((token) => token.axis === axis).map((token) => token.name);
}

function reducedMotionNames(contract) {
  return (contract.tokens ?? []).filter((token) => token.reducedMotion).map((token) => token.name);
}

function tokenIndex(contract) {
  return new Map((contract.tokens ?? []).map((token) => [token.name, token]));
}

function asMap(values) {
  return values !== null && typeof values === 'object' && !Array.isArray(values) ? values : {};
}

function checkTokenMap(errors, label, expectedNames, values) {
  const expected = new Set(expectedNames);
  const actual = asMap(values);

  for (const name of expectedNames) {
    if (!(name in actual)) errors.push(`${label} is missing ${name}`);
  }

  for (const name of Object.keys(actual)) {
    if (!expected.has(name)) errors.push(`${label} contains unknown token ${name}`);
  }
}

function checkVariantMaps(errors, label, requiredNames, expectedTokens, values) {
  const required = new Set(requiredNames);
  const actual = asMap(values);

  for (const name of requiredNames) {
    if (!(name in actual)) {
      errors.push(`${label} is missing required variant ${name}`);
      continue;
    }
    checkTokenMap(errors, `${label} ${name}`, expectedTokens, actual[name]);
  }

  for (const name of Object.keys(actual)) {
    if (!required.has(name)) errors.push(`${label} contains unknown variant ${name}`);
  }
}

function references(value) {
  return [...String(value).matchAll(REFERENCE)].map(([, name]) => name);
}

function checkComposition(errors, index, label, values) {
  for (const [name, value] of Object.entries(asMap(values))) {
    const token = index.get(name);
    if (token === undefined) continue;

    const referenced = references(value);
    for (const reference of referenced) {
      const target = index.get(reference);
      if (target === undefined) {
        errors.push(
          `${label} ${name} references ${reference}, which the contract does not declare`,
        );
        continue;
      }
      if (LAYER_DEPTH[target.layer] > LAYER_DEPTH[token.layer]) {
        errors.push(
          `${label} ${name} is ${token.layer} and reaches for ${target.layer} ${reference}`,
        );
      }
    }

    if (!token.root && !token.literal && referenced.length === 0) {
      errors.push(`${label} ${name} states a literal without declaring why`);
    }
  }
}

/** WCAG 2.2 target size, in the unit every geometry value is authored in. */
function pixels(value) {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(String(value).trim());
  return match ? Number(match[1]) : undefined;
}

function checkTargets(errors, theme) {
  const base = asMap(theme.base);
  for (const [density, values] of Object.entries(asMap(theme.densities))) {
    const resolved = resolveTokens({ ...base, ...asMap(values) });
    const minimum = pixels(resolved['--slotted-target-min']);
    if (minimum === undefined) continue;

    for (const [name, value] of Object.entries(resolved)) {
      if (!/^--slotted-control-height-(sm|md|lg)$/.test(name)) continue;
      const height = pixels(value);
      if (height !== undefined && height < minimum) {
        errors.push(`density ${density} ${name} is ${value}, below the ${minimum}px target size`);
      }
    }
  }
}

export function validateContract(contract) {
  const errors = [];
  const seen = new Set();

  for (const token of contract.tokens ?? []) {
    if (seen.has(token.name)) errors.push(`contract declares ${token.name} twice`);
    seen.add(token.name);

    if (!(token.layer in LAYER_DEPTH))
      errors.push(`${token.name} has unknown layer ${token.layer}`);
    if (!(contract.axes ?? []).includes(token.axis)) {
      errors.push(`${token.name} has unknown axis ${token.axis}`);
    }
    if (token.root && token.literal) {
      errors.push(`${token.name} is a scale root, so a literal reason says nothing`);
    }

    if (token.axis === 'scheme') {
      if (token.forcedColor === undefined) {
        errors.push(`${token.name} varies by scheme and declares no forced-colors mapping`);
      } else if (!SYSTEM_COLORS.has(token.forcedColor)) {
        errors.push(`${token.name} maps to ${token.forcedColor}, which is not a system colour`);
      }
    } else if (token.forcedColor !== undefined) {
      errors.push(`${token.name} does not vary by scheme, so forced colours cannot replace it`);
    }
  }

  return errors;
}

export function validateTheme(contract, theme) {
  const errors = validateContract(contract);

  const index = tokenIndex(contract);

  checkTokenMap(errors, 'base', namesOn(contract, 'base'), theme.base);
  checkTokenMap(errors, 'reducedMotion', reducedMotionNames(contract), theme.reducedMotion);

  checkVariantMaps(
    errors,
    'scheme',
    contract.requiredSchemes,
    namesOn(contract, 'scheme'),
    theme.schemes,
  );
  checkVariantMaps(
    errors,
    'density',
    contract.requiredDensities,
    namesOn(contract, 'density'),
    theme.densities,
  );

  checkComposition(errors, index, 'base', theme.base);
  for (const [scheme, values] of Object.entries(asMap(theme.schemes))) {
    checkComposition(errors, index, `scheme ${scheme}`, values);
  }
  for (const [density, values] of Object.entries(asMap(theme.densities))) {
    checkComposition(errors, index, `density ${density}`, values);
  }

  checkTargets(errors, theme);

  return errors;
}

export function assertValidTheme(contract, theme) {
  const errors = validateTheme(contract, theme);
  if (errors.length > 0) {
    throw new Error(`Invalid theme:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
}
