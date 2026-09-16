import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
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
  ViewEncapsulation,
} from '@angular/core';

import { SlDialog, SlDialogTitle } from '@slotted/angular/dialog';
import type { DialogChangeRequest, DialogDismissPolicy } from '@slotted/angular/dialog';
import { SlHighlight } from '@slotted/angular/highlight';
import { injectKbdPlatform, SlShortcut } from '@slotted/angular/kbd';
import { moveIndex, splitByMatch } from '@slotted/core/collection';
import type { MoveIntent } from '@slotted/core/collection';
import { createCommandRanker, pushRecent, resolveCommands } from '@slotted/core/commands';
import type { CommandGroup, CommandRanker } from '@slotted/core/commands';
import { isEditableTarget, matchesShortcut, parseShortcut, resolveKey } from '@slotted/core/keys';
import type { KbdPlatform } from '@slotted/core/keys';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';

import { injectCommandPaletteDefaults } from './command-palette-defaults';
import type {
  CommandPaletteHighlightReason,
  CommandPaletteItem,
  CommandPaletteItemContext,
  CommandPaletteOpenReason,
  CommandPalettePagesReason,
  CommandPalettePresentation,
  CommandPaletteQueryReason,
  CommandPaletteSelectReason,
  CommandPaletteSelectRequest,
  CommandPaletteSize,
} from './command-palette-defaults';

/**
 * A search that executes.
 *
 * `<sl-command-palette>` is written in place and its template holds the
 * `<sl-dialog>` — the layer, the scrim, the focus containment and the
 * dismissal are the dialog family's, as `upload-viewer` composes them — or,
 * under `presentation="inline"`, the panel itself. DOM focus stays on the
 * input and the list is walked with `aria-activedescendant`, the model
 * `combobox` uses. Which rows are drawn, in which order, is
 * `@slotted/core/commands`, the same function the React binding asks.
 */

let nextId = 0;

const ARIA_MODIFIERS: Record<string, string> = {
  alt: 'Alt',
  ctrl: 'Control',
  meta: 'Meta',
  shift: 'Shift',
};

