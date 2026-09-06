import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/select/contract.json';
import { Field, FieldLabel } from '../field';
import { Select } from './select';
import { SelectDefaultsProvider } from './select-defaults';
import { SelectGroup, SelectItem, SelectSeparator } from './select-items';
import { SelectContent, SelectTrigger, SelectValue } from './select-parts';
import type { SelectProps, SelectSelection } from './select.types';

function Basic({ children, ...props }: Partial<SelectProps>) {
  return (
    <Select {...props}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent>
        {children ?? (
          <>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem disabled value="banana">
              Banana
            </SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectSeparator />
            <SelectItem value="cherry">Cherry</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}

const trigger = () => screen.getByRole('combobox', { name: 'Fruit' });
const press = (key: string, options: Record<string, unknown> = {}) =>
  fireEvent.keyDown(document.activeElement ?? document.body, { key, ...options });

const open = async () => {
  trigger().focus();
  press('ArrowDown');
  return screen.findByRole('listbox');
};

const optionNamed = (name: string) => screen.getByRole('option', { name });
const highlighted = () => trigger().getAttribute('aria-activedescendant');

describe('Select', () => {
  it('is a combobox that opens a listbox, which is the pattern it cites', async () => {
    render(<Basic />);
    expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');

    const listbox = await open();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', listbox.id);
    expect(contract.roles.trigger).toBe('combobox');
    expect(contract.roles.content).toBe('listbox');
  });

  /**
   * The whole of the family's focus model in one assertion: the popup opens,
   * the highlight moves, options are announced — and the button never lets go.
   */
  it('keeps DOM focus on the trigger for the whole interaction', async () => {
    render(<Basic />);
    await open();
    expect(document.activeElement).toBe(trigger());
    press('ArrowDown');
    press('End');
    expect(document.activeElement).toBe(trigger());
  });

  it('marks the highlight with aria-activedescendant and data-current', async () => {
    render(<Basic />);
    await open();
    expect(highlighted()).toBe(optionNamed('Apple').id);
    expect(optionNamed('Apple')).toHaveAttribute('data-current');
    press('ArrowDown');
    expect(optionNamed('Blueberry')).toHaveAttribute('data-current');
    expect(optionNamed('Apple')).not.toHaveAttribute('data-current');
  });

  it('skips a disabled option rather than landing on it, and never commits one', async () => {
    render(<Basic />);
    await open();
    press('ArrowDown');
    /* Banana sits between Apple and Blueberry and is disabled. */
    expect(highlighted()).toBe(optionNamed('Blueberry').id);
    fireEvent.click(optionNamed('Banana'));
    expect(screen.getByText('Choose a fruit')).toBeInTheDocument();
  });

  it('does not wrap by default, which is where it parts company with menu', async () => {
    render(<Basic />);
    await open();
    press('End');
    expect(highlighted()).toBe(optionNamed('Cherry').id);
    press('ArrowDown');
    expect(highlighted()).toBe(optionNamed('Cherry').id);
  });

  it('wraps when it is asked to', async () => {
    render(<Basic loop />);
    await open();
    press('End');
    press('ArrowDown');
    expect(highlighted()).toBe(optionNamed('Apple').id);
  });

  it('opens onto the last option from ArrowUp, and onto the selected one from ArrowDown', async () => {
    const { unmount } = render(<Basic />);
    trigger().focus();
    press('ArrowUp');
    await screen.findByRole('listbox');
    expect(highlighted()).toBe(optionNamed('Cherry').id);
    unmount();

    render(<Basic defaultValue="blueberry" />);
    await open();
    expect(highlighted()).toBe(optionNamed('Blueberry').id);
  });

  it('opens without moving the highlight on Alt+ArrowDown', async () => {
    render(<Basic />);
    trigger().focus();
    press('ArrowDown', { altKey: true });
    await screen.findByRole('listbox');
    expect(highlighted()).toBeNull();
  });

  it('travels ten options on a page key, and never past the end', async () => {
    render(
      <Basic>
        {Array.from({ length: 30 }, (_, index) => (
          <SelectItem key={index} value={`option-${index}`}>{`Option ${index}`}</SelectItem>
        ))}
      </Basic>,
    );
    await open();
    press('PageDown');
    expect(highlighted()).toBe(optionNamed('Option 10').id);
    press('PageUp');
    expect(highlighted()).toBe(optionNamed('Option 0').id);
    press('End');
    press('PageDown');
    expect(highlighted()).toBe(optionNamed('Option 29').id);
  });

  it('commits on Enter and closes, and reports the reason', async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} onValueChange={onValueChange} />);
    await open();
    press('Enter');

    expect(onValueChange).toHaveBeenCalledWith(
      'apple',
      expect.objectContaining({ reason: 'keyboard' }),
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'select' }),
    );
  });

  /**
   * The one key that differs from a native `select`, which the example calls
   * out by name: Tab takes the highlighted option with it.
   */
  it('commits on Tab and lets the key move focus on', async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    await open();
    press('ArrowDown');
    const event = fireEvent.keyDown(trigger(), { key: 'Tab' });
    expect(onValueChange).toHaveBeenCalledWith('blueberry', expect.anything());
    expect(event).toBe(true);
  });

  it('closes on Escape without committing anything', async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} onValueChange={onValueChange} />);
    await open();
    press('ArrowDown');
    press('Escape');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    );
  });

  it('moves the highlight to whichever option the pointer enters', async () => {
    render(<Basic />);
    await open();
    fireEvent.pointerEnter(optionNamed('Cherry'));
    expect(highlighted()).toBe(optionNamed('Cherry').id);
  });

  it('finds an option by typing its opening characters', async () => {
    render(<Basic />);
    await open();
    press('c');
    expect(highlighted()).toBe(optionNamed('Cherry').id);
  });

  it('opens on a printable character and highlights the match', async () => {
    render(<Basic />);
    trigger().focus();
    press('b');
    await screen.findByRole('listbox');
    await waitFor(() => expect(highlighted()).toBe(optionNamed('Blueberry').id));
  });

  it('names the chosen option in the closed control', async () => {
    render(<Basic />);
    await open();
    fireEvent.click(optionNamed('Blueberry'));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(trigger()).toHaveTextContent('Blueberry');
  });

  /**
   * The popup does not exist while the control is closed, so an option's own
   * label cannot be read from it. `items` is what a select that knows its
   * options up front hands over instead.
   */
  it('names a value from items before the popup has ever been built', () => {
    render(<Basic defaultValue="blueberry" items={[{ label: 'Blueberry', value: 'blueberry' }]} />);
    expect(trigger()).toHaveTextContent('Blueberry');
  });

  it('shows a value it cannot resolve rather than falling back to the placeholder', () => {
    render(<Basic defaultValue="usr_8f21c0" />);
    expect(trigger()).toHaveTextContent('usr_8f21c0');
    expect(trigger().querySelector("[data-part='value']")).toHaveAttribute('data-unmatched');
  });

  /**
   * SL4: several values are the chips they are, and not a sentence about them.
   * The sentence stays as the trigger's name — and as what a control too narrow
   * for a chip shows — but the picture is one `tag` per value, each with the
   * remove control a tag already has.
   */
  it('previews several values as chips, and keeps the popup open while they are taken', async () => {
    const { container } = render(<Basic multiple />);
    const listbox = await open();
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');

    fireEvent.click(optionNamed('Apple'));
    fireEvent.click(optionNamed('Cherry'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const chips = [
      ...container.querySelectorAll("[data-part='tags'] > [data-ui='tag']:not([data-overflow])"),
    ];
    expect(chips.map((chip) => chip.querySelector("[data-part='label']")?.textContent)).toEqual([
      'Apple',
      'Cherry',
    ]);
    for (const chip of chips) expect(chip.querySelector("[data-part='remove']")).not.toBeNull();
    expect(trigger()).toHaveTextContent('2 selected');

    /* The chip that counts what did not fit is rendered and hidden until the
       collapse reveals it: `createCollapse` measures it to know whether it
       will fit before it draws it. */
    const overflow = container.querySelector("[data-part='tags'] > [data-overflow]");
    expect(overflow).toHaveAttribute('data-ui', 'tag');
    expect(overflow).toHaveAttribute('hidden');
  });

  it('takes a value out of the selection from its own chip', async () => {
    const onValueChange = vi.fn();
    render(<Basic multiple onValueChange={onValueChange} />);
    await open();
    fireEvent.click(optionNamed('Apple'));
    fireEvent.click(optionNamed('Cherry'));

    fireEvent.click(screen.getByRole('button', { name: 'Remove Apple' }));

    expect(onValueChange).toHaveBeenLastCalledWith(
      ['cherry'],
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('clears the selection, and says why', async () => {
    const onValueChange = vi.fn();
    render(<Basic clearable defaultValue="apple" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onValueChange).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'clear' }));
  });

  it('lets a consumer own the value and refuse a change', async () => {
    function Controlled() {
      const [value, setValue] = useState<SelectSelection>('apple');
      return (
        <Basic
          onValueChange={(next, request) => {
            if (next === 'cherry') request.cancel();
            else setValue(next);
          }}
          value={value}
        />
      );
    }
    render(<Controlled />);
    await open();
    fireEvent.click(optionNamed('Cherry'));
    expect(trigger()).toHaveTextContent('Apple');
  });

  it('opens onto a sentence when it holds no options', async () => {
    render(<Basic>{[]}</Basic>);
    await open();
    expect(screen.getByText('No options')).toBeInTheDocument();
  });

  it('keeps its measure and says it is busy while an answer travels', async () => {
    render(<Basic loading>{[]}</Basic>);
    const listbox = await open();
    expect(listbox).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  /**
   * SL6/CB5: the wait is drawn once, by the two sheets that own it. The
   * control shows the ring `spinner` draws instead of the chevron, and the
   * popup shows three rows the height of an option, drawn by `skeleton`.
   */
  it('shows the ring instead of the chevron, and three rows instead of a sentence, while an answer travels', async () => {
    const { container } = render(<Basic loading>{[]}</Basic>);
    expect(container.querySelector("[data-part='arrow']")).toBeNull();
    const busy = container.querySelector("[data-part='busy']");
    expect(busy).toHaveAttribute('data-ui', 'spinner');

    await open();
    const placeholder = document.querySelector("[data-part='placeholder']");
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(placeholder?.querySelectorAll("[data-ui='skeleton']")).toHaveLength(3);
  });

  it('names each group by its own label, as the listbox pattern requires', async () => {
    render(
      <Basic>
        <SelectGroup label="Berries">
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectGroup>
      </Basic>,
    );
    await open();
    const group = screen.getByRole('group');
    const labelId = group.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId ?? '')).toHaveTextContent('Berries');
  });

  it('refuses to open, and refuses to move, while it is read-only', async () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultValue="apple" onOpenChange={onOpenChange} readOnly />);
    expect(trigger()).toHaveAttribute('aria-readonly', 'true');
    trigger().focus();
    press('ArrowDown');
    fireEvent.click(trigger());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('takes disabled, invalid, required and size from the field around it', () => {
    render(
      <Field disabled invalid required size="lg">
        <FieldLabel>Fruit</FieldLabel>
        <Basic />
      </Field>,
    );
    expect(trigger()).toBeDisabled();
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('aria-required', 'true');
    expect(trigger().closest("[data-ui='select']")).toHaveAttribute('data-size', 'lg');
  });

  it('submits through a real select, so a plain form and reset() both work', async () => {
    render(<Basic defaultValue="apple" name="fruit" />);
    const native = document.querySelector<HTMLSelectElement>("select[name='fruit']");
    expect(native).not.toBeNull();
    expect(native?.value).toBe('apple');
    expect(native).toHaveAttribute('aria-hidden', 'true');
  });

  it('lets an application set its defaults once', async () => {
    render(
      <SelectDefaultsProvider size="sm" variant="subtle">
        <Basic />
      </SelectDefaultsProvider>,
    );
    const root = trigger().closest("[data-ui='select']");
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveAttribute('data-variant', 'subtle');
  });

  it('runs the consumer’s own handler as well as its own', async () => {
    const onClick = vi.fn();
    render(
      <Select>
        <SelectTrigger aria-label="Fruit" onClick={onClick}>
          <SelectValue placeholder="Choose a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    fireEvent.click(trigger());
    expect(onClick).toHaveBeenCalled();
    await screen.findByRole('listbox');
  });

  it('writes every state a consumer may style into the DOM', async () => {
    render(<Basic defaultValue="apple" invalid required />);
    const root = trigger().closest("[data-ui='select']");
    for (const state of ['data-invalid', 'data-required', 'data-full-width']) {
      expect(root).toHaveAttribute(state);
    }
    await open();
    expect(optionNamed('Apple')).toHaveAttribute('data-selected');
  });
});
