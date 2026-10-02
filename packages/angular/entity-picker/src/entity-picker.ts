import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import type { EmbeddedViewRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { injectLocale, injectMessages } from '@slotted/angular/i18n';
import { SlGlyph, SlIcon } from '@slotted/angular/icon';
import { SlAvatar } from '@slotted/angular/avatar';
import { SlField } from '@slotted/angular/field';
import { SlHighlight } from '@slotted/angular/highlight';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { moveIndex } from '@slotted/core/collection';
import type { MoveIntent } from '@slotted/core/collection';
import { createDismissableLayer, pressOrigin } from '@slotted/core/dismissable-layer';
import type { DismissableLayerHandle } from '@slotted/core/dismissable-layer';
import {
  CREATE_OPTION,
  RETRY_OPTION,
  createEntityCache,
  createEntityResolver,
  createEntitySearch,
  entityInitials,
  entityName,
  entityOptions,
  entityPickerKey,
  entitySections,
  localEntitySource,
  offersCreation,
} from '@slotted/core/entity-picker';
import type {
  Entity,
  EntityOption,
  EntityResolver,
  EntitySearchSession,
  EntitySearchState,
  EntitySource,
} from '@slotted/core/entity-picker';
import { createArrowNavigation, createRemovalFocus } from '@slotted/core/focus';
import type { ArrowNavigationHandle, RemovalFocusHandle } from '@slotted/core/focus';
import {
  entityPickerMessages,
  type EntityPickerMessages,
  type PartialMessages,
} from '@slotted/core/i18n';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createCollapse } from '@slotted/core/overflow';
import type { CollapseHandle } from '@slotted/core/overflow';
import { createPortalRoot } from '@slotted/core/portal';
import type { PortalRootHandle } from '@slotted/core/portal';
import { createPositioner } from '@slotted/core/positioner';
import type { PositionerHandle } from '@slotted/core/positioner';
import { createPresence } from '@slotted/core/presence';
import type { PresenceHandle } from '@slotted/core/presence';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';

import { injectEntityPickerDefaults } from './entity-picker-defaults';
import type {
  EntityPickerChipContext,
  EntityPickerHighlightReason,
  EntityPickerInputReason,
  EntityPickerMedia,
  EntityPickerOpenOn,
  EntityPickerOpenReason,
  EntityPickerOptionContext,
  EntityPickerOverflow,
  EntityPickerScope,
  EntityPickerScopeReason,
  EntityPickerSelectionMode,
  EntityPickerSide,
  EntityPickerSize,
  EntityPickerStrategy,
  EntityPickerValue,
  EntityPickerValueReason,
  EntityPickerValueRequest,
  EntityPickerVariant,
  EntityPickerWidth,
} from './entity-picker-defaults';

/** Replaces the content of an option; the face, the check and the row stay the family's. */
@Directive({ selector: 'ng-template[slEntityPickerOption]', standalone: true })
export class SlEntityPickerOption {
  readonly template = inject<TemplateRef<EntityPickerOptionContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: SlEntityPickerOption,
    context: unknown,
  ): context is EntityPickerOptionContext {
    return context !== null;
  }
}

/** Replaces the words of a chip; the face and the remove button stay the family's. */
@Directive({ selector: 'ng-template[slEntityPickerChip]', standalone: true })
export class SlEntityPickerChip {
  readonly template = inject<TemplateRef<EntityPickerChipContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: SlEntityPickerChip,
    context: unknown,
  ): context is EntityPickerChipContext {
    return context !== null;
  }
}

type Entry = 'selected' | 'first' | 'last' | 'keep';

const CHIP_SELECTOR = "[data-part='chips'] > [data-ui='tag']:not([data-count])";
const EMPTY: readonly Entity[] = [];

function idsOf(value: EntityPickerValue | undefined): readonly string[] {
  if (Array.isArray(value)) return value as readonly string[];
  return typeof value === 'string' ? [value] : [];
}

function sameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * A field that chooses records from a remote collection.
 *
 * The value is an id — or, with `selectionMode="multiple"`, an array of ids —
 * and every request to change it carries the records the family knows for
 * the new value. The search, the next page and the resolution of an id
 * nobody showed the family are `source`'s; the delay, the abort and the cache
 * are the family's, in `@slotted/core/entity-picker`, shared with React.
 *
 * The field is one line in a form: a chosen set collapses into a "+N" chip
 * whose records the popup lists first, and a scope stands in front of the
 * field, not above it.
 */
