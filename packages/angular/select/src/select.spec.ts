import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { SlSelect } from './select';
import { provideSelectDefaults } from './select-defaults';
import { SlSelectGroup, SlSelectItem, SlSelectSeparator } from './select-items';

@Component({
  standalone: true,
  imports: [SlSelect, SlSelectGroup, SlSelectItem, SlSelectSeparator],
  template: `
    <sl-select
      aria-label="Fruit"
      placeholder="Choose a fruit"
      [(value)]="value"
      [multiple]="multiple()"
      [clearable]="clearable()"
      [loop]="loop()"
      [readOnly]="readOnly()"
      (valueChangeRequest)="valueReason.set($event.reason)"
      (openChangeRequest)="openReason.set($event.reason)"
    >
      <sl-select-group label="Berries">
        <sl-select-item value="apple">Apple</sl-select-item>
        <sl-select-item value="banana" [disabled]="true">Banana</sl-select-item>
        <sl-select-item value="blueberry">Blueberry</sl-select-item>
      </sl-select-group>
      <sl-select-separator />
      <sl-select-item value="cherry">Cherry</sl-select-item>
    </sl-select>
  `,
})
class Host {
  readonly value = signal<string | readonly string[] | null>(null);
  readonly multiple = signal(false);
  readonly clearable = signal(false);
  readonly loop = signal(false);
  readonly readOnly = signal(false);
  readonly valueReason = signal<string | undefined>(undefined);
  readonly openReason = signal<string | undefined>(undefined);
}

const trigger = () =>
  document.querySelector<HTMLButtonElement>("[data-part='trigger']") as HTMLButtonElement;
const listbox = () => document.querySelector<HTMLElement>("[role='listbox']");
const options = () => [...document.querySelectorAll<HTMLElement>("[role='option']")];
const named = (label: string) =>
  options().find((option) => option.textContent?.includes(label)) as HTMLElement;
const highlighted = () => trigger().getAttribute('aria-activedescendant');

function press(key: string, init: KeyboardEventInit = {}) {
  trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...init }));
}

/**
 * What a browser does with a press on an option, in the order it does it. The
 * focus move is the press's default action, so an option that refuses the press
 * leaves focus where it was; the click is dispatched either way (CB11).
 */
function pressOption(fixture: ComponentFixture<unknown>, option: HTMLElement) {
  const focusMoves = option.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
  );
  if (focusMoves) {
    trigger().blur();
    fixture.detectChanges();
  }
  option.click();
  fixture.detectChanges();
}

