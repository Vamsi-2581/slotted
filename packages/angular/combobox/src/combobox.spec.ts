import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SlCombobox } from './combobox';
import { SlComboboxItem } from './combobox-items';

@Component({
  standalone: true,
  imports: [SlCombobox, SlComboboxItem],
  template: `
    <sl-combobox
      aria-label="Fruit"
      [defaultValue]="defaultValue()"
      [portal]="false"
      (valueChange)="value.set($event)"
    >
      <sl-combobox-item value="blueberry" label="Blueberry" />
      <sl-combobox-item value="raspberry" label="Raspberry" />
    </sl-combobox>
  `,
})
class Host {
  readonly defaultValue = signal<string | null | undefined>(undefined);
  readonly value = signal<string | null | undefined>(undefined);
}

@Component({
  standalone: true,
  imports: [SlCombobox, SlComboboxItem],
  template: `
    <sl-combobox
      aria-label="Fruit"
      [portal]="false"
      [items]="items"
      [allowsCustomValue]="allowsCustomValue()"
      [defaultValue]="defaultValue()"
      [inputValue]="inputText()"
      (valueChangeRequest)="requested.set($event.value)"
      (inputReset)="refused.set($event.rejected)"
    >
      <sl-combobox-item value="apple" label="Apple" />
    </sl-combobox>
  `,
})
class SettleHost {
  readonly items = [{ value: 'apple', label: 'Apple' }];
  readonly allowsCustomValue = signal(false);
  readonly defaultValue = signal<string | null | undefined>(undefined);
  readonly inputText = signal('');
  readonly requested = signal<string | null | undefined>(undefined);
  readonly refused = signal<string | undefined>(undefined);
}

@Component({
  standalone: true,
  imports: [SlCombobox, SlComboboxItem],
  template: `
    <sl-combobox aria-label="Fruit" defaultValue="raspberry" [portal]="false" [(value)]="value">
      <sl-combobox-item value="blueberry" label="Blueberry" />
      <sl-combobox-item value="raspberry" label="Raspberry" />
    </sl-combobox>
  `,
})
class BoundHost {
  value: string | null = 'blueberry';
}

@Component({
  standalone: true,
  imports: [SlCombobox, SlComboboxItem],
  template: `
    <sl-combobox
      aria-label="Fruit"
      [portal]="false"
      [open]="true"
      [creatable]="creatable()"
      (create)="created.set($event.query)"
      (valueChangeRequest)="requested.set($event.value)"
    >
      <sl-combobox-item value="apple" label="Apple" />
    </sl-combobox>
  `,
})
class CreateHost {
  readonly creatable = signal(true);
  readonly created = signal<string | undefined>(undefined);
  readonly requested = signal<string | null | undefined>(undefined);
}

const field = () =>
  document.querySelector<HTMLInputElement>("[data-part='input']") as HTMLInputElement;

const marks = () => [...document.querySelectorAll("[data-part='match']")];

