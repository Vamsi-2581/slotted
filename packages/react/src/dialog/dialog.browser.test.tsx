import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './index';

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

/**
 * A dialog that edits a record submits with Enter from any field and with the
 * footer's submit. The form is the panel itself, through `render`, so the
 * header, the body and the footer stay the panel's children and keep its
 * inset and rows; a form wrapped around them inside the panel loses both.
 */
describe('a dialog that is a form', () => {
  const parts = (
    <>
      <DialogHeader>
        <DialogTitle>Edit contact</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <input aria-label="Name" defaultValue="Ana" />
      </DialogBody>
      <DialogFooter>
        <button type="submit">Save</button>
      </DialogFooter>
    </>
  );

  /** `panel`: the form is the panel. `wrapper`: a form around the parts, inside it. */
  function Record({
    form,
    onSubmit,
  }: {
    form: 'none' | 'panel' | 'wrapper';
    onSubmit?: () => void;
  }) {
    const submit = (event: { preventDefault(): void }) => {
      event.preventDefault();
      onSubmit?.();
    };
    return (
      <Dialog defaultOpen>
        {form === 'panel' ? (
          <DialogContent render={(props) => <form {...props} onSubmit={submit} />}>
            {parts}
          </DialogContent>
        ) : (
          <DialogContent>
            {form === 'wrapper' ? <form onSubmit={submit}>{parts}</form> : parts}
          </DialogContent>
        )}
      </Dialog>
    );
  }

  const geometry = () => {
    const panel = document.querySelector('[data-part="content"]') as HTMLElement;
    const box = panel.getBoundingClientRect();
    return ['header', 'body', 'footer'].map((part) => {
      const rect = (
        panel.querySelector(`[data-part="${part}"]`) as HTMLElement
      ).getBoundingClientRect();
      return [rect.left - box.left, rect.top - box.top, rect.width, rect.height].map(Math.round);
    });
  };

  async function reference() {
    const shown = render(<Record form="none" />);
    await frame();
    await frame();
    const measured = geometry();
    shown.unmount();
    const header = measured[0]!;
    expect(header[2]).toBeGreaterThan(0);
    return measured;
  }

  it('is the panel through render, keeps its rows, and submits with Enter from a field', async () => {
    const expected = await reference();
    let submitted = 0;
    render(<Record form="panel" onSubmit={() => (submitted += 1)} />);
    await frame();
    await frame();
    const panel = document.querySelector('[data-part="content"]') as HTMLElement;
    expect(panel.tagName).toBe('FORM');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(geometry()).toEqual(expected);
    const header = panel.querySelector('[data-part="header"]') as HTMLElement;
    expect(Number.parseFloat(getComputedStyle(header).paddingInlineStart)).toBeGreaterThan(0);

    (screen.getByLabelText('Name') as HTMLInputElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(submitted).toBe(1);
  });

  it('keeps the panel’s inset and rows for a form wrapped around the parts', async () => {
    const expected = await reference();
    let submitted = 0;
    render(<Record form="wrapper" onSubmit={() => (submitted += 1)} />);
    await frame();
    await frame();
    expect(geometry()).toEqual(expected);
    const header = document.querySelector('[data-part="header"]') as HTMLElement;
    expect(Number.parseFloat(getComputedStyle(header).paddingInlineStart)).toBeGreaterThan(0);

    (screen.getByLabelText('Name') as HTMLInputElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(submitted).toBe(1);
  });
});
