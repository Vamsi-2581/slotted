import { createContext, useContext } from 'react';

import type { TagsInputDefaults, TagsInputDefaultsProviderProps } from './tags-input.types';

/**
 * The numbers, and why they are these numbers.
 *
 * `invalidValues` is `keep`. It is the reason the family exists beside
 * `multi-select`: a recipients field that silently drops `jhon.company` has
 * told the reader John was invited. `refuse` is for a filter operand, where a
 * bad value has nowhere to go.
 *
 * `pendingOnBlur` is `commit`: a reader who typed an address and pressed the
 * submit button meant it. `keep` is the filter operand's answer and `discard`
 * a chat box's, and both are one word away.
 *
 * `delimiters` is the comma alone — the one separator every surveyed
 * implementation ships, and a space would make a two-word value impossible
 * to type. Line breaks split a paste whatever this says.
 *
 * `max` is `null`. A limit is a rule about the consumer's data, and a family
 * that invented one would refuse a value for a reason nobody wrote.
 *
 * The sentences are terse on purpose and mostly numbers: `{label}, {count}`
 * reads the same in every language a screen reader speaks, and the words in
 * them are the ones an application translates once, here.
 */
export const TAGS_INPUT_FALLBACK: TagsInputDefaults = {
  addedLabel: '{label} added, {count}',
  addOnPaste: true,
  allowDuplicates: false,
  clearable: true,
  clearLabel: 'Clear',
  copiedLabel: '{count} copied',
  countLabel: '{count} values',
  counterLabel: '{count} of {max}',
  delimiters: [','],
  disabled: false,
  duplicateLabel: '{label} is already in the list',
  editable: false,
  editHintLabel: 'Press Enter to edit a value.',
  fullWidth: true,
  hintLabel: 'Press Delete to remove a value.',
  invalid: false,
  invalidLabel: 'Not a valid value',
  invalidValues: 'keep',
  max: null,
  overflow: 'wrap',
  pendingOnBlur: 'commit',
  readOnly: false,
  removedLabel: '{label} removed, {count}',
  removeLabel: 'Remove {label}',
  reorderable: false,
  reorderLabel: '{label}, position {position} of {count}',
  required: false,
  size: 'md',
  variant: 'outline',
};

const TagsInputDefaultsContext = createContext<TagsInputDefaults>(TAGS_INPUT_FALLBACK);

/** The defaults in force here. The family reads it; a consumer rarely needs to. */
export function useTagsInputDefaults(): TagsInputDefaults {
  return useContext(TagsInputDefaultsContext);
}

/**
 * The decisions an application takes once, in its bootstrap, rather than on
 * every control it renders — including the sentences the family speaks, which
 * is where an application translates them.
 */
export function TagsInputDefaultsProvider({
  children,
  ...overrides
}: TagsInputDefaultsProviderProps) {
  const inherited = useTagsInputDefaults();

  const value = { ...inherited };
  for (const key of Object.keys(inherited) as (keyof TagsInputDefaults)[]) {
    const override = overrides[key];
    if (override !== undefined) (value as Record<string, unknown>)[key] = override;
  }

  return (
    <TagsInputDefaultsContext.Provider value={value}>{children}</TagsInputDefaultsContext.Provider>
  );
}
