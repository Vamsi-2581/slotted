import { render } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';

import { Drawer, DrawerBody, DrawerHeader, DrawerPanel, DrawerTitle } from './index';

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
