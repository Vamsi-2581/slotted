import type { HTMLAttributes } from 'react';

import type { ToolbarGroupProps, ToolbarSeparatorProps, ToolbarSpacerProps } from './toolbar.types';

/**
 * A run of related controls, announced as a group.
 *
 * The distance inside it is half the bar's gap and the distance around it is a
 * gap and a half, so the boundary between two groups reads wider than the
 * boundary between two controls — which is what keeps a destructive action off a
 * frequent one. Its accessible name is the consumer's own `aria-label`: only the
 * page knows what the run is for.
 *
 * The arrows do not stop at its edge. A group is a label around a run, not a
 * second keyboard: the item list stays linear, which is what the APG's own
 * multi-row bullet needs.
 */
export function ToolbarGroup({ children, ref, render, ...nativeProps }: ToolbarGroupProps) {
  const rootProps: HTMLAttributes<HTMLElement> & { 'data-part': string; role: 'group' } = {
    ...nativeProps,
    children,
    'data-part': 'group',
    role: 'group',
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * A hairline between two runs.
 *
 * It is a part of this family rather than a `divider`, because its geometry
 * belongs to the bar: it is measured against the controls beside it, and it
 * turns with the bar. `aria-orientation` states the axis of the rule itself,
 * which is perpendicular to the one the controls run along.
 */
export function ToolbarSeparator({ ref, render, ...nativeProps }: ToolbarSeparatorProps) {
  const rootProps: HTMLAttributes<HTMLElement> & { 'data-part': string; role: 'separator' } = {
    ...nativeProps,
    'data-part': 'separator',
    role: 'separator',
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The free space between two runs, so what follows sits at the end of the bar.
 *
 * It replaces a `justify` axis: an axis decides the placement of every control
 * at once, and what a bar needs is one boundary — the editing controls at the
 * start, the destructive one at the end.
 */
export function ToolbarSpacer({ ref, render, ...nativeProps }: ToolbarSpacerProps) {
  const rootProps: HTMLAttributes<HTMLElement> & { 'data-part': string } = {
    'aria-hidden': true,
    ...nativeProps,
    'data-part': 'spacer',
  };

  return render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps);
}
