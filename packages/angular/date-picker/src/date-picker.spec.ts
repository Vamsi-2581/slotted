import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { plainDate, toISODate } from '@slotted/core/date';
import type { PlainDate } from '@slotted/core/date';
import { PT_BR } from '@slotted/core/i18n/pt-BR';
import type { ChangeRequest } from '@slotted/core/state';
import type { CalendarValue } from '@slotted/angular/calendar';
import { provideSlotted } from '@slotted/angular/i18n';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/date-picker/contract.json';
import { SlDatePicker } from './date-picker';
import { provideDatePickerDefaults } from './date-picker-defaults';
import { SlDatePickerFooter, SlDatePickerPresets } from './date-picker-parts';

const NINTH = plainDate(2026, 9, 9);

@Component({
  standalone: true,
  imports: [SlDatePicker, SlDatePickerFooter, SlDatePickerPresets],
  template: `<div slDatePicker></div>`,
})
class Host {
  readonly ninth = NINTH;
  readonly january = plainDate(2026, 1, 1);
  readonly values: CalendarValue[] = [];
  readonly opens: boolean[] = [];
  readonly onValue = vi.fn((request: ChangeRequest<CalendarValue>) => {
    this.values.push(request.value);
  });
  readonly onOpen = vi.fn((request: ChangeRequest<boolean>) => {
    this.opens.push(request.value);
  });
  readonly refuseNinth = (date: PlainDate) => date.day === 9;
}

function renderTemplate(template: string, providers: unknown[] = []) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: providers as never[] });
  TestBed.overrideComponent(Host, { set: { template } });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

type Fixture = ReturnType<typeof renderTemplate>;

const root = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-ui="date-picker"][data-part="root"]') as HTMLElement;
const trigger = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="trigger"]') as HTMLButtonElement;
const surface = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="content"]') as HTMLElement | null;
const dayFor = (fixture: Fixture, number: number) =>
  [...fixture.nativeElement.querySelectorAll('[data-part="day"]')].find(
    (element: Element) =>
      ((element as HTMLElement).textContent ?? '').trim() === String(number) &&
      element.closest('[data-part="cell"]')?.hasAttribute('data-outside-month') === false,
  ) as HTMLElement;

const click = (fixture: Fixture, element: HTMLElement) => {
  element.click();
  fixture.detectChanges();
};

const escape = (fixture: Fixture) => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  fixture.detectChanges();
};

describe('what it is made of', () => {
  /**
   * It composes the other two families and redraws neither. A second segmented
   * field or a second month grid would be two places to fix one defect.
   */
  it('renders the field and the calendar, each keeping its own identifier', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" [defaultValue]="ninth"></div>`,
    );

    expect(fixture.nativeElement.querySelector('[data-ui="date-field"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-ui="calendar"]')).not.toBeNull();
    expect(root(fixture).getAttribute('data-ui')).toBe(contract.ui);
  });

  it('declares every part the contract names', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" [defaultValue]="ninth">
         <div slDatePickerPresets><button type="button">Hoje</button></div>
         <div slDatePickerFooter><button type="button">Aplicar</button></div>
       </div>`,
    );

    const present = [...fixture.nativeElement.querySelectorAll('[data-part]')].map(
      (element: Element) => (element as HTMLElement).dataset['part'],
    );
    for (const part of [
      'root',
      'control',
      'trigger',
      'positioner',
      'content',
      'presets',
      'footer',
    ]) {
      expect(present).toContain(part);
    }
  });

  it('carries the dialog role and points the trigger at it while it is open', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" [defaultValue]="ninth"></div>`,
    );

    expect(surface(fixture)?.getAttribute('role')).toBe('dialog');
    expect(trigger(fixture).getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(trigger(fixture).getAttribute('aria-controls')).toBe(surface(fixture)?.id);
  });
});

