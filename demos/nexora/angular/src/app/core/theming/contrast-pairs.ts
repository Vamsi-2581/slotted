/**
 * The pairs the contrast table reads, as data: the table draws its rows from
 * them while `contrast-reading.ts`, which needs the theme definitions, is
 * still loading.
 */
export const CONTRAST_PAIRS = [
  {
    id: 'text',
    label: 'Muted text',
    fore: '--slotted-text-muted',
    ground: '--slotted-surface',
    text: true,
  },
  {
    id: 'accent-text',
    label: 'Accent text',
    fore: '--slotted-tone-accent-text',
    ground: '--slotted-surface',
    text: true,
  },
  {
    id: 'accent-border',
    label: 'Accent border',
    fore: '--slotted-tone-accent-border',
    ground: '--slotted-surface',
    text: false,
  },
  {
    id: 'on-solid',
    label: 'Text on solid',
    fore: '--slotted-tone-accent-on-solid',
    ground: '--slotted-tone-accent-solid',
    text: true,
  },
] as const;

export type ContrastPairId = (typeof CONTRAST_PAIRS)[number]['id'];
