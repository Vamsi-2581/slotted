import assert from 'node:assert/strict';
import test from 'node:test';

import { validateTheme } from '../src/validate-theme.mjs';

const contract = {
  base: ['--base'],
  scheme: ['--scheme'],
  density: ['--density'],
  requiredSchemes: ['light', 'dark'],
  requiredDensities: ['comfortable', 'compact'],
};

const validTheme = {
  name: 'test',
  base: { '--base': '1px' },
  schemes: {
    light: { '--scheme': '#fff' },
    dark: { '--scheme': '#000' },
  },
  densities: {
    comfortable: { '--density': '2rem' },
    compact: { '--density': '1.5rem' },
  },
};

test('accepts a complete theme', () => {
  assert.deepEqual(validateTheme(contract, validTheme), []);
});

test('reports missing tokens with their scope', () => {
  const invalid = structuredClone(validTheme);
  delete invalid.schemes.dark['--scheme'];
  assert.deepEqual(validateTheme(contract, invalid), ['scheme dark is missing --scheme']);
});

test('reports unknown tokens', () => {
  const invalid = structuredClone(validTheme);
  invalid.base['--unknown'] = 'value';
  assert.deepEqual(validateTheme(contract, invalid), ['base contains unknown token --unknown']);
});

test('reports an unknown scheme variant', () => {
  const invalid = structuredClone(validTheme);
  invalid.schemes.typo = { '--scheme': '#f0f' };
  assert.deepEqual(validateTheme(contract, invalid), ['scheme contains unknown variant typo']);
});

test('reports an unknown density variant', () => {
  const invalid = structuredClone(validTheme);
  invalid.densities.typo = { '--density': '1rem' };
  assert.deepEqual(validateTheme(contract, invalid), ['density contains unknown variant typo']);
});

test('reports a missing required scheme variant', () => {
  const invalid = structuredClone(validTheme);
  delete invalid.schemes.dark;
  assert.deepEqual(validateTheme(contract, invalid), ['scheme is missing required variant dark']);
});

test('reports a missing required density variant', () => {
  const invalid = structuredClone(validTheme);
  delete invalid.densities.compact;
  assert.deepEqual(validateTheme(contract, invalid), [
    'density is missing required variant compact',
  ]);
});

const malformedVariantContainers = [
  { name: 'absent' },
  { name: 'undefined', value: undefined },
  { name: 'null', value: null },
  { name: 'string', value: 'bad' },
  { name: 'number', value: 42 },
  { name: 'array', value: ['unexpected'] },
];

function testMalformedTokenMaps(label, createInvalid, expected) {
  test(`normalizes malformed ${label} maps to missing tokens`, async (t) => {
    for (const { name, value } of malformedVariantContainers) {
      await t.test(name, () => {
        assert.deepEqual(validateTheme(contract, createInvalid(name, value)), expected);
      });
    }
  });
}

test('normalizes malformed scheme containers to ordered missing variants', async (t) => {
  for (const { name, value } of malformedVariantContainers) {
    await t.test(name, () => {
      const invalid = structuredClone(validTheme);
      if (name === 'absent') delete invalid.schemes;
      else invalid.schemes = value;

      assert.deepEqual(validateTheme(contract, invalid), [
        'scheme is missing required variant light',
        'scheme is missing required variant dark',
      ]);
    });
  }
});

test('normalizes malformed density containers to ordered missing variants', async (t) => {
  for (const { name, value } of malformedVariantContainers) {
    await t.test(name, () => {
      const invalid = structuredClone(validTheme);
      if (name === 'absent') delete invalid.densities;
      else invalid.densities = value;

      assert.deepEqual(validateTheme(contract, invalid), [
        'density is missing required variant comfortable',
        'density is missing required variant compact',
      ]);
    });
  }
});

testMalformedTokenMaps(
  'base',
  (name, value) => {
    const invalid = structuredClone(validTheme);
    if (name === 'absent') delete invalid.base;
    else invalid.base = value;
    return invalid;
  },
  ['base is missing --base'],
);

testMalformedTokenMaps(
  'scheme light',
  (name, value) => {
    const invalid = structuredClone(validTheme);
    invalid.schemes.light = value;
    return invalid;
  },
  ['scheme light is missing --scheme'],
);

testMalformedTokenMaps(
  'density comfortable',
  (name, value) => {
    const invalid = structuredClone(validTheme);
    invalid.densities.comfortable = value;
    return invalid;
  },
  ['density comfortable is missing --density'],
);

const reducedMotionContract = {
  base: [],
  scheme: [],
  density: [],
  reducedMotion: ['--slotted-duration-short'],
  requiredSchemes: [],
  requiredDensities: [],
};

test('normalizes malformed reduced-motion maps to missing tokens', async (t) => {
  for (const { name, value } of malformedVariantContainers) {
    await t.test(name, () => {
      const theme = { base: {}, schemes: {}, densities: {} };
      if (name !== 'absent') theme.reducedMotion = value;
      assert.deepEqual(validateTheme(reducedMotionContract, theme), [
        'reducedMotion is missing --slotted-duration-short',
      ]);
    });
  }
});

test('reports a reduced-motion token the theme does not hold', () => {
  const contract = {
    base: [],
    scheme: [],
    density: [],
    reducedMotion: ['--slotted-duration-short'],
    requiredSchemes: [],
    requiredDensities: [],
  };
  const errors = validateTheme(contract, {
    base: {},
    schemes: {},
    densities: {},
    reducedMotion: {},
  });
  assert.deepEqual(errors, ['reducedMotion is missing --slotted-duration-short']);
});

test('reports a reduced-motion token outside the contract', () => {
  const contract = {
    base: [],
    scheme: [],
    density: [],
    reducedMotion: ['--slotted-duration-short'],
    requiredSchemes: [],
    requiredDensities: [],
  };
  const errors = validateTheme(contract, {
    base: {},
    schemes: {},
    densities: {},
    reducedMotion: {
      '--slotted-duration-short': '1ms',
      '--slotted-duration-long': '1ms',
    },
  });
  assert.deepEqual(errors, ['reducedMotion contains unknown token --slotted-duration-long']);
});
