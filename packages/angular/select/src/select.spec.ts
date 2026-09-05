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

  it('names the chosen option in the closed control', () => {
    open();
    named('Blueberry').click();
    fixture.detectChanges();
    expect(trigger().textContent?.trim()).toBe('Blueberry');
  });

  it('summarises several values and keeps the popup open while they are taken', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    open();
    expect(listbox()?.getAttribute('aria-multiselectable')).toBe('true');

    named('Apple').click();
    fixture.detectChanges();
    named('Cherry').click();
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    expect(trigger().textContent?.trim()).toBe('Apple +1');
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
