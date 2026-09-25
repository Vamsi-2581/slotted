import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/multi-select/contract.json';
import { Glyph, Icon } from '../icon';
import { MultiSelect } from './multi-select';
import { MultiSelectDefaultsProvider } from './multi-select-defaults';
import { MultiSelectGroup, MultiSelectItem } from './multi-select-items';
import { MultiSelectContent, MultiSelectControl } from './multi-select-parts';
import type { MultiSelectHandle, MultiSelectProps } from './multi-select.types';

const FRUIT = ['Blueberry', 'Raspberry', 'Cloudberry', 'Grapefruit', 'Pomelo'];

function Basic({ children, ...props }: Partial<MultiSelectProps>) {
  return (
    <MultiSelect {...props}>
      <MultiSelectControl aria-label="Fruit" />
      <MultiSelectContent aria-label="Fruit">
        {children ??
          FRUIT.map((label) => (
            <MultiSelectItem
              disabled={label === 'Cloudberry'}
              key={label}
              value={label.toLowerCase()}
            >
              {label}
            </MultiSelectItem>
          ))}
      </MultiSelectContent>
    </MultiSelect>
  );
}

const input = () => screen.getByRole('combobox', { name: 'Fruit' });
const press = (key: string, options: Record<string, unknown> = {}) =>
  fireEvent.keyDown(document.activeElement ?? document.body, { key, ...options });
const type = (value: string) => fireEvent.change(input(), { target: { value } });
const chips = () =>
  screen.queryAllByRole('gridcell').filter((cell) => cell.dataset['ui'] === 'tag');
const chipLabels = () =>
  chips().map((chip) => chip.querySelector("[data-part='label']")?.textContent);
const optionNamed = (name: string) => screen.getByRole('option', { name });

const openByArrow = async () => {
  input().focus();
  press('ArrowDown');
  return screen.findByRole('listbox');
};

/** What a browser does with a press on an option: the option refuses the move. */
const pressOption = (option: HTMLElement) => {
  fireEvent.pointerDown(option);
  if (option.closest('[inert]') !== null) return;
  fireEvent.click(option);
};

