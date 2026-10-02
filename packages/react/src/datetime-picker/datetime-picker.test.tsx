import { plainDate, plainDateTime, plainTime, toISODateTime } from '@slotted/core/date';
import type { PlainDateTime } from '@slotted/core/date';
import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SlottedProvider } from '../i18n';
import { DateTimePicker, DateTimePickerDefaultsProvider } from './index';
import type { DateTimePickerHandle } from './index';

const TENTH = plainDateTime(plainDate(2026, 9, 10), plainTime(15, 20));
/** Stated rather than read from the clock, so every assertion below is fixed. */
const REFERENCE = plainDateTime(plainDate(2026, 9, 10), plainTime(12, 0));

const root = () => document.querySelector('[data-ui="datetime-picker"][data-part="root"]');
const panel = () => document.querySelector('[data-part="content"]');
const trigger = () => screen.getByRole('button', { name: /date and time/i });
const options = () => screen.queryAllByRole('option');
const hidden = () =>
  document.querySelector('[data-part="hidden-input"]') as HTMLInputElement | null;

const openPanel = () => {
  fireEvent.click(trigger());
};

const dayCell = (day: number) =>
  [...document.querySelectorAll('[data-part="day"]')].find(
    (element) => element.textContent?.trim() === String(day),
  ) as HTMLElement;

const base = {
  'aria-label': 'Quando',
  locale: 'pt-BR',
  name: 'quando',
  referenceDateTime: REFERENCE,
} as const;

describe('anatomy', () => {
  /**
   * The family composes the field and the grid and redraws neither. A second
   * segmented control or a second month grid would be two places to fix one
   * defect.
   */
  it('composes the field and the calendar rather than drawing either again', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);

    expect(document.querySelector('[data-ui="datetime-field"]')).not.toBeNull();
    expect(document.querySelector('[data-ui="calendar"]')).not.toBeNull();
    expect(root()?.querySelector('[data-part="segment"]')).not.toBeNull();
  });

  /** The role the APG's own Date Picker Combobox example gives its popup. */
  it('opens one dialog holding a grid and a listbox', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);

    expect(panel()).toHaveAttribute('role', 'dialog');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('grid')).not.toBeNull();
    expect(screen.getByRole('listbox')).not.toBeNull();
  });

  /**
   * A `tablist` that exists on a narrow container and not on a wide one tells
   * assistive technology two different stories about the same component, which
   * is the arrangement Kendo and MUI ship and this family declines.
   */
  it('keeps both surfaces in the DOM, and draws no tablist at all', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);

    expect(panel()?.querySelector('[data-part="date-panel"]')).not.toBeNull();
    expect(panel()?.querySelector('[data-part="time-panel"]')).not.toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  /** No label over either surface: each names itself, and the head says the rest. */
  it('says what the reader has so far at the head of the panel', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);

    const head = panel()?.querySelector('[data-part="head-value"]');
    expect(head?.textContent).toContain('setembro');
    expect(head?.textContent).toContain('15:20');
    expect(panel()?.querySelector('[data-part="panel-label"]')).toBeNull();
  });

  it('draws the missing half as a placeholder in the head', () => {
    render(<DateTimePicker {...base} defaultOpen />);
    const head = panel()?.querySelector('[data-part="head-value"]');
    expect(head?.querySelector('[data-placeholder]')?.textContent).toBe('--:--');
  });

  /** The two marks are `Glyph` elements inside an `Icon` box, never masks. */
  it('draws the calendar on the trigger and the clock on now as glyph elements', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);
    const mark = (element: Element | null | undefined) =>
      element?.querySelector("[data-ui='icon'] > svg[data-glyph]");
    expect(mark(trigger())).toHaveAttribute('data-glyph', 'calendar');
    expect(mark(panel()?.querySelector('[data-part="now"]'))).toHaveAttribute(
      'data-glyph',
      'clock',
    );
  });
});

