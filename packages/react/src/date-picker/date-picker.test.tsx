import { plainDate, toISODate } from '@slotted/core/date';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/date-picker/contract.json';
import { DatePicker, DatePickerDefaultsProvider } from './index';
import type { DatePickerHandle } from './index';

const NINTH = plainDate(2026, 9, 9);

const root = () =>
  document.querySelector('[data-ui="date-picker"][data-part="root"]') as HTMLElement;
const trigger = () => document.querySelector('[data-part="trigger"]') as HTMLButtonElement;
const surface = () => document.querySelector('[data-part="content"]');
const dayFor = (number: number) =>
  [...document.querySelectorAll('[data-part="day"]')].find(
    (element) =>
      element.textContent === String(number) &&
      element.closest('[data-part="cell"]')?.hasAttribute('data-outside-month') === false,
  ) as HTMLElement;

const open = () => {
  fireEvent.click(trigger());
};

describe('what it is made of', () => {
  /**
   * It composes the other two families and redraws neither. A second segmented
   * field or a second month grid would be two places to fix one defect.
   */
  it('renders the field and the calendar, each keeping its own identifier', () => {
    render(<DatePicker defaultOpen defaultValue={NINTH} locale="pt-BR" />);

    expect(document.querySelector('[data-ui="date-field"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ui="calendar"]')).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-ui', contract.ui);
  });

  it('declares every part the contract names', () => {
    render(
      <DatePicker
        defaultOpen
        defaultValue={NINTH}
        footer={<button type="button">Aplicar</button>}
        locale="pt-BR"
        presets={<button type="button">Hoje</button>}
      />,
    );

    const present = [...document.querySelectorAll('[data-ui="date-picker"] [data-part]')].map(
      (element) => (element as HTMLElement).dataset['part'],
    );
    for (const part of ['control', 'trigger', 'content', 'presets', 'footer']) {
      expect(present).toContain(part);
    }
  });

  it('carries the dialog role and points the trigger at it while it is open', () => {
    render(<DatePicker defaultOpen defaultValue={NINTH} locale="pt-BR" />);

    expect(surface()).toHaveAttribute('role', 'dialog');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger().getAttribute('aria-controls')).toBe(surface()?.id);
  });
});

describe('what the trigger says', () => {
  /**
   * Focus returns here when the surface closes, so the name is where the reader
   * is told what was chosen. The APG names it as an accessibility feature.
   */
  it('names itself for choosing while nothing is chosen', () => {
    render(<DatePicker chooseLabel="Escolher data" locale="pt-BR" />);
    expect(trigger()).toHaveAttribute('aria-label', 'Escolher data');
  });

  it('carries the chosen date in words once there is one', () => {
    render(<DatePicker changeLabel="Alterar data" defaultValue={NINTH} locale="pt-BR" />);
    expect(trigger().getAttribute('aria-label')).toContain('Alterar data');
    expect(trigger().getAttribute('aria-label')).toContain('setembro');
  });

  /** The mark is a `Glyph` element inside an `Icon` box, never a mask. */
  it('draws the calendar as a glyph element', () => {
    render(<DatePicker locale="pt-BR" />);
    const mark = trigger().querySelector("[data-ui='icon'] > svg[data-glyph]");
    expect(mark).toHaveAttribute('data-glyph', 'calendar');
  });
});

describe('opening and closing', () => {
  it('opens and closes from the trigger', () => {
    const onOpenChange = vi.fn();
    render(<DatePicker locale="pt-BR" onOpenChange={onOpenChange} />);

    expect(surface()).toBeNull();
    open();
    expect(surface()).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'pointer' }),
    );

    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  /**
   * Angular Material records the platform note this inherits: ChromeOS turns
   * the chord into PageDown before the browser sees it, so the button is the
   * guaranteed path and this is only a shortcut.
   */
  it('opens from the field with the chord, and never depends on it', () => {
    render(<DatePicker locale="pt-BR" />);

    const segment = screen.getAllByRole('spinbutton')[0] as HTMLElement;
    fireEvent.keyDown(segment, { key: 'ArrowDown', altKey: true });
    expect(surface()).toBeInTheDocument();
    expect(trigger()).toBeInTheDocument();
  });

  it('marks the root while the surface is showing', () => {
    render(<DatePicker locale="pt-BR" />);
    expect(root()).not.toHaveAttribute('data-open');
    open();
    expect(root()).toHaveAttribute('data-open');
  });

  it('says which presentation the surface is in', () => {
    render(<DatePicker defaultOpen locale="pt-BR" />);
    expect(document.querySelector('[data-part="positioner"]')).toHaveAttribute(
      'data-presentation',
      'popover',
    );
  });
});

