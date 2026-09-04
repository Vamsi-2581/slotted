import '@slotted/styles/description-list/description-list.css';
import '@slotted/styles/visually-hidden/visually-hidden.css';

import { createContext, useContext, type CSSProperties } from 'react';

import {
  DEFAULT_DESCRIPTION_LIST_LABELS,
  resolveLabels,
  useDescriptionListDefaults,
} from './description-list-defaults';
import type {
  DescriptionListContextValue,
  DescriptionListItemContextValue,
  DescriptionListLabels,
  DescriptionListResolvedLabels,
  DescriptionListProps,
  DescriptionListRootProps,
} from './description-list.types';

/**
 * Every label, after the list's own prop and the provider have had their say.
 * It is written out rather than spread, because a spread of a partial object
 * types every label as possibly absent and the components would then have to
 * answer for a default they were handed.
 */
function answer(labels: DescriptionListLabels): DescriptionListResolvedLabels {
  return {
    collapse: labels.collapse ?? DEFAULT_DESCRIPTION_LIST_LABELS.collapse,
    copied: labels.copied ?? DEFAULT_DESCRIPTION_LIST_LABELS.copied,
    copy: labels.copy ?? DEFAULT_DESCRIPTION_LIST_LABELS.copy,
    placeholder: labels.placeholder ?? DEFAULT_DESCRIPTION_LIST_LABELS.placeholder,
    reveal: labels.reveal ?? DEFAULT_DESCRIPTION_LIST_LABELS.reveal,
  };
}

const DescriptionListContext = createContext<DescriptionListContextValue | undefined>(undefined);
const DescriptionListItemContext = createContext<DescriptionListItemContextValue | undefined>(
  undefined,
);

/**
 * What the list around this part decided. A part outside a list has no
 * arrangement to answer and no labels to read, so this throws rather than
 * rendering markup that looks right and behaves like nothing.
 */
export function useDescriptionList(): DescriptionListContextValue {
  const context = useContext(DescriptionListContext);
  if (context === undefined) {
    throw new Error('Description list parts must be rendered inside a DescriptionList.');
  }
  return context;
}

/** The pair around this part, when there is one. */
export function useDescriptionListItem(): DescriptionListItemContextValue | undefined {
  return useContext(DescriptionListItemContext);
}

export const DescriptionListItemProvider = DescriptionListItemContext.Provider;

/**
 * Pairs of a term and its description, read rather than edited.
 *
 * **The semantics are the platform's.** `dl`, `dt` and `dd` already carry
 * `list`, `term` and `definition`, so the family writes no role: MDN records
 * that authoring the ARIA `term` and `definition` roles by hand changes how
 * VoiceOver announces the construct. The `div` around each pair is the form the
 * HTML Standard permits, and it is what makes a pair one grid area.
 *
 * **The `dl` is fixed, and the wrapper around it is why.** An element with
 * `container-type: inline-size` is a query container for its descendants and
 * not for itself, and what the container query changes here is the grid. So the
 * root is the container and the `dl` is the grid; substituting the `dl` would
 * take away the element every semantic in this family rests on, and it has no
 * option of its own to be worth the risk. Native props, the ref and `render`
 * reach the root.
 *
 * **It answers its own width, not the viewport's.** The same list sits in a
 * three-hundred-pixel drawer and in a page, on one screen.
 */
export function DescriptionList({
  children,
  columns,
  labels,
  layout,
  render,
  style,
  termWidth,
  variant,
  ...nativeProps
}: DescriptionListProps) {
  const defaults = useDescriptionListDefaults();

  const context: DescriptionListContextValue = {
    columns: columns ?? defaults.columns ?? 1,
    labels: answer(resolveLabels(defaults.labels, labels)),
    layout: layout ?? defaults.layout ?? 'row',
    variant: variant ?? defaults.variant ?? 'plain',
  };

  const width = termWidth ?? defaults.termWidth;

  const rootProps: DescriptionListRootProps = {
    ...nativeProps,
    children: <dl data-part="list">{children}</dl>,
    'data-columns': String(context.columns),
    'data-layout': context.layout,
    'data-part': 'root',
    'data-ui': 'description-list',
    'data-variant': context.variant,
    /* A length only the consumer knows, handed to the stylesheet under the
       name that says so. It is a runtime value rather than a design token,
       which is the same route `skeleton` takes for its geometry. */
    style:
      width === undefined
        ? style
        : ({ ...style, '--slotted-description-list-term-width': width } as CSSProperties),
  };

  return (
    <DescriptionListContext.Provider value={context}>
      {render === undefined ? <div {...rootProps} /> : render(rootProps)}
    </DescriptionListContext.Provider>
  );
}
