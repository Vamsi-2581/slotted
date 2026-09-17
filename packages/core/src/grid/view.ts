/**
 * A view: the reader's arrangement of the columns and the query, as one
 * object and one line of text. What a saved view, a bookmark and a
 * `localStorage` entry hold; what `usePersistedGridView` and
 * `persistedGridView` read and write.
 */

import {
  emptyColumnState,
  normalizeColumnState,
  parseColumnState,
  serializeColumnState,
} from './columns';
import { fromGridParams, toGridParams, type GridParamOptions } from './query';
import type { GridColumn, GridColumnState, GridQuery } from './types';

export interface GridView {
  readonly columns: GridColumnState;
  readonly query: GridQuery;
}

export interface GridViewOptions extends GridParamOptions {
  /** The parameter the column state is written under. Default `columns`. */
  columnsParam?: string;
  /** The page size a query with a page but no size takes. */
  defaultPageSize?: number | undefined;
}

/**
 * The query's own parameters, and the column state under `columns` when the
 * reader touched it. A view nobody touched is the empty string, so a store
 * can drop it.
 */
export function serializeGridView(
  view: GridView,
  columns?: readonly GridColumn<never>[],
  options: GridViewOptions = {},
): string {
  const params = toGridParams(view.query, options);
  const state = serializeColumnState(view.columns, columns);
  if (state !== '') params.set(options.columnsParam ?? 'columns', state);
  return params.toString();
}

/**
 * Total: malformed text is the empty view, and the column state is normalised
 * against the model when the model is given, so a column the model no longer
 * has is dropped before it reaches the grid.
 */
export function parseGridView(
  text: string | null | undefined,
  columns?: readonly GridColumn<never>[],
  options: GridViewOptions = {},
): GridView {
  const params = new URLSearchParams(text ?? '');
  const query = fromGridParams(params, options);
  const state = parseColumnState(params.get(options.columnsParam ?? 'columns'));
  return {
    columns: columns ? normalizeColumnState(state, columns) : state,
    query,
  };
}

export function emptyGridView(defaultPageSize?: number): GridView {
  return {
    columns: emptyColumnState(),
    query: fromGridParams('', { defaultPageSize }),
  };
}
