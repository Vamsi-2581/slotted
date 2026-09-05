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
    <sl-combobox aria-label="Fruit" defaultValue="raspberry" [portal]="false" [(value)]="value">
      <sl-combobox-item value="blueberry" label="Blueberry" />
      <sl-combobox-item value="raspberry" label="Raspberry" />
    </sl-combobox>
  `,
})
class BoundHost {
  value: string | null = 'blueberry';
}

const field = () =>
  document.querySelector<HTMLInputElement>("[data-part='input']") as HTMLInputElement;

describe('SlCombobox', () => {
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