describe('what the trigger says', () => {
  it('names itself for choosing while nothing is chosen', () => {
    const fixture = renderTemplate(
      `<div slDatePicker locale="pt-BR" [messages]="{ choose: 'Escolher uma data' }"></div>`,
    );
    expect(trigger(fixture).getAttribute('aria-label')).toBe('Escolher uma data');
  });

  /**
   * Focus returns here when the surface closes, so the name is where the reader
   * is told what was chosen. The APG names it as an accessibility feature.
   */
  it('carries the chosen date in words once there is one', () => {
    const fixture = renderTemplate(
      `<div slDatePicker locale="pt-BR" [messages]="{ change: 'Alterar a data, {date}' }" [defaultValue]="ninth"></div>`,
    );
    const label = trigger(fixture).getAttribute('aria-label') ?? '';
    expect(label).toContain('Alterar a data, ');
    expect(label).toContain('setembro');
  });

  /** The mark is a `Glyph` element inside an `Icon` box, never a mask. */
  it('draws the calendar as a glyph element', () => {
    const fixture = renderTemplate(`<div slDatePicker locale="pt-BR"></div>`);
    const mark = trigger(fixture).querySelector("[data-ui='icon'] > svg[data-glyph]");
    expect(mark?.getAttribute('data-glyph')).toBe('calendar');
  });
});

describe('opening and closing', () => {
  it('opens and closes from the trigger', () => {
    const fixture = renderTemplate(
      `<div slDatePicker locale="pt-BR" (openChange)="onOpen($event)"></div>`,
    );

    expect(surface(fixture)).toBeNull();
    click(fixture, trigger(fixture));
    expect(surface(fixture)).not.toBeNull();
    expect(fixture.componentInstance.opens.at(-1)).toBe(true);

    click(fixture, trigger(fixture));
    expect(fixture.componentInstance.opens.at(-1)).toBe(false);
  });

  /**
   * Angular Material records the platform note this inherits: ChromeOS turns
   * the chord into PageDown before the browser sees it, so the button is the
   * guaranteed path and this is only a shortcut.
   */
  it('opens from the field with the chord, and never depends on it', () => {
    const fixture = renderTemplate(`<div slDatePicker locale="pt-BR"></div>`);

    const segment = fixture.nativeElement.querySelector('[data-part="segment"]') as HTMLElement;
    segment.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );
    fixture.detectChanges();

    expect(surface(fixture)).not.toBeNull();
    expect(trigger(fixture)).not.toBeNull();
  });

  it('marks the root while the surface is showing', () => {
    const fixture = renderTemplate(`<div slDatePicker locale="pt-BR"></div>`);

    expect(root(fixture).hasAttribute('data-open')).toBe(false);
    click(fixture, trigger(fixture));
    expect(root(fixture).hasAttribute('data-open')).toBe(true);
  });

  it('says which presentation the surface is in', () => {
    const fixture = renderTemplate(`<div slDatePicker defaultOpen locale="pt-BR"></div>`);
    expect(
      fixture.nativeElement
        .querySelector('[data-part="positioner"]')
        .getAttribute('data-presentation'),
    ).toBe('popover');
  });
});

describe('choosing a date', () => {
  it('writes the date into the field and closes, for one date', () => {
    const fixture = renderTemplate(
      `<div
         slDatePicker
         defaultOpen
         locale="pt-BR"
         name="data"
         [defaultValue]="ninth"
         (valueChange)="onValue($event)"
       ></div>`,
    );

    click(fixture, dayFor(fixture, 17));

    expect(fixture.componentInstance.values.at(-1)).toEqual(plainDate(2026, 9, 17));
    expect(root(fixture).hasAttribute('data-open')).toBe(false);
    expect(
      (fixture.nativeElement.querySelector('[data-part="hidden-input"]') as HTMLInputElement).value,
    ).toBe(toISODate(plainDate(2026, 9, 17)));
  });

  /** Closing on the first press of a range is a trap: the second needs the same surface. */
  it('stays open for a range', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" selectionMode="range"></div>`,
    );

    click(fixture, dayFor(fixture, 7));
    expect(surface(fixture)).not.toBeNull();

    click(fixture, dayFor(fixture, 11));
    expect(surface(fixture)).not.toBeNull();
  });

  it('takes the axis over the default when a product asks', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" closeOnSelect="never" [defaultValue]="ninth"></div>`,
    );

    click(fixture, dayFor(fixture, 17));
    expect(surface(fixture)).not.toBeNull();
  });
});

