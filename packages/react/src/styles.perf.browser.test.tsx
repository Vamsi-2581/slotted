import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import {
  AppShell,
  AppShellMain,
  AppShellNav,
  DataGrid,
  Page,
  PageBody,
  PageHeader,
  PageHeaderHeading,
} from './index';
import type { DataGridColumn } from './data-grid/data-grid.types';

interface Entry {
  id: string;
  date: string;
  payee: string;
  category: string;
  account: string;
  amount: number;
  note: string;
}

const ROWS: Entry[] = Array.from({ length: 50 }, (_, index) => ({
  id: `E${String(index)}`,
  date: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
  payee: `Payee ${String(index)}`,
  category: `Category ${String(index % 9)}`,
  account: `Account ${String(index % 4)}`,
  amount: index * 13.5,
  note: index % 3 === 0 ? 'Recurring' : '',
}));

const COLUMNS: DataGridColumn<Entry>[] = [
  { id: 'date', label: 'Date', kind: 'date' },
  { id: 'payee', label: 'Payee', rowHeader: true },
  { id: 'category', label: 'Category' },
  { id: 'account', label: 'Account' },
  { id: 'amount', label: 'Amount', kind: 'number' },
  { id: 'note', label: 'Note' },
  { id: 'id', label: 'Reference' },
];

/** The median of nine full style recalculations: every element invalidated, no layout read. */
function styleRecalculation(): number {
  const probe = document.body.lastElementChild ?? document.body;
  const samples: number[] = [];
  for (let run = 0; run < 9; run += 1) {
    const start = performance.now();
    document.documentElement.style.setProperty('--slotted-perf-probe', String(run));
    void getComputedStyle(probe).color;
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return samples[4] ?? 0;
}

/**
 * The stylesheet's cost of one full style recalculation, at the 1 440 × 900
 * frame the finding was measured in.
 *
 * With every rule keyed on `[data-part='…']` and `[data-ui='…']`, Blink tested
 * each element that carried the attribute against the 4 800 rules filed under
 * its name, and a full recalculation of a data-grid page cost 357 to 470 ms.
 * Keyed on `[data-part-…]` and `[data-ui-…]` (`@slotted/core/selector-key`),
 * this page measures 29 ms above the bare document in Chromium headless. The
 * budget leaves room for a slower runner and fails long before value selectors
 * come back.
 */
describe('the library stylesheet', () => {
  it('adds under 45 ms to a full style recalculation of a data-grid page', async () => {
    await page.viewport(1440, 900);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    flushSync(() =>
      root.render(
        <AppShell>
          <AppShellNav aria-label="Sections">
            <a href="#transactions">Transactions</a>
          </AppShellNav>
          <AppShellMain>
            <Page>
              <PageHeader>
                <PageHeaderHeading>Transactions</PageHeaderHeading>
              </PageHeader>
              <PageBody>
                <DataGrid<Entry>
                  aria-label="Transactions"
                  columns={COLUMNS}
                  rowKey="id"
                  rows={ROWS}
                  selectionMode="multiple"
                  virtualize={false}
                />
              </PageBody>
            </Page>
          </AppShellMain>
        </AppShell>,
      ),
    );
    const elements = document.querySelectorAll('*').length;
    styleRecalculation();
    const styled = styleRecalculation();

    const sheets = [...document.styleSheets];
    for (const sheet of sheets) sheet.disabled = true;
    styleRecalculation();
    const bare = styleRecalculation();
    for (const sheet of sheets) sheet.disabled = false;

    root.unmount();
    host.remove();

    expect(elements).toBeGreaterThan(1400);
    expect(styled - bare).toBeLessThan(45);
  });
});
