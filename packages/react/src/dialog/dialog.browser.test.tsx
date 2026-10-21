import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from './index';

const ROWS = Array.from({ length: 60 }, (_, index) => `Row ${String(index + 1)}`);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The virtual keyboard shrinks only the visual viewport on Android Chrome and
 * iOS Safari, and a full-screen panel is the layout viewport's height: its
 * lower part sat under the keys and its list had nothing to scroll. With the
 * inset the binding writes, the panel's scroll box ends above the keys and
 * scrolls to its last row.
 */
describe('a full-screen dialog over the virtual keyboard', () => {
  it('ends its scroll box above the keys and scrolls to the last row', async () => {
    render(
      <Dialog defaultOpen fullScreen="narrow">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rows</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {ROWS.map((row) => (
              <p key={row}>{row}</p>
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );
    /* The binding's own first reading lands after the first layout. */
    await frame();
    await frame();
    const root = document.querySelector('[data-ui="dialog"]') as HTMLElement;
    root.style.setProperty('--slotted-keyboard-inset', '260px');
    await frame();

    const keys = window.innerHeight - 260;
    const body = document.querySelector('[data-part="body"]') as HTMLElement;
    expect(Math.round(body.getBoundingClientRect().bottom)).toBe(keys);

    body.scrollTop = body.scrollHeight;
    await frame();
    const last = screen.getByText(ROWS.at(-1) ?? '');
    expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(keys + 1);
    expect(last.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      body.getBoundingClientRect().top,
    );
  });
});
