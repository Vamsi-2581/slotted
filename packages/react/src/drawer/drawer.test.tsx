import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/drawer/contract.json';
import { Drawer } from './drawer';
import { DrawerDefaultsProvider } from './drawer-defaults';
import {
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerResizer,
  DrawerTitle,
  DrawerTrigger,
} from './drawer-parts';
import type { DrawerChangeRequest, DrawerHandle, DrawerProps } from './drawer.types';

function Basic({ children, ...props }: Partial<DrawerProps>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger>Open details</DrawerTrigger>
      <DrawerPanel>
        <DrawerHeader>
          <DrawerTitle>Invoice 4471</DrawerTitle>
          <DrawerDescription>Issued on 12 August.</DrawerDescription>
          <DrawerClose />
        </DrawerHeader>
        <DrawerBody>{children ?? <input aria-label="Note" />}</DrawerBody>
        <DrawerFooter>
          <button type="button">Cancel</button>
        </DrawerFooter>
        <DrawerResizer />
      </DrawerPanel>
    </Drawer>
  );
}

const layer = () => document.querySelector('[data-ui="drawer"]') as HTMLElement | null;
const panel = () => document.querySelector('[data-part="panel"]') as HTMLElement | null;
const separator = () => screen.getByRole('separator');
const trigger = () => screen.getByRole('button', { name: 'Open details' });

const press = (node: Element) => fireEvent.click(node, { detail: 1 });
const activateByKey = (node: Element) => fireEvent.click(node, { detail: 0 });
const escape = () =>
  fireEvent.keyDown(document, { key: 'Escape', bubbles: true, cancelable: true });

/**
 * jsdom lays nothing out, so every rectangle is zero and the extent arithmetic
 * has nothing to measure. The layer is given a size once, here, so the pointer
 * tests are about the family's own rules rather than about the environment.
 */
function measureLayerAs(width: number, height: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    bottom: height,
    height,
    left: 0,
    right: width,
    toJSON: () => ({}),
    top: 0,
    width,
    x: 0,
    y: 0,
  } as DOMRect);
}

/**
 * jsdom implements pointer events and not pointer *capture*, so a drag that
 * claims the pointer throws before the family's own rule is reached. The three
 * methods are filled in rather than guarded in the family: a guard would be
 * production code shaped by the test environment.
 */
beforeAll(() => {
  const element = Element.prototype as unknown as Record<string, unknown>;
  element['setPointerCapture'] ??= () => {};
  element['releasePointerCapture'] ??= () => {};
  element['hasPointerCapture'] ??= () => true;
});

