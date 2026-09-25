import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { plainDate, plainDateTime, plainTime, toISODateTime } from '@slotted/core/date';
import type { PlainDate, PlainDateTime, PlainTime } from '@slotted/core/date';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/datetime-picker/contract.json';
import { SlDateTimePicker } from './datetime-picker';
import type { DateTimePickerHighlight } from './datetime-picker';
import { provideDateTimePickerDefaults } from './datetime-picker-defaults';
import {
  SlDateTimePickerFooter,
  SlDateTimePickerOption,
  SlDateTimePickerPresets,
} from './datetime-picker-parts';

const TENTH = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
/** Stated rather than read from the clock, so every assertion below is fixed. */
const REFERENCE = plainDateTime(plainDate(2026, 9, 10), plainTime(12, 0));

@Component({
  standalone: true,
  imports: [
    SlDateTimePicker,
    SlDateTimePickerFooter,
    SlDateTimePickerOption,
    SlDateTimePickerPresets,
  ],
  template: `<div slDateTimePicker></div>`,
})
class Host {
  readonly value = signal<PlainDateTime | null | undefined>(undefined);
  readonly tenth = TENTH;
  readonly reference = REFERENCE;
  readonly irregular = [plainTime(9, 0), plainTime(9, 20), plainTime(13, 45)];
  readonly closedDay = (_time: PlainTime, date: PlainDate) => date.day === 12;
  readonly onValue = vi.fn();
  readonly onOpen = vi.fn();
  readonly onHighlight = vi.fn((request: { value: DateTimePickerHighlight }) => request);
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
  fixture.nativeElement.querySelector(
    '[data-ui="datetime-picker"][data-part="root"]',
  ) as HTMLElement;
const panel = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="content"]') as HTMLElement | null;
const trigger = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="trigger"]') as HTMLButtonElement;
const options = (fixture: Fixture) =>
  [...fixture.nativeElement.querySelectorAll('[data-part="option"]')] as HTMLElement[];
const hidden = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="hidden-input"]') as HTMLInputElement;
const list = (fixture: Fixture) =>
  fixture.nativeElement.querySelector('[data-part="list"]') as HTMLElement | null;

const dayCell = (fixture: Fixture, day: number) =>
  [...fixture.nativeElement.querySelectorAll('[data-part="day"]')].find(
    (element) => (element as HTMLElement).textContent?.trim() === String(day),
  ) as HTMLElement;

const click = (fixture: Fixture, element: HTMLElement) => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  fixture.detectChanges();
};

const key = (
  fixture: Fixture,
  element: HTMLElement,
  name: string,
  init: KeyboardEventInit = {},
) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: name, ...init }));
  fixture.detectChanges();
};

const OPEN = `locale="pt-BR" name="quando" defaultOpen [referenceDateTime]="reference"`;

