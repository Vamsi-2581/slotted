import type {
  DashboardDirection,
  DashboardGridLabels,
  DashboardSizeClass,
  DashboardTile,
} from '@slotted/core/dashboard-grid';
import { createContext, useContext } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

import type { DashboardHeadingLevel, DashboardLayoutReason } from './dashboard-grid.types';

/** An edge a widget is pulled by. The top is not one: gravity decides it. */
export type DashboardEdge = 'start' | 'end' | 'bottom' | 'bottom-start' | 'bottom-end';

/** What the grid tells one widget about where and how it is drawn. */
export interface DashboardSlot {
  readonly tile: DashboardTile;
  /** The CSS `order` while a gesture previews a flow. */
  readonly order: number | undefined;
  readonly dragging: boolean;
  readonly resizing: boolean;
  /** The edge a pointer is pulling, while it pulls. */
  readonly edge: DashboardEdge | null;
  /** The size the pull has reached, already filled. */
  readonly readout: string | null;
  readonly can: {
    readonly up: boolean;
    readonly down: boolean;
    readonly left: boolean;
    readonly right: boolean;
    readonly wider: boolean;
    readonly narrower: boolean;
    readonly taller: boolean;
    readonly shorter: boolean;
  };
}

export interface DashboardGridContextValue {
  readonly editing: boolean;
  readonly labels: DashboardGridLabels;
  readonly headingLevel: DashboardHeadingLevel;
  readonly statusId: string;
  readonly sizeClass: DashboardSizeClass;
  readonly slots: ReadonlyMap<string, DashboardSlot>;
  registerWidget: (key: string, element: HTMLLIElement | null) => void;
  registerHandle: (key: string, element: HTMLElement | null) => void;
  registerCard: (key: string, element: HTMLElement | null) => void;
  move: (
    key: string,
    direction: DashboardDirection,
    reason: DashboardLayoutReason,
    source?: Event,
  ) => void;
  resize: (
    key: string,
    delta: { columns: number; rows: number },
    reason: DashboardLayoutReason,
    source?: Event,
  ) => void;
  hide: (key: string, reason: DashboardLayoutReason, source?: Event) => void;
  onHandleKeyDown: (key: string, event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (key: string, edge: DashboardEdge, event: PointerEvent<HTMLElement>) => void;
}

export const DashboardGridContext = createContext<DashboardGridContextValue | null>(null);

export function useDashboardGrid(part: string): DashboardGridContextValue {
  const context = useContext(DashboardGridContext);
  if (context === null) throw new Error(`${part} must be rendered inside a DashboardGrid`);
  return context;
}