@Component({
  selector: 'sl-entity-picker',
  standalone: true,
  exportAs: 'slEntityPicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, SlAvatar, SlGlyph, SlHighlight, SlIcon, SlSelect, SlSelectItem],
  styleUrls: [
    '../../../styles/src/entity-picker/entity-picker.css',
    '../../../styles/src/tag/tag.css',
    '../../../styles/src/spinner/spinner.css',
    '../../../styles/src/skeleton/skeleton.css',
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SlEntityPicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => SlEntityPicker), multi: true },
  ],
  host: {
    'data-ui': 'entity-picker',
    'data-part': 'root',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-selection-mode]': 'selectionMode()',
    '[attr.data-overflow]': 'resolvedOverflow()',
    '[attr.data-full-width]': "resolvedFullWidth() ? '' : null",
    '[attr.data-open]': "isOpen() ? '' : null",
    '[attr.data-disabled]': "resolvedDisabled() ? '' : null",
    '[attr.data-readonly]': "resolvedReadOnly() ? '' : null",
    '[attr.data-invalid]': "resolvedInvalid() ? '' : null",
    '[attr.data-required]': "resolvedRequired() ? '' : null",
    '[attr.data-loading]': "busy() ? '' : null",
    '[attr.data-complete]': "complete() ? '' : null",
    '[attr.role]': "hasScopes() ? 'group' : null",
    '[attr.aria-labelledby]': 'hasScopes() ? (field?.ids()?.label ?? null) : null',
    '[attr.aria-label]': 'hasScopes() && !field ? (ariaLabel() ?? null) : null',
  },
  template: `
    @if (hasScopes()) {
      <div data-part="scope">
        <sl-select
          [value]="scope()"
          [items]="scopeItems()"
          [size]="resolvedSize()"
          [variant]="resolvedVariant()"
          [disabled]="resolvedDisabled() || resolvedReadOnly()"
          [aria-label]="t('scope')"
          (valueChangeRequest)="onScopeRequest($event)"
        >
          @for (item of scopes(); track item.id) {
            <sl-select-item [value]="item.id" [label]="item.label" />
          }
        </sl-select>
      </div>
    }
    <div data-part="control" #control>
      @if (showSelection(); as chosen) {
        <span data-part="selection" aria-hidden="true">
          <span
            slAvatar
            decorative
            size="xs"
            [name]="chosen.avatar?.name ?? chosen.label"
            [initials]="initials(chosen)"
            [src]="chosen.avatar?.src"
            [shape]="chosen.avatar?.shape ?? 'circle'"
            [locale]="resolvedLocale()"
          ></span>
        </span>
      }
      @if (multiple()) {
        <div data-part="values" role="grid" [attr.aria-label]="chipsLabel()">
          <div data-part="chips" role="row" #chips>
            @for (id of chosen(); track id) {
              <span
                data-ui="tag"
                data-part="root"
                data-size="sm"
                data-tone="secondary"
                role="gridcell"
                tabindex="-1"
                [attr.data-value]="id"
                [attr.data-variant]="record(id) ? 'soft' : 'outline'"
                [attr.data-loading]="resolution(id) === 'pending' ? '' : null"
                [attr.data-unresolved]="resolution(id) === 'missing' ? '' : null"
                [attr.data-disabled]="resolvedDisabled() ? '' : null"
                [attr.aria-busy]="resolution(id) === 'pending' ? true : null"
                [attr.aria-label]="chipName(id)"
                (keydown)="onChipKey(id, $event)"
              >
                <span data-part="body">
                  @if (resolvedMedia() === 'avatar' && record(id)?.avatar !== null) {
                    <span data-part="start">
                      @if (record(id); as entity) {
                        <span
                          slAvatar
                          decorative
                          size="xs"
                          [name]="entity.avatar?.name ?? entity.label"
                          [initials]="initials(entity)"
                          [src]="entity.avatar?.src"
                          [shape]="entity.avatar?.shape ?? 'circle'"
                          [locale]="resolvedLocale()"
                        ></span>
                      } @else if (resolution(id) === 'pending') {
                        <span
                          data-ui="skeleton"
                          data-part="root"
                          data-shape="circle"
                          data-size="xs"
                          data-loading
                          aria-hidden="true"
                        ></span>
                      } @else if (resolution(id) === 'missing') {
                        <span slIcon><svg slGlyph name="circle-alert"></svg></span>
                      }
                    </span>
                  }
                  <span data-part="label">
                    @if (resolution(id) === 'pending' && !record(id)) {
                      <span
                        data-ui="skeleton"
                        data-part="root"
                        data-shape="text"
                        data-loading
                        aria-hidden="true"
                      ></span>
                    } @else if (record(id) && chipTemplate(); as chip) {
                      <ng-container
                        [ngTemplateOutlet]="chip.template"
                        [ngTemplateOutletContext]="{ $implicit: record(id)! }"
                      />
                    } @else {
                      {{ record(id)?.label ?? t('unresolved') }}
                    }
                  </span>
                </span>
                @if (!resolvedReadOnly() && !resolvedDisabled()) {
                  <button
                    type="button"
                    data-part="remove"
                    tabindex="-1"
                    [attr.aria-label]="removeLabel(id)"
                    (click)="onRemoveClick(id, $event)"
                  >
                    <span slIcon><svg slGlyph name="x"></svg></span>
                  </button>
                }
              </span>
            }
            @if (collapsing()) {
              <span
                #count
                data-ui="tag"
                data-part="root"
                data-size="sm"
                data-tone="secondary"
                data-variant="outline"
                data-count
                role="gridcell"
                tabindex="-1"
                hidden
                [attr.aria-label]="moreLabel()"
                (click)="onCountClick($event)"
              >
                <span data-part="body">
                  <span data-part="label">{{ moreText() }}</span>
                </span>
              </span>
            }
            <span data-part="field" role="gridcell">
              <ng-container [ngTemplateOutlet]="field_" />
            </span>
          </div>
        </div>
      } @else {
        <ng-container [ngTemplateOutlet]="field_" />
      }
      @if (showClear()) {
        <button
          type="button"
          data-part="clear"
          [attr.aria-label]="t('clear')"
          (click)="onClear($event)"
        >
          <span slIcon><svg slGlyph name="x"></svg></span>
        </button>
      }
      <button
        type="button"
        tabindex="-1"
        data-part="trigger"
        [disabled]="resolvedDisabled()"
        [attr.aria-label]="t('trigger')"
        (click)="onToggle($event)"
      >
        @if (busy()) {
          <span data-part="busy" data-ui="spinner" aria-hidden="true"></span>
        } @else {
          <span data-part="arrow"
            ><span slIcon><svg slGlyph name="chevron-down"></svg></span
          ></span>
        }
      </button>
    </div>

    <ng-template #field_>
      <input
        #input
        type="text"
        role="combobox"
        data-part="input"
        autocomplete="off"
        aria-autocomplete="list"
        [id]="controlId()"
        [value]="inputValue()"
        [disabled]="resolvedDisabled()"
        [readOnly]="resolvedReadOnly()"
        [required]="resolvedRequired() && chosen().length === 0"
        [placeholder]="placeholder()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? contentId : null"
        [attr.aria-activedescendant]="activeDescendant()"
        [attr.aria-label]="ariaLabel() ?? null"
        [attr.aria-describedby]="field?.describedBy() ?? null"
        [attr.aria-readonly]="resolvedReadOnly() ? true : null"
        [attr.aria-invalid]="resolvedInvalid() ? true : null"
        [attr.aria-busy]="pendingSingle() ? true : null"
        (input)="onInput($event)"
        (click)="onInputClick($event)"
        (keydown)="onKeyDown($event)"
        (focus)="onFocus()"
        (blur)="onBlur($event)"
      />
    </ng-template>

    <ng-template #layer>
      <div
        data-ui="entity-picker"
        data-part="positioner"
        data-align="start"
        [attr.data-size]="resolvedSize()"
        [attr.data-width]="resolvedWidth()"
        [attr.data-open]="isOpen() && positioned() ? '' : null"
        [attr.inert]="isOpen() ? null : ''"
      >
        <div
          data-part="content"
          role="listbox"
          [id]="contentId"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-multiselectable]="multiple() ? true : null"
          [attr.aria-busy]="search().status === 'loading' ? true : null"
          [attr.data-loading]="refreshing() ? '' : null"
        >
          @if (!(failed() && search().items.length === 0)) {
            @for (section of sections().sections; track section.key) {
              @if (sections().headings) {
                <div
                  data-part="group"
                  role="group"
                  [attr.aria-labelledby]="contentId + '-' + section.key"
                >
                  <div data-part="group-label" [id]="contentId + '-' + section.key">
                    {{ section.label }}
                  </div>
                  @for (entity of section.entities; track entity.id) {
                    <ng-container
                      [ngTemplateOutlet]="row"
                      [ngTemplateOutletContext]="{ $implicit: entity }"
                    />
                  }
                </div>
              } @else {
                @for (entity of section.entities; track entity.id) {
                  <ng-container
                    [ngTemplateOutlet]="row"
                    [ngTemplateOutletContext]="{ $implicit: entity }"
                  />
                }
              }
            }
          }
          @if (firstPage() && search().indicator) {
            <div data-part="placeholder" aria-hidden="true">
              @for (row of [0, 1, 2]; track row) {
                <div>
                  <span
                    data-ui="skeleton"
                    data-part="root"
                    data-shape="circle"
                    data-size="xs"
                    data-loading
                  ></span>
                  <span data-ui="skeleton" data-part="root" data-shape="text" data-loading></span>
                  <span data-ui="skeleton" data-part="root" data-shape="text" data-loading></span>
                </div>
              }
            </div>
          }
          @if (search().loadingMore && search().indicator) {
            <div data-part="more" aria-hidden="true">
              <div>
                <span
                  data-ui="skeleton"
                  data-part="root"
                  data-shape="circle"
                  data-size="xs"
                  data-loading
                ></span>
                <span data-ui="skeleton" data-part="root" data-shape="text" data-loading></span>
                <span data-ui="skeleton" data-part="root" data-shape="text" data-loading></span>
              </div>
            </div>
          }
          <div data-sentinel></div>
          @if (offerCreate()) {
            <div
              role="option"
              data-part="item"
              data-create
              aria-selected="false"
              [attr.data-value]="CREATE"
              [id]="optionId(CREATE)"
              [attr.data-current]="highlightedValue() === CREATE ? '' : null"
              [attr.data-loading]="creating() ? '' : null"
              (pointerdown)="keepFocus($event)"
              (pointerenter)="setHighlighted(CREATE, 'pointer', $event)"
              (click)="activate(CREATE, 'pointer', $event)"
            >
              <span data-part="media" aria-hidden="true"
                ><span slIcon><svg slGlyph name="plus"></svg></span
              ></span>
              <span data-part="label">{{ createText() }}</span>
            </div>
          }
          @if (failed()) {
            <div data-part="error">
              <span slIcon><svg slGlyph name="circle-alert"></svg></span>{{ t('error') }}
            </div>
            <div
              role="option"
              data-part="item"
              data-retry
              aria-selected="false"
              [attr.data-value]="RETRY"
              [id]="optionId(RETRY)"
              [attr.data-current]="highlightedValue() === RETRY ? '' : null"
              (pointerdown)="keepFocus($event)"
              (pointerenter)="setHighlighted(RETRY, 'pointer', $event)"
              (click)="activate(RETRY, 'pointer', $event)"
            >
              <span data-part="media" aria-hidden="true"
                ><span slIcon><svg slGlyph name="rotate-ccw"></svg></span
              ></span>
              <span data-part="label">{{ t('retry') }}</span>
            </div>
          }
          @if (showEmpty()) {
            <div data-part="empty">{{ t('empty') }}</div>
          }
          <div data-part="status" role="status" aria-live="polite">{{ statusMessage() }}</div>
        </div>
      </div>
    </ng-template>

    <ng-template #row let-entity>
      <div
        role="option"
        data-part="item"
        [attr.data-value]="entity.id"
        [id]="optionId(entity.id)"
        [attr.aria-selected]="isChosen(entity.id)"
        [attr.aria-disabled]="isDisabled(entity) ? true : null"
        [attr.data-selected]="isChosen(entity.id) ? '' : null"
        [attr.data-current]="highlightedValue() === entity.id ? '' : null"
        [attr.data-disabled]="isDisabled(entity) ? '' : null"
        (pointerdown)="keepFocus($event)"
        (pointerenter)="onRowEnter(entity, $event)"
        (click)="onRowClick(entity, $event)"
      >
        @if (resolvedMedia() === 'avatar' && entity.avatar !== null) {
          <span data-part="media">
            <span
              slAvatar
              decorative
              size="xs"
              [name]="entity.avatar?.name ?? entity.label"
              [initials]="initials(entity)"
              [src]="entity.avatar?.src"
              [shape]="entity.avatar?.shape ?? 'circle'"
              [locale]="resolvedLocale()"
            ></span>
          </span>
        }
        @if (optionTemplate(); as custom) {
          <ng-container
            [ngTemplateOutlet]="custom.template"
            [ngTemplateOutletContext]="{
              $implicit: entity,
              query: query(),
              selected: isChosen(entity.id),
              current: highlightedValue() === entity.id,
              disabled: isDisabled(entity),
            }"
          />
        } @else {
          <span data-part="label">
            @if (resolvedHighlightMatch() && query() !== '') {
              <span
                slHighlight
                [text]="entity.label"
                [query]="query()"
                [locale]="resolvedLocale()"
              ></span>
            } @else {
              {{ entity.label }}
            }
          </span>
          @if (entity.description) {
            <span data-part="description">{{ entity.description }}</span>
          }
          @if (entity.meta) {
            <span data-part="meta">{{ entity.meta }}</span>
          }
        }
        <span data-part="indicator"
          ><span slIcon><svg slGlyph name="check"></svg></span
        ></span>
      </div>
    </ng-template>
  `,
})
export class SlEntityPicker implements ControlValueAccessor, Validator {
  protected readonly CREATE = CREATE_OPTION;
  protected readonly RETRY = RETRY_OPTION;

