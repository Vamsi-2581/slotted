import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SlMultiSelect } from './multi-select';
import { SlMultiSelectItem } from './multi-select-items';
import type { MultiSelectRefuseCause } from './multi-select-defaults';

@Component({
  standalone: true,
  imports: [SlMultiSelect, SlMultiSelectItem],
  template: `
    <sl-multi-select
      aria-label="Fruit"
      [portal]="false"
      [defaultValue]="defaultValue()"
      [creatable]="creatable()"
      [editable]="editable()"
      [reorderable]="reorderable()"
      [allowDuplicates]="allowDuplicates()"
      [max]="max()"
      [name]="name()"
      (valueChange)="value.set($event)"
      (valueChangeRequest)="reason.set($event.reason)"
      (valueRefuse)="refused.set($event)"
    >
      <sl-multi-select-item value="blueberry" label="Blueberry" />
      <sl-multi-select-item value="raspberry" label="Raspberry" />
      <sl-multi-select-item value="cloudberry" label="Cloudberry" disabled />
    </sl-multi-select>
  `,
})
class Host {
  readonly defaultValue = signal<readonly string[] | undefined>(undefined);
  readonly creatable = signal(false);
  readonly editable = signal(false);
  readonly reorderable = signal(false);
  readonly allowDuplicates = signal(false);
  readonly max = signal<number | undefined>(undefined);
  readonly name = signal<string | undefined>(undefined);
  readonly value = signal<readonly string[] | undefined>(undefined);
  readonly reason = signal<string | undefined>(undefined);
  readonly refused = signal<{ values: readonly string[]; cause: MultiSelectRefuseCause } | null>(
    null,
  );
}

const field = () => document.querySelector<HTMLInputElement>("[data-part='input']")!;
const grid = () => document.querySelector<HTMLElement>("[data-part='control']")!;
const root = () =>
  document.querySelector<HTMLElement>("[data-ui='multi-select'][data-part='root']")!;
const chips = () =>
  [
    ...document.querySelectorAll<HTMLElement>(
      "[data-part='chips'] > [role='gridcell']:not([data-part='field'])",
    ),
  ].filter((chip) => chip.hasAttribute('data-value'));
const chipValues = () => chips().map((chip) => chip.dataset['value']);
const optionFor = (value: string) =>
  document.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)!;

const press = (target: Element, key: string, modifiers: KeyboardEventInit = {}) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...modifiers }));

const type = (fixture: ComponentFixture<unknown>, text: string) => {
  field().value = text;
  field().dispatchEvent(new Event('input'));
  fixture.detectChanges();
};

const settle = async (fixture: ComponentFixture<unknown>) => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

const open = async (fixture: ComponentFixture<unknown>) => {
  field().focus();
  press(field(), 'ArrowDown');
  await settle(fixture);
};