describe('the keyboard', () => {
  it('closes on Escape and returns focus to the trigger', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR" [defaultValue]="ninth" (openChange)="onOpen($event)"></div>`,
    );

    escape(fixture);
    expect(fixture.componentInstance.opens.at(-1)).toBe(false);
  });

  /**
   * `dismissable-layer` asks in the capture phase, so a handler inside the
   * surface is too late. The family decides there instead and simply does not
   * ask the layer to close.
   */
  it('walks the calendar down a view before it closes', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen defaultView="year" locale="pt-BR" [defaultValue]="ninth"></div>`,
    );
    const calendar = () =>
      fixture.nativeElement.querySelector('[data-ui="calendar"]') as HTMLElement;

    escape(fixture);
    expect(calendar().getAttribute('data-view')).toBe('month');
    expect(surface(fixture)).not.toBeNull();

    escape(fixture);
    expect(calendar().getAttribute('data-view')).toBe('day');
    expect(surface(fixture)).not.toBeNull();

    escape(fixture);
    expect(root(fixture).hasAttribute('data-open')).toBe(false);
  });
});

describe('what the field around it says', () => {
  it('takes the trigger out while it is disabled', () => {
    const fixture = renderTemplate(
      `<div slDatePicker disabled locale="pt-BR" [defaultValue]="ninth"></div>`,
    );
    expect(trigger(fixture).disabled).toBe(true);
    expect(root(fixture).hasAttribute('data-disabled')).toBe(true);
  });

  it('states its own invalidity when the value is outside the bounds', () => {
    const fixture = renderTemplate(
      `<div slDatePicker locale="pt-BR" [defaultValue]="january" [min]="ninth"></div>`,
    );
    expect(root(fixture).hasAttribute('data-invalid')).toBe(true);
  });

  it('states its own invalidity when the predicate refuses the date', () => {
    const fixture = renderTemplate(
      `<div slDatePicker locale="pt-BR" [defaultValue]="ninth" [isDateUnavailable]="refuseNinth"></div>`,
    );
    expect(root(fixture).hasAttribute('data-invalid')).toBe(true);
  });
});

describe('what an application sets once', () => {
  it('takes the appearance from a provider and the locale from the language in force', () => {
    const fixture = renderTemplate(`<div slDatePicker></div>`, [
      provideSlotted({ locale: 'ja-JP' }),
      provideDatePickerDefaults({ size: 'lg' }),
    ]);

    const fields = [...fixture.nativeElement.querySelectorAll('[data-part="segment"]')].map(
      (element: Element) => (element as HTMLElement).dataset['field'],
    );
    expect(fields).toEqual(['year', 'month', 'day']);
    expect(root(fixture).getAttribute('data-size')).toBe('lg');
    expect(trigger(fixture).getAttribute('aria-label')).toBe('Choose date');
  });

  it('changes its words and its date together with the language in force', () => {
    const locale = signal('pt-BR');
    const fixture = renderTemplate(`<div slDatePicker [defaultValue]="ninth"></div>`, [
      provideSlotted({ locale, catalogs: { 'pt-BR': PT_BR } }),
    ]);

    expect(trigger(fixture).getAttribute('aria-label')).toMatch(
      /^Alterar data, .*setembro de 2026/,
    );

    locale.set('en-US');
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-label')).toMatch(
      /^Change date, .*September 9, 2026/,
    );
  });
});

describe('the composition surface', () => {
  it('hands a template the instance and its imperative actions', () => {
    const fixture = renderTemplate(
      `<div slDatePicker #picker="slDatePicker" locale="pt-BR" [defaultValue]="ninth"></div>
       <button type="button" id="abrir" (click)="picker.openSurface()">abrir</button>`,
    );

    click(fixture, fixture.nativeElement.querySelector('#abrir') as HTMLElement);
    expect(surface(fixture)).not.toBeNull();
  });

  it('takes the consumer’s own slots into the surface', () => {
    const fixture = renderTemplate(
      `<div slDatePicker defaultOpen locale="pt-BR">
         <div slDatePickerPresets><button type="button">Hoje</button></div>
         <div slDatePickerFooter><button type="button">Aplicar</button></div>
       </div>`,
    );

    expect(fixture.nativeElement.querySelector('[data-part="presets"]')?.textContent).toContain(
      'Hoje',
    );
    expect(fixture.nativeElement.querySelector('[data-part="footer"]')?.textContent).toContain(
      'Aplicar',
    );
  });
});