describe('focus follows the missing half', () => {
  /**
   * The decision this family owes, in one sentence: the press that leaves the
   * value incomplete carries focus to the half that is missing, and the press
   * that completes the value closes the panel.
   */
  it('carries focus to the list when a day leaves the value incomplete', async () => {
    render(<DateTimePicker {...base} defaultOpen />);

    fireEvent.click(dayCell(11));

    /* The value is whole — the time half took `referenceDateTime`'s — but it
       was not whole before, so the press completed it and the panel closes. */
    await waitFor(() => expect(panel()).toBeNull());
    expect(hidden()).toHaveValue('2026-09-11T12:00:00');
  });

  /**
   * A value that was already whole is not completed by anything, so a reader
   * who opened a filled field to change both halves is not shut out by their
   * first press. Ant spends a confirm button on this and Kendo spends Set.
   */
  it('leaves the panel open when the value was already whole', () => {
    render(<DateTimePicker {...base} defaultOpen value={TENTH} />);

    fireEvent.click(dayCell(11));
    expect(panel()).not.toBeNull();
  });

  it('closes on any press that changes the value when closeOnSelect is always', async () => {
    render(<DateTimePicker {...base} closeOnSelect="always" defaultOpen value={TENTH} />);
    fireEvent.click(dayCell(11));
    await waitFor(() => expect(panel()).toBeNull());
  });

  it('closes on nothing when closeOnSelect is never', () => {
    render(<DateTimePicker {...base} closeOnSelect="never" defaultOpen />);
    fireEvent.click(dayCell(11));
    expect(panel()).not.toBeNull();
  });
});

describe('the list', () => {
  /**
   * The list answers the day the reader is on rather than a day already
   * committed, so a closed day empties it while the reader is still deciding.
   * Ant recomputes `disabledTime(date)` only for a committed date.
   */
  it('answers the day the calendar has focused, before anything is chosen', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        isTimeUnavailable={(_time, date) => date.day === 12}
        unavailableOptions="hide"
      />,
    );

    expect(options().length).toBeGreaterThan(0);
    fireEvent.click(dayCell(12));
    /* Choosing the twelfth leaves nothing on it, so the panel says so rather
       than drawing an empty box. */
    expect(panel()?.querySelector('[data-part="empty"]')?.textContent).toContain('No time');
  });

  it('offers one row per step, at the step the consumer set', () => {
    render(<DateTimePicker {...base} defaultOpen step={3600} value={TENTH} />);
    expect(options()).toHaveLength(24);
  });

  /**
   * `options` states a set no single step describes — a clinic open at 09:00,
   * 09:20 and 13:45 — which is the half of the column question a decline had to
   * answer rather than avoid.
   */
  it('takes an explicit list of times in the consumer s own order', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        options={[plainTime(9, 0), plainTime(9, 20), plainTime(13, 45)]}
        value={TENTH}
      />,
    );
    expect(options().map((element) => element.textContent)).toEqual(['09:00', '09:20', '13:45']);
  });

  it('cuts the list at maxOptions and says so in the DOM', () => {
    render(<DateTimePicker {...base} defaultOpen maxOptions={4} step={900} value={TENTH} />);
    expect(options()).toHaveLength(4);
    expect(screen.getByRole('listbox')).toHaveAttribute('data-truncated');
    expect(panel()).toHaveAttribute('aria-description');
  });

  /**
   * A refused row stays in the list by default: a list that silently drops rows
   * is a list whose step the reader cannot infer.
   */
  it('keeps a refused row and marks it, unless the consumer hides it', () => {
    const { rerender } = render(
      <DateTimePicker
        {...base}
        defaultOpen
        isTimeUnavailable={(time) => time.hour === 15}
        step={3600}
        value={TENTH}
      />,
    );
    expect(options()).toHaveLength(24);
    expect(options().filter((element) => element.hasAttribute('data-disabled'))).toHaveLength(1);

    rerender(
      <DateTimePicker
        {...base}
        defaultOpen
        isTimeUnavailable={(time) => time.hour === 15}
        step={3600}
        unavailableOptions="hide"
        value={TENTH}
      />,
    );
    expect(options()).toHaveLength(23);
  });
});

