const REFERENCE = /var\(\s*(--[a-z0-9-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/i;

/**
 * Expands `var()` references a token map makes to itself.
 *
 * The theme is authored with scale steps referenced by the tokens that
 * predate them, so the file no longer states what a token resolves to. This
 * puts that back, so a test can hold the emitted values to the ones the
 * library shipped before the scales existed.
 *
 * It is not a CSS engine: it resolves within one map, which is what the
 * theme's own blocks are.
 */
export function resolveTokens(values) {
  const resolved = { ...values };

  for (const name of Object.keys(resolved)) {
    resolved[name] = resolveValue(values, values[name], name, new Set([name]));
  }

  return resolved;
}

function resolveValue(values, value, name, path) {
  while (REFERENCE.test(value)) {
    value = value.replace(REFERENCE, (whole, reference, fallback) => {
      if (reference in values) {
        if (path.has(reference)) throw new Error(`Reference cycle at ${reference}`);
        return resolveValue(values, values[reference], name, new Set([...path, reference]));
      }
      if (fallback !== undefined) return fallback.trim();
      throw new Error(`${name} references ${reference}, which the map does not hold`);
    });
  }

  return value;
}