  private static readonly flag = (given: boolean | string | undefined) =>
    given === undefined ? undefined : booleanAttribute(given);
  private static readonly count = (given: number | string | undefined) =>
    given === undefined ? undefined : numberAttribute(given);

  // ── Inputs and models ──────────────────────────────────────────────────

  readonly selectionMode = input<EntityPickerSelectionMode>('single');
  readonly value = model<EntityPickerValue>(null);
  readonly valueChangeRequest = output<EntityPickerValueRequest>();
  readonly defaultValue = input<EntityPickerValue | undefined>(undefined);
  readonly inputValue = model<string>('');
  readonly inputValueChangeRequest = output<ChangeRequest<string>>();
  readonly open = model<boolean>(false);
  readonly openChangeRequest = output<ChangeRequest<boolean>>();
  readonly highlightedValue = model<string | null>(null);
  readonly highlightedValueChangeRequest = output<ChangeRequest<string | null>>();
  readonly scope = model<string | null>(null);
  readonly scopeChangeRequest = output<ChangeRequest<string | null>>();
  /** The reader asked to create what they typed. */
  readonly create = output<{ query: string; reason: EntityPickerValueReason }>();

  readonly source = input<EntitySource | undefined>(undefined);
  readonly items = input<readonly Entity[] | undefined>(undefined);
  readonly entities = input<readonly Entity[]>(EMPTY);
  readonly favorites = input<readonly Entity[]>(EMPTY);
  readonly recent = input<readonly Entity[]>(EMPTY);
  readonly scopes = input<readonly EntityPickerScope[]>([]);
  /**
   * Makes a record for what the reader typed. A record returned is chosen,
   * with reason `submit`; the `create` output fires either way.
   */
  readonly createEntity = input<
    ((query: string) => Entity | null | undefined | Promise<Entity | null | undefined>) | undefined
  >(undefined);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly placeholder = input<string>('');
  readonly name = input<string | undefined>(undefined);
  readonly form = input<string | undefined>(undefined);
  /** BCP 47, for the local filter and the mark. The language in force when absent. */
  readonly locale = input<string | undefined>(undefined);
  readonly max = input(undefined, { transform: SlEntityPicker.count });
  /**
   * Words laid over the catalog of the language in force, key by key: the
   * buttons, the sections, the chips, and the sentences the popup and the
   * announcer say.
   */
  readonly messages = input<PartialMessages<EntityPickerMessages> | undefined>(undefined);