describe('Drawer', () => {
  it('renders the anatomy the contract declares', () => {
    render(<Basic defaultOpen />);

    const parts = [...document.querySelectorAll('[data-part]')].map((node) =>
      node.getAttribute('data-part'),
    );
    for (const part of contract.members.drawer.parts) {
      expect(parts, `${part} is declared and never rendered`).toContain(part);
    }
    expect(layer()?.dataset['ui']).toBe('drawer');
  });

  it('writes every axis the stylesheet keys on', () => {
    render(<Basic defaultOpen mount="eager" side="bottom" size="lg" />);

    const root = layer() as HTMLElement;
    expect(root.dataset['mode']).toBe('overlay');
    expect(root.dataset['side']).toBe('bottom');
    expect(root.dataset['size']).toBe('lg');
    expect(root.dataset['mount']).toBe('eager');
    expect(root.hasAttribute('data-modal')).toBe(true);
  });

  /* ------------------------------------------------------------- opening - */

  it('opens from the trigger and tells a pointer from a key', () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    press(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'pointer' }),
    );

    activateByKey(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'keyboard' }),
    );
  });

  /** An inline drawer is a disclosure; an overlay one is a popup as well. */
  it('promises a popup only where there is one', () => {
    const { rerender } = render(<Basic defaultOpen />);
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    rerender(<Basic defaultOpen mode="inline" />);
    expect(trigger().hasAttribute('aria-haspopup')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('names the panel from the trigger, and the title from the panel', () => {
    render(<Basic defaultOpen />);

    expect(trigger().getAttribute('aria-controls')).toBe(panel()?.id);
    expect(panel()?.getAttribute('aria-labelledby')).toBe(screen.getByText('Invoice 4471').id);
    expect(panel()?.getAttribute('aria-describedby')).toBe(
      screen.getByText('Issued on 12 August.').id,
    );
  });

  /** A reference to an id nothing carries is worse than no name at all. */
  it('writes no labelling for a part that was not rendered', () => {
    render(
      <Drawer defaultOpen>
        <DrawerPanel aria-label="Filters">
          <DrawerBody>Nothing else</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );

    expect(panel()?.hasAttribute('aria-labelledby')).toBe(false);
    expect(panel()?.hasAttribute('aria-describedby')).toBe(false);
    expect(panel()?.getAttribute('aria-label')).toBe('Filters');
  });

  /* -------------------------------------------------------------- closing - */

  it('closes from the close button, carrying dismiss and its value', () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer defaultOpen onOpenChange={onOpenChange}>
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Invoice</DrawerTitle>
            <DrawerClose value="dismissed" />
          </DrawerHeader>
        </DrawerPanel>
      </Drawer>,
    );

    press(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'dismiss', result: 'dismissed' }),
    );
  });

  it('closes on Escape, carrying escape', () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen onOpenChange={onOpenChange} />);

    escape();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape' }));
  });

  it('refuses Escape when the policy says so', () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen escape="none" onOpenChange={onOpenChange} />);

    escape();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * One cancellable request covers every way out. Angular Material's
   * `disableClose` refuses two of the four sources and cannot refuse the third;
   * Ant needs two booleans and still cannot refuse the close button.
   */
  it('lets one guard refuse every source', () => {
    function Guarded() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer
          onOpenChange={(next, request: DrawerChangeRequest) => {
            if (!next) return request.cancel();
            setOpen(next);
          }}
          open={open}
        >
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Saving</DrawerTitle>
              <DrawerClose />
            </DrawerHeader>
          </DrawerPanel>
        </Drawer>
      );
    }

    render(<Guarded />);
    escape();
    expect(layer()).not.toBeNull();

    press(screen.getByRole('button', { name: 'Close' }));
    expect(layer()).not.toBeNull();
  });

  it('runs the consumer’s own handler first, and lets it refuse', () => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Drawer onOpenChange={onOpenChange}>
        <DrawerTrigger onClick={onClick}>Open details</DrawerTrigger>
        <DrawerPanel />
      </Drawer>,
    );

    press(trigger());
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /* --------------------------------------------------------------- modes - */

  /**
   * An inline drawer is a region of the page: nothing is inert, nothing is
   * contained, and `role="dialog"` on it would be the claim the APG calls
   * severe. It also never leaves the document, because its own measure is what
   * opens and closes.
   */
  it('is a dialog only where the background is out of reach', () => {
    const { rerender } = render(<Basic defaultOpen />);
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(panel()?.getAttribute('aria-modal')).toBe('true');

    rerender(<Basic defaultOpen mode="inline" />);
    expect(panel()?.hasAttribute('role')).toBe(false);
    expect(panel()?.hasAttribute('aria-modal')).toBe(false);
    expect(layer()?.dataset['mode']).toBe('inline');
  });

  it('keeps an inline drawer in the document and makes it inert when closed', () => {
    render(<Basic mode="inline" />);

    expect(layer()).not.toBeNull();
    expect(layer()?.hasAttribute('inert')).toBe(true);
    expect(layer()?.hasAttribute('data-open')).toBe(false);
  });

  it('drops an active overlay layer when it closes', () => {
    const { rerender } = render(<Basic defaultOpen />);
    expect(layer()).not.toBeNull();

    rerender(<Basic open={false} />);
    /* Gone, or on its way out — `presence` decides which, and neither is open. */
    expect(layer()?.hasAttribute('data-open') ?? false).toBe(false);
  });

  /**
   * The scrim belongs to the layer, not to the dismissal policy. `modal`
   * decides what happens to the page *behind* it — inert, the scroll lock,
   * focus containment — and never what is painted. Tying the two cost a
   * reference page: a demonstration that stands open must not be modal, and
   * with the scrim gated on modality every still picture lost the scrim that
   * is half of it.
   */
  it('paints the scrim wherever there is a layer, modal or not', () => {
    const { rerender } = render(<Basic defaultOpen />);
    expect(document.querySelector('[data-part="backdrop"]')).not.toBeNull();

    rerender(<Basic defaultOpen modal={false} />);
    expect(document.querySelector('[data-part="backdrop"]')).not.toBeNull();
    expect(document.querySelector('[data-part="panel"]')?.hasAttribute('aria-modal')).toBe(false);
  });

  it('paints no scrim where there is no layer', () => {
    render(<Basic defaultOpen mode="inline" />);
    expect(document.querySelector('[data-part="backdrop"]')).toBeNull();
  });

  /* ------------------------------------------------------------- resizing - */

  it('wires the separator to the pane it sizes, both ways', () => {
    render(<Basic defaultOpen />);

    const bar = separator();
    expect(bar.getAttribute('aria-orientation')).toBe('vertical');
    expect(bar.getAttribute('aria-controls')).toBe(panel()?.id);
    expect(bar.getAttribute('aria-labelledby')).toBe(screen.getByText('Invoice 4471').id);
    expect(bar.tabIndex).toBe(0);
  });

  it('reports the measure as the range the pattern calls typical', () => {
    render(<Basic defaultExtent={0.4} defaultOpen />);

    const bar = separator();
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuemin')).toBe('20');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('turns the block axis around for a sheet', () => {
    render(<Basic defaultOpen side="bottom" />);
    expect(separator().getAttribute('aria-orientation')).toBe('horizontal');
  });

  /**
   * The arrows name a direction on the screen, which is the Window Splitter
   * pattern's own reading. `ArrowLeft` grows an `end`-side panel and shrinks a
   * `start`-side one, because the same key moves the separator the same way and
   * the panels are on opposite edges.
   */
  it('moves the separator by the screen rather than by the anchor', () => {
    const onExtentChange = vi.fn();
    /* Controlled and never moved, so each press is measured from the same
       place rather than from wherever the one before it landed. */
    const { rerender } = render(
      <Basic defaultOpen extent={0.4} onExtentChange={onExtentChange} side="end" />,
    );

    fireEvent.keyDown(separator(), { key: 'ArrowLeft' });
    expect(onExtentChange).toHaveBeenLastCalledWith(
      expect.closeTo(0.45, 5),
      expect.objectContaining({ reason: 'keyboard' }),
    );

    rerender(<Basic defaultOpen extent={0.4} onExtentChange={onExtentChange} side="start" />);
    fireEvent.keyDown(separator(), { key: 'ArrowLeft' });
    expect(onExtentChange).toHaveBeenLastCalledWith(
      expect.closeTo(0.35, 5),
      expect.objectContaining({ reason: 'keyboard' }),
    );
  });

  it('takes Home and End to the ends of the range', () => {
    const onExtentChange = vi.fn();
    render(<Basic defaultExtent={0.5} defaultOpen onExtentChange={onExtentChange} />);

    fireEvent.keyDown(separator(), { key: 'End' });
    expect(onExtentChange).toHaveBeenLastCalledWith(1, expect.anything());

    fireEvent.keyDown(separator(), { key: 'Home' });
    expect(onExtentChange).toHaveBeenLastCalledWith(0.2, expect.anything());
  });

  /**
   * The pattern says `Enter` collapses the pane and restores it. It does not
   * close the drawer, because Escape already means that and a reader pressing
   * Enter on a separator expects the separator to still be there.
   */
  it('collapses and restores on Enter without closing', () => {
    function Controlled() {
      const [extent, setExtent] = useState(0.6);
      return <Basic defaultOpen extent={extent} onExtentChange={setExtent} />;
    }

    render(<Controlled />);
    fireEvent.keyDown(separator(), { key: 'Enter' });
    expect(separator().getAttribute('aria-valuenow')).toBe('20');
    expect(layer()).not.toBeNull();

    fireEvent.keyDown(separator(), { key: 'Enter' });
    expect(separator().getAttribute('aria-valuenow')).toBe('60');
  });

  /** A snap point is a stop of the same separator, reachable by arrow. */
  it('moves between snap points rather than by the step', () => {
    const onExtentChange = vi.fn();
    render(
      <Basic
        defaultExtent={0.25}
        defaultOpen
        onExtentChange={onExtentChange}
        side="bottom"
        snapPoints={[0.25, 0.5, 1]}
      />,
    );

    fireEvent.keyDown(separator(), { key: 'ArrowUp' });
    expect(onExtentChange).toHaveBeenLastCalledWith(0.5, expect.anything());
  });

  it('takes its limits from the first and last stop', () => {
    render(<Basic defaultOpen snapPoints={[0.3, 0.6, 0.9]} />);

    expect(separator().getAttribute('aria-valuemin')).toBe('30');
    expect(separator().getAttribute('aria-valuemax')).toBe('90');
  });

  it('follows the pointer while it is down, and says so in the DOM', () => {
    measureLayerAs(1000, 800);
    const onExtentChange = vi.fn();
    render(<Basic defaultOpen onExtentChange={onExtentChange} side="end" />);

    const bar = separator();
    fireEvent.pointerDown(bar, { button: 0, clientX: 700, clientY: 0, pointerId: 1 });
    expect(layer()?.hasAttribute('data-dragging')).toBe(true);
    expect(onExtentChange).toHaveBeenLastCalledWith(
      expect.closeTo(0.3, 5),
      expect.objectContaining({ reason: 'pointer' }),
    );

    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(layer()?.hasAttribute('data-dragging')).toBe(false);
    vi.restoreAllMocks();
  });

  /**
   * One rule on release: a measure below the floor asks to close, carrying
   * `pointer`. MUI's `SwipeableDrawer` and Vaul's dismiss gesture both do this,
   * expressed here as a consequence of the resize rather than as a second
   * mechanism.
   */
  it('asks to close when a drag is released below the floor', () => {
    measureLayerAs(1000, 800);
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen onOpenChange={onOpenChange} side="end" />);

    const bar = separator();
    fireEvent.pointerDown(bar, { button: 0, clientX: 950, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });

    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'pointer' }),
    );
    vi.restoreAllMocks();
  });

  /* --------------------------------------------------------------- state - */

  it('reads a controlled value and never moves it itself', () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} open={false} />);

    press(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(document.querySelector('[data-part="panel"]')).toBeNull();
  });

  it('holds its own value when the consumer owns nothing', () => {
    render(<Basic />);
    press(trigger());
    expect(panel()).not.toBeNull();
  });

  it('carries the loading state to the row that is waiting', () => {
    render(<Basic defaultOpen loading />);

    expect(layer()?.hasAttribute('data-loading')).toBe(true);
    expect(document.querySelector('[data-part="body"]')?.getAttribute('aria-busy')).toBe('true');
    /* And nothing is disabled: a drawer a reader cannot leave is worse. */
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });

  /* -------------------------------------------------------- composition - */

  it('lets an application set the axes once', () => {
    render(
      <DrawerDefaultsProvider mode="inline" side="start" size="xl">
        <Basic defaultOpen />
      </DrawerDefaultsProvider>,
    );

    expect(layer()?.dataset['side']).toBe('start');
    expect(layer()?.dataset['size']).toBe('xl');
    expect(layer()?.dataset['mode']).toBe('inline');
  });

  it('lets an explicit value win over the provider', () => {
    render(
      <DrawerDefaultsProvider size="xl">
        <Basic defaultOpen size="sm" />
      </DrawerDefaultsProvider>,
    );

    expect(layer()?.dataset['size']).toBe('sm');
  });

  /** `render` substitutes the panel, which is how an inline drawer is a nav. */
  it('substitutes the element a part renders', () => {
    render(
      <Drawer defaultOpen mode="inline">
        <DrawerPanel render={(props) => <nav {...props} aria-label="Sections" />}>
          <DrawerBody>Sections</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );

    const nav = screen.getByRole('navigation', { name: 'Sections' });
    expect(nav.dataset['part']).toBe('panel');
  });

  it('gives the consumer the three actions they cannot write declaratively', () => {
    const handle = { current: null as DrawerHandle | null };
    const onOpenChange = vi.fn();

    render(<Basic onOpenChange={onOpenChange} ref={handle} />);

    act(() => handle.current?.open());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'programmatic' }),
    );

    act(() => handle.current?.close('saved'));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'programmatic', result: 'saved' }),
    );
  });

  it('throws for a part written outside the family', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DrawerTitle>Loose</DrawerTitle>)).toThrow(/inside Drawer/);
    quiet.mockRestore();
  });
});
