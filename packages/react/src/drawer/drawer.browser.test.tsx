import { render } from '@testing-library/react';
import { useState } from 'react';
import { cdp, page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IconButton } from '../button';
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from '../message-scroller';
import {
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerTitle,
} from './index';
import type { DrawerProps } from './drawer.types';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) {
  const frameBox = window.frameElement?.getBoundingClientRect();
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints:
      type === 'touchEnd' ? [] : [{ x: (frameBox?.left ?? 0) + x, y: (frameBox?.top ?? 0) + y }],
  });
}

/**
 * Dragging a bottom sheet by its body rendered the drawer on every move, and
 * each render measured the layer to turn the hand's position into a length: a
 * render of the drawer's consumers and a forced layout per move. The hand's
 * position is written on the layer as it moves, and the extent is requested
 * once, on release.
 */
describe('a bottom sheet dragged by its body', () => {
  it('renders nothing and reads no layout while the hand moves', async () => {
    let renders = 0;
    function Row({ label }: { label: string }) {
      renders += 1;
      return <li>{label}</li>;
    }
    render(
      <Drawer defaultOpen side="bottom">
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <ul>
              {Array.from({ length: 10 }, (_, index) => (
                <Row key={index} label={`Row ${String(index + 1)}`} />
              ))}
            </ul>
          </DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    for (let index = 0; index < 10; index += 1) await frame();
    const title = document.querySelector('[data-ui="drawer"] [data-part="header"]') as HTMLElement;
    const box = title.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    /* Past the slop, so the drag has begun: its start renders once. */
    await touch('touchStart', x, y);
    await touch('touchMove', x, y + 20);
    for (let index = 0; index < 3; index += 1) await frame();
    renders = 0;
    const reads = vi.spyOn(Element.prototype, 'getBoundingClientRect');
    for (let step = 1; step <= 30; step += 1) {
      await touch('touchMove', x, y + 20 + step * 2);
      await frame();
    }
    const read = reads.mock.calls.length;
    reads.mockRestore();
    await touch('touchEnd', x, y + 80);

    expect(renders).toBe(0);
    expect(read).toBe(0);
  });
});

/**
 * A bottom sheet dragged to the top of the screen is the screen: its top
 * corners square and its header clears the safe area. It kept the radius of a
 * sheet lying over the page.
 */
describe('a bottom sheet at its last stop', () => {
  it('is expanded, with square top corners', async () => {
    render(
      <Drawer defaultOpen side="bottom" snapPoints={[0.5, 1]}>
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    /* The opening is the platform's smooth scroll, a little under half a second. */
    for (let index = 0; index < 45; index += 1) await frame();
    const root = document.querySelector('[data-ui="drawer"]') as HTMLElement;
    const panel = root.querySelector('[data-part="panel"]') as HTMLElement;
    const header = root.querySelector('[data-part="header"]') as HTMLElement;
    const box = header.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    await touch('touchStart', x, y);
    for (let step = 1; step <= 20; step += 1) {
      await touch('touchMove', x, y - step * 30);
      await frame();
    }
    await touch('touchEnd', x, y - 600);
    for (let index = 0; index < 60; index += 1) await frame();

    expect(root.hasAttribute('data-expanded')).toBe(true);
    expect(getComputedStyle(panel).borderTopLeftRadius).toBe('0px');
  });
});

/**
 * A link inside a sheet closes it and navigates in one turn. A router keeps
 * the state it finds when it pushes, so the sheet's history token survives the
 * push, and the sheet's own step back — taken once it has left — undid the
 * navigation. The destination stays.
 */
describe('a bottom sheet closed for a navigation', () => {
  it('keeps the destination a router pushed in the same turn', async () => {
    const start = location.search;
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer onOpenChange={setOpen} open={open} side="bottom">
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <a
                href="?route=b"
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  history.pushState({ ...history.state, key: 'b' }, '', '?route=b');
                }}
              >
                Go to b
              </a>
            </DrawerBody>
          </DrawerPanel>
        </Drawer>
      );
    }
    render(<Host />);
    for (let index = 0; index < 10; index += 1) await frame();
    (document.querySelector('a[href="?route=b"]') as HTMLElement).click();
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(location.search).toBe('?route=b');
    history.replaceState(null, '', location.pathname + start);
  });
});

/**
 * A bottom sheet is laid out once for a drag and moved by `translate` alone;
 * a fling leaves from where the hand let go, at the hand's speed, in one
 * motion: the panel's position never goes back, and it ends out of sight.
 */