  readonly size = input<EntityPickerSize | undefined>(undefined);
  readonly variant = input<EntityPickerVariant | undefined>(undefined);
  readonly media = input<EntityPickerMedia | undefined>(undefined);
  readonly overflow = input<EntityPickerOverflow | undefined>(undefined);
  /**
   * What opens the popup besides the trigger and the arrows. `input` (default): typing or a
   * press on the input; `focus`: every focus as well; `manual`: typing filters without opening.
   */
  readonly openOn = input<EntityPickerOpenOn | undefined>(undefined);
  readonly side = input<EntityPickerSide | undefined>(undefined);
  readonly width = input<EntityPickerWidth | undefined>(undefined);
  readonly strategy = input<EntityPickerStrategy | undefined>(undefined);
  readonly searchDelay = input(undefined, { transform: SlEntityPicker.count });
  readonly minQueryLength = input(undefined, { transform: SlEntityPicker.count });
  readonly clearable = input(undefined, { transform: SlEntityPicker.flag });
  readonly loop = input(undefined, { transform: SlEntityPicker.flag });
  readonly highlightMatch = input(undefined, { transform: SlEntityPicker.flag });
  readonly portal = input(undefined, { transform: SlEntityPicker.flag });
  readonly fullWidth = input(undefined, { transform: SlEntityPicker.flag });
  readonly disabled = input(undefined, { transform: SlEntityPicker.flag });
  readonly readOnly = input(undefined, { transform: SlEntityPicker.flag });
  readonly required = input(undefined, { transform: SlEntityPicker.flag });
  readonly invalid = input(undefined, { transform: SlEntityPicker.flag });

  protected readonly optionTemplate = contentChild(SlEntityPickerOption);
  protected readonly chipTemplate = contentChild(SlEntityPickerChip);

  // ── Wiring ─────────────────────────────────────────────────────────────

