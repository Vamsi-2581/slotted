import { handleShortcuts, tileStyle } from '@slotted/core/dashboard-grid';
import {
  memo,
  useCallback,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type Ref,
} from 'react';

import { Button, IconButton } from '../button';
import { Card, CardActions, CardBody, CardFooter, CardHeader } from '../card';
import { Glyph, Icon } from '../icon';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemLabel,
  MenuItemShortcut,
  MenuSeparator,
  MenuTrigger,
  type MenuSelectEvent,
} from '../menu';
import {
  ResultState,
  ResultStateActions,
  ResultStateContent,
  ResultStateDescription,
  ResultStateTitle,
} from '../result-state';
import { Skeleton, useSkeletonDefaults } from '../skeleton';
import { useLoadingVisibility } from '../skeleton/use-loading-visibility';
import {
  useDashboardGrid,
  type DashboardEdge,
  type DashboardGridContextValue,
  type DashboardSlot,
} from './dashboard-grid-context';
import type {
  DashboardHeadingLevel,
  DashboardLayoutReason,
  DashboardWidgetProps,
  DashboardWidgetRootProps,
} from './dashboard-grid.types';

const EDGES: readonly DashboardEdge[] = ['start', 'end', 'bottom', 'bottom-start', 'bottom-end'];

function assign<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T }).current = value;
}

const reasonOf = (event: MenuSelectEvent): DashboardLayoutReason =>
  event.reason === 'keyboard' ? 'keyboard' : 'pointer';

/**
 * The handle: the family's own button, not the button family's, because it is
 * a grip on the card's edge rather than a control beside the content. Its ref
 * is stable across renders: an inline ref callback is a new function each
 * render, and React detaches and reattaches the element for it, which rebuilt
 * the grid's drag controller mid-drag.
 */
function HandleButton({
  register,
  triggerRef,
  ...props
}: ComponentPropsWithRef<'button'> & {
  register: (element: HTMLButtonElement | null) => void;
  triggerRef: Ref<HTMLButtonElement> | undefined;
}) {
  const latest = useRef(triggerRef);
  latest.current = triggerRef;
  const setNode = useCallback(
    (element: HTMLButtonElement | null) => {
      register(element);
      assign(latest.current, element);
    },
    [register],
  );
  return (
    <button {...props} type="button" data-part="handle" ref={setNode}>
      <Icon>
        <Glyph name="grip-horizontal" />
      </Icon>
    </button>
  );
}

/**
 * One widget: an `li` in the grid holding a card whose header is its title and
 * its actions. While editing, a handle stands on the card's top edge and the
 * card's other edges can be pulled. The body is the consumer's content, or the
 * state it is in — waiting, empty or failed.
 */
export function DashboardWidget({
  headingLevel,
  /* The widget's own declaration: the grid reads these from the element. */
  defaultColumns: _defaultColumns,
  defaultRows: _defaultRows,
  minColumns: _minColumns,
  maxColumns: _maxColumns,
  minRows: _minRows,
  maxRows: _maxRows,
  movable: _movable,
  resizable: _resizable,
  removable: _removable,
  loading = false,
  ref,
  ...props
}: DashboardWidgetProps) {
  const { value } = props;
  const grid = useDashboardGrid('DashboardWidget');
  const slot = grid.slots.get(value);
  const titleId = `${useId()}-title`;
  const descriptionId = `${titleId}-description`;
  const skeletonDefaults = useSkeletonDefaults();
  const painted = useLoadingVisibility({
    delay: skeletonDefaults.delay ?? 0,
    loading,
    minDuration: skeletonDefaults.minDuration ?? 0,
  });

  const { registerWidget, registerHandle, registerCard } = grid;
  const setWidget = useCallback(
    (element: HTMLLIElement | null) => {
      registerWidget(value, element);
      assign(ref, element);
    },
    [ref, registerWidget, value],
  );
  const setCard = useCallback(
    (element: HTMLElement | null) => registerCard(value, element),
    [registerCard, value],
  );
  const setHandle = useCallback(
    (element: HTMLButtonElement | null) => registerHandle(value, element),
    [registerHandle, value],
  );

  if (slot === undefined) return null;
  return (
    <WidgetView
      {...props}
      headingLevel={headingLevel ?? grid.headingLevel}
      drawnSlot={slot}
      painted={painted}
      titleId={titleId}
      descriptionId={descriptionId}
      setWidget={setWidget}
      setCard={setCard}
      setHandle={setHandle}
      t={grid.t}
      editing={grid.editing}
      sizeClass={grid.sizeClass}
      statusId={grid.statusId}
      move={grid.move}
      resize={grid.resize}
      hide={grid.hide}
      onHandleKeyDown={grid.onHandleKeyDown}
      onResizePointerDown={grid.onResizePointerDown}
    />
  );
}

type WidgetViewProps = Omit<
  DashboardWidgetProps,
  | 'ref'
  | 'headingLevel'
  | 'loading'
  | 'defaultColumns'
  | 'defaultRows'
  | 'minColumns'
  | 'maxColumns'
  | 'minRows'
  | 'maxRows'
  | 'movable'
  | 'resizable'
  | 'removable'