/**
 * The sheet on the platform's scroll (docs/history/designs/
 * 2026-10-23-drawer-sheet-native-scroll-design.md §3): the finger, the fling
 * and the landing are the compositor's, the family reads where they end.
 */
describe('a bottom sheet on the platform scroll', () => {
  /* The theme's motion tokens, which the test document does not load: the
     layer is kept for as long as they say the scroll takes. */
  beforeEach(() => {
    document.documentElement.style.setProperty('--slotted-duration-short', '120ms');
    document.documentElement.style.setProperty('--slotted-duration-medium', '200ms');
    document.documentElement.style.setProperty('--slotted-duration-long', '320ms');
  });
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  const rows = Array.from({ length: 40 }, (_, index) => (
    <p key={index} style={{ blockSize: 48, margin: 0 }}>
      Row {index + 1}
    </p>
  ));

  async function open({ onOpenChange: alsoOnOpenChange, ...props }: Partial<DrawerProps> = {}) {
    const onOpenChange = vi.fn();
    const onExtentChange = vi.fn();
    render(
      <Drawer
        defaultOpen
        onExtentChange={onExtentChange}
        onOpenChange={(next, request) => {
          onOpenChange(next, request);
          alsoOnOpenChange?.(next, request);
        }}
        side="bottom"
        {...props}
      >
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Transactions</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>{props.children ?? rows}</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    for (let index = 0; index < 45; index += 1) await frame();
    const layer = document.querySelector('[data-ui="drawer"]') as HTMLElement;
    const panel = layer.querySelector('[data-part="panel"]') as HTMLElement;
    const header = layer.querySelector('[data-part="header"]') as HTMLElement;
    const box = header.getBoundingClientRect();
    return {
      header: { x: box.left + box.width / 2, y: box.top + box.height / 2 },
      layer,
      onExtentChange,
      onOpenChange,
      panel,
    };
  }

  /** The visible height of the panel, whatever the layer's own coordinates are. */
  const shown = (layer: HTMLElement, panel: HTMLElement) =>
    Math.round(layer.getBoundingClientRect().bottom - panel.getBoundingClientRect().top);

  async function drag(from: { x: number; y: number }, by: number, steps: number) {
    await touch('touchStart', from.x, from.y);
    for (let step = 1; step <= steps; step += 1) {
      await touch('touchMove', from.x, from.y + (by * step) / steps);
      await frame();
    }
    await touch('touchEnd', from.x, from.y + by);
  }

  async function trace(layer: HTMLElement, panel: HTMLElement, frames = 60) {
    const tops: number[] = [];
    for (let index = 0; index < frames; index += 1) {
      await frame();
      if (!panel.isConnected) break;
      tops.push(Math.round(panel.getBoundingClientRect().top));
    }
    return tops;
  }

  it('closes on a fling down, and the panel never comes back up on its way out', async () => {
    const { header, layer, onOpenChange, panel } = await open({
      snapPoints: [0.4, 1],
      defaultExtent: 0.4,
    });
    await drag(header, 300, 5);
    const tops = await trace(layer, panel);
    for (let index = 1; index < tops.length; index += 1) {
      expect(tops[index]!).toBeGreaterThanOrEqual(tops[index - 1]! - 0.5);
    }
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  it('lands a slow drag on the nearest stop and asks for it', async () => {
    const { header, layer, onExtentChange, panel } = await open({
      snapPoints: [0.4, 0.8],
      defaultExtent: 0.4,
    });
    const span = layer.clientHeight;
    /* Up by a third of the layer, slowly: nearer to 0.8 than to 0.4. */
    await drag(header, -Math.round(span * 0.3), 30);
    await trace(layer, panel, 45);
    expect(Math.abs(shown(layer, panel) - span * 0.8)).toBeLessThanOrEqual(2);
    expect(onExtentChange).toHaveBeenLastCalledWith(
      0.8,
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  it('goes on into the content in the same gesture, and stays where it is let go', async () => {
    const { header, layer, panel } = await open({ snapPoints: [0.4, 1], defaultExtent: 0.4 });
    const span = layer.clientHeight;
    await drag(header, -Math.round(span * 0.9), 40);
    await trace(layer, panel, 45);
    /* The panel's top went past the top of the screen: the content scrolled under the header. */
    expect(panel.getBoundingClientRect().top).toBeLessThan(-span * 0.2);
    expect(layer.hasAttribute('data-sheet-content')).toBe(true);
  });

  it('stops a fling out of the content at the top of the content, and stays open', async () => {
    const { header, layer, onOpenChange, panel } = await open({
      snapPoints: [0.4, 1],
      defaultExtent: 0.4,
    });
    const span = layer.clientHeight;
    await drag(header, -Math.round(span * 0.9), 40);
    await trace(layer, panel, 45);
    /* A fling down from inside the content, the hand lifting before the top. */
    const body = layer.querySelector('[data-part="body"]') as HTMLElement;
    const at = body.getBoundingClientRect();
    /* The content is 0.3 of the layer past its top; the hand travels 0.2 and lets the fling carry on. */
    await drag({ x: at.left + at.width / 2, y: span * 0.2 }, Math.round(span * 0.2), 2);
    /* However hard the fling, the panel's top never comes below the top of the
       screen: the content stops at its own top, and the sheet stays where it is. */
    const tops = await trace(layer, panel, 90);
    expect(Math.max(...tops)).toBeLessThanOrEqual(0.5);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on a press outside along the same scroll, over many frames', async () => {
    const { layer, onOpenChange, panel } = await open({
      children: 'Short',
      snapPoints: [0.4],
      defaultExtent: 0.4,
    });
    const backdrop = layer.querySelector('[data-part="backdrop"]') as HTMLElement;
    backdrop.click();
    const tops = await trace(layer, panel);
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'outsidePress' }),
    );
    /* A slide of one or two frames read as a cut; the scroll takes a dozen or more. */
    expect(new Set(tops).size).toBeGreaterThan(10);
    for (let index = 1; index < tops.length; index += 1) {
      expect(tops[index]!).toBeGreaterThanOrEqual(tops[index - 1]! - 0.5);
    }
  });

  it('closes on the same fling with a busy main thread', async () => {
    await cdp().send('Emulation.setCPUThrottlingRate', { rate: 6 });
    try {
      const busy = () => {
        const until = performance.now() + 40;
        while (performance.now() < until) {
          /* an application rendering as the sheet closes */
        }
      };
      const { header, layer, onOpenChange } = await open({
        defaultExtent: 0.4,
        onOpenChange: busy,
        snapPoints: [0.4, 1],
      });
      /* Slower frames: the opening is given time to arrive before the hand. */
      for (let index = 0; index < 45; index += 1) await frame();
      await drag(header, Math.round(layer.clientHeight * 0.35), 5);
      for (let index = 0; index < 90; index += 1) await frame();
      expect(onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'pointer' }),
      );
    } finally {
      await cdp().send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
  });
});

/**
 * A side panel carries one or two actions beside its title. The header had a
 * column for the words and one for the close button, so a third child wrapped
 * to a second row.
 */
describe('a drawer header with actions', () => {
  it('lays the title, the actions and the close button on one row', async () => {
    render(
      <Drawer defaultOpen side="end">
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Assistant</DrawerTitle>
            <DrawerActions>
              <IconButton aria-label="History">H</IconButton>
              <IconButton aria-label="New">N</IconButton>
            </DrawerActions>
            <DrawerClose />
          </DrawerHeader>
          <DrawerBody>Body</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    for (let index = 0; index < 10; index += 1) await frame();
    const header = document.querySelector('[data-ui="drawer"] [data-part="header"]') as HTMLElement;
    const tops = [
      header.querySelector('[data-part="title"]'),
      ...header.querySelectorAll('[data-part="actions"] > button'),
      header.querySelector('[data-part="close"]'),
    ].map((element) => Math.round((element as HTMLElement).getBoundingClientRect().top));

    expect(tops).toHaveLength(4);
    expect(new Set(tops).size).toBe(1);
  });
});

/**
 * `size="full"` on a bottom sheet is the screen. The panel was as tall as its
 * content, so a short body left the footer in the middle of the screen.
 */
describe('a full bottom sheet with a short body', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  it('rests its footer on the bottom of the viewport', async () => {
    await page.viewport(390, 844);
    render(
      <Drawer defaultOpen side="bottom" size="full">
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>One paragraph.</DrawerBody>
          <DrawerFooter>Apply</DrawerFooter>
        </DrawerPanel>
      </Drawer>,
    );
    for (let index = 0; index < 45; index += 1) await frame();
    const footer = document.querySelector('[data-ui="drawer"] [data-part="footer"]') as HTMLElement;

    expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight);
  });
});

/**
 * An overlay sheet draws its side edges where it is narrower than the screen.
 * At the screen's width the two edges sat on the screen's own, and under
 * `size="full"` the sheet's rule outweighed the one that drops every edge.
 */
describe('an overlay sheet as wide as the screen', () => {
  afterEach(async () => {
    await page.viewport(412, 915);
  });

  const sheet = (props: Partial<DrawerProps>) => {
    render(
      <Drawer defaultOpen side="bottom" {...props}>
        <DrawerPanel>
          <DrawerBody>Body</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    return document.querySelector('[data-ui="drawer"] [data-part="panel"]') as HTMLElement;
  };

  it('draws no side edge on a phone', () => {
    const panel = sheet({});
    expect(getComputedStyle(panel).borderLeftWidth).toBe('0px');
    expect(getComputedStyle(panel).borderRightWidth).toBe('0px');
  });

  it('draws its side edges on a wide screen', async () => {
    await page.viewport(1440, 900);
    const panel = sheet({});
    expect(getComputedStyle(panel).borderLeftWidth).toBe('1px');
  });

  it('draws no edge under size="full" on a wide screen', async () => {
    await page.viewport(1440, 900);
    const panel = sheet({ size: 'full' });
    expect(getComputedStyle(panel).borderLeftWidth).toBe('0px');
    expect(getComputedStyle(panel).borderTopWidth).toBe('0px');
  });
});

/**
 * The slide of a drawer that a transition moves — a side panel, a top sheet —
 * reads two public tokens, one to arrive and one to leave. It read a private
 * property only, so a theme could not retune it.
 */
describe('the slide of a side drawer', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  const slide = (panel: HTMLElement) => {
    const style = getComputedStyle(panel);
    const index = style.transitionProperty.split(', ').indexOf('translate');
    return style.transitionDuration.split(', ')[index];
  };

  it('arrives in --slotted-drawer-slide-duration and leaves in --slotted-drawer-slide-exit-duration', async () => {
    /* The theme's motion tokens, which the test document does not load. */
    for (const name of ['short', 'medium', 'long', 'instant'])
      document.documentElement.style.setProperty(`--slotted-duration-${name}`, '100ms');
    for (const name of ['enter', 'exit', 'standard'])
      document.documentElement.style.setProperty(`--slotted-easing-${name}`, 'ease');
    document.documentElement.style.setProperty('--slotted-drawer-slide-duration', '240ms');
    document.documentElement.style.setProperty('--slotted-drawer-slide-exit-duration', '160ms');
    const { rerender } = render(
      <Drawer mount="eager" open side="end">
        <DrawerPanel>
          <DrawerBody>Body</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    const panel = document.querySelector('[data-ui="drawer"] [data-part="panel"]') as HTMLElement;
    for (let index = 0; index < 5; index += 1) await frame();
    expect(slide(panel)).toBe('0.24s');

    rerender(
      <Drawer mount="eager" open={false} side="end">
        <DrawerPanel>
          <DrawerBody>Body</DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    expect(slide(panel)).toBe('0.16s');
  });
});

/**
 * Inside a sheet that moves with its content (`drag="panel"`), a region's
 * scroll passes on to the sheet unless the region carries
 * `data-drawer-drag="none"`. The message scroller contained its overscroll, so
 * a pull at the top of the list did not move the sheet.
 */
describe('a message scroller in a bottom sheet', () => {
  it('passes a pull at its top on to the sheet', async () => {
    render(
      <Drawer defaultOpen side="bottom" size="full">
        <DrawerPanel>
          <DrawerBody>
            <MessageScroller style={{ blockSize: 300 }}>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {Array.from({ length: 30 }, (_, index) => (
                    <MessageScrollerItem key={index} messageId={`m${String(index)}`}>
                      <p style={{ blockSize: 40, margin: 0 }}>Message {index + 1}</p>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </DrawerBody>
        </DrawerPanel>
      </Drawer>,
    );
    for (let index = 0; index < 45; index += 1) await frame();
    const layer = document.querySelector('[data-ui="drawer"]') as HTMLElement;
    const viewport = layer.querySelector('[data-part="viewport"]') as HTMLElement;
    viewport.scrollTop = 0;
    for (let index = 0; index < 3; index += 1) await frame();
    const before = layer.scrollTop;
    const box = viewport.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + 20;

    await touch('touchStart', x, y);
    for (let step = 1; step <= 10; step += 1) {
      await touch('touchMove', x, y + step * 15);
      await frame();
    }
    const during = layer.scrollTop;
    await touch('touchEnd', x, y + 150);

    expect(viewport.scrollTop).toBe(0);
    expect(during).toBeLessThan(before);
  });
});
