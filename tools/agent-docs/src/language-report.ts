import { compileBlocks } from './render.ts';
import type { FamilyInput } from './types.ts';

/** Typographic punctuation an English example uses; anything else outside printable ASCII is reported. */
const ALLOWED = new Set([
  '…',
  '—',
  '–',
  '’',
  '‘',
  '“',
  '”',
  '·',
  '→',
  '←',
  '↑',
  '↓',
  '×',
  '⌘',
  '⇧',
  '⌥',
]);

export interface LanguageFinding {
  binding: string;
  family: string;
  key: string;
  characters: string;
}

/**
 * A report, never a gate: a name, a locale example or a glyph can be correct and
 * still fall outside the set. It lists where to look; a person decides.
 */
export function nonEnglishSnippets(
  families: readonly Omit<FamilyInput, 'verdicts'>[],
): LanguageFinding[] {
  return families.flatMap((family) =>
    compileBlocks(family).flatMap((block) => {
      const characters = [
        ...new Set(
          [...block.source].filter((char) => !/[\x20-\x7e\n\t]/.test(char) && !ALLOWED.has(char)),
        ),
      ];
      return characters.length === 0
        ? []
        : [
            {
              binding: family.binding,
              family: family.contract.family,
              key: block.key,
              characters: characters.join(''),
            },
          ];
    }),
  );
}