describe('choosing a date', () => {
  it('writes the date into the field and closes, for one date', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        defaultOpen
        defaultValue={NINTH}
        locale="pt-BR"
        name="data"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(dayFor(17));

    expect(onValueChange).toHaveBeenLastCalledWith(
      plainDate(2026, 9, 17),
      expect.objectContaining({ reason: 'pointer' }),
    );
    /* The layer is allowed to animate out, so the state is the observable and
       the node is not. */
    expect(root()).not.toHaveAttribute('data-open');
    expect(container.querySelector<HTMLInputElement>('[data-part="hidden-input"]')?.value).toBe(
      toISODate(plainDate(2026, 9, 17)),
    );
  });

  /** Closing on the first press of a range is a trap: the second needs the same surface. */
  it('stays open for a range', () => {
    render(<DatePicker defaultOpen locale="pt-BR" selectionMode="range" />);

    fireEvent.click(dayFor(7));
    expect(surface()).toBeInTheDocument();

    fireEvent.click(dayFor(11));
    expect(surface()).toBeInTheDocument();
  });

  it('takes the axis over the default when a product asks', () => {
    render(<DatePicker closeOnSelect="never" defaultOpen defaultValue={NINTH} locale="pt-BR" />);

    fireEvent.click(dayFor(17));
    expect(surface()).toBeInTheDocument();
  });
});

describe('the keyboard', () => {
  it('closes on Escape and returns focus to the trigger', () => {
    const onOpenChange = vi.fn();
    render(
      <DatePicker defaultOpen defaultValue={NINTH} locale="pt-BR" onOpenChange={onOpenChange} />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    );
    expect(trigger()).toHaveFocus();
  });

  /**
   * `dismissable-layer` asks in the capture phase, so a handler inside the
   * surface is too late. The family decides there instead and simply does not
   * ask the layer to close.
   */
  it('walks the calendar down a view before it closes', () => {
    render(<DatePicker defaultOpen defaultValue={NINTH} defaultView="year" locale="pt-BR" />);
    const calendar = document.querySelector('[data-ui="calendar"]') as HTMLElement;

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(calendar).toHaveAttribute('data-view', 'month');
    expect(surface()).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(calendar).toHaveAttribute('data-view', 'day');
    expect(surface()).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(root()).not.toHaveAttribute('data-open');
  });
});

describe('what the field around it says', () => {
  it('takes the trigger out while it is disabled', () => {
    render(<DatePicker defaultValue={NINTH} disabled locale="pt-BR" />);
    expect(trigger()).toBeDisabled();
    expect(root()).toHaveAttribute('data-disabled');
  });

  it('takes the trigger out while it is read-only', () => {
    render(<DatePicker defaultValue={NINTH} locale="pt-BR" readOnly />);
    expect(trigger()).toBeDisabled();
    expect(root()).toHaveAttribute('data-readonly');
  });

  it('states its own invalidity when the value is outside the bounds', () => {
    render(<DatePicker defaultValue={plainDate(2026, 1, 1)} locale="pt-BR" min={NINTH} />);
    expect(root()).toHaveAttribute('data-invalid');
  });
});

describe('what an application sets once', () => {
  it('takes the locale and the appearance from a provider', () => {
    render(
      <DatePickerDefaultsProvider chooseLabel="Pick a date" locale="ja-JP" size="lg">
        <DatePicker />
      </DatePickerDefaultsProvider>,
    );

    expect(screen.getAllByRole('spinbutton').map((element) => element.dataset['field'])).toEqual([
      'year',
      'month',
      'day',
    ]);
    expect(root()).toHaveAttribute('data-size', 'lg');
    expect(trigger()).toHaveAttribute('aria-label', 'Pick a date');
  });
});

describe('the composition surface', () => {
  it('hands the consumer a handle for what a prop cannot express', () => {
    let handle: DatePickerHandle | null = null;
    render(
      <DatePicker
        defaultValue={NINTH}
        locale="pt-BR"
        ref={(instance) => {
          handle = instance;
        }}
      />,
    );

    act(() => (handle as DatePickerHandle | null)?.open());
    expect(surface()).toBeInTheDocument();

    act(() => (handle as DatePickerHandle | null)?.close());
    expect(root()).not.toHaveAttribute('data-open');

    act(() => (handle as DatePickerHandle | null)?.focus());
    expect(screen.getAllByRole('spinbutton')[0]).toHaveFocus();
  });

  it('substitutes the element the root renders', () => {
    const { container } = render(
      <DatePicker defaultValue={NINTH} locale="pt-BR" render={(props) => <section {...props} />} />,
    );
    expect(container.querySelector('section[data-ui="date-picker"]')).toBeInTheDocument();
  });

  it('takes the consumer’s own slots into the surface', () => {
    render(
      <DatePicker
        defaultOpen
        footer={<button type="button">Aplicar</button>}
        locale="pt-BR"
        presets={<button type="button">Hoje</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
  });
});
