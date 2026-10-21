import { CREATE_OPTION, RETRY_OPTION } from '@slotted/core/entity-picker';
import type { Entity } from '@slotted/core/entity-picker';
import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createPortalRoot } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import type { PositionerHandle } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle, PresenceStatus } from '@slotted/core/presence';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { Highlight } from '../highlight';
import { Glyph, Icon } from '../icon';
import { useEntityPicker } from './entity-picker';
import { EntityFace } from './entity-picker-control';

/**
 * An option refuses the press so focus stays on the input: an option cannot
 * hold focus, and a press on it would take focus to the body (CB11).
 */
function keepFocus(event: PointerEvent<HTMLElement>) {
  if (event.defaultPrevented) return;
  event.preventDefault();
}

function SkeletonRow() {
  return (
    <div>
      <span
        data-loading=""
        data-part="root"
        data-part-root=""
        data-shape="circle"
        data-size="xs"
        data-ui="skeleton"
        data-ui-skeleton=""
      />
      <span
        data-loading=""
        data-part="root"
        data-part-root=""
        data-shape="text"
        data-ui="skeleton"
        data-ui-skeleton=""
      />
      <span
        data-loading=""
        data-part="root"
        data-part-root=""
        data-shape="text"
        data-ui="skeleton"
        data-ui-skeleton=""
      />
    </div>
  );
}

/**
 * The layer and the list.
 *
 * `status` is the live region: the count once the source has answered, the
 * minimum length while the query is shorter, the wait, the failure. The
 * skeleton beside it is hidden from assistive technology.
 */
