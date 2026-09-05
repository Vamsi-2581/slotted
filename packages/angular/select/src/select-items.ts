import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  ViewEncapsulation,
} from '@angular/core';

import { SlSelect } from './select';
import type { SelectOptionValue } from './select-defaults';

/**
 * One option.
 *
 * `role="option"` on the host, and not a button: the listbox pattern's option
 * is not separately focusable — DOM focus stays on the trigger for the whole
 * interaction — and a button here would put a widget inside a widget and add a
 * tab stop the pattern excludes by name.
 *
 * The highlight is set by the pointer as well as by the keyboard, so exactly
 * one option is highlighted whichever device is driving and the state a screen
 * reader announces is the state the eye sees.
 */
@Component({
  selector: 'sl-select-item',
  standalone: true,
  exportAs: 'slSelectItem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'item',
    role: 'option',
    '[id]': 'optionId()',
    '[attr.data-value]': 'value()',
    '[attr.data-text-value]': 'textValue() ?? null',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '[attr.aria-posinset]': 'position() ?? null',
    '[attr.aria-setsize]': 'position() === undefined ? null : (select.total() ?? null)',
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.data-selected]': "selected() ? '' : null",
    '[attr.data-current]': "current() ? '' : null",
    '(click)': 'onClick($event)',
    '(pointerenter)': 'onPointerEnter($event)',
  },
  template: `
    @if (icon()) {
      <span data-part="icon">{{ icon() }}</span>
    }
    <span data-part="label"><ng-content /></span>
    @if (description()) {
      <span data-part="description">{{ description() }}</span>
    }
    <span data-part="indicator"></span>
  `,
})
export class SlSelectItem {
  readonly value = input.required<SelectOptionValue>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly description = input<string | undefined>(undefined);
  /** A glyph token name, drawn as a mask by the stylesheet's icon column. */
  readonly icon = input<string | undefined>(undefined);
  /** What typeahead matches on, when the label is not plain text. */
  readonly textValue = input<string | undefined>(undefined);
  readonly position = input(undefined, {
    transform: (given: number | string | undefined) =>
      given === undefined ? undefined : numberAttribute(given),
  });

  readonly select = inject(SlSelect);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly optionId = computed(() => this.select.optionId(this.value()));
  readonly selected = computed(() => this.select.selection().includes(this.value()));
  readonly current = computed(() => this.select.highlightedValue() === this.value());

  constructor() {
    /**
     * The label reaches the closed control from here, and the count from the
     * same place. Both are read after render rather than from the input,
     * because the children may be elements and what a reader sees is the honest
     * answer either way.
     */
    afterRenderEffect(() => {
      const element = this.host.nativeElement as HTMLElement;
      const label =
        this.textValue() ?? element.querySelector("[data-part='label']")?.textContent?.trim() ?? '';
      if (label !== '') this.select.registerLabel(this.value(), label);
      this.select.recount();
    });

    inject(DestroyRef).onDestroy(() => this.select.recount());
  }

  protected onPointerEnter(event: PointerEvent) {
    if (this.disabled()) return;
    this.select.setHighlighted(this.value(), 'pointer', event);
  }

  protected onClick(event: MouseEvent) {
    if (this.disabled()) return;
    this.select.toggle(this.value(), 'pointer', event);
    /* Multiple selection keeps the popup open, so a reader can take three
       options without reopening it twice. */
    if (this.select.resolvedCloseOnSelect() && !this.select.resolvedMultiple()) {
      this.select.setOpen(false, 'select', event);
    }
  }
}

/**
 * A set of options under a heading, named by `aria-labelledby` pointing at its
 * own label — which the listbox pattern requires of every option group. The
 * label is an input rather than a projected part, because a group with no
 * accessible name is a pattern violation the type system can refuse.
 */
@Component({
  selector: 'sl-select-group',
  standalone: true,
  exportAs: 'slSelectGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'group',
    role: 'group',
    '[attr.aria-labelledby]': 'labelId',
  },
  template: `
    <div data-part="group-label" [id]="labelId">{{ label() }}</div>
    <ng-content />
  `,
})
export class SlSelectGroup {
  readonly label = input.required<string>();
  readonly labelId = `sl-select-group-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * A line between two sets of options. `role="separator"` inside a listbox is a
 * structural element and takes no orientation: the line is horizontal because
 * the list is vertical, and saying so twice is how two families came to
 * disagree about which axis the word names.
 */
@Component({
  selector: 'sl-select-separator',
  standalone: true,
  exportAs: 'slSelectSeparator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { 'data-part': 'separator', role: 'separator' },
  template: '',
})
export class SlSelectSeparator {}