describe('SlMultiSelect', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
  });

  it('is a combobox controlling a multi-selectable listbox, inside a layout grid', async () => {
    fixture.detectChanges();
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().getAttribute('aria-autocomplete')).toBe('list');
    expect(grid().getAttribute('role')).toBe('grid');
    expect(document.querySelector("[data-part='chips']")?.getAttribute('role')).toBe('row');

    await open(fixture);
    const listbox = document.querySelector("[data-part='content']")!;
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    expect(field().getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('is one tab stop, whatever the row holds', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    await settle(fixture);
    expect(field().hasAttribute('tabindex')).toBe(false);
    for (const chip of chips()) expect(chip.getAttribute('tabindex')).toBe('-1');
    expect(document.querySelector("[data-part='trigger']")?.getAttribute('tabindex')).toBe('-1');
  });

  it('adds and removes a value from the popup, and keeps the popup open', async () => {
    await open(fixture);
    optionFor('blueberry').click();
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry']);
    expect(document.querySelector("[data-part='content']")).not.toBeNull();

    optionFor('raspberry').click();
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry', 'raspberry']);

    optionFor('blueberry').click();
    await settle(fixture);
    expect(chipValues()).toEqual(['raspberry']);
  });

  /**
   * §6's rule: `Backspace` removes only from an empty field, and the
   * predictable half is two presses — one to see what is about to go and one to
   * let it go.
   */
  it('removes with Backspace only from an empty field, and only on the second press', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    await settle(fixture);
    field().focus();

    type(fixture, 'be');
    press(field(), 'Backspace');
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry', 'raspberry']);

    type(fixture, '');
    press(field(), 'Backspace');
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry', 'raspberry']);
    expect(document.activeElement).toBe(chips()[1]);

    press(chips()[1]!, 'Backspace');
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry']);
  });

  it('takes a value out from the chip that holds it', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    await settle(fixture);
    press(chips()[0]!, 'Delete');
    await settle(fixture);
    expect(chipValues()).toEqual(['raspberry']);
    expect(fixture.componentInstance.reason()).toBe('remove');
  });

  it('commits the typed text on a delimiter, and only where creation is allowed', async () => {
    fixture.detectChanges();
    field().focus();
    type(fixture, 'fig');
    press(field(), ',');
    await settle(fixture);
    expect(chipValues()).toEqual([]);

    fixture.componentInstance.creatable.set(true);
    await settle(fixture);
    type(fixture, 'fig');
    press(field(), ',');
    await settle(fixture);
    expect(chipValues()).toEqual(['fig']);
    expect(field().value).toBe('');
    expect(fixture.componentInstance.reason()).toBe('submit');
  });

  /**
   * Every icon the family owns is a `Glyph` element inside an `Icon` box, never
   * a mask, and the offer to add takes the plus where a chosen option takes the
   * check.
   */
  it('draws the chevron, the cross, the tick and the plus as glyph elements', async () => {
    fixture.componentInstance.creatable.set(true);
    fixture.componentInstance.defaultValue.set(['blueberry']);
    await settle(fixture);
    const glyph = (part: string) =>
      document.querySelector(`[data-part='${part}'] > [data-ui='icon'] > svg[data-glyph]`);
    expect(glyph('arrow')?.getAttribute('data-glyph')).toBe('chevron-down');
    expect(glyph('clear')?.getAttribute('data-glyph')).toBe('x');
    expect(glyph('remove')?.getAttribute('data-glyph')).toBe('x');

    await open(fixture);
    const mark = (option: Element | null) =>
      option?.querySelector("[data-part='indicator'] > [data-ui='icon'] > svg");
    expect(mark(optionFor('blueberry'))?.getAttribute('data-glyph')).toBe('check');

    type(fixture, 'Quince');
    await settle(fixture);
    const offer = document.querySelector("[data-part='item'][data-create]");
    expect(mark(offer)?.getAttribute('data-glyph')).toBe('plus');
  });

  it('takes up to the limit and reports the rest rather than dropping it', async () => {
    fixture.componentInstance.creatable.set(true);
    fixture.componentInstance.max.set(2);
    await settle(fixture);
    field().focus();

    const paste = new Event('paste') as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => 'fig,plum,pear,lime' },
    });
    field().dispatchEvent(paste);
    await settle(fixture);

    expect(chipValues()).toEqual(['fig', 'plum']);
    expect(fixture.componentInstance.refused()).toEqual({
      values: ['pear', 'lime'],
      cause: 'limit',
    });
  });

  it('says a full control with the word the vocabulary already had', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    fixture.componentInstance.max.set(2);
    await settle(fixture);

    expect(root().hasAttribute('data-complete')).toBe(true);
    expect(document.querySelector("[data-part='counter']")?.textContent?.trim()).toBe('2 of 2');

    await open(fixture);
    expect(optionFor('cloudberry').getAttribute('aria-disabled')).toBe('true');
    /* A value already held stays takeable: taking it out is what a full control
       still has to allow. */
    expect(optionFor('blueberry').getAttribute('aria-disabled')).toBeNull();
  });

  it('refuses a duplicate, reports it, and puts focus on the chip that holds it', async () => {
    fixture.componentInstance.creatable.set(true);
    fixture.componentInstance.defaultValue.set(['fig']);
    await settle(fixture);
    field().focus();
    type(fixture, 'FIG');
    press(field(), ',');
    await settle(fixture);

    expect(chipValues()).toEqual(['fig']);
    expect(fixture.componentInstance.refused()).toEqual({ values: ['FIG'], cause: 'duplicate' });
    expect(document.activeElement).toBe(chips()[0]);
  });

  it('lets a duplicate in when the consumer allows one', async () => {
    fixture.componentInstance.allowDuplicates.set(true);
    fixture.componentInstance.creatable.set(true);
    fixture.componentInstance.defaultValue.set(['fig']);
    await settle(fixture);
    field().focus();
    type(fixture, 'fig');
    press(field(), ',');
    await settle(fixture);
    expect(chipValues()).toEqual(['fig', 'fig']);
  });

  /** Reorder emits `keyboard` and nothing else. */
  it('moves a value with Alt and an arrow, under the one reason reorder emits', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry', 'cloudberry']);
    fixture.componentInstance.reorderable.set(true);
    await settle(fixture);

    press(chips()[0]!, 'ArrowRight', { altKey: true });
    await settle(fixture);
    expect(chipValues()).toEqual(['raspberry', 'blueberry', 'cloudberry']);
    expect(fixture.componentInstance.reason()).toBe('keyboard');

    press(chips()[1]!, 'End', { altKey: true });
    await settle(fixture);
    expect(chipValues()).toEqual(['raspberry', 'cloudberry', 'blueberry']);
  });

  it('does not move a value where reorder was not asked for', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    await settle(fixture);
    press(chips()[0]!, 'ArrowRight', { altKey: true });
    await settle(fixture);
    expect(chipValues()).toEqual(['blueberry', 'raspberry']);
  });

  it('edits a chip in place, and commits it as one value', async () => {
    fixture.componentInstance.creatable.set(true);
    fixture.componentInstance.editable.set(true);
    fixture.componentInstance.defaultValue.set(['fig']);
    await settle(fixture);

    press(chips()[0]!, 'Enter');
    await settle(fixture);
    const editor = document.querySelector<HTMLInputElement>(
      "[data-part='chips'] input:not([data-part='input'])",
    )!;
    editor.value = 'figs';
    editor.dispatchEvent(new Event('input'));
    press(editor, 'Enter');
    await settle(fixture);

    expect(chipValues()).toEqual(['figs']);
  });

  it('clears the whole set at once, and says so', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    await settle(fixture);
    document.querySelector<HTMLButtonElement>("[data-part='clear']")!.click();
    await settle(fixture);
    expect(chipValues()).toEqual([]);
    expect(fixture.componentInstance.reason()).toBe('clear');
  });

  it('submits several values under one name', async () => {
    fixture.componentInstance.defaultValue.set(['blueberry', 'raspberry']);
    fixture.componentInstance.name.set('fruit');
    await settle(fixture);
    const hidden = [...document.querySelectorAll<HTMLInputElement>('input[name="fruit"]')];
    expect(hidden.map((element) => element.value)).toEqual(['blueberry', 'raspberry']);
  });

  /**
   * The asymmetry the design records rather than levels away: Angular gets a
   * `Validator` React has no equivalent of, so a Reactive Form sees `tooMany`
   * without the consumer writing it.
   */
  it('reports the validities a native input cannot describe', async () => {
    fixture.componentInstance.max.set(1);
    await settle(fixture);
    const instance = fixture.debugElement.children[0]!.componentInstance as SlMultiSelect;

    expect(instance.validate()).toBeNull();
    instance.value.set(['a', 'b']);
    expect(instance.validate()).toEqual({ tooMany: { max: 1, actual: 2 } });
    instance.value.set(['a', 'a']);
    fixture.componentInstance.max.set(undefined);
    await settle(fixture);
    expect(instance.validate()).toEqual({ duplicate: true });
  });
});

@Component({
  standalone: true,
  imports: [SlMultiSelect, SlMultiSelectItem],
  template: `
    <sl-multi-select aria-label="Fruit" [portal]="false">
      <sl-multi-select-item value="blueberry" label="Blueberry" icon="dot" />
      <sl-multi-select-item value="raspberry" label="Raspberry" />
    </sl-multi-select>
  `,
})
class IconHost {}

/** The first column holds the glyph the icon input names; no stylesheet fills it. */
describe('SlMultiSelect, the icon column', () => {
  it('draws the named glyph in the first column, and prints no name there', async () => {
    await TestBed.configureTestingModule({ imports: [IconHost] }).compileComponents();
    const fixture = TestBed.createComponent(IconHost);
    fixture.detectChanges();
    await open(fixture);

    const column = optionFor('blueberry').querySelector("[data-part='icon']");
    expect(column?.querySelector("[data-ui='icon'] > svg")?.getAttribute('data-glyph')).toBe('dot');
    expect(column?.textContent?.trim()).toBe('');
    expect(optionFor('raspberry').querySelector("[data-part='icon']")).toBeNull();
  });
});
