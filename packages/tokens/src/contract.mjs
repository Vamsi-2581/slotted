import { readFileSync } from 'node:fs';

/**
 * The contract is one list of tokens carrying two independent facts about each
 * one: the **layer** it belongs to, which says what may reference it, and the
 * **axis** it varies on, which says which CSS block emits it. Grouping by axis
 * alone — the shape this file replaced — made the layer invisible, so nothing
 * stopped a component token from being written beside a primitive.
 */
export const contract = JSON.parse(
  readFileSync(new URL('./contract.json', import.meta.url), 'utf8'),
);

/** A token may reference its own layer or a shallower one, never a deeper one. */
export const LAYER_DEPTH = { primitive: 0, semantic: 1, component: 2 };

export const TOKENS_BY_NAME = new Map(contract.tokens.map((token) => [token.name, token]));

export function tokensOn(axis) {
  return contract.tokens.filter((token) => token.axis === axis);
}

export function tokenNames(axis) {
  return tokensOn(axis).map((token) => token.name);
}

export function tokensIn(layer) {
  return contract.tokens.filter((token) => token.layer === layer);
}

export function reducedMotionNames() {
  return contract.tokens.filter((token) => token.reducedMotion).map((token) => token.name);
}

export function forcedColorMap() {
  return Object.fromEntries(
    contract.tokens
      .filter((token) => token.forcedColor)
      .map((token) => [token.name, token.forcedColor]),
  );
}