describe('anatomy', () => {
  /**
   * The family composes the field and the grid and redraws neither. A second
   * segmented control or a second month grid would be two places to fix one
   * defect.
   */
  it('composes the field and the calendar rather than drawing either again', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);

    expect(root(fixture).dataset['ui']).toBe(contract.ui);
    expect(fixture.nativeElement.querySelector('[data-ui="datetime-field"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-ui="calendar"]')).not.toBeNull();
  });

  /** The role the APG's own Date Picker Combobox example gives its popup. */
  it('opens one dialog holding a grid and a listbox', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);

    expect(panel(fixture)?.getAttribute('role')).toBe('dialog');
    expect(trigger(fixture).getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="grid"]')).not.toBeNull();
    expect(list(fixture)?.getAttribute('role')).toBe('listbox');
  });

  /**
   * A `tablist` that exists on a narrow container and not on a wide one tells
   * assistive technology two different stories about the same component.
   */
  it('keeps both surfaces in the DOM, and draws no tablist at all', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);

    expect(panel(fixture)?.querySelector('[data-part="date-panel"]')).not.toBeNull();
    expect(panel(fixture)?.querySelector('[data-part="time-panel"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull();
  });

  it('says what the reader has so far at the head, and names no surface', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);
    const head = panel(fixture)?.querySelector('[data-part="head-value"]');
    expect(head?.textContent).toContain('setembro');
    expect(panel(fixture)?.querySelector('[data-part="panel-label"]')).toBeNull();
  });

  it('draws the missing half as a placeholder in the head', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN}></div>`);
    const placeholder = panel(fixture)?.querySelector(
      '[data-part="head-value"] [data-placeholder]',
    );
    expect(placeholder?.textContent?.trim()).toBe('--:--');
  });

  it('gives the list its own name: the day its times belong to', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);
    expect(list(fixture)?.getAttribute('aria-label')).toContain('set');
  });

  /** The two marks are `Glyph` elements inside an `Icon` box, never masks. */
  it('draws the calendar on the trigger and the clock on now as glyph elements', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);
    const mark = (element: Element | null | undefined) =>
      element?.querySelector("[data-ui='icon'] > svg[data-glyph]")?.getAttribute('data-glyph');
    expect(mark(trigger(fixture))).toBe(contract.marks.trigger);
    expect(mark(panel(fixture)?.querySelector('[data-part="now"]'))).toBe(contract.marks.now);
  });
});

describe('focus follows the missing half', () => {
  /**
   * The decision this family owes, in one sentence: the press that leaves the
   * value incomplete carries focus to the half that is missing, and the press
   * that completes the value closes the panel.
   */
  it('closes on the press that completed the value', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN}></div>`);

    click(fixture, dayCell(fixture, 11));

    expect(panel(fixture)).toBeNull();
    expect(hidden(fixture).value).toBe('2026-09-11T12:00:00');
  });

  /**
   * A value that was already whole is not completed by anything, so a reader
   * who opened a filled field to change both halves is not shut out by their
   * first press. Ant spends a confirm button on this and Kendo spends Set.
   */
  it('leaves the panel open when the value was already whole', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`);
    click(fixture, dayCell(fixture, 11));
    expect(panel(fixture)).not.toBeNull();
  });

  it('closes on any press that changes the value when closeOnSelect is always', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} closeOnSelect="always" [defaultValue]="tenth"></div>`,
    );
    click(fixture, dayCell(fixture, 11));
    expect(panel(fixture)).toBeNull();
  });

  it('closes on nothing when closeOnSelect is never', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} closeOnSelect="never"></div>`);
    click(fixture, dayCell(fixture, 11));
    expect(panel(fixture)).not.toBeNull();
  });
});

describe('the list', () => {
  it('offers one row per step, at the step the consumer set', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth"></div>`,
    );
    expect(options(fixture)).toHaveLength(24);
  });

  /**
   * The list answers the day the reader is on rather than a day already
   * committed, so a closed day empties it while the reader is still deciding.
   */
  it('empties on a day whose window is closed', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} unavailableOptions="hide" [isTimeUnavailable]="closedDay"></div>`,
    );
    expect(options(fixture).length).toBeGreaterThan(0);

    click(fixture, dayCell(fixture, 12));
    expect(panel(fixture)?.querySelector('[data-part="empty"]')).not.toBeNull();
  });

  it('takes an explicit list of times in the consumer s own order', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [options]="irregular" [defaultValue]="tenth"></div>`,
    );
    expect(options(fixture).map((element) => element.textContent?.trim())).toEqual([
      '09:00',
      '09:20',
      '13:45',
    ]);
  });

  it('cuts the list at maxOptions and says so in the DOM', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [maxOptions]="4" [step]="900" [defaultValue]="tenth"></div>`,
    );
    expect(options(fixture)).toHaveLength(4);
    expect(list(fixture)?.dataset['truncated']).toBe('');
    expect(panel(fixture)?.getAttribute('aria-description')).toBeTruthy();
  });

  /**
   * Both pairs of bounds apply at once, and the first day of the range holds a
   * partial window — the rule MDN states for the platform and no surveyed
   * script implements.
   */
  it('opens the first day of the range where the range starts', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600"
        [min]="{ date: { year: 2026, month: 9, day: 10 }, time: { hour: 14, minute: 0, second: 0 } }"
        [max]="{ date: { year: 2026, month: 9, day: 30 }, time: { hour: 11, minute: 0, second: 0 } }"
        [minTime]="{ hour: 9, minute: 0, second: 0 }"
        [maxTime]="{ hour: 18, minute: 0, second: 0 }"></div>`,
    );
    expect(options(fixture).map((element) => element.textContent?.trim())).toEqual([
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ]);
  });
});

