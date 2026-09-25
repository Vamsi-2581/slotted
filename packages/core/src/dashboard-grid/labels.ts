/**
 * The strings `dashboard-grid` draws and announces, in English. Both bindings
 * read this one object, so a product that translates the family translates it
 * once per binding's provider rather than once per framework.
 */
export interface DashboardGridLabels {
  editBar: string;
  editStatus: string;
  add: string;
  reset: string;
  cancel: string;
  done: string;
  handle: string;
  detail: string;
  retry: string;
  emptyTitle: string;
  errorTitle: string;
  empty: string;
  emptyEditing: string;
  moveUp: string;
  moveDown: string;
  moveStart: string;
  moveEnd: string;
  wider: string;
  narrower: string;
  taller: string;
  shorter: string;
  hide: string;
  size: string;
  moved: string;
  movedInOrder: string;
  resized: string;
  hidden: string;
  shown: string;
  resetDone: string;
  cancelled: string;
}

export const DEFAULT_DASHBOARD_GRID_LABELS: DashboardGridLabels = {
  editBar: 'Layout',
  editStatus:
    'Drag a widget to move it and pull its edges to resize it. From the keyboard, focus its handle: Alt with an arrow moves it, Shift with an arrow resizes it.',
  add: 'Add widget',
  reset: 'Reset layout',
  cancel: 'Cancel',
  done: 'Done',
  handle: 'Rearrange {title}',
  detail: 'Open {title}',
  retry: 'Try again',
  emptyTitle: 'No data',
  errorTitle: 'This widget could not load',
  empty: 'No widgets',
  emptyEditing: 'Every widget is hidden. Add one back to start.',
  moveUp: 'Move up',
  moveDown: 'Move down',
  moveStart: 'Move left',
  moveEnd: 'Move right',
  wider: 'Wider',
  narrower: 'Narrower',
  taller: 'Taller',
  shorter: 'Shorter',
  hide: 'Hide',
  size: '{columns} × {rows}',
  moved: '{title} moved to row {row}, column {column}',
  movedInOrder: '{title} moved to position {position} of {total}',
  resized: '{title} is {columns} columns by {rows} rows',
  hidden: '{title} hidden',
  shown: '{title} added',
  resetDone: 'Layout reset',
  cancelled: 'Layout changes discarded',
};

/** The shortcuts the handle declares in `aria-keyshortcuts`. */
export function handleShortcuts(removable: boolean): string {
  const keys = [
    'Alt+ArrowUp',
    'Alt+ArrowDown',
    'Alt+ArrowLeft',
    'Alt+ArrowRight',
    'Shift+ArrowUp',
    'Shift+ArrowDown',
    'Shift+ArrowLeft',
    'Shift+ArrowRight',
  ];
  return (removable ? [...keys, 'Delete'] : keys).join(' ');
}