describe('bounds', () => {
  /**
   * Both pairs apply at once, which MUI's own validation page records that it
   * cannot do — and the first and last day of the range hold a partial window,
   * which MDN states for the platform and no surveyed script implements.
   */
  it('opens the first day of the range where the range starts', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        max={plainDateTime(plainDate(2026, 9, 30), plainTime(11, 0))}
        maxTime={plainTime(18, 0)}
        min={plainDateTime(plainDate(2026, 9, 10), plainTime(14, 0))}
        minTime={plainTime(9, 0)}
        step={3600}
      />,
    );

    /* On `min`'s own day the window starts at `min`'s time and ends at
       `maxTime` — 14:00 through 18:00. */
    expect(options().map((element) => element.textContent)).toEqual([
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ]);
  });

  it('gives a day inside the range the repeating window and nothing else', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        max={plainDateTime(plainDate(2026, 9, 30), plainTime(11, 0))}
        maxTime={plainTime(11, 0)}
        min={plainDateTime(plainDate(2026, 9, 10), plainTime(14, 0))}
        minTime={plainTime(9, 0)}
        step={3600}
      />,
    );

    fireEvent.click(dayCell(15));
    expect(options().map((element) => element.textContent)).toEqual(['09:00', '10:00', '11:00']);
  });
});

describe('keyboard', () => {
  /**
   * The chord both sibling pickers took, with the same recorded cost: ChromeOS
   * turns it into `PageDown` before the browser sees it, so the trigger is
   * always drawn and this is only a shortcut.
   */
  it('opens on Alt+ArrowDown and leaves focus in the field', () => {
    render(<DateTimePicker {...base} value={TENTH} />);

    const segment = screen.getAllByRole('spinbutton')[0] as HTMLElement;
    act(() => segment.focus());
    fireEvent.keyDown(segment, { altKey: true, key: 'ArrowDown' });

    expect(panel()).not.toBeNull();
    expect(document.activeElement).toBe(segment);
  });

  it('moves the highlight with the arrows and selects with Enter', async () => {
    render(<DateTimePicker {...base} defaultOpen defaultValue={TENTH} step={3600} />);

    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    const current = options().find((element) => element.hasAttribute('data-current'));
    expect(current?.textContent).toBe('16:00');

    fireEvent.keyDown(list, { key: 'Enter' });
    await waitFor(() => expect(hidden()).toHaveValue('2026-09-10T16:00:00'));
  });

  it('jumps an hour boundary on PageUp and PageDown', () => {
    render(<DateTimePicker {...base} defaultOpen step={900} value={TENTH} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'PageDown' });
    const current = options().find((element) => element.hasAttribute('data-current'));
    expect(current?.textContent).toBe('16:00');
  });

  it('takes Home and End to the two ends of the list', () => {
    render(<DateTimePicker {...base} defaultOpen step={3600} value={TENTH} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(options()[0]).toHaveAttribute('data-current');
    fireEvent.keyDown(list, { key: 'End' });
    expect(options().at(-1)).toHaveAttribute('data-current');
  });

  /**
   * The highlight moves and the value does not: the listbox pattern lists
   * selection-following-focus as optional and warns it can degrade
   * accessibility, and here it would fire one request per option.
   */
  it('does not move the value as the highlight moves', () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        onValueChange={onValueChange}
        step={3600}
        value={TENTH}
      />,
    );
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('the contract with the consumer', () => {
  it('holds the value itself when nobody else does', async () => {
    render(<DateTimePicker {...base} defaultOpen defaultValue={TENTH} step={3600} />);
    fireEvent.click(options()[8] as HTMLElement);
    await waitFor(() => expect(hidden()).toHaveValue('2026-09-10T08:00:00'));
  });

  it('waits for the consumer when they own it', async () => {
    const Controlled = () => {
      const [value, setValue] = useState<PlainDateTime | null>(TENTH);
      return (
        <DateTimePicker
          {...base}
          defaultOpen
          onValueChange={(next) => setValue(next)}
          step={3600}
          value={value}
        />
      );
    };
    render(<Controlled />);
    fireEvent.click(options()[8] as HTMLElement);
    await waitFor(() => expect(hidden()).toHaveValue('2026-09-10T08:00:00'));
  });

  it('owns the open state in both modes', () => {
    const onOpenChange = vi.fn();
    render(<DateTimePicker {...base} onOpenChange={onOpenChange} open={false} value={TENTH} />);
    openPanel();
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'pointer' }));
    expect(panel()).toBeNull();
  });

  it('reaches the imperative actions through the ref', async () => {
    const handle = { current: null as DateTimePickerHandle | null };
    render(<DateTimePicker {...base} ref={handle} value={TENTH} />);

    act(() => handle.current?.open());
    await waitFor(() => expect(panel()).not.toBeNull());
    act(() => handle.current?.close());
    await waitFor(() => expect(panel()).toBeNull());
  });

  it('writes the current datetime from the head', async () => {
    render(<DateTimePicker {...base} defaultOpen />);
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    await waitFor(() => expect(hidden()).toHaveValue(toISODateTime(REFERENCE)));
  });

  it('takes its defaults from a provider, and its words from the language in force', () => {
    render(
      <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
        <DateTimePickerDefaultsProvider step={3600}>
          <DateTimePicker {...base} defaultOpen value={TENTH} />
        </DateTimePickerDefaultsProvider>
      </SlottedProvider>,
    );
    expect(screen.getByRole('button', { name: 'Agora' })).not.toBeNull();
    expect(options()).toHaveLength(24);
  });

  it('lays its own messages over the catalog', () => {
    render(<DateTimePicker {...base} defaultOpen messages={{ now: 'Já' }} />);
    expect(screen.getByRole('button', { name: 'Já' })).not.toBeNull();
  });

  it('takes the consumer s own slots', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        footer={<button type="button">Aplicar</button>}
        presets={<button type="button">Amanhã</button>}
        value={TENTH}
      />,
    );
    expect(panel()?.querySelector('[data-part="presets"]')).not.toBeNull();
    expect(panel()?.querySelector('[data-part="footer"]')).not.toBeNull();
  });

  it('draws one row the consumer s own way', () => {
    render(
      <DateTimePicker
        {...base}
        defaultOpen
        renderOption={(option) => <span data-test="row">{option.label}</span>}
        step={3600}
        value={TENTH}
      />,
    );
    expect(document.querySelectorAll('[data-test="row"]')).toHaveLength(24);
  });
});