describe('SlSelect', () => {
  let fixture: ComponentFixture<Host>;

  const open = () => {
    press('ArrowDown');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('is a combobox that opens a listbox, and says so before it does', () => {
    expect(trigger().getAttribute('role')).toBe('combobox');
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    open();
    expect(listbox()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(listbox()?.id);
  });

  it('keeps DOM focus on the trigger for the whole interaction', () => {
    trigger().focus();
    open();
    press('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger());
  });

  it('marks the highlight with aria-activedescendant and data-current', () => {
    open();
    expect(highlighted()).toBe(named('Apple').id);
    expect(named('Apple').hasAttribute('data-current')).toBe(true);
    press('ArrowDown');
    fixture.detectChanges();
    expect(named('Blueberry').hasAttribute('data-current')).toBe(true);
  });

  it('steps over a disabled option rather than landing on it', () => {
    open();
    press('ArrowDown');
    fixture.detectChanges();
    /* Banana sits between Apple and Blueberry and is disabled. */
    expect(highlighted()).toBe(named('Blueberry').id);
  });

  it('does not wrap by default, and wraps when it is asked to', () => {
    open();
    press('End');
    fixture.detectChanges();
    press('ArrowDown');
    fixture.detectChanges();
    expect(highlighted()).toBe(named('Cherry').id);

    fixture.componentInstance.loop.set(true);
    fixture.detectChanges();
    press('ArrowDown');
    fixture.detectChanges();
    expect(highlighted()).toBe(named('Apple').id);
  });

  it('opens onto the last option from ArrowUp', () => {
    press('ArrowUp');
    fixture.detectChanges();
    expect(highlighted()).toBe(named('Cherry').id);
  });

  it('commits on Enter, closes, and reports both reasons', () => {
    open();
    press('Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('apple');
    expect(fixture.componentInstance.valueReason()).toBe('keyboard');
    expect(fixture.componentInstance.openReason()).toBe('select');
    expect(listbox()).toBeNull();
  });

  it('closes on Escape without committing anything', () => {
    open();
    press('Escape');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(fixture.componentInstance.openReason()).toBe('escape');
  });

  it('finds an option by typing its opening characters', () => {
    open();
    press('c');
    fixture.detectChanges();
    expect(highlighted()).toBe(named('Cherry').id);
  });

  /**
   * CB11. The button holds focus and `aria-activedescendant` names the option;
   * a press that moved focus to the body would leave the property pointing at
   * something that is not the active element.
   */
  it('keeps DOM focus on the trigger across a press on an option', () => {
    trigger().focus();
    open();

    pressOption(fixture, named('Blueberry'));

    expect(document.activeElement).toBe(trigger());
    expect(fixture.componentInstance.value()).toBe('blueberry');
  });

  it('keeps it across every press of a multiple selection', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    trigger().focus();
    open();

    pressOption(fixture, named('Apple'));
    pressOption(fixture, named('Cherry'));

    expect(document.activeElement).toBe(trigger());
    expect(fixture.componentInstance.value()).toEqual(['apple', 'cherry']);
  });

  /**
   * SL10. The control holds one line, so twelve chosen values are three chips
   * and a count. The band at the top of the popup holds all of them, and holds
   * no widget: focus never enters this layer, so a remove control in there
   * would be a tab stop the pattern excludes and a control no keyboard reaches.
   */
  describe('the band of chosen values', () => {
    const band = () => document.querySelector("[data-part='chosen']");

    it('holds every chosen value, whatever the control had room for', () => {
      fixture.componentInstance.multiple.set(true);
      fixture.detectChanges();
      open();
      named('Apple').click();
      fixture.detectChanges();
      named('Blueberry').click();
      fixture.detectChanges();
      named('Cherry').click();
      fixture.detectChanges();

      const labels = [...(band()?.querySelectorAll("[data-part='label']") ?? [])].map(
        (label) => label.textContent,
      );
      expect(labels).toEqual(['Apple', 'Blueberry', 'Cherry']);
    });

    it('is drawn inside the surface and out of the accessibility tree', () => {
      fixture.componentInstance.multiple.set(true);
      fixture.componentInstance.value.set(['apple']);
      fixture.detectChanges();
      open();

      expect(listbox()?.contains(band())).toBe(true);
      expect(band()?.getAttribute('aria-hidden')).toBe('true');
      expect(band()?.querySelector("[data-part='remove']")).toBeNull();
      expect(band()?.querySelector('button')).toBeNull();
    });

    it('is not drawn at all while nothing is chosen, or in single selection', () => {
      fixture.componentInstance.multiple.set(true);
      fixture.detectChanges();
      open();
      expect(band()).toBeNull();

      fixture.componentInstance.multiple.set(false);
      fixture.componentInstance.value.set('apple');
      fixture.detectChanges();
      expect(band()).toBeNull();
    });
  });

  it('names the chosen option in the closed control', () => {
    open();
    named('Blueberry').click();
    fixture.detectChanges();
    expect(trigger().textContent?.trim()).toBe('Blueberry');
  });

  /**
   * SL4: several values are the chips they are, and not a sentence about them.
   * The sentence stays as the trigger's name — and as what a control too narrow
   * for a chip shows — but the picture is one `tag` per value, each with the
   * remove control a tag already has.
   */
  it('previews several values as chips, and keeps the popup open while they are taken', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    open();
    expect(listbox()?.getAttribute('aria-multiselectable')).toBe('true');

    named('Apple').click();
    fixture.detectChanges();
    named('Cherry').click();
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    const chips = [
      ...document.querySelectorAll("[data-part='tags'] > [data-ui='tag']:not([data-overflow])"),
    ];
    expect(chips.map((chip) => chip.querySelector("[data-part='label']")?.textContent)).toEqual([
      'Apple',
      'Cherry',
    ]);
    for (const chip of chips) {
      expect(chip.querySelector("[data-part='remove']")).not.toBeNull();
    }
    expect(trigger().textContent?.trim()).toBe('2 selected');

    /* The chip that counts what did not fit is rendered and hidden until the
       collapse reveals it. */
    const overflow = document.querySelector("[data-part='tags'] > [data-overflow]");
    expect(overflow?.getAttribute('data-ui')).toBe('tag');
    expect(overflow?.hasAttribute('hidden')).toBe(true);
  });

  it('takes a value out of the selection from its own chip', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    open();
    named('Apple').click();
    fixture.detectChanges();
    named('Cherry').click();
    fixture.detectChanges();

    const remove = document.querySelector<HTMLButtonElement>(
      "[data-part='tags'] > [data-ui='tag']:not([data-overflow]) [data-part='remove']",
    );
    expect(remove?.getAttribute('aria-label')).toBe('Remove Apple');
    remove?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['cherry']);
  });

  it('clears the selection, and says why', () => {
    fixture.componentInstance.clearable.set(true);
    fixture.componentInstance.value.set('apple');
    fixture.detectChanges();

    document.querySelector<HTMLButtonElement>("[data-part='clear']")?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(fixture.componentInstance.valueReason()).toBe('clear');
  });

  it('refuses to open while it is read-only', () => {
    fixture.componentInstance.readOnly.set(true);
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    open();
    expect(listbox()).toBeNull();
  });

  it('names each group by its own label, as the listbox pattern requires', () => {
    open();
    const group = document.querySelector<HTMLElement>("[role='group']");
    const labelId = group?.getAttribute('aria-labelledby') ?? '';
    expect(document.getElementById(labelId)?.textContent?.trim()).toBe('Berries');
  });

  it('opens onto a sentence when it holds no options', async () => {
    @Component({
      standalone: true,
      imports: [SlSelect],
      template: `<sl-select aria-label="Empty" />`,
    })
    class Bare {}

    const bare = TestBed.createComponent(Bare);
    bare.detectChanges();
    trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    bare.detectChanges();
    expect(document.querySelector("[data-part='empty']")?.textContent?.trim()).toBe('No options');
  });

  it('writes every state a consumer may style into the DOM', () => {
    const root = document.querySelector<HTMLElement>("[data-ui='select'][data-part='root']");
    expect(root?.getAttribute('data-size')).toBe('md');
    expect(root?.getAttribute('data-variant')).toBe('outline');
    expect(root?.hasAttribute('data-full-width')).toBe(true);
    open();
    expect(root?.hasAttribute('data-open')).toBe(true);
  });
});

