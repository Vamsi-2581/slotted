import '@slotted/styles/filter-bar/filter-bar.css';

import {
  describeFilter,
  describeFilterGroup,
  emptyFilterGroup,
  firstLevelRules,
  isFilterActive,
  isFilterGroup,
  normalizeFilterGroup,
  removeNodeAt,
  ruleFor,
  serializeFilterGroup,
  withoutRuleFor,
  withRuleFor,
} from '@slotted/core/filter';
import type { FilterDescriptor, FilterGroup, FilterNode, FilterPath } from '@slotted/core/filter';
import { createRemovalFocus, createRovingTabindex } from '@slotted/core/focus';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent } from 'react';

import { Button } from '../button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerTitle,
} from '../drawer';
import { Glyph, Icon } from '../icon';
import { Kbd } from '../kbd';
import { Menu, MenuContent, MenuGroup, MenuItem, MenuTrigger } from '../menu';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverLayer,
  PopoverTrigger,
  usePopover,
} from '../popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { TagButton } from '../tag';
import { TextField } from '../text-field';
import { fill, resolveFilterBarLabels, useFilterBarDefaults } from './filter-bar-defaults';
import {
  blankRule,
  ConditionEditor,
  fieldByKey,
  GroupEditor,
  operatorName,
} from './filter-bar-rules';
import type { RuleEnvironment } from './filter-bar-rules';
import type {
  FilterBarField,
  FilterBarLabels,
  FilterBarOpenReason,
  FilterBarPresetReason,
  FilterBarProps,
  FilterBarQueryReason,
  FilterBarRevealedReason,
  FilterBarValueReason,
} from './filter-bar.types';

export const FILTER_BAR_FALLBACK = {
  apply: 'live',
  chipLimit: 6,
  queryDelay: 320,
  shortcut: null,
  size: 'md',
} as const;

const BAR_ITEMS =
  "[data-part='pill'], [data-part='add'], [data-part='clear'], [data-part='apply'], [data-part='reset'], [data-part='summary']";
const CHIP_ITEMS = "[data-part='chip'] [data-part='body']";

function sameGroup(a: FilterGroup | null, b: FilterGroup | null) {
  return serializeFilterGroup(a) === serializeFilterGroup(b);
}

function isEditable(element: Element | null) {
  if (!element) return false;
  const tag = element.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (element as HTMLElement).isContentEditable
  );
}

/**
 * A bar above a listing that edits one value: a tree of conditions over the
 * listing's fields, whose leaves are the descriptor `table` edits in a column
 * header. The bar draws the first level — a search field, a pill per pinned
 * field, a chip per applied rule — and opens a drawer on the whole tree.
 *
 * The family applies nothing. It reports the tree and the query, and
 * `createFilterGroupPredicate` and `createSearchPredicate` in
 * `@slotted/core/filter` are what a consumer applies to its own rows.
 */
const STICKY_TOP = '--slotted-page-sticky-top';

const BAR_WRAPPED = 'data-bar-wrapped';

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Marks the root when the bar's controls take more than one line in the
 * composition the root's width selects. The attribute comes off before the
 * read, so the answer is the same whether the fallback it draws is in place
 * or not: read in the fallback, where the bar has a line of its own, the
 * answer would be "fits", and the next read would wrap it again. A control
 * starts a second line when its top is at or below another control's bottom,
 * because controls on one line share its middle. A control without a box —
 * hidden in this composition, or never laid out — is not counted.
 */
function measureBarWrap(element: HTMLElement, barNode: HTMLElement) {
  element.removeAttribute(BAR_WRAPPED);
  let top = -Infinity;
  let bottom = Infinity;
  for (const control of barNode.children) {
    const box = control.getBoundingClientRect();
    if (!(box.width > 0 && box.height > 0)) continue;
    top = Math.max(top, box.top);
    bottom = Math.min(bottom, box.bottom);
  }
  element.toggleAttribute(BAR_WRAPPED, top >= bottom);
}