describe('keyboard', () => {
  it('moves the highlight with the arrows and selects with Enter', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth"></div>`,
    );

    key(fixture, list(fixture) as HTMLElement, 'ArrowDown');
    const current = options(fixture).find((element) => element.dataset['current'] === '');
    expect(current?.textContent?.trim()).toBe('16:00');

    key(fixture, list(fixture) as HTMLElement, 'Enter');
    expect(hidden(fixture).value).toBe('2026-09-10T16:00:00');
  });

  it('jumps an hour boundary on PageDown', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="900" [defaultValue]="tenth"></div>`,
    );
    key(fixture, list(fixture) as HTMLElement, 'PageDown');
    const current = options(fixture).find((element) => element.dataset['current'] === '');
    expect(current?.textContent?.trim()).toBe('16:00');
  });

  it('takes Home and End to the two ends of the list', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth"></div>`,
    );
    key(fixture, list(fixture) as HTMLElement, 'Home');
    expect(options(fixture)[0]?.dataset['current']).toBe('');
    key(fixture, list(fixture) as HTMLElement, 'End');
    expect(options(fixture).at(-1)?.dataset['current']).toBe('');
  });

  /**
   * The highlight moves and the value does not: the listbox pattern lists
   * selection-following-focus as optional and warns it can degrade
   * accessibility.
   */
  it('does not move the value as the highlight moves', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth" (valueChange)="onValue($event)"></div>`,
    );
    const host = fixture.componentInstance as Host;
    key(fixture, list(fixture) as HTMLElement, 'ArrowDown');
    expect(host.onValue).not.toHaveBeenCalled();
  });

  /**
   * The chord both sibling pickers took, with the same recorded cost: ChromeOS
   * turns it into `PageDown` before the browser sees it.
   */
  it('opens on Alt+ArrowDown from the control', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker locale="pt-BR" [referenceDateTime]="reference" [defaultValue]="tenth"></div>`,
    );
    const control = fixture.nativeElement.querySelector('[data-part="control"]') as HTMLElement;
    key(fixture, control, 'ArrowDown', { altKey: true });
    expect(panel(fixture)).not.toBeNull();
  });
});

describe('the contract with the consumer', () => {
  it('holds the value itself when nobody else does', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth"></div>`,
    );
    click(fixture, options(fixture)[8] as HTMLElement);
    expect(hidden(fixture).value).toBe('2026-09-10T08:00:00');
  });

  it('owns the open state when the consumer states it', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker locale="pt-BR" [open]="false" [defaultValue]="tenth" (openChange)="onOpen($event)"></div>`,
    );
    const host = fixture.componentInstance as Host;
    click(fixture, trigger(fixture));
    expect(host.onOpen).toHaveBeenCalled();
    expect(panel(fixture)).toBeNull();
  });

  it('writes the current datetime from the head', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN}></div>`);
    const now = panel(fixture)?.querySelector('[data-part="now"]') as HTMLButtonElement;
    click(fixture, now);
    expect(hidden(fixture).value).toBe(toISODateTime(REFERENCE));
  });

  it('takes its defaults from a provider', () => {
    const fixture = renderTemplate(`<div slDateTimePicker ${OPEN} [defaultValue]="tenth"></div>`, [
      provideDateTimePickerDefaults({ nowLabel: 'Agora', step: 3600 }),
    ]);
    expect(panel(fixture)?.querySelector('[data-part="now"]')?.textContent?.trim()).toBe('Agora');
    expect(options(fixture)).toHaveLength(24);
  });

  it('takes the consumer s own slots', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [defaultValue]="tenth">
         <div slDateTimePickerPresets><button type="button">Amanhã</button></div>
         <div slDateTimePickerFooter><button type="button">Aplicar</button></div>
       </div>`,
    );
    expect(panel(fixture)?.querySelector('[data-part="presets"]')).not.toBeNull();
    expect(panel(fixture)?.querySelector('[data-part="footer"]')).not.toBeNull();
  });

  it('draws one row the consumer s own way', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker ${OPEN} [step]="3600" [defaultValue]="tenth">
         <ng-template slDateTimePickerOption let-time let-label="label">
           <span data-test="row">{{ label }}</span>
         </ng-template>
       </div>`,
    );
    expect(fixture.nativeElement.querySelectorAll('[data-test="row"]')).toHaveLength(24);
  });

  it('refuses to open while it is not editable', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker locale="pt-BR" disabled [defaultValue]="tenth"></div>`,
    );
    expect(root(fixture).dataset['disabled']).toBe('');
    expect(trigger(fixture).disabled).toBe(true);
  });

  it('names the chosen value on the trigger, because focus returns there', () => {
    const empty = renderTemplate(`<div slDateTimePicker locale="pt-BR"></div>`);
    expect(trigger(empty).getAttribute('aria-label')).toBe('Choose date and time');

    const chosen = renderTemplate(
      `<div slDateTimePicker locale="pt-BR" [defaultValue]="tenth"></div>`,
    );
    expect(trigger(chosen).getAttribute('aria-label')).toContain('setembro');
  });

  it('reports a value the bounds refuse', () => {
    const fixture = renderTemplate(
      `<div slDateTimePicker locale="pt-BR" [defaultValue]="tenth"
        [min]="{ date: { year: 2026, month: 9, day: 11 }, time: { hour: 9, minute: 0, second: 0 } }"></div>`,
    );
    expect(root(fixture).dataset['invalid']).toBe('');
  });
});
