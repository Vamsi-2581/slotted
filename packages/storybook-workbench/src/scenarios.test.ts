import { describe, expect, it } from 'vitest';

import {
  apiMetadataErrors,
  bindScenes,
  scenario,
  scenarioCoverageErrors,
  storyScenarioIds,
} from './scenarios';

describe('workbench scenario metadata', () => {
  it('collects story scenario IDs and reports missing or unknown IDs', () => {
    const stories = {
      default: { title: 'Example' },
      Matrix: { parameters: scenario('matrix') },
      Unexpected: { parameters: scenario('unexpected') },
      utility: () => undefined,
    };

    expect(storyScenarioIds(stories)).toEqual(['matrix', 'unexpected']);
    expect(scenarioCoverageErrors(['matrix', 'themes'], stories)).toEqual([
      'missing themes',
      'unknown unexpected',
    ]);
  });

  it('reports duplicate known story scenario IDs', () => {
    const stories = {
      First: { parameters: scenario('matrix') },
      Second: { parameters: scenario('matrix') },
    };

    expect(scenarioCoverageErrors(['matrix'], stories)).toEqual(['duplicate matrix']);
  });

  it('reports missing API capability rows and incorrect defaults', () => {
    expect(
      apiMetadataErrors(
        { capabilities: ['appearance', 'loading'], defaults: { size: 'md', loading: false } },
        [
          { name: 'variant', defaultValue: 'accent' },
          { name: 'fill', defaultValue: 'solid' },
          { name: 'size', defaultValue: 'lg' },
        ],
      ),
    ).toEqual([
      'missing API loading',
      'default size: expected md, received lg',
      'missing default loading',
    ]);
  });

  /**
   * A form holds one mutable value and it is not text. The pair
   * `docs/state-and-events.md` names for it is `errors` and `defaultErrors`,
   * and a page that documented neither would leave a reader unable to hand a
   * server's answer back.
   */
  it('asks a family that holds an error map for the pair that carries it', () => {
    expect(
      apiMetadataErrors({ capabilities: ['validity'], defaults: {} }, [
        { name: 'errors', defaultValue: '—' },
      ]),
    ).toEqual(['missing API defaultErrors']);

    expect(
      apiMetadataErrors({ capabilities: ['validity'], defaults: {} }, [
        { name: 'errors', defaultValue: '—' },
        { name: 'defaultErrors', defaultValue: '—' },
      ]),
    ).toEqual([]);
  });

  it('asks a family that paints itself for no size step it does not declare', () => {
    expect(
      apiMetadataErrors({ capabilities: ['appearance'], defaults: { variant: 'accent' } }, [
        { name: 'variant', defaultValue: 'accent' },
      ]),
    ).toEqual([]);
  });

  /**
   * An overlay places itself relative to a trigger and calls it `placement`; a
   * field places its label relative to its control and calls it
   * `labelPlacement`, because a field has two things that could be placed. The
   * table cannot know which, so it asks for neither and holds the declared
   * default instead.
   */
  it('asks a family that places something for no name it cannot know', () => {
    expect(
      apiMetadataErrors({ capabilities: ['placement'], defaults: { labelPlacement: 'top' } }, [
        { name: 'labelPlacement', defaultValue: 'top' },
      ]),
    ).toEqual([]);
  });

  /**
   * A chip is removed and names its label `removeLabel`; a tab is dismissed —
   * the APG's own word — and names it `dismissLabel`. The table cannot know
   * which, so it asks for neither and holds the declared default instead.
   */
  it('asks a family whose items go away for no name it cannot know', () => {
    expect(
      apiMetadataErrors({ capabilities: ['removable'], defaults: { dismissible: false } }, [
        { name: 'dismissible', defaultValue: 'false' },
      ]),
    ).toEqual([]);
  });

  /**
   * A control that holds text has one value and one initial value, and the
   * words for them are fixed by `docs/state-and-events.md` rather than chosen
   * by the family — so unlike `selection`, this is a name the table can know.
   */
  it('asks a family that holds a value for both halves of the pair', () => {
    expect(apiMetadataErrors({ capabilities: ['value'], defaults: {} }, [])).toEqual([
      'missing API value',
      'missing API defaultValue',
    ]);
  });

  it('reports duplicate API rows before checking capability rows or defaults', () => {
    expect(
      apiMetadataErrors({ capabilities: ['appearance'], defaults: { variant: 'accent' } }, [
        { name: 'variant', defaultValue: 'accent' },
        { name: 'variant', defaultValue: 'secondary' },
        { name: 'fill', defaultValue: 'solid' },
        { name: 'size', defaultValue: 'md' },
      ]),
    ).toEqual(['duplicate API variant']);
  });
});

