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

export function validateTheme(contract, theme) {
  const errors = [];
  checkTokenMap(errors, 'base', contract.base, theme.base);
  checkTokenMap(errors, 'reducedMotion', contract.reducedMotion ?? [], theme.reducedMotion);

  checkVariantMaps(errors, 'scheme', contract.requiredSchemes, contract.scheme, theme.schemes);
  checkVariantMaps(
    errors,
    'density',
    contract.requiredDensities,
    contract.density,
    theme.densities,
  );

  return errors;
}

export function assertValidTheme(contract, theme) {
  const errors = validateTheme(contract, theme);
  if (errors.length > 0) {
    throw new Error(`Invalid theme:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
}