describe('SlCombobox', () => {
  /**
   * R6/CB6: the span the query found is the shared mark. It wears
   * `data-ui='highlight'` beside this family's own part, so one sheet paints
   * what every list a reader types into found, and the same element is written
   * here, in React, and in the harness fragment.
   */
  describe('the marked span', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    });

    it('wears the shared highlight identifier', async () => {
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      field().focus();
      field().value = 'berr';
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(marks().length).toBeGreaterThan(0);
      for (const mark of marks()) {
        expect(mark.tagName).toBe('MARK');
        expect(mark.getAttribute('data-ui')).toBe('highlight');
      }
    });
  });

  /**
   * CB7. The default refuses text that matched no option: the field goes back
   * to the committed value and says what it refused. `allowsCustomValue` takes
   * it as the value instead. React's binding states the reasoning.
   */
  /**
   * CB8. The offer to add what was typed is an option, so the keyboard reaches
   * it and Enter takes it; taking it reports the query and selects nothing,
   * because the collection does not hold the value yet.
   */
  describe('creating a value the list does not hold', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [CreateHost] }).compileComponents();
    });

    const typeInto = (fixture: ComponentFixture<CreateHost>, text: string) => {
      field().value = text;
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    it('offers the query as an option, in place of the empty message', () => {
      const fixture = TestBed.createComponent(CreateHost);
      fixture.detectChanges();
      typeInto(fixture, 'durian');

      const offer = document.querySelector("[data-part='item'][data-create]");
      expect(offer?.textContent?.trim()).toBe('Create “durian”');
      expect(document.querySelector("[data-part='empty']")).toBeNull();
    });

    it('offers nothing while something matched, or while the field cannot create', () => {
      const fixture = TestBed.createComponent(CreateHost);
      fixture.detectChanges();
      typeInto(fixture, 'App');
      expect(document.querySelector('[data-create]')).toBeNull();

      fixture.componentInstance.creatable.set(false);
      typeInto(fixture, 'durian');
      expect(document.querySelector('[data-create]')).toBeNull();
      expect(document.querySelector("[data-part='empty']")).not.toBeNull();
    });

    it('reports the query and selects nothing when the offer is taken', () => {
      const fixture = TestBed.createComponent(CreateHost);
      fixture.detectChanges();
      typeInto(fixture, 'durian');

      document.querySelector<HTMLElement>('[data-create]')?.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.created()).toBe('durian');
      expect(fixture.componentInstance.requested()).toBeUndefined();
    });
  });

  describe('text that matches no option', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [SettleHost] }).compileComponents();
    });

    it('puts the field back to the committed value, and says what it refused', () => {
      const fixture = TestBed.createComponent(SettleHost);
      fixture.componentInstance.defaultValue.set('apple');
      fixture.componentInstance.inputText.set('Apple');
      fixture.detectChanges();

      field().value = 'appl';
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      field().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('Apple');
      expect(fixture.componentInstance.refused()).toBe('appl');
    });

    it('takes the text as the value when the field allows one of its own', () => {
      const fixture = TestBed.createComponent(SettleHost);
      fixture.componentInstance.allowsCustomValue.set(true);
      fixture.detectChanges();

      field().value = 'kumquat';
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      field().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('kumquat');
      expect(fixture.componentInstance.requested()).toBe('kumquat');
      expect(fixture.componentInstance.refused()).toBeUndefined();
    });

    it('commits an option a reader typed in full rather than refusing it', () => {
      const fixture = TestBed.createComponent(SettleHost);
      fixture.detectChanges();

      field().value = 'Apple';
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      field().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      expect(fixture.componentInstance.requested()).toBe('apple');
      expect(field().value).toBe('Apple');
    });
  });

  describe('defaultValue', () => {
    let fixture: ComponentFixture<Host>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [Host, BoundHost] }).compileComponents();
      fixture = TestBed.createComponent(Host);
    });

    it('seeds an unbound value once, and leaves the text alone', () => {
      fixture.componentInstance.defaultValue.set('blueberry');
      fixture.detectChanges();

      const combobox = fixture.debugElement.children[0]?.componentInstance as SlCombobox;
      expect(combobox.value()).toBe('blueberry');
      expect(combobox.inputValue()).toBe('');
      expect(field().value).toBe('');
    });

    it('is not read again after init', () => {
      fixture.componentInstance.defaultValue.set('blueberry');
      fixture.detectChanges();
      fixture.componentInstance.defaultValue.set('raspberry');
      fixture.detectChanges();

      const combobox = fixture.debugElement.children[0]?.componentInstance as SlCombobox;
      expect(combobox.value()).toBe('blueberry');
    });

    it('yields to a value the consumer bound', () => {
      const bound = TestBed.createComponent(BoundHost);
      bound.detectChanges();

      const combobox = bound.debugElement.children[0]?.componentInstance as SlCombobox;
      expect(combobox.value()).toBe('blueberry');
      expect(bound.componentInstance.value).toBe('blueberry');
    });
  });
});