/**
 * The table below `capabilityApi` guesses a prop name from a capability, and
 * the guess is wrong for every family that holds two of the same kind of value
 * or calls its own by another name. Pagination holds a page and a page size,
 * and neither is `value`; its current page is `page` and a stepper's is `step`.
 *
 * The contract already names both sides of every mutable capability, in its
 * `stateModel`. Passing it makes the contract the authority and leaves the
 * table as the fallback for a family that declares no model.
 */
describe('a state model the contract declares', () => {
  const model = {
    current: { controlled: 'page', uncontrolled: 'defaultPage' },
    value: { controlled: 'pageSize', uncontrolled: 'defaultPageSize' },
  };

  it('asks for the names the family actually ships', () => {
    expect(
      apiMetadataErrors({ capabilities: ['current', 'value'], defaults: {} }, [], model),
    ).toEqual([
      'missing API page',
      'missing API defaultPage',
      'missing API pageSize',
      'missing API defaultPageSize',
    ]);
  });

  it('accepts a page that documents them', () => {
    expect(
      apiMetadataErrors(
        { capabilities: ['current', 'value'], defaults: {} },
        [
          { name: 'page', defaultValue: '—' },
          { name: 'defaultPage', defaultValue: '1' },
          { name: 'pageSize', defaultValue: '—' },
          { name: 'defaultPageSize', defaultValue: '20' },
        ],
        model,
      ),
    ).toEqual([]);
  });

  it('falls back to the table for a capability the model does not name', () => {
    expect(
      apiMetadataErrors({ capabilities: ['current', 'loading'], defaults: {} }, [], model),
    ).toEqual(['missing API page', 'missing API defaultPage', 'missing API loading']);
  });

  it('leaves a family with no model reading the table, as before', () => {
    expect(apiMetadataErrors({ capabilities: ['current'], defaults: {} }, [])).toEqual([
      'missing API current',
    ]);
  });
});

/**
 * The table binding a docs scene to its story was hand-written, and a scene
 * added without a line in it took a whole reference page down with
 * `Scene "formatOn" is bound to no story` — after every test passed, because
 * nothing but rendering the page ever called the binder.
 */
describe('bindScenes', () => {
  const scene = (id: string) => ({ id, title: id, note: id, snippet: null });

  it('binds a scene through the table it was given', () => {
    const Sizes = { parameters: scenario('sizes') };
    expect(bindScenes([scene('sizes')], { sizes: Sizes })[0]?.of).toBe(Sizes);
  });

  it('binds a scene the table forgot, through the scenario the story declares', () => {
    const FormatOn = { parameters: scenario('formatOn') };
    expect(bindScenes([scene('formatOn')], { FormatOn })[0]?.of).toBe(FormatOn);
  });

  it('lets the table win where it answers, so a deliberate pairing stands', () => {
    const Chosen = { parameters: scenario('sizes') };
    const Declared = { parameters: scenario('sizes') };
    expect(bindScenes([scene('sizes')], { sizes: Chosen, Declared })[0]?.of).toBe(Chosen);
  });

  it('still refuses a scene nothing renders', () => {
    expect(() => bindScenes([scene('missing')], {})).toThrow(/bound to no story/);
  });
});