describe('MultiSelect', () => {
  it('is a combobox controlling a multi-selectable listbox, inside a layout grid', async () => {
    render(<Basic defaultValue={['fig']} />);
    expect(input()).toHaveAttribute('aria-autocomplete', 'list');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByRole('row')).toBeInTheDocument();

    const listbox = await openByArrow();
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    expect(input()).toHaveAttribute('aria-controls', listbox.id);
    expect(contract.roles).toMatchObject({ control: 'grid', chips: 'row', chip: 'gridcell' });
  });

  /**
   * The grid pattern puts one element of a layout grid in the page tab
   * sequence, and the combobox pattern excludes the popup indicator from it.
   * The field is that one element.
   */
  it('is one tab stop, whatever the row holds', () => {
    render(<Basic defaultValue={['fig', 'plum']} />);
    expect(input()).not.toHaveAttribute('tabindex');
    for (const chip of chips()) expect(chip).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Show options' })).toHaveAttribute('tabindex', '-1');
    expect(contract.focus.tabStops).toBe(1);
  });

  it('adds and removes a value from the popup, and keeps the popup open', async () => {
    render(<Basic />);
    await openByArrow();
    pressOption(optionNamed('Blueberry'));
    expect(chipLabels()).toEqual(['Blueberry']);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    pressOption(optionNamed('Raspberry'));
    expect(chipLabels()).toEqual(['Blueberry', 'Raspberry']);

    pressOption(optionNamed('Blueberry'));
    expect(chipLabels()).toEqual(['Raspberry']);
    expect(contract.members['multi-select'].defaults.closeOnSelect).toBe(false);
  });

  it('empties the query when a value is taken, so the next one can be typed', async () => {
    render(<Basic />);
    input().focus();
    type('blue');
    await screen.findByRole('listbox');
    pressOption(optionNamed('Blueberry'));
    expect(input()).toHaveValue('');
  });

  /**
   * §6's rule: `Backspace` removes only from an empty field, and the
   * predictable half is two presses — one to see what is about to go and one to
   * let it go.
   */
  it('removes with Backspace only from an empty field, and only on the second press', () => {
    render(<Basic defaultValue={['fig', 'plum']} />);
    input().focus();
    type('be');
    press('Backspace');
    expect(chipLabels()).toEqual(['fig', 'plum']);

    type('');
    press('Backspace');
    expect(chipLabels()).toEqual(['fig', 'plum']);
    expect(document.activeElement).toBe(chips()[1]);

    press('Backspace');
    expect(chipLabels()).toEqual(['fig']);
  });

  it('sends focus to the cell that took the removed one place, then to the field', async () => {
    render(<Basic defaultValue={['fig', 'plum', 'pear']} />);
    chips()[0]?.focus();
    press('Delete');
    expect(chipLabels()).toEqual(['plum', 'pear']);
    /* `createRemovalFocus` watches the DOM rather than being told, so it
       answers a mutation later — which is what makes it correct whichever way
       the value left. */
    await waitFor(() => expect(document.activeElement).toBe(chips()[0]));

    press('Delete');
    await waitFor(() => expect(document.activeElement).toBe(chips()[0]));
    press('Delete');
    expect(chipLabels()).toEqual([]);
    await waitFor(() => expect(document.activeElement).toBe(input()));
  });

  it('reaches the chips from an empty field with the arrows, and not with text in it', () => {
    render(<Basic defaultValue={['fig', 'plum']} />);
    input().focus();
    press('ArrowLeft');
    expect(document.activeElement).toBe(chips()[1]);

    input().focus();
    type('be');
    press('ArrowLeft');
    expect(document.activeElement).toBe(input());
  });

  it('commits the typed text on a delimiter, and only where creation is allowed', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Basic onValueChange={onValueChange} />);
    input().focus();
    type('fig');
    press(',');
    expect(chipLabels()).toEqual([]);

    rerender(<Basic creatable onValueChange={onValueChange} />);
    input().focus();
    type('fig');
    press(',');
    expect(chipLabels()).toEqual(['fig']);
    expect(input()).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['fig'],
      expect.objectContaining({ reason: 'submit' }),
    );
  });

  it('splits a paste on the same delimiters the key reads', () => {
    render(<Basic creatable />);
    input().focus();
    fireEvent.paste(input(), {
      clipboardData: { getData: () => 'fig, plum ,pear' },
    });
    expect(chipLabels()).toEqual(['fig', 'plum', 'pear']);
  });

  it('takes up to the limit and reports the rest rather than dropping it', () => {
    const onValueRefuse = vi.fn();
    render(<Basic creatable max={2} onValueRefuse={onValueRefuse} />);
    input().focus();
    fireEvent.paste(input(), {
      clipboardData: { getData: () => 'fig,plum,pear,lime' },
    });
    expect(chipLabels()).toEqual(['fig', 'plum']);
    expect(onValueRefuse).toHaveBeenCalledWith(
      ['pear', 'lime'],
      expect.objectContaining({ cause: 'limit' }),
    );
  });

  it('says a full control with the word the vocabulary already had', async () => {
    render(<Basic defaultValue={['blueberry', 'raspberry']} max={2} />);
    expect(screen.getByRole('grid').closest("[data-part='root']")).toHaveAttribute('data-complete');
    expect(screen.getByText('2 of 2')).toBeInTheDocument();

    await openByArrow();
    expect(optionNamed('Grapefruit')).toHaveAttribute('aria-disabled', 'true');
    /* A value already held stays takeable, because taking it out is what a full
       control still has to allow. */
    expect(optionNamed('Blueberry')).not.toHaveAttribute('aria-disabled');
    expect(contract.limit.attribute).toBe('data-complete');
  });

  it('refuses a duplicate, reports it, and shows the reader where their value is', () => {
    const onValueRefuse = vi.fn();
    render(<Basic creatable defaultValue={['fig']} onValueRefuse={onValueRefuse} />);
    input().focus();
    type('FIG');
    press(',');
    expect(chipLabels()).toEqual(['fig']);
    expect(onValueRefuse).toHaveBeenCalledWith(
      ['FIG'],
      expect.objectContaining({ cause: 'duplicate' }),
    );
    expect(document.activeElement).toBe(chips()[0]);
  });

  it('lets a duplicate in when the consumer allows one', () => {
    render(<Basic allowDuplicates creatable defaultValue={['fig']} />);
    input().focus();
    type('fig');
    press(',');
    expect(chipLabels()).toEqual(['fig', 'fig']);
  });

  it('refuses a value the predicate turns down', () => {
    const onValueRefuse = vi.fn();
    render(
      <Basic creatable onValueRefuse={onValueRefuse} validateValue={(text) => text.length > 2} />,
    );
    input().focus();
    type('ab');
    press(',');
    expect(chipLabels()).toEqual([]);
    expect(onValueRefuse).toHaveBeenCalledWith(
      ['ab'],
      expect.objectContaining({ cause: 'invalid' }),
    );
  });

  /**
   * Reorder emits `keyboard` and nothing else, which is what lets a consumer
   * persisting an order listen for exactly that.
   */
  it('moves a value with Alt and an arrow, under the one reason reorder emits', () => {
    const onValueChange = vi.fn();
    render(
      <Basic defaultValue={['fig', 'plum', 'pear']} onValueChange={onValueChange} reorderable />,
    );
    chips()[0]?.focus();
    press('ArrowRight', { altKey: true });
    expect(chipLabels()).toEqual(['plum', 'fig', 'pear']);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['plum', 'fig', 'pear'],
      expect.objectContaining({ reason: 'keyboard' }),
    );

    press('End', { altKey: true });
    expect(chipLabels()).toEqual(['plum', 'pear', 'fig']);
  });

  it('does not move a value where reorder was not asked for', () => {
    render(<Basic defaultValue={['fig', 'plum']} />);
    chips()[0]?.focus();
    press('ArrowRight', { altKey: true });
    expect(chipLabels()).toEqual(['fig', 'plum']);
  });

  it('edits a chip in place, and commits it as one value', () => {
    render(<Basic creatable defaultValue={['fig']} editable />);
    chips()[0]?.focus();
    press('Enter');
    const field = screen.getByRole('textbox', { name: 'fig' });
    fireEvent.change(field, { target: { value: 'figs' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(chipLabels()).toEqual(['figs']);
  });

  /**
   * Every icon the family owns is a `Glyph` element inside an `Icon` box, never
   * a mask, and the offer to add takes the plus where a chosen option takes the
   * check.
   */
  it('draws the chevron, the cross, the tick and the plus as glyph elements', async () => {
    const { container } = render(<Basic creatable defaultValue={['blueberry']} />);
    const glyph = (part: string) =>
      container.querySelector(`[data-part='${part}'] > [data-ui='icon'] > svg[data-glyph]`);
    expect(glyph('arrow')).toHaveAttribute('data-glyph', 'chevron-down');
    expect(glyph('clear')).toHaveAttribute('data-glyph', 'x');
    expect(glyph('remove')).toHaveAttribute('data-glyph', 'x');

    await openByArrow();
    const mark = (option: HTMLElement) =>
      option.querySelector("[data-part='indicator'] > [data-ui='icon'] > svg");
    expect(mark(optionNamed('Blueberry'))).toHaveAttribute('data-glyph', 'check');

    type('Quince');
    expect(mark(optionNamed('Add “Quince”'))).toHaveAttribute('data-glyph', 'plus');
  });

  /** The first column holds the artwork it is given; no stylesheet fills it. */
  it('holds an item icon in the first column', async () => {
    render(
      <Basic>
        <MultiSelectItem
          icon={
            <Icon>
              <Glyph name="dot" />
            </Icon>
          }
          value="blueberry"
        >
          Blueberry
        </MultiSelectItem>
      </Basic>,
    );
    await openByArrow();
    const mark = optionNamed('Blueberry').querySelector(
      "[data-part='icon'] > [data-ui='icon'] > svg[data-glyph]",
    );
    expect(mark).toHaveAttribute('data-glyph', 'dot');
  });

  it('clears the whole set at once, and says so', () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue={['fig', 'plum']} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(chipLabels()).toEqual([]);
    expect(onValueChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ reason: 'clear' }),
    );
  });

  it('holds the value when the consumer holds it, and moves nothing on its own', async () => {
    function Controlled() {
      const [value, setValue] = useState<readonly string[]>([]);
      return (
        <>
          <Basic onValueChange={setValue} value={value} />
          <p>{value.join('|')}</p>
        </>
      );
    }
    render(<Controlled />);
    await openByArrow();
    pressOption(optionNamed('Blueberry'));
    expect(chipLabels()).toEqual(['Blueberry']);
  });

  it('refuses to move a controlled value the consumer did not accept', async () => {
    render(<Basic value={[]} />);
    await openByArrow();
    pressOption(optionNamed('Blueberry'));
    expect(chipLabels()).toEqual([]);
  });

  it('submits several values under one name', () => {
    render(<Basic defaultValue={['fig', 'plum']} name="fruit" />);
    const hidden = document.querySelectorAll('input[name="fruit"]');
    expect([...hidden].map((element) => (element as HTMLInputElement).value)).toEqual([
      'fig',
      'plum',
    ]);
  });

  it('hides an option already held when the consumer asks for it', async () => {
    render(<Basic chosenOptions="hide" defaultValue={['blueberry']} />);
    await openByArrow();
    expect(screen.queryByRole('option', { name: 'Blueberry' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Raspberry' })).toBeInTheDocument();
  });

  it('offers to add what was typed only where nothing matched and there is room', async () => {
    const { rerender } = render(<Basic creatable />);
    input().focus();
    type('Quince');
    await screen.findByRole('listbox');
    expect(screen.getByRole('option', { name: 'Add “Quince”' })).toBeInTheDocument();

    rerender(<Basic creatable max={2} value={['a', 'b']} />);
    input().focus();
    type('Quince');
    expect(screen.queryByRole('option', { name: 'Add “Quince”' })).toBeNull();
  });

  it('lets an application set the defaults once', () => {
    render(
      <MultiSelectDefaultsProvider clearLabel="Limpar" size="lg">
        <Basic defaultValue={['fig']} />
      </MultiSelectDefaultsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
    expect(screen.getByRole('grid').closest("[data-part='root']")).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('keeps a group with nothing left in it off the surface', async () => {
    render(
      <Basic>
        <MultiSelectGroup label="Berries">
          <MultiSelectItem value="blueberry">Blueberry</MultiSelectItem>
        </MultiSelectGroup>
        <MultiSelectGroup label="Citrus">
          <MultiSelectItem value="pomelo">Pomelo</MultiSelectItem>
        </MultiSelectGroup>
      </Basic>,
    );
    input().focus();
    type('blue');
    await screen.findByRole('listbox');
    /* The group is taken out of the accessibility tree entirely, which is the
       point of it: a heading with no options under it says a category matched
       when none did. So it is looked for in the DOM rather than by role. */
    const groups = [...document.querySelectorAll("[data-part='group']")];
    const citrus = groups.find((group) => group.textContent?.startsWith('Citrus'));
    expect(citrus).toHaveAttribute('hidden');
    expect(screen.getByRole('option', { name: 'Blueberry' })).toBeInTheDocument();
  });

  it('answers the imperative actions a prop cannot express', async () => {
    let handle: MultiSelectHandle | null = null;
    render(
      <Basic
        ref={(instance) => {
          handle = instance;
        }}
      />,
    );
    act(() => handle?.setValue(['fig', 'plum']));
    expect(chipLabels()).toEqual(['fig', 'plum']);

    act(() => handle?.open());
    await screen.findByRole('listbox');
    act(() => handle?.close());
    act(() => handle?.focus());
    expect(document.activeElement).toBe(input());
  });

  it('runs the consumer own handler first, and stands down when it says so', () => {
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <MultiSelect defaultValue={['fig']}>
        <MultiSelectControl aria-label="Fruit" onKeyDown={onKeyDown} />
        <MultiSelectContent aria-label="Fruit" />
      </MultiSelect>,
    );
    input().focus();
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(onKeyDown).toHaveBeenCalled();
    /* The consumer defaulted the event, so the family did not take the key. */
    expect(document.activeElement).toBe(input());
  });
});
