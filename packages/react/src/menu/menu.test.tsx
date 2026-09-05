import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/menu/contract.json';
import { Menu } from './menu';
import { MenuDefaultsProvider } from './menu-defaults';
import { MenuContent, MenuTrigger } from './menu-parts';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from './menu-items';
import type { MenuProps } from './menu.types';

function Basic({ children, ...props }: Partial<MenuProps>) {
  return (
    <Menu {...props}>
      <MenuTrigger>Document</MenuTrigger>
      <MenuContent>
        {children ?? (
          <>
            <MenuItem shortcut="Mod+D">Duplicate</MenuItem>
            <MenuItem disabled>Publish</MenuItem>
            <MenuSeparator />
            <MenuItem>Share</MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

const open = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Document' }), { detail: 1 });
  return screen.findByRole('menu');
};

const item = (name: string) => screen.getByRole('menuitem', { name });

/**
 * A key press lands on whatever holds focus, as a reader's does. Firing at the
 * surface instead would tell `arrow-navigation` the key came from outside any
 * item, and it would move from the start of the list rather than from here.
 */
const press = (key: string, options: Record<string, unknown> = {}) =>
  fireEvent.keyDown(document.activeElement ?? document.body, { key, ...options });

describe('Menu', () => {
  it('wires the trigger to the surface it discloses', async () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Document' });

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const surface = await open();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', surface.id);
    expect(surface).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('carries the identifier the contract declares', async () => {
    render(<Basic />);
    await open();

    expect(document.querySelector(`[data-ui='${contract.ui}']`)).not.toBeNull();
    expect(screen.getByRole('menu')).toHaveAttribute('data-part', 'content');
  });

  /** "When a menu opens, keyboard focus is placed on the first item." */
  it('puts focus on the first item it opens', async () => {
    render(<Basic />);
    await open();

    await waitFor(() => expect(item('Duplicate')).toHaveFocus());
  });

  it('opens onto the last item when the trigger is arrowed up', async () => {
    render(<Basic />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Document' }), { key: 'ArrowUp' });
    await screen.findByRole('menu');

    await waitFor(() => expect(item('Share')).toHaveFocus());
  });

  it('opens onto the first item when the trigger is arrowed down', async () => {
    render(<Basic />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Document' }), { key: 'ArrowDown' });
    await screen.findByRole('menu');

    await waitFor(() => expect(item('Duplicate')).toHaveFocus());
  });

  it('moves along the items, wraps at the end, and reaches both ends', async () => {
    render(<Basic />);
    await open();
    await waitFor(() => expect(item('Duplicate')).toHaveFocus());

    press('ArrowDown');
    expect(item('Publish')).toHaveFocus();

    press('End');
    expect(item('Share')).toHaveFocus();

    press('ArrowDown');
    expect(item('Duplicate')).toHaveFocus();

    press('ArrowUp');
    expect(item('Share')).toHaveFocus();

    press('Home');
    expect(item('Duplicate')).toHaveFocus();
  });

  /** A disabled item is focusable and cannot be activated, as the pattern asks. */
  it('keeps a disabled item in the ring and runs nothing from it', async () => {
    const onSelect = vi.fn();
    render(
      <Basic>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem disabled onSelect={onSelect}>
          Publish
        </MenuItem>
      </Basic>,
    );
    await open();
    await waitFor(() => expect(item('Duplicate')).toHaveFocus());

    press('ArrowDown');
    expect(item('Publish')).toHaveFocus();
    expect(item('Publish')).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(item('Publish'), { detail: 1 });
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('moves to the item a printable character names', async () => {
    render(<Basic />);
    await open();
    await waitFor(() => expect(item('Duplicate')).toHaveFocus());

    press('s');
    expect(item('Share')).toHaveFocus();
  });

  it('runs an item and closes, saying the menu closed because one ran', async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Basic onOpenChange={onOpenChange}>
        <MenuItem onSelect={onSelect}>Duplicate</MenuItem>
      </Basic>,
    );
    await open();

    fireEvent.click(item('Duplicate'), { detail: 1 });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ reason: 'pointer' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('keeps the menu open when the item asks it to', async () => {
    render(
      <Basic>
        <MenuItem onSelect={(event) => event.preventDefault()}>Duplicate</MenuItem>
      </Basic>,
    );
    await open();

    fireEvent.click(item('Duplicate'), { detail: 1 });
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('keeps the menu open for an item that says so once', async () => {
    render(
      <Basic>
        <MenuItem closeOnSelect={false}>Duplicate</MenuItem>
      </Basic>,
    );
    await open();

    fireEvent.click(item('Duplicate'), { detail: 1 });
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    render(<Basic />);
    await open();
    await waitFor(() => expect(item('Duplicate')).toHaveFocus());

    press('Escape');

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(screen.getByRole('button', { name: 'Document' })).toHaveFocus();
  });

  /**
   * The pattern binds Tab itself: it closes every menu and moves focus out.
   * `popover` needed two focus guards for the same question because its layer
   * does not bind the key.
   */
  it('closes on Tab and moves focus past the trigger', async () => {
    render(
      <>
        <Basic />
        <button type="button">After</button>
      </>,
    );
    await open();
    await waitFor(() => expect(item('Duplicate')).toHaveFocus());

    press('Tab');

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('prints a shortcut for the platform and announces it', async () => {
    render(<Basic />);
    await open();

    const duplicate = item('Duplicate');
    expect(duplicate).toHaveAttribute('aria-keyshortcuts', 'Control+D');
    expect(duplicate.querySelector("[data-part='shortcut']")?.textContent).toBe('Ctrl+D');
  });

  it('holds a checkbox item without closing, and reports the device', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Basic>
        <MenuCheckboxItem onCheckedChange={onCheckedChange}>Comments</MenuCheckboxItem>
      </Basic>,
    );
    await open();

    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Comments' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox, { detail: 1 });

    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(screen.queryByRole('menu')).not.toBeNull();
    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox', { name: 'Comments' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
  });

  /** The pattern's optional rule: Space changes the state and keeps the menu. */
  it('toggles a checkbox item with Space and leaves the menu open', async () => {
    render(
      <Basic>
        <MenuCheckboxItem>Comments</MenuCheckboxItem>
      </Basic>,
    );
    await open();

    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox', { name: 'Comments' })).toHaveFocus(),
    );
    press(' ');

    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox', { name: 'Comments' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
    expect(screen.queryByRole('menu')).not.toBeNull();
  });

  it('holds one value across a radio group', async () => {
    const onValueChange = vi.fn();
    render(
      <Basic>
        <MenuRadioGroup defaultValue="name" onValueChange={onValueChange}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date">Date</MenuRadioItem>
        </MenuRadioGroup>
      </Basic>,
    );
    await open();

    expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Date' }), { detail: 1 });

    expect(onValueChange).toHaveBeenCalledWith(
      'date',
      expect.objectContaining({ reason: 'pointer' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
  });

  it('names a group by the label inside it', async () => {
    render(
      <Basic>
        <MenuGroup label="File">
          <MenuItem>Duplicate</MenuItem>
        </MenuGroup>
      </Basic>,
    );
    await open();

    const group = screen.getByRole('group');
    const label = group.querySelector("[data-part='group-label']");
    expect(group).toHaveAttribute('aria-labelledby', label?.id);
  });

  it('waits for the value the consumer holds', async () => {
    const onOpenChange = vi.fn();
    render(<Basic open={false} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Document' }), { detail: 1 });

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'pointer' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('lets a request be refused before anything moves', async () => {
    render(
      <Basic
        onOpenChange={(_open, request) => {
          request.cancel();
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Document' }), { detail: 1 });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('takes the defaults an application set once', async () => {
    render(
      <MenuDefaultsProvider size="lg">
        <Basic />
      </MenuDefaultsProvider>,
    );
    await open();

    expect(document.querySelector("[data-ui='menu']")).toHaveAttribute('data-size', 'lg');
  });

  it('never opens while it is disabled', () => {
    render(<Basic disabled />);

    fireEvent.click(screen.getByRole('button', { name: 'Document' }), { detail: 1 });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('a submenu', () => {
  function Nested() {
    return (
      <Menu>
        <MenuTrigger>Share</MenuTrigger>
        <MenuContent>
          <MenuItem>Copy link</MenuItem>
          <Menu>
            <MenuTrigger>Send to</MenuTrigger>
            <MenuContent>
              <MenuItem>Slack</MenuItem>
            </MenuContent>
          </Menu>
        </MenuContent>
      </Menu>
    );
  }

  it('renders its trigger as an item of the surface above', async () => {
    render(<Nested />);
    fireEvent.click(screen.getByRole('button', { name: 'Share' }), { detail: 1 });
    await screen.findByRole('menu');

    const parentItem = screen.getByRole('menuitem', { name: 'Send to' });
    expect(parentItem).toHaveAttribute('data-part', 'item');
    expect(parentItem).toHaveAttribute('aria-haspopup', 'menu');
    expect(parentItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on the inline end and closes back onto the item that owns it', async () => {
    render(<Nested />);
    fireEvent.click(screen.getByRole('button', { name: 'Share' }), { detail: 1 });
    await screen.findByRole('menu');

    const parentItem = screen.getByRole('menuitem', { name: 'Send to' });
    parentItem.focus();
    press('ArrowRight');

    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Slack' })).toHaveFocus());

    press('ArrowLeft');

    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    expect(screen.getByRole('menuitem', { name: 'Send to' })).toHaveFocus();
  });

  it('runs an item of the submenu and closes both surfaces', async () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Share</MenuTrigger>
        <MenuContent>
          <Menu>
            <MenuTrigger>Send to</MenuTrigger>
            <MenuContent>
              <MenuItem onSelect={onSelect}>Slack</MenuItem>
            </MenuContent>
          </Menu>
        </MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Share' }), { detail: 1 });
    await screen.findByRole('menu');
    screen.getByRole('menuitem', { name: 'Send to' }).focus();
    press('ArrowRight');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));

    fireEvent.click(screen.getByRole('menuitem', { name: 'Slack' }), { detail: 1 });

    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});

describe('a controlled menu', () => {
  function Controlled() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <Menu open={open} onOpenChange={setOpen}>
          <MenuTrigger>Document</MenuTrigger>
          <MenuContent>
            <MenuItem>Duplicate</MenuItem>
          </MenuContent>
        </Menu>
      </>
    );
  }

  it('follows the value the consumer holds', async () => {
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: 'Open from outside' }), { detail: 1 });
    await screen.findByRole('menu');

    fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }), { detail: 1 });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