/** The shortcut as `aria-keyshortcuts` states it; a sequence is drawn only. */
function announceShortcut(keys: string, platform: KbdPlatform): string | null {
  const steps = parseShortcut(keys);
  if (steps.length !== 1) return null;
  return (
    steps[0]
      ?.map((token) => {
        const canonical = resolveKey(token, { platform }).token;
        if (canonical === 'mod') return platform === 'mac' ? 'Meta' : 'Control';
        if (canonical !== undefined && canonical in ARIA_MODIFIERS) {
          return ARIA_MODIFIERS[canonical] as string;
        }
        const word = canonical ?? token;
        return word.length === 1 ? word.toUpperCase() : `${word[0]?.toUpperCase()}${word.slice(1)}`;
      })
      .join('+') ?? null
  );
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** The content of a row, written by the consumer on an `ng-template`. */
@Directive({ selector: 'ng-template[slCommandPaletteItem]', standalone: true })
export class SlCommandPaletteItem<Item extends CommandPaletteItem = CommandPaletteItem> {
  readonly template = inject<TemplateRef<CommandPaletteItemContext<Item>>>(TemplateRef);
  /* Types the template's context, so `let-item` is an `Item` in the template. */
  static ngTemplateContextGuard<Item extends CommandPaletteItem>(
    _directive: SlCommandPaletteItem<Item>,
    context: unknown,
  ): context is CommandPaletteItemContext<Item> {
    return context !== null;
  }
}

/** The footer's content, in place of the family's hints. */
@Directive({ selector: 'ng-template[slCommandPaletteFooter]', standalone: true })
export class SlCommandPaletteFooter {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** The empty message, in place of `emptyLabel`. */
@Directive({ selector: 'ng-template[slCommandPaletteEmpty]', standalone: true })
export class SlCommandPaletteEmpty {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

@Component({
  selector: 'sl-command-palette',
  standalone: true,
  exportAs: 'slCommandPalette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, SlDialog, SlDialogTitle, SlHighlight, SlShortcut],
  styleUrls: [
    '../../../styles/src/command-palette/command-palette.css',
    '../../../styles/src/skeleton/skeleton.css',
    '../../../styles/src/spinner/spinner.css',
  ],
  host: { '[style.display]': "'contents'" },
  template: `
    @if (inline()) {
      <ng-container *ngTemplateOutlet="panel" />
    } @else {
      <sl-dialog
        [open]="isOpen()"
        (openChangeRequest)="onDialogRequest($event)"
        [container]="container()"
        [size]="resolvedSize()"
        [outsidePress]="resolvedOutsidePress()"
        [initialFocus]="inputElement()"
        escape="none"
        fullScreen="narrow"
        placement="top"
        surface="plain"
      >
        <!-- The dialog takes its name from a title it points at; the title is
             read by assistive technology and hidden from the eye, because the
             field under it is the name a reader sees. -->
        <h2 slDialogTitle hidden>{{ resolvedLabel() }}</h2>
        <ng-container *ngTemplateOutlet="panel" />
      </sl-dialog>
    }

    <ng-template #panel>
      <div
        data-ui="command-palette"
        data-part="root"
        [attr.data-presentation]="resolvedPresentation()"
        [attr.data-size]="resolvedSize()"
        [attr.data-open]="isOpen() ? '' : null"
        [attr.data-loading]="loading() ? '' : null"
        [attr.data-disabled]="disabled() ? '' : null"
        [attr.data-query]="query() === '' ? null : ''"
        [attr.data-empty]="isEmpty() ? '' : null"
      >
        <div data-part="header">
          @if (loading()) {
            <span data-part="busy" data-ui="spinner" aria-hidden="true"></span>
          } @else {
            <span data-part="search" aria-hidden="true"></span>
          }
          @if (rows().trail.length > 0) {
            <ol data-part="pages" [attr.aria-label]="resolvedBackLabel()">
              @for (entry of rows().trail; track entry.id; let index = $index) {
                <li>
                  <button data-part="page" type="button" (click)="returnTo(index, $event)">
                    <span>{{ entry.label }}</span>
                  </button>
                </li>
              }
            </ol>
          }
          <input
            #field
            data-part="input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            autocomplete="off"
            spellcheck="false"
            [id]="inputId"
            [attr.aria-label]="resolvedInputLabel()"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeDescendant()"
            [attr.placeholder]="resolvedPlaceholder()"
            [disabled]="disabled()"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
          />
          <button
            data-part="clear"
            type="button"
            tabindex="-1"
            [attr.aria-label]="resolvedClearLabel()"
            (click)="clear($event)"
          ></button>
        </div>

        <div
          #list
          data-part="list"
          role="listbox"
          [id]="listId"
          [attr.aria-label]="resolvedInputLabel()"
          [attr.aria-busy]="loading() ? 'true' : null"
          [attr.data-loading]="loading() ? '' : null"
        >
          @if (loading() && rows().count === 0) {
            <div data-part="placeholder" aria-hidden="true">
              @for (row of [0, 1, 2]; track row) {
                <div>
                  <span data-ui="skeleton" data-part="root" data-shape="text" data-loading></span>
                </div>
              }
            </div>
          }
          @if (isEmpty()) {
            <div data-part="empty">
              @if (emptyTemplate(); as template) {
                <ng-container *ngTemplateOutlet="template.template" />
              } @else {
                {{ resolvedEmptyLabel() }}
              }
            </div>
          }
          @for (section of rows().sections; track $index; let sectionIndex = $index) {
            @if (sectionIndex > 0) {
              <div data-part="separator" role="separator"></div>
            }
            @if (headingOf(section); as heading) {
              <div
                data-part="group"
                role="group"
                [attr.aria-labelledby]="baseId + '-group-' + sectionIndex"
              >
                <div
                  data-part="group-label"
                  role="presentation"
                  [id]="baseId + '-group-' + sectionIndex"
                >
                  {{ heading }}
                </div>
                @for (item of section.items; track item.id) {
                  <ng-container *ngTemplateOutlet="row; context: { $implicit: item }" />
                }
              </div>
            } @else {
              @for (item of section.items; track item.id) {
                <ng-container *ngTemplateOutlet="row; context: { $implicit: item }" />
              }
            }
          }
        </div>

        <div data-part="status" role="status">{{ status() }}</div>

        @if (footerTemplate(); as footer) {
          <div data-part="footer" aria-hidden="true">
            <ng-container *ngTemplateOutlet="footer.template" />
          </div>
        } @else if (!hideFooter()) {
          <div data-part="footer" aria-hidden="true">
            <span data-part="hint">
              <kbd slShortcut keys="up" separator="" size="inherit" variant="outline"></kbd>
              <kbd slShortcut keys="down" separator="" size="inherit" variant="outline"></kbd>
              <span>{{ resolvedHintNavigate() }}</span>
            </span>
            <span data-part="hint">
              <kbd slShortcut keys="enter" separator="" size="inherit" variant="outline"></kbd>
              <span>{{ resolvedHintSelect() }}</span>
            </span>
            @if (pages().length > 0) {
              <span data-part="hint">
                <kbd
                  slShortcut
                  keys="backspace"
                  separator=""
                  size="inherit"
                  variant="outline"
                ></kbd>
                <span>{{ resolvedHintBack() }}</span>
              </span>
            }
            @if (!inline()) {
              <span data-part="hint">
                <kbd slShortcut keys="escape" separator="" size="inherit" variant="outline"></kbd>
                <span>{{ resolvedHintClose() }}</span>
              </span>
            }
          </div>
        }
      </div>
    </ng-template>

    <ng-template #row let-item>
      @if (item.href; as href) {
        <a
          data-part="item"
          role="option"
          [id]="domId(item.id)"
          [href]="href"
          [attr.target]="item.target ?? null"
          [attr.title]="item.label"
          [attr.aria-selected]="highlightedId() === item.id"
          [attr.aria-disabled]="item.disabled ? 'true' : null"
          [attr.aria-busy]="pending().has(item.id) ? 'true' : null"
          [attr.aria-keyshortcuts]="keyshortcuts(item)"
          [attr.data-current]="highlightedId() === item.id ? '' : null"
          [attr.data-disabled]="item.disabled ? '' : null"
          [attr.data-loading]="pending().has(item.id) ? '' : null"
          [attr.data-page]="item.children ? '' : null"
          (pointermove)="hover(item, $event)"
          (click)="press(item, $event)"
        >
          <ng-container *ngTemplateOutlet="cells; context: { $implicit: item }" />
        </a>
      } @else {
        <div
          data-part="item"
          role="option"
          [id]="domId(item.id)"
          [attr.title]="item.label"
          [attr.aria-selected]="highlightedId() === item.id"
          [attr.aria-disabled]="item.disabled ? 'true' : null"
          [attr.aria-busy]="pending().has(item.id) ? 'true' : null"
          [attr.aria-keyshortcuts]="keyshortcuts(item)"
          [attr.data-current]="highlightedId() === item.id ? '' : null"
          [attr.data-disabled]="item.disabled ? '' : null"
          [attr.data-loading]="pending().has(item.id) ? '' : null"
          [attr.data-page]="item.children ? '' : null"
          (pointermove)="hover(item, $event)"
          (click)="press(item, $event)"
        >
          <ng-container *ngTemplateOutlet="cells; context: { $implicit: item }" />
        </div>
      }
    </ng-template>

    <ng-template #cells let-item>
      @if (itemTemplate(); as custom) {
        <ng-container
          *ngTemplateOutlet="
            custom.template;
            context: {
              $implicit: item,
              current: highlightedId() === item.id,
              disabled: item.disabled === true,
              pending: pending().has(item.id),
              query: query(),
              runs: runsOf(item),
            }
          "
        />
      } @else {
        <span data-part="icon"></span>
        <span data-part="label">
          @if (marking()) {
            <span slHighlight [text]="item.label" [query]="query()" [locale]="locale()"></span>
          } @else {
            {{ item.label }}
          }
        </span>
        @if (item.description; as description) {
          <span data-part="description">{{ description }}</span>
        }
        @if (item.meta; as meta) {
          <span data-part="meta" aria-hidden="true">{{ meta }}</span>
        }
        @if (!item.children && item.shortcut; as shortcut) {
          <span data-part="shortcut" aria-hidden="true">
            <kbd slShortcut [keys]="shortcut" size="inherit" separator="" variant="outline"></kbd>
          </span>
        }
        @if (item.children) {
          <span data-part="arrow" aria-hidden="true"></span>
        }
        @if (pending().has(item.id)) {
          <span data-part="busy" data-ui="spinner" aria-hidden="true"></span>
        }
      }
    </ng-template>
  `,
})
export class SlCommandPalette<Item extends CommandPaletteItem = CommandPaletteItem> {
  private static flag(value: unknown) {
    return value === undefined ? undefined : booleanAttribute(value);
  }

  private static count(value: unknown) {
    return value === undefined ? undefined : numberAttribute(value);
  }

  private readonly defaults = injectCommandPaletteDefaults();
  private readonly platformOf = injectKbdPlatform();
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly baseId =
    inject(new HostAttributeToken('id'), { optional: true }) ?? `sl-command-palette-${nextId++}`;
  protected readonly inputId = `${this.baseId}-input`;
  protected readonly listId = `${this.baseId}-list`;

  /* ── Inputs ───────────────────────────────────────────────────────────── */

  readonly items = input.required<readonly Item[]>();
  readonly groups = input<readonly CommandGroup[] | undefined>(undefined);
  /** The adapter. Absent takes the core ranker; `null` shows the items as they came. */
  readonly rank = input<CommandRanker<Item> | null | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly limit = input(undefined, { transform: SlCommandPalette.count });

  readonly presentation = input<CommandPalettePresentation | undefined>(undefined);
  readonly size = input<CommandPaletteSize | undefined>(undefined);
  readonly outsidePress = input<DialogDismissPolicy | undefined>(undefined);
  readonly loop = input(undefined, { transform: SlCommandPalette.flag });
  readonly autoHighlight = input(undefined, { transform: SlCommandPalette.flag });
  readonly closeOnSelect = input(undefined, { transform: SlCommandPalette.flag });
  readonly clearOnClose = input(undefined, { transform: SlCommandPalette.flag });
  readonly highlightMatch = input(undefined, { transform: SlCommandPalette.flag });
  /** `null` turns the hotkey off; absent takes the provider's. */
  readonly hotkey = input<string | null | undefined>(undefined);
  readonly recentLimit = input(undefined, { transform: SlCommandPalette.count });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A parent for the layer alone, instead of the portal root the dialog makes beside this host. */
  readonly container = input<Element | null | undefined>(undefined);
  /** Removes the footer. An `ng-template[slCommandPaletteFooter]` replaces it instead. */
  readonly hideFooter = input(false, { transform: booleanAttribute });

  readonly label = input<string | undefined>(undefined);
  readonly inputLabel = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly emptyLabel = input<string | undefined>(undefined);
  readonly loadingLabel = input<string | undefined>(undefined);
  readonly errorLabel = input<string | undefined>(undefined);
  readonly countLabel = input<string | undefined>(undefined);
  readonly recentLabel = input<string | undefined>(undefined);
  readonly clearLabel = input<string | undefined>(undefined);
  readonly backLabel = input<string | undefined>(undefined);
  readonly hintNavigate = input<string | undefined>(undefined);
  readonly hintSelect = input<string | undefined>(undefined);
  readonly hintClose = input<string | undefined>(undefined);
  readonly hintBack = input<string | undefined>(undefined);

  /* ── The five values ──────────────────────────────────────────────────── */

  readonly open = model<boolean>(false);
  readonly openChangeRequest = output<ChangeRequest<boolean>>();

  readonly query = model<string>('');
  readonly queryChangeRequest = output<ChangeRequest<string>>();

  readonly highlightedId = model<string | null>(null);
  readonly highlightedIdChangeRequest = output<ChangeRequest<string | null>>();

  readonly pages = model<readonly string[]>([]);
  readonly pagesChangeRequest = output<ChangeRequest<readonly string[]>>();

  readonly recent = model<readonly string[]>([]);
  readonly recentChangeRequest = output<ChangeRequest<readonly string[]>>();

  /** Every executed item, after the item's own handler. */
  readonly select = output<CommandPaletteSelectRequest<Item>>();

  /* ── Content ──────────────────────────────────────────────────────────── */

  protected readonly itemTemplate = contentChild(SlCommandPaletteItem<Item>);
  protected readonly footerTemplate = contentChild(SlCommandPaletteFooter);
  protected readonly emptyTemplate = contentChild(SlCommandPaletteEmpty);

  /** The layer, while there is one; the trigger registers itself on it. */
  readonly dialog = viewChild(SlDialog);

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly list = viewChild<ElementRef<HTMLDivElement>>('list');

  /* ── Resolution ───────────────────────────────────────────────────────── */

  protected readonly resolvedPresentation = computed(
    () => this.presentation() ?? this.defaults.presentation,
  );
  protected readonly inline = computed(() => this.resolvedPresentation() === 'inline');
  protected readonly resolvedSize = computed(() => this.size() ?? this.defaults.size);
  protected readonly resolvedOutsidePress = computed(
    () => this.outsidePress() ?? this.defaults.outsidePress,
  );
  protected readonly resolvedLoop = computed(() => this.loop() ?? this.defaults.loop);
  protected readonly resolvedAutoHighlight = computed(
    () => this.autoHighlight() ?? this.defaults.autoHighlight,
  );
  protected readonly resolvedCloseOnSelect = computed(
    () => this.closeOnSelect() ?? this.defaults.closeOnSelect,
  );
  protected readonly resolvedClearOnClose = computed(
    () => this.clearOnClose() ?? this.defaults.clearOnClose,
  );
  protected readonly resolvedHighlightMatch = computed(
    () => this.highlightMatch() ?? this.defaults.highlightMatch,
  );
  protected readonly resolvedHotkey = computed(() => {
    const own = this.hotkey();
    return own === undefined ? this.defaults.hotkey : own;
  });
  protected readonly resolvedRecentLimit = computed(
    () => this.recentLimit() ?? this.defaults.recentLimit,
  );
  protected readonly resolvedLabel = computed(() => this.label() ?? this.defaults.label);
  protected readonly resolvedInputLabel = computed(
    () => this.inputLabel() ?? this.defaults.inputLabel,
  );
  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.defaults.placeholder,
  );
  protected readonly resolvedEmptyLabel = computed(
    () => this.emptyLabel() ?? this.defaults.emptyLabel,
  );
  protected readonly resolvedClearLabel = computed(
    () => this.clearLabel() ?? this.defaults.clearLabel,
  );
  protected readonly resolvedBackLabel = computed(
    () => this.backLabel() ?? this.defaults.backLabel,
  );
  protected readonly resolvedHintNavigate = computed(
    () => this.hintNavigate() ?? this.defaults.hintNavigate,
  );
  protected readonly resolvedHintSelect = computed(
    () => this.hintSelect() ?? this.defaults.hintSelect,
  );
  protected readonly resolvedHintClose = computed(
    () => this.hintClose() ?? this.defaults.hintClose,
  );
  protected readonly resolvedHintBack = computed(() => this.hintBack() ?? this.defaults.hintBack);

  /** Open for the stylesheet and the dialog: an inline palette is always open. */
  protected readonly isOpen = computed(() => this.inline() || this.open());
  protected readonly inputElement = computed(() => this.field()?.nativeElement ?? undefined);

  /* ── The rows ─────────────────────────────────────────────────────────── */

  private readonly ranker = computed<CommandRanker<Item> | null>(() => {
    const own = this.rank();
    return own === undefined ? createCommandRanker<Item>({ locale: this.locale() }) : own;
  });

  protected readonly rows = computed(() =>
    resolveCommands<Item>({
      items: this.items(),
      query: this.query(),
      pages: this.pages(),
      recent: this.recent(),
      groups: this.groups(),
      rank: this.ranker(),
      limit: this.limit(),
    }),
  );
  private readonly rowIds = computed(() => this.rows().rows.map((item) => item.id));
  private readonly enabled = computed(() => this.rows().rows.map((item) => item.disabled !== true));

  protected readonly isEmpty = computed(() => !this.loading() && this.rows().count === 0);
  protected readonly activeDescendant = computed(() => {
    const id = this.highlightedId();
    return id === null ? null : this.domId(id);
  });

  protected readonly pending = signal<ReadonlySet<string>>(new Set());
  private readonly error = signal<string | null>(null);

  protected readonly status = computed(() => {
    if (this.loading()) return this.loadingLabel() ?? this.defaults.loadingLabel;
    const failure = this.error();
    if (failure !== null) {
      return fill(this.errorLabel() ?? this.defaults.errorLabel, { message: failure });
    }
    return fill(this.countLabel() ?? this.defaults.countLabel, { count: this.rows().count });
  });

  constructor() {
    /* Where the highlight stands once the rows have changed: on the row it was
       on, on the first enabled row with autoHighlight, and nowhere otherwise. */
    effect(() => {
      if (!this.isOpen()) return;
      const ids = this.rowIds();
      const enabled = this.enabled();
      const current = this.highlightedId();
      const at = current === null ? -1 : ids.indexOf(current);
      if (at !== -1 && enabled[at] === true) return;
      const first = this.resolvedAutoHighlight()
        ? moveIndex({ enabled, from: -1, intent: 'first', loop: false })
        : -1;
      untracked(() =>
        this.setHighlighted(first === -1 ? null : (ids[first] ?? null), 'programmatic'),
      );
    });

    /* The row the highlight is on scrolls into view; it holds no focus. */
    effect(() => {
      const id = this.highlightedId();
      if (id === null) return;
      const node = this.list()?.nativeElement.querySelector<HTMLElement>(
        `#${CSS.escape(this.domId(id))}`,
      );
      if (typeof node?.scrollIntoView === 'function') node.scrollIntoView({ block: 'nearest' });
    });

    /* Closing puts the palette back where it started, each value by its own
       request, so a consumer owning one of them hears about it. */
    let wasOpen = untracked(() => this.isOpen());
    effect(() => {
      const open = this.isOpen();
      if (wasOpen && !open && untracked(() => this.resolvedClearOnClose())) {
        untracked(() => {
          this.setQuery('', 'programmatic');
          this.setPages([], 'programmatic');
          this.setHighlighted(null, 'programmatic');
        });
      }
      wasOpen = open;
    });

    /* The count, the wait and the failure, said once each. */
    effect(() => {
      if (!this.isOpen()) return;
      const message = this.status();
      getLiveAnnouncer(this.document).announce(message);
    });

    /* A failure belongs to the moment it happened: typing or turning a page clears it. */
    effect(() => {
      this.query();
      this.pages();
      untracked(() => this.error.set(null));
    });

    /* The hotkey, on the document, in the capture phase. */
    const onKey = (event: KeyboardEvent) => {
      const keys = this.resolvedHotkey();
      if (keys === null || this.inline() || this.disabled()) return;
      const platform = this.platformOf();
      if (!matchesShortcut(event, keys, platform)) return;
      const bare = parseShortcut(keys)[0]?.every(
        (token) =>
          !['mod', 'meta', 'ctrl', 'alt'].includes(resolveKey(token, { platform }).token ?? ''),
      );
      if (bare === true && isEditableTarget(event)) return;
      event.preventDefault();
      if (this.isOpen()) {
        this.focus();
        return;
      }
      this.setOpen(true, 'keyboard', event);
    };
    this.document.addEventListener('keydown', onKey, true);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', onKey, true));
  }

  /* ── Requests ─────────────────────────────────────────────────────────── */

  setOpen(next: boolean, reason: CommandPaletteOpenReason, source?: Event) {
    if (this.inline() || next === this.open()) return;
    const state = createControllable<boolean>({
      initial: this.open(),
      onRequest: (request) => this.openChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.open.set(next);
  }

  setQuery(next: string, reason: CommandPaletteQueryReason, source?: Event) {
    if (next === this.query()) return;
    const state = createControllable<string>({
      initial: this.query(),
      onRequest: (request) => this.queryChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.query.set(next);
  }

  setHighlighted(next: string | null, reason: CommandPaletteHighlightReason, source?: Event) {
    if (next === this.highlightedId()) return;
    const state = createControllable<string | null>({
      initial: this.highlightedId(),
      onRequest: (request) => this.highlightedIdChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.highlightedId.set(next);
  }

  setPages(next: readonly string[], reason: CommandPalettePagesReason, source?: Event) {
    const current = this.pages();
    if (next.length === current.length && next.every((id, index) => id === current[index])) return;
    const state = createControllable<readonly string[]>({
      initial: current,
      onRequest: (request) => this.pagesChangeRequest.emit(request),
      equals: () => false,
    });
    if (state.request(next, reason, source)) this.pages.set(next);
  }

  private setRecent(next: readonly string[], source?: Event) {
    const state = createControllable<readonly string[]>({
      initial: this.recent(),
      onRequest: (request) => this.recentChangeRequest.emit(request),
      equals: (a, b) => a.length === b.length && a.every((id, index) => id === b[index]),
    });
    if (state.request(next, 'select', source)) this.recent.set(next);
  }

  /* ── The handle ───────────────────────────────────────────────────────── */

  openPalette() {
    this.setOpen(true, 'programmatic');
  }

  close() {
    this.setOpen(false, 'programmatic');
  }

  toggle() {
    this.setOpen(!this.open(), 'programmatic');
  }

  /** Focuses the input and selects the query. */
  focus() {
    const node = this.field()?.nativeElement;
    if (node === undefined) return;
    node.focus();
    node.select();
  }

  /** Highlights the row with this id and scrolls it into view. */
  scrollToId(id: string) {
    this.setHighlighted(id, 'programmatic');
  }

  /* ── Executing ────────────────────────────────────────────────────────── */

  private execute(item: Item, reason: CommandPaletteSelectReason, source: Event | undefined) {
    if (item.disabled === true || this.pending().has(item.id)) return;

    if (item.children !== undefined) {
      this.setPages(
        [...this.pages(), item.id],
        reason === 'pointer' ? 'pointer' : 'select',
        source,
      );
      this.setQuery('', 'select', source);
      return;
    }

    let keep = false;
    const request: CommandPaletteSelectRequest<Item> = {
      item,
      reason,
      source,
      keepOpen: () => {
        keep = true;
      },
    };

    const finish = () => {
      this.setRecent(pushRecent(this.recent(), item.id, this.resolvedRecentLimit()), source);
      this.select.emit(request);
      if (this.resolvedCloseOnSelect() && !keep) this.setOpen(false, 'select', source);
    };

    const settle = () => {
      this.pending.update((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
    };

    let outcome: unknown;
    try {
      outcome = item.onSelect?.(request);
    } catch (thrown) {
      this.error.set(thrown instanceof Error ? thrown.message : String(thrown));
      return;
    }

    if (outcome instanceof Promise) {
      this.error.set(null);
      this.pending.update((previous) => new Set(previous).add(item.id));
      void outcome.then(
        () => {
          settle();
          finish();
        },
        (thrown: unknown) => {
          settle();
          this.error.set(thrown instanceof Error ? thrown.message : String(thrown));
        },
      );
      return;
    }

    finish();
  }

  /* ── Template helpers ─────────────────────────────────────────────────── */

  protected domId(id: string) {
    return `${this.baseId}-${id.replace(/[^\w-]/g, (character) => `_${character.charCodeAt(0).toString(16)}`)}`;
  }

  protected headingOf(section: { recent: boolean; label: string | undefined }) {
    return section.recent ? (this.recentLabel() ?? this.defaults.recentLabel) : section.label;
  }

  /** Whether the rows mark the query: the family's own switch, and a query to mark. */
  protected readonly marking = computed(
    () => this.resolvedHighlightMatch() && this.query().trim() !== '',
  );

  /**
   * The runs of a row's label, handed to a consumer's own row template as
   * `runs`. The default row renders the `highlight` family instead; the
   * context keeps the runs for a template written before wave 10.
   */
  protected runsOf(item: Item) {
    const query = this.query();
    if (!this.resolvedHighlightMatch() || query.trim() === '') {
      return [{ text: item.label, matched: false }];
    }
    return splitByMatch(item.label, query, { locale: this.locale() });
  }

  protected keyshortcuts(item: Item) {
    if (item.children !== undefined || item.shortcut === undefined) return null;
    return announceShortcut(item.shortcut, this.platformOf());
  }

  protected onInput(event: Event) {
    this.setQuery((event.target as HTMLInputElement).value, 'keyboard', event);
  }

  protected clear(event: Event) {
    this.setQuery('', 'clear', event);
    this.field()?.nativeElement.focus();
  }

  protected returnTo(index: number, event: Event) {
    this.setPages(this.pages().slice(0, index + 1), 'pointer', event);
  }

  protected hover(item: Item, event: Event) {
    if (item.disabled === true) return;
    this.setHighlighted(item.id, 'pointer', event);
  }

  protected press(item: Item, event: MouseEvent) {
    if (item.disabled === true || this.pending().has(item.id)) {
      event.preventDefault();
      return;
    }
    /* A link with a modifier is the browser's: a new tab, a download. */
    if (item.href !== undefined && (event.metaKey || event.ctrlKey || event.shiftKey)) return;
    this.execute(item, 'pointer', event);
  }

  protected onDialogRequest(request: DialogChangeRequest) {
    const reason: CommandPaletteOpenReason =
      request.reason === 'outsidePress' || request.reason === 'escape'
        ? request.reason
        : request.reason === 'pointer' || request.reason === 'keyboard'
          ? request.reason
          : 'dismiss';
    const state = createControllable<boolean>({
      initial: this.open(),
      onRequest: (own) => this.openChangeRequest.emit(own),
    });
    if (!state.request(request.value, reason, request.source)) {
      request.cancel();
      return;
    }
    this.open.set(request.value);
  }

  private move(intent: MoveIntent, event: KeyboardEvent) {
    const ids = this.rowIds();
    const current = this.highlightedId();
    const from = current === null ? -1 : ids.indexOf(current);
    const paged = intent === 'pageDown' || intent === 'pageUp';
    const next = moveIndex({
      enabled: this.enabled(),
      from,
      intent,
      loop: this.resolvedLoop() && !paged,
    });
    event.preventDefault();
    if (next === -1) return;
    this.setHighlighted(ids[next] ?? null, 'keyboard', event);
  }

  protected onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return;
    switch (event.key) {
      case 'ArrowDown':
        this.move('next', event);
        return;
      case 'ArrowUp':
        this.move('previous', event);
        return;
      case 'PageDown':
        this.move('pageDown', event);
        return;
      case 'PageUp':
        this.move('pageUp', event);
        return;
      case 'Home':
        if (event.ctrlKey) this.move('first', event);
        return;
      case 'End':
        if (event.ctrlKey) this.move('last', event);
        return;
      case 'Enter': {
        const id = this.highlightedId();
        const item = id === null ? undefined : this.rows().rows.find((row) => row.id === id);
        if (item === undefined) return;
        event.preventDefault();
        if (item.href !== undefined) {
          const node = this.list()?.nativeElement.querySelector<HTMLAnchorElement>(
            `#${CSS.escape(this.domId(item.id))}`,
          );
          if (event.metaKey || event.ctrlKey || event.shiftKey) {
            node?.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                metaKey: event.metaKey,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
              }),
            );
            return;
          }
          this.execute(item, 'keyboard', event);
          node?.click();
          return;
        }
        this.execute(item, 'keyboard', event);
        return;
      }
      case 'Escape':
        if (this.query() !== '') {
          event.preventDefault();
          event.stopPropagation();
          this.setQuery('', 'clear', event);
          return;
        }
        if (this.pages().length > 0) {
          event.preventDefault();
          event.stopPropagation();
          this.setPages(this.pages().slice(0, -1), 'keyboard', event);
          return;
        }
        if (!this.inline()) {
          event.preventDefault();
          this.setOpen(false, 'escape', event);
        }
        return;
      case 'Backspace':
        if (this.query() === '' && this.pages().length > 0) {
          event.preventDefault();
          this.setPages(this.pages().slice(0, -1), 'keyboard', event);
        }
        return;
      default:
        return;
    }
  }
}

/**
 * The control that opens the palette, on the consumer's own element. The
 * dialog family's trigger is not composed here because it needs the dialog
 * instance, which lives inside this component's template; what the trigger
 * needs from it — the open, the `aria-expanded`, the `aria-haspopup` — is
 * written from the palette instead, and the focus returns to the element
 * that held it when the layer opened, which is this one.
 */
@Directive({
  selector: '[slCommandPaletteTrigger]',
  standalone: true,
  exportAs: 'slCommandPaletteTrigger',
  host: {
    'data-part': 'trigger',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'palette().open()',
    '[attr.data-open]': 'palette().open() ? "" : null',
    '[attr.disabled]': 'palette().disabled() ? "" : null',
    '(click)': 'onClick($event)',
  },
})
export class SlCommandPaletteTrigger {
  readonly palette = input.required<SlCommandPalette>({ alias: 'slCommandPaletteTrigger' });

  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    /* The dialog's own trigger registers its node as the layer's focus origin
       and as a branch the outside press ignores; this one does the same, on
       the dialog the palette holds, whenever that dialog exists. */
    effect(() => {
      const dialog = this.palette().dialog();
      if (dialog === undefined) return;
      untracked(() => dialog.triggerNode.set(this.native));
    });
    inject(DestroyRef).onDestroy(() => {
      const dialog = this.palette().dialog();
      if (dialog?.triggerNode() === this.native) dialog.triggerNode.set(null);
    });
  }

  protected onClick(event: MouseEvent) {
    if (event.defaultPrevented) return;
    this.palette().setOpen(true, event.detail === 0 ? 'keyboard' : 'pointer', event);
  }
}