describe('SlSelect in a form', () => {
  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, SlSelect, SlSelectItem],
    template: `
      <sl-select aria-label="Fruit" [formControl]="control" [required]="true">
        <sl-select-item value="apple">Apple</sl-select-item>
      </sl-select>
    `,
  })
  class FormHost {
    readonly control = new FormControl<string | null>(null);
  }

  it('is a ControlValueAccessor and a Validator, which is Angular’s own answer', async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();

    /* The family owns `required`, because the hidden native select always holds
       an option and the browser therefore cannot answer the question. */
    expect(fixture.componentInstance.control.errors).toEqual({ required: true });

    fixture.componentInstance.control.setValue('apple');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.errors).toBeNull();
    expect(trigger().textContent?.trim()).toBe('Apple');
  });

  it('takes its disabled state from the form', async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
  });
});

describe('SlSelect defaults', () => {
  @Component({
    standalone: true,
    imports: [SlSelect, SlSelectItem],
    template: `
      <sl-select aria-label="Fruit"><sl-select-item value="apple">Apple</sl-select-item></sl-select>
    `,
  })
  class ProvidedHost {}

  it('lets an application set every axis and every word once', async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidedHost],
      providers: [provideSelectDefaults({ size: 'sm', variant: 'subtle', emptyLabel: 'Nothing' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProvidedHost);
    fixture.detectChanges();
    const root = document.querySelector<HTMLElement>("[data-ui='select'][data-part='root']");
    expect(root?.getAttribute('data-size')).toBe('sm');
    expect(root?.getAttribute('data-variant')).toBe('subtle');
  });
});

