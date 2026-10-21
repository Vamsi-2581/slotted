import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { cdp, page } from 'vitest/browser';

import { Badge } from '../badge';
import { Button, IconButton } from '../button';
import { Glyph, Icon } from '../icon';
import { DataGrid } from './data-grid';
import type { DataGridColumn } from './data-grid.types';

interface Entry {
  id: string;
  date: string;
  payee: string;
  category: string;
  account: string;
  amount: number;
  status: string;
  note: string;
  city: string;
}

const ROWS: Entry[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `E${String(index)}`,
  date: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
  payee: `Payee number ${String(index)}`,
  category: `Category ${String(index % 9)}`,
  account: `Account ${String(index % 4)}`,
  amount: index * 13.5,
  status: ['paid', 'pending', 'failed'][index % 3]!,
  note: index % 3 === 0 ? '' : 'Recurring transfer',
  city: ['Lisboa', 'Porto', 'Braga'][index % 3]!,
}));

const COLUMNS: DataGridColumn<Entry>[] = [
  { id: 'date', label: 'Date', kind: 'date' },
  { id: 'payee', label: 'Payee', rowHeader: true },
  { id: 'category', label: 'Category' },
  { id: 'account', label: 'Account' },
  { id: 'amount', label: 'Amount', kind: 'number' },
  { id: 'status', label: 'Status' },
  { id: 'note', label: 'Note' },
  { id: 'city', label: 'City' },
  { id: 'actions', label: 'Actions', kind: 'actions' },
];

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

interface TraceEvent {
  name: string;
  ph: string;
  dur?: number;
  args?: { elementCount?: number };
}

/** Where the trace being collected goes; the listeners are registered once. */
let sink: TraceEvent[] = [];
let finished = () => {};
let listening = false;

/** The style and layout events of a run, read from a Chrome trace. */
async function traced(run: () => Promise<void>): Promise<TraceEvent[]> {
  const session = cdp();
  if (!listening) {
    session.on('Tracing.dataCollected', (payload) =>
      sink.push(...(payload.value as unknown as TraceEvent[])),
    );
    session.on('Tracing.tracingComplete', () => finished());
    listening = true;
  }
  const events: TraceEvent[] = [];
  sink = events;
  const complete = new Promise<void>((resolve) => {
    finished = resolve;
  });
  await session.send('Tracing.start', {
    categories: 'devtools.timeline',
    transferMode: 'ReportEvents',
  });
  await run();
  await session.send('Tracing.end');
  await complete;
  return events.filter((event) => event.ph === 'X');
}

const total = (events: TraceEvent[], name: string) =>
  events.filter((event) => event.name === name).reduce((sum, event) => sum + (event.dur ?? 0), 0);

/**
 * A scroll step of a windowed grid lays out and restyles the rows it mounted,
 * not the grid. The scroller was a size container, and the browser laid out
 * everything inside it whenever a row entered — 45 ms per step on 29 mounted
 * rows, as much as the grid's first layout; and the body wrote the window's
 * offset as an inherited custom property, which restyled every row and cell
 * on every step. Both are measured against the grid's own first render in the
 * same run, so a slower runner moves both sides.
 */
describe('a windowed data grid while it scrolls', () => {
  it('restyles and lays out a fraction of the grid per step', async () => {
    await page.viewport(1440, 900);
    const host = document.createElement('div');
    host.style.blockSize = '760px';
    host.style.display = 'flex';
    document.body.append(host);
    const root = createRoot(host);

    const mount = await traced(async () => {
      flushSync(() =>
        root.render(
          <DataGrid<Entry>
            aria-label="Entries"
            cellRenderers={{
              actions: () => (
                <IconButton aria-label="More" size="sm" variant="ghost">
                  <Icon>
                    <Glyph name="ellipsis" />
                  </Icon>
                </IconButton>
              ),
              category: ({ text }) => (
                <Button size="sm" variant="ghost">
                  {text}
                </Button>
              ),
              status: ({ text }) => <Badge size="sm">{text}</Badge>,
            }}
            columns={COLUMNS}
            rowKey="id"
            rows={ROWS}
            selectionMode="multiple"
          />,
        ),
      );
      await frame();
      await frame();
    });
    const elements = host.querySelectorAll('*').length;
    const scroller = host.querySelector<HTMLElement>('[data-part="scroll"]')!;
    const first = () =>
      host.querySelector('[data-part="body"] > [data-row]')?.getAttribute('data-row');
    const before = first();

    const steps = 12;
    const scrolling = await traced(async () => {
      for (let step = 0; step < steps; step += 1) {
        scroller.scrollTop += 120;
        await frame();
        await frame();
      }
    });
    root.unmount();
    host.remove();

    const restyled =
      scrolling
        .filter((event) => event.name === 'UpdateLayoutTree')
        .reduce((sum, event) => sum + (event.args?.elementCount ?? 0), 0) / steps;
    const layoutPerStep = total(scrolling, 'Layout') / steps;

    expect(first()).toBeUndefined();
    expect(before).not.toBeUndefined();
    expect(restyled).toBeLessThan(elements / 3);
    expect(layoutPerStep).toBeLessThan(total(mount, 'Layout') / 4);
  }, 60000);
});
