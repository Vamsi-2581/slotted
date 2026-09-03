import { apiMetadataErrors, scenarioCoverageErrors } from '@slotted/storybook-workbench';
import { referencePageErrors, snippetFormatErrors } from '@slotted/storybook-workbench/testing';
import { describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/text-field/contract.json';
import { REACT_TEXT_FIELD_DOCS } from './text-field.docs';
import * as textFieldStories from './text-field.stories';

describe('TextField stories', () => {
  it('covers every required scenario', () => {
    expect(scenarioCoverageErrors(contract.scenarios.textField, textFieldStories)).toEqual([]);
  });

  it('documents each public component API', () => {
    for (const member of Object.keys(contract.members) as Array<
      keyof typeof REACT_TEXT_FIELD_DOCS
    >) {
      expect(
        apiMetadataErrors(contract.members[member], REACT_TEXT_FIELD_DOCS[member].api),
      ).toEqual([]);
    }
  });

  /**
   * The family holds two mutable values, so the page owes an event table as
   * well as the import, the anatomy and one captioned demonstration per
   * scenario with the code that produced it.
   */
  it('answers the reference-page contract', () => {
    expect(
      referencePageErrors({
        docs: REACT_TEXT_FIELD_DOCS.textField,
        framework: 'React',
        member: contract.members.textField,
        scenarioIds: contract.scenarios.textField,
        stateModel: contract.stateModel,
      }),
    ).toEqual([]);
  });

  it('keeps curated snippets formatted', async () => {
    const snippets = Object.values(REACT_TEXT_FIELD_DOCS).flatMap((docs) => [
      ...docs.snippets,
      ...docs.scenes.map((scene) => scene.snippet),
    ]);
    expect(await snippetFormatErrors(snippets)).toEqual([]);
  });
});