@Component({
  standalone: true,
  imports: [SlSelect, SlSelectGroup, SlSelectItem],
  template: `
    <button type="button">before</button>
    <sl-select
      search
      aria-label="Fruit"
      placeholder="Choose a fruit"
      [(value)]="value"
      [(searchValue)]="query"
      [multiple]="multiple()"
      [filter]="filter()"
      (searchValueChangeRequest)="searchReason.set($event.reason)"
    >
      <sl-select-item value="apple" label="Apple" />
      <sl-select-item value="blueberry" label="Blueberry" />
      <sl-select-item value="cherry" label="Cherry" />
      <sl-select-item value="raspberry" label="Raspberry" />
    </sl-select>
    <button type="button">after</button>
  `,
})
class SearchHost {
  readonly value = signal<string | readonly string[] | null>(null);
  readonly query = signal('');
  readonly multiple = signal(false);
  readonly filter = signal<((label: string, query: string) => boolean) | null | undefined>(
    undefined,
  );
  readonly searchReason = signal<string | undefined>(undefined);
}

describe('SlSelect, searching', () => {
  let fixture: ComponentFixture<SearchHost>;

  const field = () =>
    document.querySelector<HTMLInputElement>("[data-part='search-input']") as HTMLInputElement;
  const visible = () => options().filter((option) => !option.hasAttribute('hidden'));
  const outside = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.trim() === label,
    ) as HTMLButtonElement;

  const openSearch = () => {
    trigger().focus();
    trigger().click();
    fixture.detectChanges();
  };

  const type = (value: string) => {
    field().value = value;
    field().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  const send = (key: string, init: KeyboardEventInit = {}) => {
    field().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...init }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SearchHost] }).compileComponents();
    fixture = TestBed.createComponent(SearchHost);
    fixture.detectChanges();
  });

  /**
   * The popup stops being a listbox and becomes a dialog holding one, which is
   * the composition the combobox pattern names: a popup that is not a listbox
   * is named by `aria-haspopup` on the control.
   */
  it('opens a dialog holding a listbox, and says so on the trigger', () => {
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    openSearch();

    const dialog = document.querySelector<HTMLElement>("[role='dialog']");
    expect(dialog).not.toBeNull();
    expect(trigger().getAttribute('aria-controls')).toBe(dialog?.id);
    expect(field().getAttribute('aria-controls')).toBe(listbox()?.id);
    expect(field().getAttribute('aria-autocomplete')).toBe('list');
  });

  /** The pattern: a dialog popup does not support aria-activedescendant. */
  it('takes focus into the field however the popup was opened, and gives it back', () => {
    openSearch();
    expect(document.activeElement).toBe(field());
    expect(trigger().getAttribute('aria-activedescendant')).toBeNull();

    send('ArrowDown');
    expect(field().getAttribute('aria-activedescendant')).not.toBeNull();

    send('Escape');
    expect(document.activeElement).toBe(trigger());
  });

  it('filters the options and marks the span the query matched', () => {
    openSearch();
    type('berr');

    expect(visible().map((option) => option.textContent?.trim())).toEqual([
      'Blueberry',
      'Raspberry',
    ]);
    const marks = [...document.querySelectorAll("[data-part='match']")];
    expect(marks).toHaveLength(2);
    expect(marks.every((mark) => mark.parentElement?.getAttribute('data-ui') === 'highlight')).toBe(
      true,
    );
  });

  it('moves the highlight onto the first surviving option as the query changes', () => {
    openSearch();
    type('rasp');
    expect(field().getAttribute('aria-activedescendant')).toBe(named('Raspberry').id);

    send('Enter');
    expect(fixture.componentInstance.value()).toBe('raspberry');
    expect(document.querySelector("[role='dialog']")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  /** The query first, the popup second. */
  it('clears the query on the first Escape and closes on the second', () => {
    openSearch();
    type('berr');
    expect(visible()).toHaveLength(2);

    send('Escape');
    expect(visible()).toHaveLength(4);
    expect(document.querySelector("[role='dialog']")).not.toBeNull();
    expect(fixture.componentInstance.query()).toBe('');

    send('Escape');
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  /**
   * Tab keeps the effect the closed control's Tab has — commit, close, move on
   * — and only the mechanism differs: the layer is portalled to the end of the
   * document, so the browser's own next element is the end of the page.
   */
  it('commits on Tab and leaves the control for the element beside it', () => {
    openSearch();
    send('ArrowDown');
    send('Tab');

    expect(fixture.componentInstance.value()).toBe('blueberry');
    expect(document.querySelector("[role='dialog']")).toBeNull();
    expect(document.activeElement).toBe(outside('after'));
  });

  it('goes back the way it came under Shift', () => {
    openSearch();
    send('Tab', { shiftKey: true });
    expect(document.activeElement).toBe(outside('before'));
  });

  /** A field the reader is typing into cannot spend the space bar on a commit. */
  it('leaves the space bar, Home and End to the browser', () => {
    openSearch();
    send('ArrowDown');
    const held = field().getAttribute('aria-activedescendant');

    for (const key of [' ', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key });
      field().dispatchEvent(event);
      fixture.detectChanges();
      expect(event.defaultPrevented, `${key} was prevented`).toBe(false);
    }
    expect(field().getAttribute('aria-activedescendant')).toBe(held);
    expect(document.querySelector("[role='dialog']")).not.toBeNull();
  });

  it('announces how many options survived the query', () => {
    openSearch();
    const status = () => document.querySelector<HTMLElement>("[data-part='status']");
    expect(status()?.textContent?.trim()).toBe('4 results');

    type('berr');
    expect(status()?.textContent?.trim()).toBe('2 results');
  });

  it('renders the window it was given when the filter is null', () => {
    fixture.componentInstance.filter.set(null);
    fixture.detectChanges();
    openSearch();
    type('nothing matches this');
    expect(visible()).toHaveLength(4);
  });

  it('replaces the comparison when a filter is given', () => {
    fixture.componentInstance.filter.set((label, query) => label.startsWith(query));
    fixture.detectChanges();
    openSearch();
    type('Ch');
    expect(visible().map((option) => option.textContent?.trim())).toEqual(['Cherry']);
  });

  /** Two searches on one keystroke would move the highlight twice per character. */
  it('turns typeahead off, so a printable key only types', () => {
    trigger().focus();
    press('c');
    fixture.detectChanges();
    expect(fixture.componentInstance.query()).toBe('c');
    expect(visible().map((option) => option.textContent?.trim())).toEqual(['Cherry']);
  });

  /** The query is a value the consumer can own, and it is not the selection. */
  it('asks before the query moves, with a reason of its own', () => {
    openSearch();
    type('ch');
    expect(fixture.componentInstance.searchReason()).toBe('keyboard');
    expect(fixture.componentInstance.value()).toBeNull();
  });

  /** A list still filtered to the row the reader has just taken looks broken. */
  it('empties the query when an option is taken and the popup stays open', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    openSearch();
    type('berr');
    expect(visible()).toHaveLength(2);

    pressOption(fixture, named('Blueberry'));
    expect(visible()).toHaveLength(4);
    expect(document.querySelector("[role='dialog']")).not.toBeNull();
    expect(fixture.componentInstance.searchReason()).toBe('select');
  });

  it('forgets the query when the popup closes', () => {
    openSearch();
    type('berr');
    send('Escape');
    send('Escape');
    expect(document.querySelector("[role='dialog']")).toBeNull();

    openSearch();
    expect(field().value).toBe('');
    expect(visible()).toHaveLength(4);
  });
});
