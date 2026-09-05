import { moveIndex } from '@slotted/core/collection';
import type { MoveIntent } from '@slotted/core/collection';
import { createDismissableLayer } from '@slotted/core/dismissable-layer';
import type { DismissableLayerHandle } from '@slotted/core/dismissable-layer';
import { createPortalRoot } from '@slotted/core/portal';
import type { PortalRootHandle } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import type { PositionerHandle } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import { createTypeahead, isPrintable } from '@slotted/core/typeahead';
import type { TypeaheadHandle } from '@slotted/core/typeahead';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
  type EmbeddedViewRef,
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { SlField } from '@slotted/angular/field';

import { injectSelectDefaults } from './select-defaults';
import type {
  SelectAlign,
  SelectHighlightReason,
  SelectItems,
  SelectMount,
  SelectOpenReason,
  SelectOption,
  SelectOptionGroup,
  SelectOptionValue,
  SelectSelection,
  SelectSide,
  SelectSize,
  SelectStrategy,
  SelectValueReason,
  SelectVariant,
  SelectWidth,
} from './select-defaults';
import { SlSelectValue } from './select-value';

export * from './select-defaults';
export { SlSelectValue } from './select-value';

/** Where the highlight lands when the popup opens. */
type Entry = 'selected' | 'first' | 'last' | 'none';

const OPTION_SELECTOR = "[data-part='item']";

const isGroup = (entry: SelectItems[number]): entry is SelectOptionGroup => 'options' in entry;

const flatten = (items: SelectItems | undefined): readonly SelectOption[] =>
  items === undefined ? [] : items.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]));

/**
 * A control that shows the current choice and opens a listbox of the rest.
 *
 * **The host element is the control.** `sl-select` carries `data-ui` and the
 * frame's own `data-part`, and the button, the chevron, the clear button and
 * the hidden native `select` are its template — the same shape `text-field`
 * has, where the frame draws the border and the ring because a ring can only be
 * drawn by an ancestor of whatever took focus.
 *
 * **The popup is an `ng-template` built into the portal when it opens**, which
 * is how `sl-menu` is built and for the same reason: a surface that has to
 * escape its parent's clipping cannot be rendered where it was declared. It
 * also makes `mount` a real axis here — a hundred options are not constructed
 * until the popup is.
 *
 * **Focus never leaves the button.** The highlighted option is named by
 * `aria-activedescendant`, which is what the APG's own select-only combobox
 * example does and what this family's pair, `combobox`, has no choice about.
 */
