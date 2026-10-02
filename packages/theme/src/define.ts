import { parseSeed, toHex, type Oklch } from './color';
import {
  COMPONENT_TOKENS,
  contract,
  type BaseToken,
  type ComponentToken,
  type DensityToken,
  type MotionToken,
  type SchemeToken,
} from './generated/contract';
import {
  evaluateRecipe,
  SCHEMES,
  SEED_NAMES,
  type Recipe,
  type Scheme,
  type SeedName,
} from './recipe';
import { hasUnsafeStructuralChar, validateTheme, type FlatTheme } from './validate';

export const DENSITIES = ['comfortable', 'compact', 'dense'] as const;
export type Density = (typeof DENSITIES)[number];

type Values<T extends string> = Readonly<Partial<Record<T, string>>>;

export interface FontFaceDefinition {
  readonly family: string;
  /** A CSS `src` value, written as it would be in `@font-face`. */
  readonly src: string;
  readonly weight?: string;
  readonly style?: string;
  readonly display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface ThemeDefinition {
  readonly name: string;
  readonly seeds: Readonly<Record<SeedName, string>>;
  readonly recipe: Recipe;
  readonly base?: Values<BaseToken>;
  readonly schemes?: Readonly<Partial<Record<Scheme, Values<SchemeToken>>>>;
  readonly densities?: Readonly<Partial<Record<Density, Values<DensityToken>>>>;
  readonly reducedMotion?: Values<MotionToken>;
  readonly components?: Values<ComponentToken>;
  readonly fonts?: readonly FontFaceDefinition[];
  /** CSS text, or the URL of a `.css` file the CLI reads at build time. */
  readonly rules?: readonly (string | URL)[];
}

export interface Theme extends ThemeDefinition {
  readonly kind: 'slotted-theme';
}

export type ThemeOverrides = Omit<Partial<ThemeDefinition>, 'name' | 'seeds'> & {
  readonly seeds?: Readonly<Partial<Record<SeedName, string>>>;
};

const NAME = /^[a-z][a-z0-9-]*$/;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !(value instanceof URL) && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function parsedSeeds(seeds: ThemeDefinition['seeds']): Record<SeedName, Oklch> {
  return Object.fromEntries(SEED_NAMES.map((name) => [name, parseSeed(seeds[name])!])) as Record<
    SeedName,
    Oklch
  >;
}

/**
 * The theme as the contract reads it: every scheme with the recipe evaluated —
 * an alias as its `var()`, every other derivation as the hex it computes to
 * with the theme's own seeds — and the theme's scheme values laid over it.
 */
export function flattenTheme(theme: ThemeDefinition): FlatTheme {
  const seeds = parsedSeeds(theme.seeds);
  const schemes = Object.fromEntries(
    SCHEMES.map((scheme) => {
      const derived = evaluateRecipe(theme.recipe, seeds, scheme);
      const values: Record<string, string> = {};
      for (const [name, rule] of Object.entries(theme.recipe[scheme])) {
        values[name] = 'alias' in rule ? `var(${rule.alias})` : toHex(derived[name]!);
      }
      return [scheme, { ...values, ...(theme.schemes?.[scheme] ?? {}) }];
    }),
  );
  return {
    name: theme.name,
    base: { ...(theme.base ?? {}) },
    schemes,
    densities: Object.fromEntries(
      Object.entries(theme.densities ?? {}).map(([density, values]) => [density, { ...values }]),
    ),
    reducedMotion: { ...(theme.reducedMotion ?? {}) },
  };
}

export function defineTheme(definition: ThemeDefinition): Theme {
  const errors: string[] = [];
  if (!NAME.test(definition.name)) {
    errors.push(`name ${JSON.stringify(definition.name)} is not [a-z][a-z0-9-]*`);
  }
  for (const seed of SEED_NAMES) {
    const value = definition.seeds?.[seed];
    if (typeof value !== 'string' || parseSeed(value) === null) {
      errors.push(`seed ${seed} ${JSON.stringify(value)} is neither #rrggbb nor oklch(L C H)`);
    }
  }
  const components = new Set<string>(COMPONENT_TOKENS);
  for (const [name, value] of Object.entries(definition.components ?? {})) {
    if (!components.has(name)) errors.push(`components contains ${name}, which no family reads`);
    if (hasUnsafeStructuralChar(value as string)) {
      errors.push(
        `components ${name} is ${JSON.stringify(value)}, which contains an unquoted ;, { or }, or leaves a string, a comment or an escape open`,
      );
    }
  }
  const schemeTokens = new Set(
    contract.tokens.filter((token) => token.axis === 'scheme').map((token) => token.name),
  );
  for (const scheme of SCHEMES) {
    for (const name of Object.keys(definition.recipe?.[scheme] ?? {})) {
      if (!schemeTokens.has(name))
        errors.push(`recipe ${scheme} derives ${name}, which no scheme carries`);
    }
  }
  for (const rule of definition.rules ?? []) {
    if (typeof rule !== 'string' && !(rule instanceof URL))
      errors.push('a rule is neither CSS text nor a URL');
  }
  // `family` is written through `JSON.stringify` and stays a quoted CSS string whatever
  // it contains; the other fields are interpolated into `@font-face` verbatim.
  for (const [index, font] of (definition.fonts ?? []).entries()) {
    for (const field of ['src', 'weight', 'style', 'display'] as const) {
      const value = font[field];
      if (value !== undefined && hasUnsafeStructuralChar(value)) {
        errors.push(
          `fonts[${index}].${field} is ${JSON.stringify(value)}, which contains an unquoted ;, { or }, or leaves a string, a comment or an escape open`,
        );
      }
    }
  }
  if (errors.length === 0) {
    try {
      errors.push(...validateTheme(contract, flattenTheme(definition)));
    } catch (error) {
      errors.push((error as Error).message);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Invalid theme ${definition.name}:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
  }
  const { kind: _kind, ...plain } = definition as ThemeDefinition & { kind?: string };
  return deepFreeze({ ...plain, kind: 'slotted-theme' as const });
}

function mergeNested<K extends string, V extends object>(
  base: Readonly<Partial<Record<K, V>>> | undefined,
  overrides: Readonly<Partial<Record<K, V>>> | undefined,
): Partial<Record<K, V>> {
  const merged: Partial<Record<K, V>> = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(overrides ?? {}) as [K, V][]) {
    merged[key] = { ...(merged[key] ?? {}), ...value } as V;
  }
  return merged;
}

/**
 * A theme built on another: `base`, `reducedMotion` and `components` merged
 * key by key; `schemes` and `densities` merged per scheme/density; `seeds`
 * merged per seed name; `recipe` replaced whole when `overrides` carries one;
 * `fonts` and `rules` appended after `base`'s own.
 */
export function extendTheme(
  base: Theme,
  overrides: ThemeOverrides,
  options: { readonly name: string },
): Theme {
  const { kind: _kind, ...parent } = base;
  return defineTheme({
    ...parent,
    name: options.name,
    seeds: { ...parent.seeds, ...(overrides.seeds ?? {}) },
    recipe: overrides.recipe ?? parent.recipe,
    base: { ...(parent.base ?? {}), ...(overrides.base ?? {}) },
    schemes: mergeNested(parent.schemes, overrides.schemes),
    densities: mergeNested(parent.densities, overrides.densities),
    reducedMotion: { ...(parent.reducedMotion ?? {}), ...(overrides.reducedMotion ?? {}) },
    components: { ...(parent.components ?? {}), ...(overrides.components ?? {}) },
    fonts: [...(parent.fonts ?? []), ...(overrides.fonts ?? [])],
    rules: [...(parent.rules ?? []), ...(overrides.rules ?? [])],
  });
}