  private readonly defaults = injectEntityPickerDefaults();
  readonly field = inject(SlField, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly hostId = inject(new HostAttributeToken('id'), { optional: true });
  private readonly layerTemplate = viewChild.required<TemplateRef<unknown>>('layer');
  private readonly controlRef = viewChild.required<ElementRef<HTMLDivElement>>('control');
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly chipsRef = viewChild<ElementRef<HTMLDivElement>>('chips');
  private readonly countRef = viewChild<ElementRef<HTMLSpanElement>>('count');

  private readonly identifier = Math.random().toString(36).slice(2, 8);
  readonly contentId = `sl-entity-picker-${this.identifier}`;
  private readonly ownId = `sl-entity-picker-input-${this.identifier}`;

  private readonly cache = createEntityCache();
  private readonly version = signal(0);
  private readonly searchState = signal<EntitySearchState | null>(null);
  private readonly typed = signal(false);
  protected readonly positioned = signal(false);
  protected readonly creating = signal(false);
  private readonly collapsedCount = signal(0);
  private readonly disabledByForm = signal<boolean | undefined>(undefined);
  private entry: Entry = 'keep';
  private readonly sessionConfig = { delay: 250, minQueryLength: 0 };
  private seeded = false;

  private readonly session: EntitySearchSession;
  private readonly resolver: EntityResolver;

  private view: EmbeddedViewRef<unknown> | null = null;
  private layerNode: HTMLElement | null = null;
  private surfaceNode: HTMLElement | null = null;
  private portalRoot: PortalRootHandle | null = null;
  private positionerHandle: PositionerHandle | null = null;
  private layer: DismissableLayerHandle | null = null;
  private presence: PresenceHandle | null = null;
  private observer: IntersectionObserver | null = null;
  private navigation: ArrowNavigationHandle | null = null;
  private removal: RemovalFocusHandle | null = null;
  private collapse: CollapseHandle | null = null;

  private onChange: (value: EntityPickerValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ── Resolution ─────────────────────────────────────────────────────────

  /** The family's words in the language in force, with this picker's `messages` laid over them. */
  readonly t = injectMessages(entityPickerMessages, this.messages);
  private readonly inForceLocale = injectLocale();
  /** The locale the local filter and the mark compare in: the `locale` input, or the language in force. */
  readonly resolvedLocale = computed(() => this.locale() ?? this.inForceLocale());
  readonly multiple = computed(() => this.selectionMode() === 'multiple');
  readonly resolvedSize = computed(() => this.size() ?? this.field?.size() ?? this.defaults.size);
  readonly resolvedVariant = computed(() => this.variant() ?? this.defaults.variant);
  readonly resolvedMedia = computed(() => this.media() ?? this.defaults.media);
  readonly resolvedOverflow = computed(() => this.overflow() ?? this.defaults.overflow);
  readonly resolvedOpenOn = computed(() => this.openOn() ?? this.defaults.openOn);
  readonly resolvedWidth = computed(() => this.width() ?? this.defaults.width);
  readonly resolvedFullWidth = computed(() => this.fullWidth() ?? this.defaults.fullWidth);
  readonly resolvedHighlightMatch = computed(
    () => this.highlightMatch() ?? this.defaults.highlightMatch,
  );
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
  private readonly resolvedMinQuery = computed(
    () => this.minQueryLength() ?? this.defaults.minQueryLength,
  );
  private readonly resolvedSource = computed<EntitySource>(
    () =>
      this.source() ?? localEntitySource(this.items() ?? EMPTY, { locale: this.resolvedLocale() }),
  );

  readonly hasScopes = computed(() => this.scopes().length > 0);
  /** The labels the select shows before its options are built. */
  protected readonly scopeItems = computed(() =>
    this.scopes().map((item) => ({ value: item.id, label: item.label })),
  );
  readonly isOpen = computed(() => this.open() && !this.resolvedDisabled());
  readonly controlId = computed(() => this.hostId ?? this.field?.ids().control ?? this.ownId);
  readonly chosen = computed(() => idsOf(this.value()));
  readonly collapsing = computed(() => this.multiple() && this.resolvedOverflow() === 'collapse');
  readonly maxResolved = computed(() => (this.multiple() ? (this.max() ?? null) : null));
  readonly complete = computed(() => {
    const max = this.maxResolved();
    return max !== null && this.chosen().length >= max;
  });

  readonly query = computed(() =>
    this.multiple() ? this.inputValue() : this.typed() ? this.inputValue() : '',
  );

  readonly search = computed<EntitySearchState>(() => this.searchState() ?? this.session.state);

  readonly sections = computed(() => {
    this.version();
    const search = this.search();
    const results = search.answered || search.status === 'loading' ? search.items : EMPTY;
    return entitySections({
      query: this.query(),
      scope: this.scope(),
      chosen: this.multiple() ? this.cache.pick(this.chosen()) : EMPTY,
      favorites: this.favorites(),
      recent: this.recent(),
      results: search.status === 'error' || search.status === 'short' ? search.items : results,
      searchedEmpty: this.resolvedMinQuery() === 0,
      labels: {
        chosen: this.t('chosen'),
        favorites: this.t('favorites'),
        recent: this.t('recent'),
        results: this.t('results'),
      },
    });
  });

  readonly offerCreate = computed(
    () =>
      !this.creating() &&
      offersCreation({
        enabled: this.createEntity() !== undefined,
        query: this.query(),
        answered: this.search().status === 'ready',
        results: this.search().items,
        locale: this.resolvedLocale(),
      }),
  );

  readonly failed = computed(() => this.search().status === 'error');
  readonly firstPage = computed(
    () => this.search().status === 'loading' && this.search().items.length === 0,
  );
  readonly refreshing = computed(
    () =>
      this.search().status === 'loading' &&
      this.search().items.length > 0 &&
      this.search().indicator,
  );

  private readonly blocked = computed(() => {
    if (!this.complete()) return undefined;
    const chosen = new Set(this.chosen());
    return new Set(
      this.sections()
        .sections.flatMap((section) => section.entities)
        .map((entity) => entity.id)
        .filter((id) => !chosen.has(id)),
    );
  });

  readonly options = computed<readonly EntityOption[]>(() => {
    const blocked = this.blocked();
    const records = entityOptions({
      sections: this.sections().sections,
      create: this.offerCreate(),
      ...(blocked === undefined ? {} : { blocked }),
    });
    return this.failed()
      ? [
          ...records.filter((option) => option.key !== CREATE_OPTION),
          { key: RETRY_OPTION, disabled: false },
        ]
      : records;
  });

  readonly showEmpty = computed(() => {
    const records = this.options().filter(
      (option) => option.key !== CREATE_OPTION && option.key !== RETRY_OPTION,
    ).length;
    const status = this.search().status;
    return (
      records === 0 &&
      !this.offerCreate() &&
      !this.failed() &&
      !this.firstPage() &&
      status !== 'waiting' &&
      status !== 'short'
    );
  });

  readonly statusMessage = computed(() => {
    const search = this.search();
    if (search.status === 'short') {
      return this.t('minQuery', { count: this.resolvedMinQuery() });
    }
    if (search.status === 'error') return '';
    if (search.indicator && (this.firstPage() || search.loadingMore)) return this.t('loading');
    if (search.status === 'ready' && this.query() !== '') {
      return this.t('count', { count: search.total ?? search.items.length });
    }
    return '';
  });

  readonly activeDescendant = computed(() => {
    const held = this.highlightedValue();
    return this.isOpen() && held !== null ? this.optionId(held) : null;
  });

  readonly pendingSingle = computed(() => {
    this.version();
    const first = this.chosen()[0];
    return !this.multiple() && first !== undefined && this.resolver.status(first) === 'pending';
  });

  readonly busy = computed(() => this.search().indicator || this.pendingSingle());

  readonly showClear = computed(
    () =>
      (this.clearable() ?? this.defaults.clearable) &&
      !this.resolvedDisabled() &&
      !this.resolvedReadOnly() &&
      (this.chosen().length > 0 || this.inputValue() !== ''),
  );

  readonly showSelection = computed(() => {
    this.version();
    if (this.multiple() || this.resolvedMedia() !== 'avatar') return null;
    const first = this.chosen()[0];
    const entity = first === undefined ? undefined : this.cache.get(first);
    if (entity === undefined || entity.avatar === null) return null;
    return this.inputValue() === entity.label ? entity : null;
  });

  readonly chipsLabel = computed(() =>
    this.t('chips', {
      label: this.ariaLabel() ?? '',
      count: this.chosen().length,
    }).replace(/^, /, ''),
  );

  readonly moreText = computed(() => this.t('more', { count: Math.max(this.collapsedCount(), 1) }));
  readonly moreLabel = computed(() =>
    this.t('moreLabel', { count: Math.max(this.collapsedCount(), 1) }),
  );
  readonly createText = computed(() => this.t('create', { query: this.query().trim() }));

  constructor() {
    const destroyRef = inject(DestroyRef);

    /* The session is made before the inputs exist; it reads these two numbers
       at the time of each search, and `runSearch` writes them first. */
    const config = this.sessionConfig;
    this.session = createEntitySearch({
      source: {
        search: (request, options) => this.resolvedSource().search(request, options),
      },
      get delay() {
        return config.delay;
      },
      get minQueryLength() {
        return config.minQueryLength;
      },
      onChange: (state) => this.searchState.set(state),
      onResults: (found) => this.cache.remember(found),
    });

    this.resolver = createEntityResolver({
      source: {
        search: (request, options) => this.resolvedSource().search(request, options),
        resolve: (ids, options) => {
          const source = this.resolvedSource();
          return source.resolve === undefined
            ? Promise.reject(new Error('no resolve'))
            : source.resolve(ids, options);
        },
      },
      cache: this.cache,
      onChange: () => this.version.update((count) => count + 1),
    });

    /* What the application hands over is known before anything is asked. */
    effect(() => {
      this.cache.remember(this.entities());
      this.cache.remember(this.favorites());
      this.cache.remember(this.recent());
      untracked(() => this.version.update((count) => count + 1));
    });

    /* An id nobody showed the family is asked for once. */
    effect(() => {
      const ids = this.chosen();
      this.version();
      untracked(() => this.resolver.require(ids));
    });

    /* In single, the field reads the chosen name whenever the reader is not typing. */
    effect(() => {
      this.version();
      if (this.multiple() || this.typed()) return;
      const first = this.chosen()[0];
      const name = first === undefined ? '' : (this.cache.get(first)?.label ?? '');
      untracked(() => {
        if (this.inputValue() !== name) this.inputValue.set(name);
      });
    });

    /* The search follows the open popup, the query and the scope. */
    effect(() => {
      if (!this.isOpen()) return;
      const query = this.query();
      const scope = this.scope();
      untracked(() => this.runSearch(query, scope));
    });

    effect(() => {
      const open = this.isOpen();
      untracked(() => (open ? this.show() : this.hide()));
    });

    /* Where the highlight lands as the list changes. */
    effect(() => {
      const options = this.options();
      if (!this.isOpen()) return;
      untracked(() => this.placeHighlight(options));
    });

    /* The failure is said once, by the announcer. */
    effect(() => {
      if (!this.failed() || !this.isOpen()) return;
      untracked(() => this.announce(this.t('error')));
    });

    afterRenderEffect(() => {
      this.chosen();
      this.version();
      this.collapse?.refresh();
      this.observeEnd();
    });

    afterNextRender(() => this.wireChips());

    destroyRef.onDestroy(() => {
      this.session.dispose();
      this.resolver.dispose();
      this.navigation?.destroy();
      this.removal?.destroy();
      this.collapse?.destroy();
      this.teardown();
    });
  }

  ngOnInit() {
    const seed = this.defaultValue();
    if (seed !== undefined && !this.seeded && this.chosen().length === 0) {
      this.seeded = true;
      this.value.set(this.multiple() ? idsOf(seed) : (idsOf(seed)[0] ?? null));
    }
  }

  // ── Reading ────────────────────────────────────────────────────────────

  optionId(key: string): string {
    return `${this.contentId}-option-${encodeURIComponent(key)}`;
  }

  protected record(id: string): Entity | undefined {
    this.version();
    return this.cache.get(id);
  }

  protected resolution(id: string) {
    this.version();
    return this.resolver.status(id);
  }

  protected initials(entity: Entity) {
    return entityInitials(entity);
  }

  protected chipName(id: string) {
    const entity = this.record(id);
    if (entity !== undefined) return entityName(entity);
    return this.resolution(id) === 'missing'
      ? this.t('unresolvedChip', { id })
      : this.t('loadingChip', { id });
  }

  protected removeLabel(id: string) {
    return this.t('remove', {
      label: this.record(id)?.label ?? this.t('unresolved'),
    });
  }

  protected isChosen(id: string) {
    return this.chosen().includes(id);
  }

  protected isDisabled(entity: Entity) {
    return entity.disabled === true || this.blocked()?.has(entity.id) === true;
  }

  // ── Imperative ─────────────────────────────────────────────────────────

  focus() {
    this.inputRef()?.nativeElement.focus({ preventScroll: true });
  }

  /** Asks the source again for the current query. */
  refresh() {
    this.session.refresh();
  }

  // ── Requests ───────────────────────────────────────────────────────────

  setOpen(next: boolean, reason: EntityPickerOpenReason, source?: Event) {
    if (next === this.isOpen()) return;
    const state = createControllable<boolean>({
      initial: this.isOpen(),
      onRequest: (request) => this.openChangeRequest.emit(request),
    });
    if (!state.request(next, reason, source)) return;
    this.open.set(next);
    if (!next) {
      this.highlightedValue.set(null);
      this.entry = 'keep';
    }
  }

  setHighlighted(next: string | null, reason: EntityPickerHighlightReason, source?: Event) {
    if (next === this.highlightedValue()) return;
    const state = createControllable<string | null>({
      initial: this.highlightedValue(),
      onRequest: (request) => this.highlightedValueChangeRequest.emit(request),
    });
    if (!state.request(next, reason, source)) return;
    this.highlightedValue.set(next);
    if (next !== null) {
      const option = this.surfaceNode?.ownerDocument.getElementById(this.optionId(next));
      if (typeof option?.scrollIntoView === 'function') option.scrollIntoView({ block: 'nearest' });
    }
  }

  private setInput(next: string, reason: EntityPickerInputReason, source?: Event) {
    if (next === this.inputValue()) return;
    const state = createControllable<string>({
      initial: this.inputValue(),
      onRequest: (request) => this.inputValueChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.inputValue.set(next);
  }

  private requestIds(next: readonly string[], reason: EntityPickerValueReason, source?: Event) {
    const before = this.chosen();
    if (sameIds(before, next)) return false;
    const toValue = (ids: readonly string[]): EntityPickerValue =>
      this.multiple() ? ids : (ids[0] ?? null);
    const state = createControllable<EntityPickerValue>({
      initial: toValue(before),
      equals: (a, b) => sameIds(idsOf(a), idsOf(b)),
      onRequest: (request) =>
        this.valueChangeRequest.emit(
          Object.assign(request, { entities: this.cache.pick(next) }) as EntityPickerValueRequest,
        ),
    });
    if (!state.request(toValue(next), reason, source)) return false;
    this.value.set(toValue(next));
    this.onChange(toValue(next));
    this.onTouched();
    return true;
  }

  private setScope(next: string | null, reason: EntityPickerScopeReason, source?: Event) {
    if (next === this.scope()) return;
    const state = createControllable<string | null>({
      initial: this.scope(),
      onRequest: (request) => this.scopeChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.scope.set(next);
  }

  private announce(message: string) {
    getLiveAnnouncer(this.host.nativeElement.ownerDocument).announce(message, { repeat: true });
  }

  private labelOf(id: string | undefined) {
    return id === undefined ? '' : (this.cache.get(id)?.label ?? '');
  }

  private runSearch(query: string, scope: string | null) {
    this.sessionConfig.delay = this.searchDelay() ?? this.defaults.searchDelay;
    this.sessionConfig.minQueryLength = this.resolvedMinQuery();
    this.session.search({ query, scope, selected: this.chosen() });
  }

  activate(key: string, reason: EntityPickerValueReason, source?: Event) {
    if (key === RETRY_OPTION) {
      this.session.retry();
      this.focus();
      return;
    }
    if (key === CREATE_OPTION) {
      this.makeEntity(reason, source);
      if (!this.multiple()) this.setOpen(false, 'select', source);
      this.focus();
      return;
    }
    const entity = this.cache.get(key);
    if (entity?.disabled === true || this.blocked()?.has(key) === true) return;
    if (this.multiple()) {
      this.toggle(key, reason, source);
      return;
    }
    this.requestIds([key], reason, source);
    this.typed.set(false);
    this.setInput(this.labelOf(key), 'select', source);
    this.setOpen(false, 'select', source);
  }

  private toggle(id: string, reason: EntityPickerValueReason, source?: Event) {
    const chosen = this.chosen();
    if (chosen.includes(id)) {
      const next = chosen.filter((item) => item !== id);
      if (this.requestIds(next, reason, source)) {
        this.announce(this.t('removed', { label: this.labelOf(id), count: next.length }));
      }
    } else {
      const max = this.maxResolved();
      if (max !== null && chosen.length >= max) return;
      const next = [...chosen, id];
      if (this.requestIds(next, reason, source)) {
        this.announce(this.t('added', { label: this.labelOf(id), count: next.length }));
        if (max !== null && next.length === max) {
          this.announce(this.t('complete', { max }));
        }
      }
    }
    this.setInput('', 'select', source);
  }

  remove(id: string, source?: Event) {
    const next = this.chosen().filter((item) => item !== id);
    if (this.requestIds(next, 'remove', source)) {
      this.announce(
        this.t('removed', {
          label: this.labelOf(id) || this.t('unresolved'),
          count: next.length,
        }),
      );
    }
  }

  clear(source?: Event) {
    this.requestIds([], 'clear', source);
    this.typed.set(false);
    this.setInput('', 'clear', source);
  }

  private makeEntity(reason: EntityPickerValueReason, source?: Event) {
    const text = this.inputValue().trim();
    if (text === '') return;
    this.create.emit({ query: text, reason });
    const maker = this.createEntity();
    if (maker === undefined) return;
    const adopt = (made: Entity | null | undefined) => {
      this.creating.set(false);
      if (made === null || made === undefined) return;
      this.cache.remember([made]);
      this.version.update((count) => count + 1);
      if (this.multiple()) {
        const chosen = this.chosen();
        if (!chosen.includes(made.id)) {
          this.requestIds([...chosen, made.id], 'submit', source);
          this.announce(this.t('added', { label: made.label, count: chosen.length + 1 }));
        }
        this.setInput('', 'select', source);
      } else {
        this.requestIds([made.id], 'submit', source);
        this.typed.set(false);
        this.setInput(made.label, 'select', source);
      }
    };
    const result = maker(text);
    if (result instanceof Promise) {
      this.creating.set(true);
      result.then(adopt, () => this.creating.set(false));
    } else {
      adopt(result);
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────

  protected onInput(event: Event) {
    const next = (event.target as HTMLInputElement).value;
    this.typed.set(true);
    this.setInput(next, 'keyboard', event);
    if (!this.isOpen() && !this.resolvedReadOnly() && this.resolvedOpenOn() !== 'manual') {
      this.entry = 'keep';
      this.setOpen(true, 'keyboard', event);
    }
  }

  protected onFocus() {
    if (this.resolvedOpenOn() !== 'focus' || this.resolvedReadOnly() || this.isOpen()) return;
    this.entry = this.multiple() ? 'keep' : 'selected';
    this.setOpen(true, 'keyboard');
  }

  protected onInputClick(event: MouseEvent) {
    if (
      event.defaultPrevented ||
      this.resolvedOpenOn() === 'manual' ||
      this.resolvedDisabled() ||
      this.resolvedReadOnly() ||
      this.isOpen()
    ) {
      return;
    }
    this.entry = this.multiple() ? 'keep' : 'selected';
    this.setOpen(true, 'pointer', event);
  }

  protected onBlur(event: FocusEvent) {
    this.onTouched();
    const next = event.relatedTarget;
    const control = this.controlRef().nativeElement;
    if (next instanceof Node && (this.surfaceNode?.contains(next) || control.contains(next)))
      return;
    const began = pressOrigin(control.ownerDocument);
    if (began instanceof Node && this.surfaceNode?.contains(began) === true) return;
    this.settle(event);
    if (this.isOpen()) this.setOpen(false, 'blur', event);
  }

  /** Text that is not the chosen name goes back to it; an emptied field clears the choice. */
  private settle(source?: Event) {
    if (this.multiple() || !this.typed()) return;
    if (this.inputValue().trim() === '') {
      if (this.chosen().length > 0) this.requestIds([], 'clear', source);
      this.typed.set(false);
      return;
    }
    this.typed.set(false);
    this.setInput(this.labelOf(this.chosen()[0]), 'blur', source);
  }

  protected onKeyDown(event: KeyboardEvent) {
    if (this.resolvedDisabled()) return;
    const input = event.target as HTMLInputElement;
    const action = entityPickerKey({
      key: event.key,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      composing: event.isComposing,
      open: this.isOpen(),
      selectionMode: this.selectionMode(),
      readOnly: this.resolvedReadOnly(),
      highlighted: this.highlightedValue() !== null,
      empty: input.value === '',
      caretAtStart: input.selectionStart === 0 && input.selectionEnd === 0,
      chips: this.chosen().length,
      dir: getComputedStyle(input).direction === 'rtl' ? 'rtl' : 'ltr',
    });

    switch (action.type) {
      case 'none':
        if (event.key === 'Tab' && this.isOpen()) this.setOpen(false, 'blur', event);
        return;
      case 'open':
        event.preventDefault();
        this.entry = action.highlight;
        this.setOpen(true, 'keyboard', event);
        return;
      case 'close':
        event.preventDefault();
        this.setOpen(false, action.reason, event);
        return;
      case 'move':
        event.preventDefault();
        this.move(action.intent, event);
        return;
      case 'activate': {
        event.preventDefault();
        const held = this.highlightedValue();
        if (held !== null) this.activate(held, 'keyboard', event);
        return;
      }
      case 'revert':
        event.preventDefault();
        this.revert(event);
        return;
      case 'clearQuery':
        event.preventDefault();
        this.setInput('', 'clear', event);
        return;
      case 'focusChip': {
        event.preventDefault();
        const chips = [
          ...(this.chipsRef()?.nativeElement.querySelectorAll<HTMLElement>(CHIP_SELECTOR) ?? []),
        ].filter((chip) => !chip.hidden);
        chips.at(-1)?.focus({ preventScroll: true });
        return;
      }
    }
  }

  private revert(source?: Event) {
    const first = this.chosen()[0];
    if (first === undefined) {
      this.typed.set(false);
      this.setInput('', 'programmatic', source);
      return;
    }
    const name = this.labelOf(first);
    if (this.inputValue() === name) {
      this.clear(source);
      return;
    }
    this.typed.set(false);
    this.setInput(name, 'programmatic', source);
  }

  private move(intent: MoveIntent, source?: Event) {
    const options = this.options();
    const from = options.findIndex((option) => option.key === this.highlightedValue());
    const next = moveIndex({
      enabled: options.map((option) => !option.disabled),
      from,
      intent,
      loop: this.loop() ?? this.defaults.loop,
    });
    if (next >= 0) this.setHighlighted(options[next]!.key, 'keyboard', source);
  }

  private placeHighlight(options: readonly EntityOption[]) {
    if (this.entry !== 'keep') {
      const enabled = options.filter((option) => !option.disabled);
      const chosen = this.chosen();
      const target =
        this.entry === 'last'
          ? enabled.at(-1)
          : this.entry === 'selected'
            ? options.find((option) => chosen.includes(option.key))
            : enabled[0];
      if (target !== undefined || this.entry !== 'selected') {
        this.entry = 'keep';
        if (target !== undefined) this.setHighlighted(target.key, 'keyboard');
      }
      return;
    }
    const held = this.highlightedValue();
    if (held !== null && !options.some((option) => option.key === held)) {
      this.setHighlighted(null, 'keyboard');
    }
  }

  protected onChipKey(id: string, event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const frozen = this.resolvedReadOnly() || this.resolvedDisabled();
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (frozen) return;
        event.preventDefault();
        this.remove(id, event);
        return;
      case 'Escape':
        event.preventDefault();
        this.focus();
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.focus();
        }
    }
  }

  protected onRemoveClick(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.remove(id, event);
    this.focus();
  }

  protected onCountClick(event: MouseEvent) {
    this.typed.set(true);
    this.setInput('', 'programmatic', event);
    this.entry = 'keep';
    this.setOpen(true, 'pointer', event);
    this.focus();
  }

  protected onClear(event: MouseEvent) {
    this.clear(event);
    this.focus();
  }

  protected onToggle(event: MouseEvent) {
    if (this.resolvedDisabled() || this.resolvedReadOnly()) return;
    this.entry = this.multiple() ? 'keep' : 'selected';
    this.setOpen(!this.isOpen(), 'pointer', event);
    this.focus();
  }

  protected onScopeRequest(request: ChangeRequest<unknown>) {
    const next = typeof request.value === 'string' ? request.value : null;
    const reason =
      request.reason === 'pointer' || request.reason === 'keyboard'
        ? request.reason
        : 'programmatic';
    this.setScope(next, reason, request.source as Event | undefined);
  }

  protected onRowEnter(entity: Entity, event: PointerEvent) {
    if (this.isDisabled(entity)) return;
    this.setHighlighted(entity.id, 'pointer', event);
  }

  protected onRowClick(entity: Entity, event: MouseEvent) {
    if (this.isDisabled(entity)) return;
    this.activate(entity.id, 'pointer', event);
    this.focus();
  }

  protected keepFocus(event: PointerEvent) {
    if (event.defaultPrevented) return;
    event.preventDefault();
  }

  // ── The chips ──────────────────────────────────────────────────────────

  private wireChips() {
    const row = this.chipsRef()?.nativeElement;
    if (row === undefined) return;
    this.navigation = createArrowNavigation(row, {
      itemSelector: `${CHIP_SELECTOR}, [data-part='field'] > [data-part='input']`,
      loop: false,
      ownedKeys: (item) =>
        item instanceof HTMLInputElement && item.value !== ''
          ? ['ArrowLeft', 'ArrowRight', 'Home', 'End']
          : [],
    });
    this.removal = createRemovalFocus(row, {
      itemSelector: CHIP_SELECTOR,
      fallback: () => this.inputRef()?.nativeElement ?? null,
    });
    if (!this.collapsing()) return;
    this.collapse = createCollapse(row, {
      collapsible: (unit) => unit.dataset['part'] !== 'field',
      fixedSize: (unit) =>
        unit.dataset['part'] === 'field'
          ? Number.parseFloat(getComputedStyle(unit).minInlineSize) || 0
          : undefined,
      onChange: (units) => this.collapsedCount.set(units.length),
      trigger: () => this.countRef()?.nativeElement ?? null,
      units: () =>
        [...row.children].filter(
          (unit): unit is HTMLElement =>
            unit instanceof HTMLElement && !unit.hasAttribute('data-count'),
        ),
    });
  }

  // ── The layer ──────────────────────────────────────────────────────────

  private show() {
    this.build();
    this.position();
    this.bind();
  }

  private build() {
    if (this.view !== null) {
      this.presence?.sync(true);
      this.view.detectChanges();
      return;
    }
    const origin = this.inputRef()?.nativeElement ?? this.host.nativeElement;
    this.portalRoot = createPortalRoot({ origin, disabled: this.portal() === false });
    this.view = this.viewContainer.createEmbeddedView(this.layerTemplate());
    this.view.detectChanges();
    this.layerNode = this.view.rootNodes.find(
      (node: unknown): node is HTMLElement => node instanceof HTMLElement,
    ) as HTMLElement | null;
    this.surfaceNode = this.layerNode?.querySelector<HTMLElement>("[data-part='content']") ?? null;
    if (this.layerNode === null) return;
    this.portalRoot.container?.append(this.layerNode);
    this.presence = createPresence({ present: true });
    this.presence.setNode(this.layerNode);
  }

  private position() {
    if (this.layerNode === null) return;
    this.positionerHandle?.destroy();
    this.positionerHandle = createPositioner(this.controlRef().nativeElement, this.layerNode, {
      align: 'start',
      alignOffset: 0,
      boundaryPadding: 8,
      flip: true,
      hideWhenDetached: true,
      matchWidth: this.resolvedWidth() === 'anchor',
      shift: true,
      side: this.side() ?? this.defaults.side,
      sideOffset: 4,
      strategy: this.strategy() ?? this.defaults.strategy,
    });
    void this.positionerHandle.update().then(() => this.positioned.set(true));
  }

  private bind() {
    if (this.layerNode === null) return;
    this.layer = createDismissableLayer(this.layerNode, {
      branches: [this.controlRef().nativeElement],
      escape: true,
      focusOutside: false,
      modal: false,
      outsidePress: true,
      scrollLock: false,
      onDismiss: (request) => {
        this.setOpen(
          false,
          request.reason === 'escape' ? 'escape' : 'outsidePress',
          request.source as Event | undefined,
        );
      },
    });
  }

  private observeEnd() {
    this.observer?.disconnect();
    this.observer = null;
    const root = this.surfaceNode;
    if (root === null || !this.search().hasMore || typeof IntersectionObserver !== 'function')
      return;
    const sentinel = root.querySelector<HTMLElement>('[data-sentinel]');
    if (sentinel === null) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this.session.more();
      },
      { root },
    );
    this.observer.observe(sentinel);
  }

  private hide() {
    this.layer?.destroy();
    this.positionerHandle?.destroy();
    this.observer?.disconnect();
    this.layer = null;
    this.positionerHandle = null;
    this.observer = null;
    this.positioned.set(false);
    this.teardown();
  }

  private teardown() {
    this.layer?.destroy();
    this.positionerHandle?.destroy();
    this.presence?.destroy();
    this.portalRoot?.release();
    this.layerNode?.remove();
    this.view?.destroy();
    this.layer = null;
    this.positionerHandle = null;
    this.presence = null;
    this.portalRoot = null;
    this.layerNode = null;
    this.surfaceNode = null;
    this.view = null;
  }

  // ── Forms ──────────────────────────────────────────────────────────────

  writeValue(value: EntityPickerValue) {
    this.value.set(this.multiple() ? idsOf(value ?? []) : (idsOf(value)[0] ?? null));
    this.typed.set(false);
  }

  registerOnChange(fn: (value: EntityPickerValue) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabledByForm.set(isDisabled);
  }

  validate(): ValidationErrors | null {
    this.version();
    const chosen = this.chosen();
    if (this.resolvedRequired() && chosen.length === 0) return { required: true };
    const missing = chosen.filter((id) => this.resolver.status(id) === 'missing');
    return missing.length > 0 ? { unresolved: { ids: missing } } : null;
  }
}
