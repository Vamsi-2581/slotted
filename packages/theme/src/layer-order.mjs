/**
 * `slotted` is the only top-level layer. An application orders the whole
 * library against its own CSS with one line — `@layer slotted, app;` — and
 * never has to learn a sublayer name.
 *
 * `reset` and `tokens` hold no rule today. They are declared because a layer
 * takes its position from the first mention of its name: reserving a name now
 * costs a string, inserting one later would reorder what already shipped.
 */
export const LAYER_NAMES = ['reset', 'tokens', 'theme', 'components'];

export const LAYER_ORDER_STATEMENT = `@layer ${LAYER_NAMES.map((name) => `slotted.${name}`).join(', ')};\n`;
