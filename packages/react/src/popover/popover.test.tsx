import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/popover/contract.json';
import { Popover } from './popover';
import { PopoverDefaultsProvider } from './popover-defaults';
import {
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverLayer,
  PopoverTitle,
  PopoverTrigger,
} from './popover-parts';
import type { PopoverHandle, PopoverProps } from './popover.types';

function Basic({ label = 'Filters', ...props }: Partial<PopoverProps> & { label?: string }) {
  return (
    <Popover {...props}>
      <PopoverTrigger>{label}</PopoverTrigger>
      <PopoverLayer>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Filter invoices</PopoverTitle>
            <PopoverDescription>Applies to the current view only.</PopoverDescription>
            <PopoverClose />
          </PopoverHeader>
          <PopoverBody>
            <input aria-label="Search" />
          </PopoverBody>
          <PopoverFooter>
            <button type="button">Apply</button>
          </PopoverFooter>
          <PopoverArrow />
        </PopoverContent>
      </PopoverLayer>
    </Popover>
  );
}

const layer = () => document.querySelector('[data-ui="popover"]');
const panel = () => document.querySelector('[role="dialog"]') as HTMLElement | null;
const trigger = () => screen.getByRole('button', { name: 'Filters' });
const guards = () => document.querySelectorAll('[data-part="focus-guard"]');

describe('Popover', () => {
  it('renders every part the contract declares', async () => {
    render(<Basic defaultOpen />);
    await waitFor(() => expect(layer()).not.toBeNull());

    const present = contract.members.popover.parts.filter(
      (part) => document.querySelector(`[data-part="${part}"]`) !== null,
    );
    expect(present).toEqual(contract.members.popover.parts);
  });

  it('builds nothing until it is opened', () => {
    render(<Basic />);
    expect(layer()).toBeNull();
  });

  it('opens and closes from the trigger, and says so on it', async () => {
    render(<Basic />);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');

    fireEvent.click(trigger());
    await waitFor(() => expect(layer()).not.toBeNull());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(panel()?.id);

    fireEvent.click(trigger());
    await waitFor(() => expect(layer()).toBeNull());
  });

  /**
   * A dialog with no accessible name is one a reader cannot identify, and a
   * name the family invented would be worse than none.
   */
  it('names the panel from its title and describes it from its description', async () => {
    render(<Basic defaultOpen />);
    await waitFor(() => expect(panel()).not.toBeNull());

    const title = document.querySelector('[data-part="title"]');
    const description = document.querySelector('[data-part="description"]');
    expect(panel()?.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(panel()?.getAttribute('aria-describedby')).toBe(description?.id);
    expect(panel()?.getAttribute('aria-modal')).toBeNull();
  });

  it('writes no aria-labelledby when there is no title', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverLayer>
          <PopoverContent aria-label="Filters">
            <PopoverBody>Nothing but a body.</PopoverBody>
          </PopoverContent>
        </PopoverLayer>
      </Popover>,
    );
    await waitFor(() => expect(panel()).not.toBeNull());
    expect(panel()?.getAttribute('aria-labelledby')).toBeNull();
    expect(panel()?.getAttribute('aria-label')).toBe('Filters');
  });

  it('takes the focus on open and gives it back to the trigger on close', async () => {
    render(<Basic />);
    fireEvent.click(trigger());
    await waitFor(() => expect(document.activeElement).toBe(panel()));

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(layer()).toBeNull());
    expect(document.activeElement).toBe(trigger());
  });

  it('focuses what initialFocus names instead', async () => {
    render(<Basic initialFocus="input" />);
    fireEvent.click(trigger());
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Search')));
  });

  it('leaves the focus alone when autoFocus is off', async () => {
    render(<Basic autoFocus={false} />);
    trigger().focus();
    fireEvent.click(trigger());
    await waitFor(() => expect(layer()).not.toBeNull());
    expect(document.activeElement).toBe(trigger());
  });

  /**
   * The question every surveyed library leaves open. Focus reaching a guard
   * arrived by Tab at the edge of a layer at the end of the document, so the
   * family closes and puts focus back where the reading order continues.
   */
  it('closes and returns focus when Tab reaches the edge of the layer', async () => {
    render(<Basic defaultOpen />);
    await waitFor(() => expect(guards()).toHaveLength(2));

    const trailing = guards()[1] as HTMLElement;
    fireEvent.focus(trailing);
    await waitFor(() => expect(layer()).toBeNull());
    expect(document.activeElement).toBe(trigger());
    expect(contract.focus.guards.emits).toBe('keyboard');
  });

  it('carries a reason for every way it closes, and can be refused', async () => {
    const seen: string[] = [];
    render(
      <Basic
        defaultOpen
        onOpenChange={(_open, request) => {
          seen.push(request.reason);
          if (request.reason === 'escape') request.cancel();
        }}
      />,
    );
    await waitFor(() => expect(layer()).not.toBeNull());

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(seen).toContain('escape');
    expect(layer()).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(layer()).toBeNull());
    expect(seen).toContain('dismiss');
  });

  it('closes on a press outside, and not on one inside', async () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen onOpenChange={onOpenChange} />);
    await waitFor(() => expect(layer()).not.toBeNull());

    fireEvent.pointerDown(panel() as HTMLElement);
    expect(layer()).not.toBeNull();

    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(layer()).toBeNull());
    expect(onOpenChange.mock.calls.at(-1)?.[1].reason).toBe('outsidePress');
  });

  it('measures the anchor rather than the trigger when one is given', async () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor data-testid="row">
          <PopoverTrigger>Actions</PopoverTrigger>
        </PopoverAnchor>
        <PopoverLayer>
          <PopoverContent aria-label="Row actions">
            <PopoverBody>Duplicate, archive, delete.</PopoverBody>
          </PopoverContent>
        </PopoverLayer>
      </Popover>,
    );
    await waitFor(() => expect(layer()).not.toBeNull());
    expect(screen.getByTestId('row')).not.toBeNull();
  });

  it('never opens while it is disabled', () => {
    render(<Basic defaultOpen disabled />);
    expect(layer()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens and closes from the handle', async () => {
    function WithHandle() {
      const handle = useRef<PopoverHandle>(null);
      return (
        <>
          <button type="button" onClick={() => handle.current?.open()}>
            open it
          </button>
          <Basic ref={handle} />
        </>
      );
    }
    render(<WithHandle />);
    fireEvent.click(screen.getByText('open it'));
    await waitFor(() => expect(layer()).not.toBeNull());
  });

  it('takes the close label from the provider, and the instance still wins', async () => {
    render(
      <PopoverDefaultsProvider closeLabel="Fechar" size="lg">
        <Basic defaultOpen />
      </PopoverDefaultsProvider>,
    );
    await waitFor(() => expect(layer()).not.toBeNull());
    expect(screen.getByRole('button', { name: 'Fechar' })).not.toBeNull();
    expect(layer()?.getAttribute('data-size')).toBe('lg');
  });

  it('runs the consumer own handler beside the family one', () => {
    const own = vi.fn();
    render(
      <Popover>
        <PopoverTrigger onClick={own}>Filters</PopoverTrigger>
        <PopoverLayer>
          <PopoverContent aria-label="Filters">
            <PopoverBody>Body</PopoverBody>
          </PopoverContent>
        </PopoverLayer>
      </Popover>,
    );
    fireEvent.click(trigger());
    expect(own).toHaveBeenCalledTimes(1);
  });
});