> &
  Pick<
    DashboardGridContextValue,
    | 't'
    | 'editing'
    | 'sizeClass'
    | 'statusId'
    | 'move'
    | 'resize'
    | 'hide'
    | 'onHandleKeyDown'
    | 'onResizePointerDown'
  > & {
    headingLevel: DashboardHeadingLevel;
    drawnSlot: DashboardSlot;
    painted: boolean;
    titleId: string;
    descriptionId: string;
    setWidget: (element: HTMLLIElement | null) => void;
    setCard: (element: HTMLElement | null) => void;
    setHandle: (element: HTMLButtonElement | null) => void;
  };

/**
 * What a widget draws, from props the grid keeps stable: a widget the preview
 * leaves where it was gets the same slot, and its card, menu, handle and edges
 * are not drawn again for each cell the pointer crosses.
 */
const WidgetView = memo(function WidgetView({
  value,
  title,
  description,
  children,
  headingLevel,
  busy = false,
  status = 'ready',
  skeleton,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorTitle,
  errorDescription,
  onRetry,
  detailHref,
  onDetail,
  actions,
  footer,
  fill,
  size,
  render,
  style,
  drawnSlot: slot,
  painted,
  titleId,
  descriptionId,
  setWidget,
  setCard,
  setHandle,
  t,
  editing,
  sizeClass,
  statusId,
  move: moveTo,
  resize: resizeBy,
  hide,
  onHandleKeyDown,
  onResizePointerDown,
  ...nativeProps
}: WidgetViewProps) {
  const { tile, can } = slot;
  const Heading = `h${headingLevel}` as const;
  const named = { title };
  const flows = sizeClass !== 'expanded';

  const detail =
    detailHref !== undefined ? (
      <IconButton
        aria-label={t('detail', named)}
        size="sm"
        tone="secondary"
        variant="ghost"
        render={({ type: _type, disabled: _disabled, ...props }) => (
          <a {...(props as object)} data-part="detail" href={detailHref} onClick={onDetail} />
        )}
      >
        {/* The arrow points out of the widget, to the inline end: it turns with the writing direction. */}
        <Icon directional>
          <Glyph name="external" />
        </Icon>
      </IconButton>
    ) : onDetail !== undefined ? (
      <IconButton
        aria-label={t('detail', named)}
        size="sm"
        tone="secondary"
        variant="ghost"
        onClick={onDetail}
        render={(props) => <button {...props} data-part="detail" />}
      >
        <Icon directional>
          <Glyph name="external" />
        </Icon>
      </IconButton>
    ) : null;

  const move = (direction: 'up' | 'down' | 'left' | 'right') => (event: MenuSelectEvent) =>
    moveTo(value, direction, reasonOf(event), event.source);
  const resize = (columns: number, rows: number) => (event: MenuSelectEvent) =>
    resizeBy(value, { columns, rows }, reasonOf(event), event.source);
  const sizable = tile.resizable && sizeClass !== 'compact';

  const handle =
    editing && (tile.movable || sizable || tile.removable) ? (
      <Menu>
        <MenuTrigger
          onKeyDown={(event) => onHandleKeyDown(value, event)}
          render={({ ref: triggerRef, ...props }) => (
            <HandleButton
              {...(props as ComponentPropsWithRef<'button'>)}
              aria-label={t('handle', named)}
              aria-describedby={statusId}
              aria-keyshortcuts={handleShortcuts(tile.removable)}
              register={setHandle}
              triggerRef={triggerRef as Ref<HTMLButtonElement> | undefined}
            />
          )}
        />
        <MenuContent>
          {tile.movable ? (
            <>
              <MenuItem disabled={!can.up} onSelect={move('up')}>
                <MenuItemLabel>{t('moveUp')}</MenuItemLabel>
                <MenuItemShortcut keys="Alt+ArrowUp" />
              </MenuItem>
              <MenuItem disabled={!can.down} onSelect={move('down')}>
                <MenuItemLabel>{t('moveDown')}</MenuItemLabel>
                <MenuItemShortcut keys="Alt+ArrowDown" />
              </MenuItem>
              {flows ? null : (
                <>
                  <MenuItem disabled={!can.left} onSelect={move('left')}>
                    <MenuItemLabel>{t('moveStart')}</MenuItemLabel>
                    <MenuItemShortcut keys="Alt+ArrowLeft" />
                  </MenuItem>
                  <MenuItem disabled={!can.right} onSelect={move('right')}>
                    <MenuItemLabel>{t('moveEnd')}</MenuItemLabel>
                    <MenuItemShortcut keys="Alt+ArrowRight" />
                  </MenuItem>
                </>
              )}
            </>
          ) : null}
          {tile.movable && sizable ? <MenuSeparator /> : null}
          {sizable ? (
            <>
              <MenuItem disabled={!can.wider} onSelect={resize(1, 0)}>
                <MenuItemLabel>{t('wider')}</MenuItemLabel>
                <MenuItemShortcut keys="Shift+ArrowRight" />
              </MenuItem>
              <MenuItem disabled={!can.narrower} onSelect={resize(-1, 0)}>
                <MenuItemLabel>{t('narrower')}</MenuItemLabel>
                <MenuItemShortcut keys="Shift+ArrowLeft" />
              </MenuItem>
              <MenuItem disabled={!can.taller} onSelect={resize(0, 1)}>
                <MenuItemLabel>{t('taller')}</MenuItemLabel>
                <MenuItemShortcut keys="Shift+ArrowDown" />
              </MenuItem>
              <MenuItem disabled={!can.shorter} onSelect={resize(0, -1)}>
                <MenuItemLabel>{t('shorter')}</MenuItemLabel>
                <MenuItemShortcut keys="Shift+ArrowUp" />
              </MenuItem>
            </>
          ) : null}
          {tile.removable ? (
            <>
              {tile.movable || sizable ? <MenuSeparator /> : null}
              <MenuItem tone="danger" onSelect={(event) => hide(value, 'remove', event.source)}>
                <MenuItemLabel>{t('hide')}</MenuItemLabel>
                <MenuItemShortcut keys="Delete" />
              </MenuItem>
            </>
          ) : null}
        </MenuContent>
      </Menu>
    ) : null;

  const message = (kind: 'empty' | 'error') => (
    <div data-part="message">
      <ResultState
        status={kind}
        reach="section"
        align="center"
        live={kind === 'error' ? 'polite' : 'off'}
      >
        <ResultStateContent>
          <ResultStateTitle>
            {kind === 'empty' ? (emptyTitle ?? t('emptyTitle')) : (errorTitle ?? t('errorTitle'))}
          </ResultStateTitle>
          {(kind === 'empty' ? emptyDescription : errorDescription) === undefined ? null : (
            <ResultStateDescription>
              {kind === 'empty' ? emptyDescription : errorDescription}
            </ResultStateDescription>
          )}
        </ResultStateContent>
        {kind === 'empty' && emptyAction !== undefined ? (
          <ResultStateActions>{emptyAction}</ResultStateActions>
        ) : null}
        {kind === 'error' && onRetry !== undefined ? (
          <ResultStateActions>
            <Button
              size="sm"
              tone="secondary"
              variant="outline"
              start={
                <Icon>
                  <Glyph name="rotate-ccw" />
                </Icon>
              }
              onClick={onRetry}
              render={(props) => <button {...props} data-part="retry" />}
            >
              {t('retry')}
            </Button>
          </ResultStateActions>
        ) : null}
      </ResultState>
    </div>
  );

  const content = painted ? (
    <div data-part="skeleton">{skeleton ?? <Skeleton shape="block" />}</div>
  ) : status === 'empty' ? (
    message('empty')
  ) : status === 'error' ? (
    message('error')
  ) : (
    children
  );

  const rootProps: DashboardWidgetRootProps = {
    ...nativeProps,
    style: {
      ...(tileStyle(tile) as CSSProperties),
      ...(slot.order === undefined ? {} : { order: slot.order }),
      ...style,
    },
    'data-part': 'widget',
    'data-key': value,
    'data-status': status,
    ...(painted ? { 'data-loading': '' } : {}),
    ...(tile.movable ? { 'data-movable': '' } : {}),
    ...(tile.resizable ? { 'data-resizable': '' } : {}),
    ...(slot.dragging ? { 'data-dragging': '' } : {}),
    ...(slot.resizing ? { 'data-resizing': '' } : {}),
    ref: setWidget,
    children: (
      <>
        <Card
          fill={fill}
          size={size}
          render={(props) => (
            <article
              {...props}
              ref={setCard}
              aria-labelledby={titleId}
              aria-describedby={description === undefined ? undefined : descriptionId}
              aria-busy={painted || busy || undefined}
            />
          )}
        >
          <CardHeader>
            <Heading data-part="title" id={titleId}>
              {title}
            </Heading>
            {description === undefined ? null : (
              <p data-part="description" id={descriptionId}>
                {description}
              </p>
            )}
            {actions !== undefined || detail !== null ? (
              <CardActions>
                {actions}
                {detail}
              </CardActions>
            ) : null}
          </CardHeader>
          <CardBody>
            {busy && !painted ? <span data-part="busy-indicator" aria-hidden="true" /> : null}
            {content}
          </CardBody>
          {footer === undefined ? null : <CardFooter>{footer}</CardFooter>}
        </Card>
        {handle}
        {editing && sizable
          ? EDGES.map((edge) => (
              <span
                key={edge}
                data-part="resize-handle"
                data-edge={edge}
                {...(slot.edge === edge ? { 'data-active': '' } : {})}
                aria-hidden="true"
                onPointerDown={(event) => onResizePointerDown(value, edge, event)}
              />
            ))
          : null}
        {slot.readout === null ? null : (
          <span data-part="size-readout" data-edge={slot.edge ?? undefined} aria-hidden="true">
            {slot.readout}
          </span>
        )}
      </>
    ),
  };

  return render === undefined ? <li {...rootProps} /> : render(rootProps);
});