export function EntityPickerPopup() {
  const picker = useEntityPicker();
  const { t, search } = picker;
  const headingPrefix = useId();

  const [layerNode, setLayerNode] = useState<HTMLElement | null>(null);
  const [surfaceNode, setSurfaceNode] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<Element | null>(null);
  const [status, setStatus] = useState<PresenceStatus>('unmounted');
  /**
   * The reader is about to open the popup: the field took focus or a press.
   * The portal's layer is made then, because making it reads the field's
   * computed style, and a read in the open's own task is a style recalculation
   * the first frame waits for.
   */
  const [warm, setWarm] = useState(false);
  const presence = useRef<PresenceHandle | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const latest = useRef(picker);
  latest.current = picker;

  useEffect(() => {
    const handle = createPresence({ present: latest.current.open, onStatusChange: setStatus });
    presence.current = handle;
    setStatus(handle.status);
    return () => {
      handle.destroy();
      presence.current = null;
    };
  }, []);

  useEffect(() => presence.current?.sync(picker.open), [picker.open]);
  useEffect(() => presence.current?.setNode(layerNode), [layerNode]);

  /** Open renders the popup in the commit that opens it. */
  const mounted = picker.open || status !== 'unmounted';

  useEffect(() => {
    const field = picker.inputNode;
    if (field === null || warm) return undefined;
    const prepare = () => setWarm(true);
    field.addEventListener('focusin', prepare);
    field.addEventListener('pointerdown', prepare);
    return () => {
      field.removeEventListener('focusin', prepare);
      field.removeEventListener('pointerdown', prepare);
    };
  }, [picker.inputNode, warm]);

  const layered = mounted || warm;
  useLayoutEffect(() => {
    if (!layered) {
      setContainer(null);
      return;
    }
    const handle = createPortalRoot({ origin: picker.inputNode, disabled: !picker.portal });
    setContainer(handle.container);
    return () => handle.release();
  }, [layered, picker.inputNode, picker.portal]);

  const { side, strategy, width, controlNode } = picker;

  /* The anchor is the frame, not the root: the popup lines up with the text
     and not with the scope in front of it. */
  const positioner = useRef<PositionerHandle | null>(null);

  /**
   * `data-open` is written by the measurement that places the popup, on the
   * element, in the task that opened it: the position, the side and the open
   * state reach one style update together. A render to say "positioned" was a
   * frame of its own.
   */
  const place = useCallback((handle: PositionerHandle, layer: HTMLElement) => {
    void handle.update().then(() => {
      if (positioner.current !== handle || !latest.current.open) return;
      layer.setAttribute('data-open', '');
    });
  }, []);

  useLayoutEffect(() => {
    if (layerNode === null || controlNode === null) return;
    const handle = createPositioner(controlNode, layerNode, {
      align: 'start',
      alignOffset: 0,
      boundaryPadding: 8,
      flip: true,
      hideWhenDetached: true,
      matchWidth: width === 'anchor',
      shift: true,
      side,
      sideOffset: 4,
      strategy,
    });
    positioner.current = handle;
    if (latest.current.open) place(handle, layerNode);
    return () => {
      handle.destroy();
      positioner.current = null;
      layerNode.removeAttribute('data-open');
    };
  }, [controlNode, layerNode, place, side, strategy, width]);

  useLayoutEffect(() => {
    const handle = positioner.current;
    if (handle === null || layerNode === null) return;
    if (picker.open) place(handle, layerNode);
    else layerNode.removeAttribute('data-open');
  }, [layerNode, picker.open, place]);

  useEffect(() => {
    if (layerNode === null || !picker.open || controlNode === null) return;
    const layer = createDismissableLayer(layerNode, {
      branches: [controlNode],
      escape: true,
      focusOutside: false,
      modal: false,
      outsidePress: true,
      scrollLock: false,
      onDismiss: (request) => {
        latest.current.setOpen(
          false,
          request.reason === 'escape' ? 'escape' : 'outsidePress',
          request.source,
        );
      },
    });
    return () => layer.destroy();
  }, [controlNode, layerNode, picker.open]);

  /**
   * Where the highlight lands as the popup opens, and where it goes when a
   * new answer takes the highlighted option away: the option that took its
   * place is not guessed at, the highlight simply leaves.
   */
  const keys = picker.options.map((option) => option.key).join('\u0001');
  useLayoutEffect(() => {
    const state = latest.current;
    if (!state.open) return;
    const options = state.options;
    const entry = state.entry.current;
    if (entry !== 'keep') {
      const enabled = options.filter((option) => !option.disabled);
      const target =
        entry === 'last'
          ? enabled[enabled.length - 1]
          : entry === 'selected'
            ? (options.find((option) => state.chosen.includes(option.key)) ?? undefined)
            : enabled[0];
      if (target !== undefined || entry !== 'selected') {
        state.entry.current = 'keep';
        if (target !== undefined) state.setHighlighted(target.key, 'keyboard');
      }
      return;
    }
    if (state.highlighted !== null && !options.some((option) => option.key === state.highlighted)) {
      state.setHighlighted(null, 'keyboard');
    }
  }, [keys, picker.open]);

  useEffect(() => {
    if (surfaceNode === null || picker.highlighted === null) return;
    const option = surfaceNode.ownerDocument.getElementById(picker.optionId(picker.highlighted));
    if (typeof option?.scrollIntoView === 'function') option.scrollIntoView({ block: 'nearest' });
  }, [picker, picker.highlighted, surfaceNode]);

  /* The failure is said once, by the announcer: the sentence is already on
     the surface, and the live region beside it would print it twice. */
  const failedNow = search.status === 'error';
  useEffect(() => {
    if (!failedNow || !latest.current.open) return;
    getLiveAnnouncer(latest.current.inputNode?.ownerDocument).announce(latest.current.t('error'), {
      repeat: true,
    });
  }, [failedNow]);

  /* The last row came into view: the next page, if there is one. */
  useEffect(() => {
    const target = sentinel.current;
    const root = surfaceNode;
    if (target === null || root === null || !search.hasMore) return;
    if (typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) latest.current.session.more();
      },
      { root },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [search.hasMore, search.items.length, surfaceNode]);

  if (!mounted) return null;

  const records = picker.options.filter(
    (option) => option.key !== CREATE_OPTION && option.key !== RETRY_OPTION,
  ).length;
  const firstPage = search.status === 'loading' && search.items.length === 0;
  const refreshing = search.status === 'loading' && search.items.length > 0 && search.indicator;
  const failed = search.status === 'error';
  const empty =
    records === 0 &&
    !picker.offerCreate &&
    !failed &&
    !firstPage &&
    search.status !== 'waiting' &&
    search.status !== 'short';

  const message = (() => {
    if (search.status === 'short') {
      return t('minQuery', { count: picker.props.minQueryLength ?? 0 });
    }
    if (failed) return null;
    if (search.indicator && (firstPage || search.loadingMore)) return t('loading');
    if (search.status === 'ready' && picker.query !== '') {
      return t('count', { count: search.total ?? search.items.length });
    }
    return null;
  })();

  const option = (entity: Entity) => {
    const key = entity.id;
    const selected = picker.chosen.includes(key);
    const current = picker.highlighted === key;
    const disabled =
      picker.options.find((candidate) => candidate.key === key)?.disabled ??
      entity.disabled === true;
    const choose = (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      picker.activate(key, 'pointer', event.nativeEvent);
      picker.inputNode?.focus({ preventScroll: true });
    };
    const content =
      picker.props.renderOption !== undefined ? (
        picker.props.renderOption(entity, { current, disabled, query: picker.query, selected })
      ) : (
        <>
          <span data-part="label" data-part-label="">
            {picker.highlightMatch && picker.query !== '' ? (
              <Highlight locale={picker.locale} query={picker.query} text={entity.label} />
            ) : (
              entity.label
            )}
          </span>
          {entity.description === undefined ? null : (
            <span data-part="description" data-part-description="">
              {entity.description}
            </span>
          )}
          {entity.meta === undefined ? null : (
            <span data-part="meta" data-part-meta="">
              {entity.meta}
            </span>
          )}
        </>
      );
    return (
      <div
        aria-disabled={disabled ? true : undefined}
        aria-selected={selected}
        data-part="item"
        data-part-item=""
        data-value={key}
        id={picker.optionId(key)}
        key={key}
        onClick={choose}
        onPointerDown={keepFocus}
        onPointerEnter={(event) => {
          if (!disabled) picker.setHighlighted(key, 'pointer', event.nativeEvent);
        }}
        role="option"
        {...(current ? { 'data-current': '' } : {})}
        {...(selected ? { 'data-selected': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
      >
        {picker.media === 'avatar' && entity.avatar !== null ? (
          <span data-part="media" data-part-media="">
            <EntityFace entity={entity} locale={picker.locale} />
          </span>
        ) : null}
        {content}
        <span data-part="indicator" data-part-indicator="">
          <Icon>
            <Glyph name="check" />
          </Icon>
        </span>
      </div>
    );
  };

  const offer = (
    key: string,
    label: string,
    onPress: (event: MouseEvent<HTMLDivElement>) => void,
  ) => (
    <div
      aria-selected={false}
      data-part="item"
      data-part-item=""
      data-value={key}
      id={picker.optionId(key)}
      onClick={onPress}
      onPointerDown={keepFocus}
      onPointerEnter={(event) => picker.setHighlighted(key, 'pointer', event.nativeEvent)}
      role="option"
      {...(key === CREATE_OPTION ? { 'data-create': '' } : { 'data-retry': '' })}
      {...(picker.highlighted === key ? { 'data-current': '' } : {})}
      {...(picker.creating && key === CREATE_OPTION ? { 'data-loading': '' } : {})}
    >
      <span aria-hidden="true" data-part="media" data-part-media="">
        <Icon>
          <Glyph name={key === CREATE_OPTION ? 'plus' : 'rotate-ccw'} />
        </Icon>
      </span>
      <span data-part="label" data-part-label="">
        {label}
      </span>
    </div>
  );

  const { sections, headings } = picker.sections;
  const showRecords = !(failed && search.items.length === 0);

  const element = (
    <div
      data-align="start"
      data-part="positioner"
      data-part-positioner=""
      data-size={picker.size}
      data-ui="entity-picker"
      data-ui-entity-picker=""
      data-width={picker.width}
      ref={setLayerNode}
      {...(picker.open ? {} : { inert: true })}
    >
      <div
        aria-busy={search.status === 'loading' ? true : undefined}
        aria-label={picker.props['aria-label']}
        data-part="content"
        data-part-content=""
        id={picker.contentId}
        ref={setSurfaceNode}
        role="listbox"
        {...(picker.multiple ? { 'aria-multiselectable': true } : {})}
        {...(refreshing ? { 'data-loading': '' } : {})}
      >
        {showRecords
          ? sections.map((section) =>
              headings ? (
                <div
                  aria-labelledby={`${headingPrefix}${section.key}`}
                  data-part="group"
                  data-part-group=""
                  key={section.key}
                  role="group"
                >
                  <div
                    data-part="group-label"
                    data-part-group-label=""
                    id={`${headingPrefix}${section.key}`}
                  >
                    {section.label}
                  </div>
                  {section.entities.map(option)}
                </div>
              ) : (
                section.entities.map(option)
              ),
            )
          : null}
        {firstPage && search.indicator ? (
          <div aria-hidden="true" data-part="placeholder" data-part-placeholder="">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : null}
        {search.loadingMore && search.indicator ? (
          <div aria-hidden="true" data-part="more" data-part-more="">
            <SkeletonRow />
          </div>
        ) : null}
        <div ref={sentinel} />
        {picker.offerCreate
          ? offer(CREATE_OPTION, t('create', { query: picker.query.trim() }), (event) =>
              picker.activate(CREATE_OPTION, 'pointer', event.nativeEvent),
            )
          : null}
        {failed ? (
          <div data-part="error" data-part-error="">
            <Icon>
              <Glyph name="circle-alert" />
            </Icon>
            {t('error')}
          </div>
        ) : null}
        {failed
          ? offer(RETRY_OPTION, t('retry'), () => {
              picker.retry();
              picker.inputNode?.focus({ preventScroll: true });
            })
          : null}
        {empty ? (
          <div data-part="empty" data-part-empty="">
            {t('empty')}
          </div>
        ) : null}
        <div aria-live="polite" data-part="status" data-part-status="" role="status">
          {message}
        </div>
      </div>
    </div>
  );

  return container === null ? element : createPortal(element, container);
}