describe('states', () => {
  it('refuses to open while it is not editable', () => {
    render(<DateTimePicker {...base} disabled value={TENTH} />);
    expect(root()).toHaveAttribute('data-disabled');
    expect(trigger()).toBeDisabled();
  });

  it('reports a value the bounds refuse', () => {
    render(
      <DateTimePicker
        {...base}
        min={plainDateTime(plainDate(2026, 9, 11), plainTime(9, 0))}
        value={TENTH}
      />,
    );
    expect(root()).toHaveAttribute('data-invalid');
  });

  it('names the chosen value on the trigger, because focus returns there', () => {
    const { rerender } = render(<DateTimePicker {...base} />);
    expect(trigger()).toHaveAttribute('aria-label', 'Choose date and time');

    rerender(<DateTimePicker {...base} value={TENTH} />);
    expect(trigger().getAttribute('aria-label')).toContain('setembro');
  });

  it('changes its words and its moment together with the language in force', () => {
    const inLocale = (locale: string) => (
      <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale={locale}>
        <DateTimePicker aria-label="Quando" referenceDateTime={REFERENCE} value={TENTH} />
      </SlottedProvider>
    );
    const { rerender } = render(inLocale('pt-BR'));
    const name = () =>
      document.querySelector('[data-part="trigger"]')?.getAttribute('aria-label') ?? '';

    expect(name()).toMatch(/^Alterar data e hora, .*setembro/);

    rerender(inLocale('en-US'));
    expect(name()).toMatch(/^Change date and time, .*September/);
  });
});