@Component({
  selector: 'sl-select',
  standalone: true,
  exportAs: 'slSelect',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../styles/src/select/select.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SlSelect), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => SlSelect), multi: true },
  ],
  host: {
    'data-ui': 'select',
    'data-part': 'root',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-full-width]': "resolvedFullWidth() ? '' : null",
    '[attr.data-multiple]': "resolvedMultiple() ? '' : null",
    '[attr.data-open]': "isOpen() ? '' : null",
    '[attr.data-disabled]': "resolvedDisabled() ? '' : null",
    '[attr.data-readonly]': "resolvedReadOnly() ? '' : null",
    '[attr.data-invalid]': "resolvedInvalid() ? '' : null",
    '[attr.data-required]': "resolvedRequired() ? '' : null",
    '[attr.data-loading]': "loading() ? '' : null",
  },
  template: `
    <button
      #trigger
      type="button"
      role="combobox"
      data-part="trigger"
      aria-haspopup="listbox"
      [id]="triggerId"
      [disabled]="resolvedDisabled()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="isOpen() ? contentId : null"
      [attr.aria-activedescendant]="activeDescendant()"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-readonly]="resolvedReadOnly() ? true : null"
      [attr.aria-required]="resolvedRequired() ? true : null"
      [attr.aria-invalid]="resolvedInvalid() ? true : null"
      (click)="onTriggerClick($event)"
      (keydown)="onKeyDown($event)"
      (blur)="onBlur()"
    >
      <span
        data-part="value"
        [attr.data-placeholder]="selection().length === 0 ? '' : null"
        [attr.data-unmatched]="unmatched() ? '' : null"
      >
        @if (summaryTemplate(); as template) {
          <ng-container
            [ngTemplateOutlet]="template"
            [ngTemplateOutletContext]="{ $implicit: selection(), labels: labels() }"
          />
        } @else {
          {{ summary() }}
        }
      </span>
    </button>

    @if (showClear()) {
      <button
        type="button"
        data-part="clear"
        [attr.aria-label]="resolvedClearLabel()"
        (click)="onClear($event)"
      ></button>
    }
    <span data-part="arrow"></span>

    @if (name(); as submissionName) {
      <select
        aria-hidden="true"
        tabindex="-1"
        [name]="submissionName"
        [attr.form]="form() ?? null"
        [multiple]="resolvedMultiple()"
        [disabled]="resolvedDisabled()"
        [required]="resolvedRequired()"
        style="
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          padding: 0;
          border: 0;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        "
      >
        <option value=""></option>
        @for (held of selection(); track held) {
          <option [value]="held" selected>{{ labelFor(held) ?? held }}</option>
        }
      </select>
    }

    <ng-template #layer>
      <div
        data-ui="select"
        data-part="positioner"
        [attr.data-align]="resolvedAlign()"
        [attr.data-size]="resolvedSize()"
        [attr.data-width]="resolvedWidth()"
        [attr.data-open]="isOpen() ? '' : null"
        [attr.inert]="isOpen() ? null : ''"
      >
        <div
          #surface
          data-part="content"
          role="listbox"
          [id]="contentId"
          [attr.aria-labelledby]="ariaLabel() === undefined ? triggerId : null"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-multiselectable]="resolvedMultiple() ? true : null"
          [attr.aria-busy]="loading() ? true : null"
          [attr.data-loading]="loading() ? '' : null"
        >
          <ng-content />
          @if (loading()) {
            <div data-part="status" role="status" data-loading>{{ resolvedLoadingLabel() }}</div>
          } @else if (empty()) {
            <div data-part="empty">{{ resolvedEmptyLabel() }}</div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class SlSelect implements ControlValueAccessor, Validator {
  private static readonly flag = (given: boolean | string | undefined) =>
    given === undefined ? undefined : booleanAttribute(given);
  private static readonly count = (given: number | string | undefined) =>
    given === undefined ? undefined : numberAttribute(given);

  /** The chosen value, or the chosen values when `multiple` is set. */
  readonly value = model<SelectSelection>(null);
  readonly valueChangeRequest = output<ChangeRequest<SelectSelection>>();

  readonly open = model<boolean>(false);
  readonly openChangeRequest = output<ChangeRequest<boolean>>();

  /** The option the highlight is on, which is not the option that is chosen. */
  readonly highlightedValue = model<SelectOptionValue | null>(null);
  readonly highlightedValueChangeRequest = output<ChangeRequest<SelectOptionValue | null>>();

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly placeholder = input<string>('');
  readonly name = input<string | undefined>(undefined);
  readonly form = input<string | undefined>(undefined);
  /** Labels for values, so a closed control can name one it never rendered. */
  readonly items = input<SelectItems | undefined>(undefined);
  readonly total = input(undefined, { transform: SlSelect.count });

  readonly size = input<SelectSize | undefined>(undefined);
  readonly variant = input<SelectVariant | undefined>(undefined);
  readonly side = input<SelectSide | undefined>(undefined);
  readonly align = input<SelectAlign | undefined>(undefined);
  readonly width = input<SelectWidth | undefined>(undefined);
  readonly mount = input<SelectMount | undefined>(undefined);
  readonly strategy = input<SelectStrategy | undefined>(undefined);
  readonly clearLabel = input<string | undefined>(undefined);
  readonly emptyLabel = input<string | undefined>(undefined);
  readonly loadingLabel = input<string | undefined>(undefined);

  readonly sideOffset = input(undefined, { transform: SlSelect.count });
  readonly alignOffset = input(undefined, { transform: SlSelect.count });
  readonly collisionPadding = input(undefined, { transform: SlSelect.count });
  readonly typeaheadTimeout = input(undefined, { transform: SlSelect.count });

  readonly multiple = input(undefined, { transform: SlSelect.flag });
  readonly clearable = input(undefined, { transform: SlSelect.flag });
  readonly loop = input(undefined, { transform: SlSelect.flag });
  readonly typeahead = input(undefined, { transform: SlSelect.flag });
  readonly closeOnSelect = input(undefined, { transform: SlSelect.flag });
  readonly closeOnEscape = input(undefined, { transform: SlSelect.flag });
  readonly closeOnOutsidePress = input(undefined, { transform: SlSelect.flag });
  readonly flip = input(undefined, { transform: SlSelect.flag });
  readonly shift = input(undefined, { transform: SlSelect.flag });
  readonly hideWhenDetached = input(undefined, { transform: SlSelect.flag });
  readonly portal = input(undefined, { transform: SlSelect.flag });
  readonly fullWidth = input(undefined, { transform: SlSelect.flag });
  readonly disabled = input(undefined, { transform: SlSelect.flag });
  readonly readOnly = input(undefined, { transform: SlSelect.flag });
  readonly required = input(undefined, { transform: SlSelect.flag });
  readonly invalid = input(undefined, { transform: SlSelect.flag });
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly defaults = injectSelectDefaults();
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly template = viewChild.required<TemplateRef<unknown>>('layer');
  private readonly triggerRef = viewChild.required<{ nativeElement: HTMLButtonElement }>('trigger');
  /** The summary a consumer writes instead of the family's own. */
  readonly summaryTemplate = contentChild(SlSelectValue, { read: TemplateRef });

  /** The field around the control, whose state a bare input defers to. */
  readonly field = inject(SlField, { optional: true });

  private readonly identifier = Math.random().toString(36).slice(2, 8);
  readonly contentId = `sl-select-${this.identifier}`;
  readonly triggerId = `sl-select-trigger-${this.identifier}`;

  private readonly registry = signal(new Map<SelectOptionValue, string>());
  private readonly optionCount = signal(0);
  private entry: Entry = 'selected';
  private pending: string | null = null;
  private disabledByForm = signal<boolean | undefined>(undefined);

  private view: EmbeddedViewRef<unknown> | null = null;
  private layerNode: HTMLElement | null = null;
  private surfaceNode: HTMLElement | null = null;
  private portalRoot: PortalRootHandle | null = null;
  private positioner: PositionerHandle | null = null;
  private layer: DismissableLayerHandle | null = null;
  private presence: PresenceHandle | null = null;
  private typeaheadHandle: TypeaheadHandle | null = null;

  private readonly hostLabelledBy = inject(new HostAttributeToken('aria-labelledby'), {
    optional: true,
  });

  private onChange: (value: SelectSelection) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly resolvedSize = computed(() => this.size() ?? this.field?.size() ?? this.defaults.size);
  readonly resolvedVariant = computed(() => this.variant() ?? this.defaults.variant);
  readonly resolvedAlign = computed(() => this.align() ?? this.defaults.align);
  readonly resolvedSide = computed(() => this.side() ?? this.defaults.side);
  readonly resolvedWidth = computed(() => this.width() ?? this.defaults.width);
  readonly resolvedMount = computed(() => this.mount() ?? this.defaults.mount);
  readonly resolvedMultiple = computed(() => this.multiple() ?? this.defaults.multiple);
  readonly resolvedClearable = computed(() => this.clearable() ?? this.defaults.clearable);
  readonly resolvedLoop = computed(() => this.loop() ?? this.defaults.loop);
  readonly resolvedTypeahead = computed(() => this.typeahead() ?? this.defaults.typeahead);
  readonly resolvedCloseOnSelect = computed(
    () => this.closeOnSelect() ?? this.defaults.closeOnSelect,
  );
  readonly resolvedFullWidth = computed(() => this.fullWidth() ?? this.defaults.fullWidth);
  readonly resolvedClearLabel = computed(() => this.clearLabel() ?? this.defaults.clearLabel);
  readonly resolvedEmptyLabel = computed(() => this.emptyLabel() ?? this.defaults.emptyLabel);
  readonly resolvedLoadingLabel = computed(() => this.loadingLabel() ?? this.defaults.loadingLabel);

  /** Unset asks the field; a field that says nothing leaves the default. */
  readonly resolvedDisabled = computed(
    () =>
      this.disabled() ?? this.disabledByForm() ?? this.field?.disabled() ?? this.defaults.disabled,
  );
  readonly resolvedReadOnly = computed(
    () => this.readOnly() ?? this.field?.readOnly() ?? this.defaults.readOnly,
  );
  readonly resolvedRequired = computed(
    () => this.required() ?? this.field?.required() ?? this.defaults.required,
  );
  readonly resolvedInvalid = computed(
    () => this.invalid() ?? this.field?.invalid() ?? this.defaults.invalid,
  );

  readonly isOpen = computed(() => this.open() && !this.resolvedDisabled());

  /** One value, several, or none — always read as a list, whatever was given. */
  readonly selection = computed((): readonly SelectOptionValue[] => {
    const held = this.value();
    if (held === null || held === undefined) return [];
    return typeof held === 'string' ? [held] : held;
  });

  private readonly declared = computed(() => {
    const table = new Map<SelectOptionValue, string>();
    for (const option of flatten(this.items())) table.set(option.value, option.label);
    return table;
  });

  readonly labels = computed(() => this.selection().map((held) => this.labelFor(held) ?? held));

  readonly unmatched = computed(() =>
    this.selection().some((held) => this.labelFor(held) === undefined),
  );

  /** The first label, then how many more. A count alone names none of them. */
  readonly summary = computed(() => {
    const held = this.selection();
    if (held.length === 0) return this.placeholder();
    const first = this.labelFor(held[0] as string) ?? held[0];
    return held.length === 1 ? first : `${first} +${held.length - 1}`;
  });

  readonly showClear = computed(
    () =>
      this.resolvedClearable() &&
      this.selection().length > 0 &&
      !this.resolvedDisabled() &&
      !this.resolvedReadOnly(),
  );

  readonly empty = computed(() => this.optionCount() === 0);

  readonly activeDescendant = computed(() => {
    const held = this.highlightedValue();
    return this.isOpen() && held !== null ? this.optionId(held) : null;
  });

  readonly labelledBy = computed(() => {
    if (this.ariaLabel() !== undefined) return null;
    return this.hostLabelledBy ?? this.field?.ids().label ?? null;
  });

  readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const open = this.isOpen();
      untracked(() => (open ? this.show() : this.hide()));
    });

    afterNextRender(() => {
      if (this.resolvedMount() === 'eager' && !this.isOpen()) this.build();
    });

    destroyRef.onDestroy(() => this.teardown());
  }

  /** The element `aria-activedescendant` names, and the option carries. */
  optionId(value: SelectOptionValue): string {
    return `${this.contentId}-option-${encodeURIComponent(value)}`;
  }

  labelFor(value: SelectOptionValue): string | undefined {
    return this.declared().get(value) ?? this.registry().get(value);
  }

  /** An option hands over what it reads as, so the closed control can print it. */
  registerLabel(value: SelectOptionValue, label: string) {
    if (this.registry().get(value) === label) return;
    const next = new Map(this.registry());
    next.set(value, label);
    this.registry.set(next);
  }

  /** Options count themselves, so the popup knows whether it holds any. */
  recount() {
    this.optionCount.set(this.options().length);
  }

  options(): HTMLElement[] {
    return [...(this.surfaceNode?.querySelectorAll<HTMLElement>(OPTION_SELECTOR) ?? [])];
  }

  focus() {
    this.triggerRef().nativeElement.focus({ preventScroll: true });
  }

  scrollToKey(value: SelectOptionValue) {
    const option = this.options().find((candidate) => candidate.dataset['value'] === value);
    if (typeof option?.scrollIntoView === 'function') option.scrollIntoView({ block: 'nearest' });
  }

  /** Asks to open or close, and reports the reason before anything moves. */
  setOpen(next: boolean, reason: SelectOpenReason, source?: Event) {
    if (next === this.isOpen()) return;

    const state = createControllable<boolean>({
      initial: this.isOpen(),
      onRequest: (request) => this.openChangeRequest.emit(request),
    });
    if (!state.request(next, reason, source)) return;
    this.open.set(next);
    if (!next) {
      this.highlightedValue.set(null);
      this.entry = 'selected';
    }
  }

  setHighlighted(next: SelectOptionValue | null, reason: SelectHighlightReason, source?: Event) {
    if (next === this.highlightedValue()) return;

    const state = createControllable<SelectOptionValue | null>({
      initial: this.highlightedValue(),
      onRequest: (request) => this.highlightedValueChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) {
      this.highlightedValue.set(next);
      this.reveal(next);
    }
  }

  /** Takes an option, or takes it back when the select holds several. */
  toggle(value: SelectOptionValue, reason: SelectValueReason, source?: Event) {
    if (!this.resolvedMultiple()) {
      this.commit([value], reason, source);
      return;
    }
    const held = this.selection();
    this.commit(
      held.includes(value) ? held.filter((candidate) => candidate !== value) : [...held, value],
      reason,
      source,
    );
  }

  clear(reason: SelectValueReason, source?: Event) {
    this.commit([], reason, source);
  }

  private commit(next: readonly SelectOptionValue[], reason: SelectValueReason, source?: Event) {
    const held = this.selection();
    const same = next.length === held.length && next.every((value, index) => value === held[index]);
    if (same) return;

    const shaped: SelectSelection = this.resolvedMultiple() ? next : (next[0] ?? null);
    const state = createControllable<SelectSelection>({
      initial: this.resolvedMultiple() ? held : (held[0] ?? null),
      /* Membership was compared above; comparing the shaped values here would
         compare two fresh arrays by identity and call every request a change. */
      equals: () => false,
      onRequest: (request) => this.valueChangeRequest.emit(request),
    });
    if (!state.request(shaped, reason, source)) return;
    this.value.set(shaped);
    this.onChange(shaped);
    this.onTouched();
  }

  protected onTriggerClick(event: MouseEvent) {
    if (this.resolvedDisabled() || this.resolvedReadOnly()) return;
    this.entry = 'selected';
    this.setOpen(!this.isOpen(), 'pointer', event);
  }

  protected onClear(event: MouseEvent) {
    this.clear('clear', event);
    this.focus();
  }

  protected onBlur() {
    this.onTouched();
  }

  protected onKeyDown(event: KeyboardEvent) {
    if (this.resolvedDisabled() || this.resolvedReadOnly()) return;
    const alt = event.altKey;

    if (!this.isOpen()) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          return this.openWith(alt ? 'none' : 'selected', event);
        case 'ArrowUp':
          /* The example opens onto the first option; the last is the mirror of
             ArrowDown, and the contract records the departure. */
          event.preventDefault();
          return this.openWith('last', event);
        case 'Enter':
        case ' ':
          event.preventDefault();
          return this.openWith('selected', event);
        case 'Home':
          event.preventDefault();
          return this.openWith('first', event);
        case 'End':
          event.preventDefault();
          return this.openWith('last', event);
        default:
          break;
      }
      if (this.resolvedTypeahead() && !event.ctrlKey && !event.metaKey && !alt) {
        if (!isPrintable(event.key)) return;
        event.preventDefault();
        this.pending = event.key;
        this.openWith('none', event);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        return this.move('next', event);
      case 'ArrowUp':
        event.preventDefault();
        return alt ? this.commitHighlighted(event, true) : this.move('previous', event);
      case 'Home':
        event.preventDefault();
        return this.move('first', event);
      case 'End':
        event.preventDefault();
        return this.move('last', event);
      case 'PageDown':
        event.preventDefault();
        return this.move('pageDown', event);
      case 'PageUp':
        event.preventDefault();
        return this.move('pageUp', event);
      case 'Enter':
        event.preventDefault();
        return this.commitHighlighted(event, this.resolvedCloseOnSelect());
      case ' ':
        event.preventDefault();
        /* Multiple selection keeps the popup open on Space, which is the
           listbox pattern's recommended model. */
        return this.commitHighlighted(
          event,
          this.resolvedMultiple() ? false : this.resolvedCloseOnSelect(),
        );
      case 'Escape':
        event.preventDefault();
        return this.setOpen(false, 'escape', event);
      case 'Tab':
        /* Not prevented: the key commits and then does what Tab does, which the
           example states and notes differs from a native select. */
        return this.commitHighlighted(event, true);
      default:
        break;
    }

    const handle = this.typeaheadHandle;
    if (handle === null) return;
    if (event.ctrlKey || event.metaKey || alt) return;
    if (!isPrintable(event.key, handle.query.length > 0)) return;

    event.preventDefault();
    this.search(event.key, handle);
  }

  private openWith(entry: Entry, event: Event) {
    this.entry = entry;
    this.setOpen(true, 'keyboard', event);
  }

  private move(intent: MoveIntent, event: Event) {
    const list = this.options();
    if (list.length === 0) return;
    const held = this.highlightedValue();
    const index = moveIndex({
      enabled: list.map((option) => option.dataset['disabled'] === undefined),
      from: held === null ? -1 : list.findIndex((option) => option.dataset['value'] === held),
      intent,
      loop: this.resolvedLoop(),
    });
    if (index !== -1) this.setHighlighted(list[index]?.dataset['value'] ?? null, 'keyboard', event);
  }

  private commitHighlighted(event: Event, close: boolean) {
    const held = this.highlightedValue();
    if (held !== null) this.toggle(held, 'keyboard', event);
    if (close) this.setOpen(false, 'select', event);
  }

  /**
   * Typeahead searches the **enabled** options and only those. The arrows step
   * over a disabled option, so a typeahead that landed on one would let a
   * reader reach by typing a row the family then refuses to commit.
   */
  private search(character: string, handle: TypeaheadHandle) {
    const list = this.options().filter((option) => option.dataset['disabled'] === undefined);
    const labels = list.map(
      (option) =>
        option.dataset['textValue'] ??
        option.querySelector("[data-part='label']")?.textContent?.trim() ??
        '',
    );
    const held = this.highlightedValue();
    const from = held === null ? -1 : list.findIndex((option) => option.dataset['value'] === held);
    const index = handle.match(character, labels, from);
    if (index !== -1) this.setHighlighted(list[index]?.dataset['value'] ?? null, 'keyboard');
  }

  private reveal(value: SelectOptionValue | null) {
    if (value === null) return;
    this.scrollToKey(value);
  }

  private show() {
    this.build();
    this.position();
    this.bind();
    this.enter();
  }

  private build() {
    if (this.view !== null) {
      this.presence?.sync(this.isOpen());
      this.view.detectChanges();
      return;
    }

    this.portalRoot = createPortalRoot({
      origin: this.triggerRef().nativeElement,
      disabled: this.portal() === false,
    });

    this.view = this.viewContainer.createEmbeddedView(this.template());
    this.view.detectChanges();

    this.layerNode = this.view.rootNodes.find(
      (node: unknown): node is HTMLElement => node instanceof HTMLElement,
    ) as HTMLElement | null;
    this.surfaceNode = this.layerNode?.querySelector<HTMLElement>("[data-part='content']") ?? null;
    if (this.layerNode === null) return;

    this.portalRoot.container?.append(this.layerNode);
    this.presence = createPresence({ present: this.isOpen() });
    this.presence.setNode(this.layerNode);
    this.recount();
  }

  private position() {
    if (this.layerNode === null) return;
    this.positioner?.destroy();
    this.positioner = createPositioner(
      this.triggerRef().nativeElement.parentElement ?? this.triggerRef().nativeElement,
      this.layerNode,
      {
        align: this.resolvedAlign(),
        alignOffset: this.alignOffset() ?? this.defaults.alignOffset,
        boundaryPadding: this.collisionPadding() ?? this.defaults.collisionPadding,
        flip: this.flip() ?? this.defaults.flip,
        hideWhenDetached: this.hideWhenDetached() ?? this.defaults.hideWhenDetached,
        matchWidth: this.resolvedWidth() === 'anchor',
        shift: this.shift() ?? this.defaults.shift,
        side: this.resolvedSide(),
        sideOffset: this.sideOffset() ?? this.defaults.sideOffset,
        strategy: this.strategy() ?? this.defaults.strategy,
      },
    );
    void this.positioner.update();
  }

  private bind() {
    if (this.layerNode === null) return;

    /* The control is a branch, so pressing the trigger again toggles the popup
       instead of dismissing it and reopening it in one gesture. */
    this.layer = createDismissableLayer(this.layerNode, {
      branches: [this.triggerRef().nativeElement.parentElement].filter(
        (branch): branch is HTMLElement => branch !== null,
      ),
      escape: this.closeOnEscape() ?? this.defaults.closeOnEscape,
      focusOutside: false,
      modal: false,
      outsidePress: this.closeOnOutsidePress() ?? this.defaults.closeOnOutsidePress,
      scrollLock: false,
      onDismiss: (request) => {
        this.setOpen(
          false,
          request.reason === 'escape' ? 'escape' : 'outsidePress',
          request.source as Event | undefined,
        );
      },
    });

    if (this.resolvedTypeahead()) {
      this.typeaheadHandle = createTypeahead({
        timeout: this.typeaheadTimeout() ?? this.defaults.typeaheadTimeout,
      });
    }
  }

  /** Where the highlight lands as the popup opens. Nothing takes focus. */
  private enter() {
    this.recount();
    const list = this.options();
    if (list.length === 0) return;

    const character = this.pending;
    this.pending = null;
    if (character !== null && this.typeaheadHandle !== null) {
      this.search(character, this.typeaheadHandle);
      return;
    }

    if (this.entry === 'none') return;
    if (this.entry === 'selected') {
      const held = this.selection();
      const chosen = list.find(
        (option) =>
          held.includes(option.dataset['value'] ?? '') && option.dataset['disabled'] === undefined,
      );
      if (chosen !== undefined) {
        this.setHighlighted(chosen.dataset['value'] ?? null, 'keyboard');
        return;
      }
      this.move('first', new Event('keydown'));
      return;
    }
    this.move(this.entry, new Event('keydown'));
  }

  private hide() {
    this.unbind();
    if (this.resolvedMount() === 'active') this.teardown();
  }

  private unbind() {
    this.layer?.destroy();
    this.positioner?.destroy();
    this.typeaheadHandle?.destroy();
    this.layer = null;
    this.positioner = null;
    this.typeaheadHandle = null;
  }

  private teardown() {
    this.unbind();
    this.presence?.destroy();
    this.portalRoot?.release();
    this.layerNode?.remove();
    this.view?.destroy();

    this.presence = null;
    this.portalRoot = null;
    this.layerNode = null;
    this.surfaceNode = null;
    this.view = null;
  }

  writeValue(value: SelectSelection) {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: SelectSelection) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabledByForm.set(isDisabled);
  }

  /**
   * The one validity the family owns. `required` on a native `select` is
   * satisfied by any non-empty option, and the hidden element this control
   * carries always holds one — so the browser cannot answer the question and
   * the family answers it here.
   */
  validate(): ValidationErrors | null {
    if (!this.resolvedRequired()) return null;
    return this.selection().length === 0 ? { required: true } : null;
  }
}