export function FilterBar({
  apply: applyProp,
  children,
  chipLimit: chipLimitProp,
  count,
  defaultOpen,
  defaultPreset,
  defaultQuery,
  defaultRevealed,
  defaultValue,
  disabled = false,
  fields,
  labels: labelsProp,
  loading = false,
  locale,
  onOpenChange,
  onPresetChange,
  onPresetSave,
  onQueryChange,
  onRevealedChange,
  onValueChange,
  open: openProp,
  preset: presetProp,
  presets,
  query: queryProp,
  queryDelay: queryDelayProp,
  ref,
  renderOperand,
  revealed: revealedProp,
  shortcut: shortcutProp,
  size: sizeProp,
  sticky = false,
  container,
  total,
  value: valueProp,
  ...nativeProps
}: FilterBarProps) {
  const defaults = useFilterBarDefaults();
  const labels = useMemo(
    () => resolveFilterBarLabels(defaults.labels, labelsProp),
    [defaults.labels, labelsProp],
  );
  const apply = applyProp ?? defaults.apply ?? FILTER_BAR_FALLBACK.apply;
  const chipLimit = chipLimitProp ?? defaults.chipLimit ?? FILTER_BAR_FALLBACK.chipLimit;
  const queryDelay = queryDelayProp ?? defaults.queryDelay ?? FILTER_BAR_FALLBACK.queryDelay;
  const shortcut =
    shortcutProp === undefined ? (defaults.shortcut ?? FILTER_BAR_FALLBACK.shortcut) : shortcutProp;
  const size = sizeProp ?? defaults.size ?? FILTER_BAR_FALLBACK.size;

  const base = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const search = useRef<HTMLInputElement | null>(null);
  const bar = useRef<HTMLDivElement | null>(null);
  const chips = useRef<HTMLDivElement | null>(null);

  /* ── The five values ─────────────────────────────────────────────────── */

  const [ownValue, setOwnValue] = useState<FilterGroup | null>(defaultValue ?? null);
  const value = valueProp === undefined ? ownValue : valueProp;

  const [ownQuery, setOwnQuery] = useState(defaultQuery ?? '');
  const query = queryProp === undefined ? ownQuery : queryProp;

  const [ownPreset, setOwnPreset] = useState<string | null>(defaultPreset ?? null);
  const preset = presetProp === undefined ? ownPreset : presetProp;

  const [ownOpen, setOwnOpen] = useState(defaultOpen ?? false);
  const open = openProp === undefined ? ownOpen : openProp;

  const [ownRevealed, setOwnRevealed] = useState(defaultRevealed ?? false);
  const revealed = revealedProp === undefined ? ownRevealed : revealedProp;

  function announce(message: string) {
    getLiveAnnouncer(root.current?.ownerDocument).announce(message);
  }

  const format = useMemo(
    () => ({
      field: (key: string) => fieldByKey(fields, key)?.label ?? key,
      join: (join: 'and' | 'or') => labels.joins[join],
      operator: (operator: string) => operatorName(labels, operator),
    }),
    [fields, labels],
  );

  /** The sentence for one field's rule, with a set value written as its option's label. */
  const sentence = useCallback(
    (field: FilterBarField | undefined, filter: FilterDescriptor | null | undefined) =>
      describeFilter(filter, {
        ...format,
        value: (value) =>
          field?.options?.find((option) => option.value === value)?.label ?? String(value),
      }),
    [format],
  );

  const requestValue = useCallback(
    (next: FilterGroup | null, reason: FilterBarValueReason, source?: unknown) => {
      const normalized = normalizeFilterGroup(next);
      const state = createControllable<FilterGroup | null>({
        controlled: valueProp,
        equals: sameGroup,
        initial: value,
        onRequest: (request) => onValueChange?.(request.value, request as never),
      });
      if (state.request(normalized, reason, source)) setOwnValue(normalized);
    },
    [onValueChange, value, valueProp],
  );

  const requestQuery = useCallback(
    (next: string, reason: FilterBarQueryReason, source?: unknown) => {
      const state = createControllable<string>({
        controlled: queryProp,
        initial: query,
        onRequest: (request) => onQueryChange?.(request.value, request as never),
      });
      if (state.request(next, reason, source)) setOwnQuery(next);
    },
    [onQueryChange, query, queryProp],
  );

  function requestPreset(next: string | null, reason: FilterBarPresetReason, source?: unknown) {
    const state = createControllable<string | null>({
      controlled: presetProp,
      initial: preset,
      onRequest: (request) => onPresetChange?.(request.value, request as never),
    });
    if (state.request(next, reason, source)) setOwnPreset(next);
  }

  function requestOpen(next: boolean, reason: FilterBarOpenReason, source?: unknown) {
    const state = createControllable<boolean>({
      controlled: openProp,
      initial: open,
      onRequest: (request) => onOpenChange?.(request.value, request as never),
    });
    if (state.request(next, reason, source)) setOwnOpen(next);
  }

  function requestRevealed(next: boolean, reason: FilterBarRevealedReason, source?: unknown) {
    const state = createControllable<boolean>({
      controlled: revealedProp,
      initial: revealed,
      onRequest: (request) => onRevealedChange?.(request.value, request as never),
    });
    if (state.request(next, reason, source)) setOwnRevealed(next);
  }

  /* ── The draft under manual ──────────────────────────────────────────── */

  const [draft, setDraft] = useState<{ value: FilterGroup | null; query: string } | null>(null);
  const shown = apply === 'manual' && draft ? draft.value : value;
  const shownQuery = apply === 'manual' && draft ? draft.query : query;
  const dirty =
    apply === 'manual' &&
    draft !== null &&
    (!sameGroup(draft.value, value) || draft.query !== query);

  /* A controlled value that changes from outside replaces the draft — the application's value wins. */
  const lastValue = useRef(value);
  useEffect(() => {
    if (!sameGroup(lastValue.current, value)) {
      lastValue.current = value;
      setDraft(null);
    }
  }, [value]);

  /* A preset whose tree the value has left is dirty rather than dropped. */
  const presetDirty = useMemo(() => {
    const chosen = presets?.find((entry) => entry.key === preset);
    return chosen !== undefined && !sameGroup(normalizeFilterGroup(chosen.value), value);
  }, [preset, presets, value]);

  /**
   * Every edit of the tree goes through here: under `live` it is requested
   * at once, under `manual` it goes to the draft and Apply requests it.
   */
  function edit(next: FilterGroup | null, reason: FilterBarValueReason, source?: unknown) {
    if (apply === 'manual') {
      setDraft({ value: next, query: shownQuery });
      return;
    }
    requestValue(next, reason, source);
  }

  /* ── Required fields ─────────────────────────────────────────────────── */

  const required = useMemo(() => fields.filter((field) => field.required), [fields]);

  /** The tree with every required field at its default, which is what Clear returns to. */
  function baseline(): FilterGroup | null {
    let next: FilterGroup | null = null;
    for (const field of required) {
      if (field.defaultValue) next = withRuleFor(next, field.key, field.defaultValue);
    }
    return normalizeFilterGroup(next);
  }

  function missing(tree: FilterGroup | null): FilterBarField[] {
    return required.filter((field) => !isFilterActive(ruleFor(tree, field.key) ?? null));
  }

  /* ── Commit points ───────────────────────────────────────────────────── */

  function submit(source?: unknown) {
    if (!draft) return;
    const lacking = missing(draft.value);
    if (lacking.length > 0) {
      const first = lacking[0]!;
      setInvalid(first.key);
      announce(fill(labels.required, { field: first.label }));
      root.current
        ?.querySelector<HTMLElement>(`[data-part='pill'][data-field='${CSS.escape(first.key)}']`)
        ?.focus();
      return;
    }
    setInvalid(null);
    requestValue(draft.value, 'submit', source);
    if (draft.query !== query) requestQuery(draft.query, 'submit', source);
    setDraft(null);
    const applied = normalizeFilterGroup(draft.value);
    announce(
      applied
        ? fill(labels.appliedCount, { count: firstLevelRules(applied).length }) +
            ': ' +
            describeFilterGroup(applied, format)
        : labels.cleared,
    );
  }

  function reset() {
    setDraft(null);
    setInvalid(null);
  }

  function clearAll(source?: unknown) {
    const next = baseline();
    setInvalid(null);
    if (apply === 'manual') {
      setDraft({ value: next, query: '' });
    } else {
      requestValue(next, 'clear', source);
      if (query !== '') requestQuery('', 'clear', source);
    }
    announce(next ? `${labels.cleared}. ${describeFilterGroup(next, format)}` : labels.cleared);
  }

  function removeField(key: string, source?: unknown) {
    const field = fieldByKey(fields, key);
    if (field?.required) {
      setInvalid(key);
      announce(fill(labels.required, { field: field.label }));
      return;
    }
    edit(withoutRuleFor(shown, key), 'remove', source);
    announce(fill(labels.removed, { field: field?.label ?? key }));
  }

  function removeNode(path: FilterPath, source?: unknown) {
    if (!shown) return;
    edit(removeNodeAt(shown, path), 'remove', source);
  }

  function choosePreset(key: string | null, source?: unknown) {
    requestPreset(key, key === null ? 'clear' : 'select', source);
    const chosen = presets?.find((entry) => entry.key === key);
    if (chosen) {
      setDraft(null);
      requestValue(chosen.value, 'select', source);
      announce(chosen.label);
    }
  }

  const [invalid, setInvalid] = useState<string | null>(null);

  /* ── The query ───────────────────────────────────────────────────────── */

  const [typed, setTyped] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function typeQuery(next: string, reason: FilterBarQueryReason, source?: unknown) {
    if (apply === 'manual') {
      setDraft({ value: shown, query: next });
      return;
    }
    setTyped(next);
    if (timer.current) clearTimeout(timer.current);
    if (reason === 'clear' || queryDelay === 0) {
      setTyped(null);
      requestQuery(next, reason, source);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setTyped(null);
      requestQuery(next, reason, source);
    }, queryDelay);
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && (typed ?? shownQuery) !== '') {
      event.preventDefault();
      typeQuery('', 'clear', event);
    }
    if (event.key === 'Enter' && apply === 'manual') submit(event);
  }

  /* The document key that reaches the search, unless the reader is typing. */
  useEffect(() => {
    if (!shortcut || disabled) return;
    const doc = root.current?.ownerDocument;
    if (!doc) return;
    const listener = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== shortcut) return;
      if (isEditable(doc.activeElement)) return;
      event.preventDefault();
      search.current?.focus();
    };
    doc.addEventListener('keydown', listener);
    return () => doc.removeEventListener('keydown', listener);
  }, [disabled, shortcut]);

  /* ── The roving rings ────────────────────────────────────────────────── */

  const firstLevel = useMemo(() => (shown ? shown.rules : []), [shown]);

  const rings = useRef<{ refresh: () => void }[]>([]);
  useEffect(() => {
    const barNode = bar.current;
    const chipsNode = chips.current;
    if (!barNode || !chipsNode) return;
    const barRing = createRovingTabindex(barNode, { itemSelector: BAR_ITEMS });
    const chipRing = createRovingTabindex(chipsNode, { itemSelector: CHIP_ITEMS });
    const removal = createRemovalFocus(chipsNode, {
      fallback: () => barNode.querySelector<HTMLElement>("[data-part='add']") ?? null,
      itemSelector: CHIP_ITEMS,
    });
    rings.current = [barRing, chipRing];
    return () => {
      barRing.destroy();
      chipRing.destroy();
      removal.destroy();
      rings.current = [];
    };
  }, []);

  /* The rings read the DOM again after a chip, a pill or a control came or went. */
  useEffect(() => {
    for (const ring of rings.current) ring.refresh();
  });

  /* ── The bar's own line ──────────────────────────────────────────────── */

  /**
   * Before paint on mount, and on the microtask after anything in the frame
   * comes, goes or changes its text. A resize is read on the next frame instead:
   * the attribute changes the root's height, and a change made inside the
   * observer's own callback to a box it observes ends the browser's loop with
   * an error.
   */
  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    const barNode = bar.current;
    const frame = barNode?.parentElement;
    if (!element || !barNode || !frame) return;
    const measure = () => measureBarWrap(element, barNode);
    let pending = 0;
    const sizes =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            cancelAnimationFrame(pending);
            pending = requestAnimationFrame(measure);
          });
    sizes?.observe(element);
    sizes?.observe(barNode);
    const contents = new MutationObserver(measure);
    contents.observe(frame, { characterData: true, childList: true, subtree: true });
    measure();
    return () => {
      sizes?.disconnect();
      contents.disconnect();
      cancelAnimationFrame(pending);
    };
  }, []);

  /* ── Sticky ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    const element = root.current;
    if (!sticky || !element || typeof ResizeObserver === 'undefined') return;
    const parent = element.parentElement;
    const view = element.ownerDocument.defaultView;
    if (!parent || !view) return;
    /* What the parent declared inline before this bar added itself: put back
       before every read, so a second measure never sums the bar twice. */
    const declared = parent.style.getPropertyValue(STICKY_TOP);
    const restore = () =>
      declared
        ? parent.style.setProperty(STICKY_TOP, declared)
        : parent.style.removeProperty(STICKY_TOP);
    const publish = () => {
      restore();
      const above = view.getComputedStyle(parent).getPropertyValue(STICKY_TOP).trim() || '0px';
      const height = element.getBoundingClientRect().height;
      element.style.setProperty(STICKY_TOP, above);
      parent.style.setProperty(STICKY_TOP, `calc(${above} + ${height}px)`);
    };
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    publish();
    return () => {
      observer.disconnect();
      element.style.removeProperty(STICKY_TOP);
      restore();
    };
  }, [sticky]);

  /* ── Announce the count ──────────────────────────────────────────────── */

  const figure = (n: number) => new Intl.NumberFormat(locale).format(n);
  const countText =
    count === undefined
      ? null
      : total === undefined
        ? fill(labels.countOnly, { count: figure(count) })
        : fill(labels.count, { count: figure(count), total: figure(total) });

  useImperativeHandle(
    ref as never,
    () => ({
      focusSearch: () => search.current?.focus(),
      open: (path?: FilterPath) => {
        void path;
        requestOpen(true, 'programmatic');
      },
      get root() {
        return root.current;
      },
    }),
    [],
  );

  /* ── Rendering ───────────────────────────────────────────────────────── */

  const environment: RuleEnvironment = {
    apply: () => (apply === 'manual' ? submit() : undefined),
    fields,
    labels,
    renderOperand,
    size,
  };

  const pinned = fields.filter((field) => field.pinned || field.required);
  const pinnedKeys = new Set(pinned.map((field) => field.key));
  const activeCount = shown ? countActive(shown) : 0;

  /* A field the add menu chose and whose rule is not active yet: a chip with its editor open. */
  const [pending, setPending] = useState<string | null>(null);

  const chipNodes: { node: FilterNode; path: FilterPath }[] = [];
  firstLevel.forEach((node, index) => {
    if (isFilterGroup(node)) chipNodes.push({ node, path: [index] });
    else if (!pinnedKeys.has(node.field)) chipNodes.push({ node, path: [index] });
  });
  const pendingField = pending ? fieldByKey(fields, pending) : undefined;
  const unfiltered = fields.filter(
    (field) =>
      !pinnedKeys.has(field.key) &&
      ruleFor(shown, field.key) === undefined &&
      field.key !== pending,
  );
  const sections = new Map<string | undefined, FilterBarField[]>();
  for (const field of unfiltered) {
    const list = sections.get(field.section) ?? [];
    list.push(field);
    sections.set(field.section, list);
  }

  const folded = Math.max(0, chipNodes.length - chipLimit);

  const editorFor = (field: FilterBarField, current: FilterDescriptor | undefined) => (
    <RuleEditorPopoverBody
      apply={apply}
      current={current}
      environment={environment}
      field={field}
      invalid={invalid === field.key}
      labels={labels}
      onChange={(next) => {
        if (next === null) {
          if (field.required) {
            setInvalid(field.key);
            announce(fill(labels.required, { field: field.label }));
            return;
          }
          edit(withoutRuleFor(shown, field.key), 'clear');
          return;
        }
        setInvalid(null);
        const nextTree = withRuleFor(shown, field.key, next);
        edit(nextTree, 'keyboard');
        if (pending === field.key && isFilterActive(next)) setPending(null);
      }}
      onDone={() => {
        const rule = ruleFor(shown, field.key);
        if (rule && isFilterActive(rule)) {
          announce(`${field.label}: ${sentence(field, rule)}`);
        }
      }}
      queryDelay={queryDelay}
    />
  );

  const drawerDraft = useDrawerDraft(open, shown);

  return (
    <div
      aria-label={labels.bar}
      role="search"
      {...nativeProps}
      data-apply={apply}
      data-part="root"
      data-size={size}
      data-ui="filter-bar"
      ref={root}
      {...(disabled ? { 'data-disabled': '' } : {})}
      {...(loading ? { 'data-loading': '' } : {})}
      {...(dirty || presetDirty ? { 'data-dirty': '' } : {})}
      {...(open ? { 'data-open': '' } : {})}
      {...(sticky ? { 'data-sticky': '' } : {})}
    >
      <div data-part="frame">
        <div data-part="search">
          <TextField
            aria-label={labels.search}
            clearable
            disabled={disabled}
            end={shortcut ? <Kbd size="sm">{shortcut}</Kbd> : undefined}
            onKeyDown={onSearchKeyDown}
            onValueChange={(next, request) =>
              typeQuery(next, request.reason === 'clear' ? 'clear' : 'keyboard', request.source)
            }
            placeholder={labels.search}
            ref={search}
            size={size}
            start={
              <Icon>
                <Glyph name="search" />
              </Icon>
            }
            type="search"
            value={typed ?? shownQuery}
          />
        </div>

        <div aria-label={labels.filters} data-part="bar" ref={bar} role="toolbar">
          {pinned.map((field) => {
            const rule = ruleFor(shown, field.key);
            const active = rule !== undefined && isFilterActive(rule);
            return (
              <Popover key={field.key}>
                <PopoverTrigger
                  render={(props) => (
                    <button
                      {...props}
                      aria-haspopup="dialog"
                      data-field={field.key}
                      data-part="pill"
                      disabled={disabled}
                      type="button"
                      {...(active ? { 'data-filtered': '' } : {})}
                      {...(invalid === field.key
                        ? { 'data-invalid': '', 'aria-invalid': true }
                        : {})}
                    >
                      <span>{field.label}</span>
                      {active ? <span>{sentence(field, rule)}</span> : null}
                      <Icon>
                        <Glyph name="chevron-down" />
                      </Icon>
                    </button>
                  )}
                />
                <PopoverLayer>
                  <PopoverContent aria-label={field.label}>
                    <PopoverBody>{editorFor(field, rule)}</PopoverBody>
                  </PopoverContent>
                </PopoverLayer>
              </Popover>
            );
          })}

          <Menu>
            <MenuTrigger
              render={(props) => (
                <Button
                  {...(props as object)}
                  disabled={disabled || unfiltered.length === 0}
                  render={(inner) => <button {...inner} data-part="add" />}
                  size={size}
                  start={
                    <Icon>
                      <Glyph name="plus" />
                    </Icon>
                  }
                  tone="secondary"
                  variant="ghost"
                >
                  {labels.add}
                </Button>
              )}
            />
            <MenuContent aria-label={labels.add}>
              {[...sections.entries()].map(([section, list]) =>
                section === undefined ? (
                  list.map((field) => (
                    <MenuItem key={field.key} onSelect={() => setPending(field.key)}>
                      {field.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuGroup key={section} label={section}>
                    {list.map((field) => (
                      <MenuItem key={field.key} onSelect={() => setPending(field.key)}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </MenuGroup>
                ),
              )}
            </MenuContent>
          </Menu>

          {activeCount > 0 || shownQuery !== '' ? (
            <Button
              disabled={disabled}
              onClick={(event) => clearAll(event)}
              render={(props) => <button {...props} data-part="clear" />}
              size={size}
              tone="secondary"
              variant="ghost"
            >
              {labels.clear}
            </Button>
          ) : null}

          {apply === 'manual' ? (
            <div data-part="actions">
              <Button
                disabled={disabled || !dirty}
                onClick={reset}
                render={(props) => <button {...props} data-part="reset" />}
                size={size}
                tone="secondary"
                variant="ghost"
              >
                {labels.reset}
              </Button>
              <Button
                disabled={disabled || loading || !dirty}
                onClick={(event) => submit(event)}
                render={(props) => <button {...props} data-part="apply" />}
                size={size}
              >
                {labels.apply}
              </Button>
            </div>
          ) : null}

          <Button
            aria-haspopup="dialog"
            disabled={disabled}
            onClick={(event) => requestOpen(true, 'pointer', event)}
            render={(props) => <button {...props} data-part="summary" />}
            size={size}
            tone="secondary"
            variant="outline"
          >
            <span>{fill(labels.summary, { count: activeCount }).replace(/\s*\(.*$/, '')}</span>{' '}
            <span>{fill(labels.summary, { count: activeCount }).replace(/^[^(]*/, '')}</span>
          </Button>
        </div>

        <div data-part="end">
          {presets && presets.length > 0 ? (
            /* Clearable: leaving a preset is the control's own clear, and
               without it the one way out of a saved view is deleting it. */
            <div data-part="preset">
              <Select
                clearable
                disabled={disabled}
                items={presets.map((entry) => ({ label: entry.label, value: entry.key }))}
                onValueChange={(next, request) =>
                  choosePreset((next as string | null) ?? null, request.source)
                }
                size={size}
                value={preset}
              >
                <SelectTrigger aria-label={labels.preset}>
                  <SelectValue placeholder={labels.presetNone} />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((entry) => (
                    <SelectItem key={entry.key} value={entry.key}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {children}
        </div>

        {countText !== null || loading ? (
          <p aria-live="polite" data-part="count" {...(loading ? { 'aria-busy': true } : {})}>
            {loading ? (
              <span
                data-ui="spinner"
                data-part="root"
                data-size="sm"
                role="progressbar"
                aria-label={labels.filters}
              />
            ) : null}
            {countText}
          </p>
        ) : null}

        <div
          aria-label={labels.applied}
          data-part="chips"
          ref={chips}
          role="grid"
          {...(revealed ? { 'data-revealed': '' } : {})}
        >
          <div role="row" style={{ display: 'contents' }}>
            {chipNodes.map(({ node, path }, index) => {
              const foldedChip = index >= chipLimit;
              if (isFilterGroup(node)) {
                const sentence = describeFilterGroup(node, format);
                return (
                  <div
                    data-part="chip"
                    key={`group-${path.join('.')}`}
                    role="gridcell"
                    {...(foldedChip ? { 'data-folded': '' } : {})}
                  >
                    <TagButton
                      onClick={(event) => requestOpen(true, 'pointer', event)}
                      onRemove={(request) => removeNode(path, request.source)}
                      removeLabel={labels.remove}
                      size="sm"
                      title={sentence}
                    >
                      <span>({sentence})</span>
                    </TagButton>
                  </div>
                );
              }
              const field = fieldByKey(fields, node.field);
              const label = field?.label ?? node.field;
              const words = sentence(field, node.filter);
              const unknown = field === undefined;
              return (
                <div
                  data-part="chip"
                  key={node.field}
                  role="gridcell"
                  {...(foldedChip ? { 'data-folded': '' } : {})}
                  {...(unknown || invalid === node.field ? { 'data-invalid': '' } : {})}
                >
                  {unknown ? (
                    <TagButton
                      aria-label={`${fill(labels.unknownField, { field: node.field })}: ${words}`}
                      onRemove={(request) => removeField(node.field, request.source)}
                      removeLabel={labels.remove}
                      size="sm"
                      title={words}
                    >
                      <span>{label}</span> <span>{words}</span>
                    </TagButton>
                  ) : (
                    <Popover>
                      <PopoverTrigger
                        render={(props) => (
                          <TagButton
                            {...(props as object)}
                            aria-label={`${label}: ${words}`}
                            onRemove={(request) => removeField(node.field, request.source)}
                            removeLabel={labels.remove}
                            size="sm"
                            title={`${label}: ${words}`}
                          >
                            <span>{label}</span> <span>{words}</span>
                          </TagButton>
                        )}
                      />
                      <PopoverLayer>
                        <PopoverContent aria-label={label}>
                          <PopoverBody>{editorFor(field, node.filter)}</PopoverBody>
                        </PopoverContent>
                      </PopoverLayer>
                    </Popover>
                  )}
                </div>
              );
            })}
            {pendingField ? (
              <div data-part="chip" key={`pending-${pendingField.key}`} role="gridcell">
                <Popover
                  defaultOpen
                  onOpenChange={(next) => {
                    if (!next && !isFilterActive(ruleFor(shown, pendingField.key) ?? null))
                      setPending(null);
                  }}
                >
                  <PopoverTrigger
                    render={(props) => (
                      <TagButton {...(props as object)} aria-label={pendingField.label} size="sm">
                        <span>{pendingField.label}</span>
                      </TagButton>
                    )}
                  />
                  <PopoverLayer>
                    <PopoverContent aria-label={pendingField.label}>
                      <PopoverBody>
                        {editorFor(
                          pendingField,
                          ruleFor(shown, pendingField.key) ?? blankRule(pendingField),
                        )}
                      </PopoverBody>
                    </PopoverContent>
                  </PopoverLayer>
                </Popover>
              </div>
            ) : null}
            {folded > 0 ? (
              <button
                aria-expanded={revealed}
                data-part="more"
                onClick={(event) => requestRevealed(!revealed, 'pointer', event)}
                type="button"
              >
                {revealed ? labels.less : fill(labels.more, { count: folded })}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Drawer
        container={container}
        onOpenChange={(next, request) => {
          requestOpen(next, request.reason as FilterBarOpenReason, request.source);
        }}
        open={open}
        side="end"
        size="xl"
      >
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>{labels.builder}</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <DrawerBody>
            <div data-part="builder" data-ui="filter-bar" id={`${base}builder`}>
              <GroupEditor
                environment={{ ...environment, apply: () => commitDrawer() }}
                extra={
                  onPresetSave ? (
                    <Button
                      onClick={() => onPresetSave(normalizeFilterGroup(drawerDraft.value))}
                      render={(props) => <button {...props} data-part="save-preset" />}
                      size="sm"
                      tone="secondary"
                      variant="ghost"
                    >
                      {labels.savePreset}
                    </Button>
                  ) : null
                }
                firstField={fields[0]}
                group={drawerDraft.value ?? emptyFilterGroup()}
                onRootChange={(next) => drawerDraft.set(next)}
                path={[]}
                root={drawerDraft.value ?? emptyFilterGroup()}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button
              onClick={(event) => requestOpen(false, 'dismiss', event)}
              size="sm"
              tone="secondary"
              variant="ghost"
            >
              {labels.cancel}
            </Button>
            <Button onClick={() => commitDrawer()} size="sm">
              {labels.apply}
            </Button>
          </DrawerFooter>
        </DrawerPanel>
      </Drawer>
    </div>
  );

  function commitDrawer() {
    const next = drawerDraft.value;
    const lacking = missing(next);
    if (lacking.length > 0) {
      const first = lacking[0]!;
      setInvalid(first.key);
      announce(fill(labels.required, { field: first.label }));
      return;
    }
    setInvalid(null);
    edit(next, 'submit');
    const applied = normalizeFilterGroup(next);
    announce(
      applied
        ? fill(labels.appliedCount, { count: countActive(applied) }) +
            ': ' +
            describeFilterGroup(applied, format)
        : labels.cleared,
    );
    requestOpen(false, 'submit');
  }
}

/** The draft the drawer edits, taken from the tree each time it opens. */
function useDrawerDraft(open: boolean, shown: FilterGroup | null) {
  const [value, set] = useState<FilterGroup | null>(shown);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) set(shown);
    wasOpen.current = open;
  }, [open, shown]);
  return { set, value };
}

function countActive(group: FilterGroup): number {
  const active = normalizeFilterGroup(group);
  if (!active) return 0;
  let count = 0;
  const walk = (node: FilterNode) => {
    if (isFilterGroup(node)) node.rules.forEach(walk);
    else count += 1;
  };
  walk(active);
  return count;
}

interface RuleEditorPopoverBodyProps {
  apply: 'live' | 'manual';
  current: FilterDescriptor | undefined;
  environment: RuleEnvironment;
  field: FilterBarField;
  invalid: boolean;
  labels: FilterBarLabels;
  onChange: (next: FilterDescriptor | null) => void;
  onDone: () => void;
  queryDelay: number;
}

/**
 * One rule in a popover. Under `live` every change is requested at once — a
 * text operand after `queryDelay`, so a query does not fire per keystroke —
 * and Done closes; under `manual` the change goes to the draft the same way.
 * Clear removes the rule, which a required field refuses.
 */
function RuleEditorPopoverBody({
  current,
  environment,
  field,
  invalid,
  labels,
  onChange,
  onDone,
  queryDelay,
}: RuleEditorPopoverBodyProps) {
  const popover = usePopover();
  const close = () => popover.toggle(false, 'dismiss');
  const [local, setLocal] = useState<FilterDescriptor>(current ?? blankRule(field));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function change(next: FilterDescriptor) {
    setLocal(next);
    if (timer.current) clearTimeout(timer.current);
    const debounced = field.kind === 'text' || field.kind === 'number';
    if (!debounced || queryDelay === 0) {
      onChange(next);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      onChange(next);
    }, queryDelay);
  }

  function done() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      onChange(local);
    }
    onDone();
    close();
  }

  const condition = local.conditions[0] ?? { operator: field.defaultOperator ?? 'contains' };

  return (
    <div
      data-kind={field.kind}
      data-part="rule"
      data-ui="filter-bar"
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      <ConditionEditor
        condition={condition}
        environment={{ ...environment, apply: done }}
        field={field}
        onConditionChange={(next) => change({ ...local, conditions: [next] } as FilterDescriptor)}
      />
      <div data-part="actions">
        <Button
          disabled={field.required === true}
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setLocal(blankRule(field));
            onChange(null);
            close();
          }}
          size="sm"
          tone="secondary"
          variant="ghost"
        >
          {labels.clearRule}
        </Button>
        <Button onClick={done} size="sm">
          {labels.done}
        </Button>
      </div>
    </div>
  );
}
