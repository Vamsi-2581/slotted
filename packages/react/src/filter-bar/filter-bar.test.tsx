import { serializeFilterGroup } from '@slotted/core/filter';
import type { FilterGroup } from '@slotted/core/filter';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/filter-bar/contract.json';
import { FilterBar } from './filter-bar';
import { FilterBarDefaultsProvider } from './filter-bar-defaults';
import type { FilterBarField, FilterBarProps } from './filter-bar.types';

const FIELDS: FilterBarField[] = [
  {
    key: 'status',
    kind: 'set',
    label: 'Status',
    options: [
      { label: 'Paid', value: 'paid' },
      { label: 'Refunded', value: 'refunded' },
      { label: 'Draft', value: 'draft' },
    ],
    pinned: true,
  },
  { key: 'owner', kind: 'text', label: 'Owner', pinned: true },
  { key: 'amount', kind: 'number', label: 'Amount' },
  { key: 'customer', kind: 'text', label: 'Customer' },
  { key: 'created', kind: 'date', label: 'Created', section: 'Dates' },
  { key: 'note', kind: 'boolean', label: 'Has note' },
];

const TWO_VALUES: FilterGroup = {
  join: 'and',
  rules: [
    {
      field: 'status',
      filter: {
        kind: 'set',
        join: 'and',
        conditions: [{ operator: 'anyOf', value: ['paid', 'refunded'] }],
      },
    },
  ],
};

const TREE: FilterGroup = {
  join: 'and',
  rules: [
    {
      field: 'status',
      filter: { kind: 'set', join: 'and', conditions: [{ operator: 'anyOf', value: ['paid'] }] },
    },
    {
      field: 'amount',
      filter: {
        kind: 'number',
        join: 'and',
        conditions: [{ operator: 'greaterThan', value: 100 }],
      },
    },
    {
      field: 'customer',
      filter: { kind: 'text', join: 'and', conditions: [{ operator: 'contains', value: 'ana' }] },
    },
  ],
};

function Orders(props: Partial<FilterBarProps>) {
  return <FilterBar count={128} fields={FIELDS} locale="en-US" total={3412} {...props} />;
}

const root = () =>
  document.querySelector('[data-ui="filter-bar"][data-part="root"]') as HTMLElement;
const part = (name: string) => root().querySelector(`[data-part="${name}"]`) as HTMLElement;
const parts = (name: string) =>
  [...root().querySelectorAll(`[data-part="${name}"]`)] as HTMLElement[];

describe('FilterBar', () => {
  it('is selected in public by the family identifier, and is a search landmark holding a toolbar and a grid', () => {
    render(<Orders defaultValue={TREE} />);
    expect(root().dataset['ui']).toBe(contract.ui);
    expect(screen.getByRole('search', { name: 'Filter' })).toBe(root());
    expect(screen.getByRole('toolbar', { name: 'Filters' })).toBe(part('bar'));
    expect(screen.getByRole('grid', { name: 'Applied filters' })).toBe(part('chips'));
    for (const name of [
      'frame',
      'search',
      'pill',
      'add',
      'clear',
      'chips',
      'chip',
      'count',
      'summary',
    ]) {
      expect(part(name)).not.toBeNull();
    }
  });

  it('draws a pinned field as a pill, filled while it holds a rule, and an unpinned one as a chip', () => {
    render(<Orders defaultValue={TREE} />);
    const pills = parts('pill');
    expect(pills.map((pill) => pill.textContent)).toEqual(['Statusis Paid', 'Owner']);
    expect(pills[0]!.hasAttribute('data-filtered')).toBe(true);
    expect(pills[1]!.hasAttribute('data-filtered')).toBe(false);
    expect(pills[0]!.getAttribute('aria-haspopup')).toBe('dialog');
    const chips = parts('chip');
    expect(chips).toHaveLength(2);
    expect(chips[0]!.getAttribute('role')).toBe('gridcell');
    expect(screen.getByRole('button', { name: 'Amount: greater than 100' })).not.toBeNull();
    /* The name and the sentence are two runs with a space between them. The
       space is a text node rather than a gap, because it separates the words of
       the chip's own accessible name as well as the words on the screen. */
    expect(chips[0]!.querySelector('[data-part="label"]')?.textContent).toBe(
      'Amount greater than 100',
    );
    expect(screen.getByRole('button', { name: 'Remove Amount greater than 100' })).not.toBeNull();
  });

  it('holds one tab stop for the bar and one for the chips, with arrows between', () => {
    render(<Orders defaultValue={TREE} />);
    const [status, owner] = parts('pill');
    const add = part('add');
    expect(status!.getAttribute('tabindex')).toBe('0');
    expect(owner!.getAttribute('tabindex')).toBe('-1');
    expect(add.getAttribute('tabindex')).toBe('-1');
    status!.focus();
    fireEvent.keyDown(status!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(owner);
    fireEvent.keyDown(owner!, { key: 'End' });
    expect(document.activeElement?.getAttribute('data-part')).toBe('summary');

    const bodies = [...part('chips').querySelectorAll('[data-part="body"]')] as HTMLElement[];
    expect(bodies[0]!.getAttribute('tabindex')).toBe('0');
    expect(bodies[1]!.getAttribute('tabindex')).toBe('-1');
  });

  it('removes a chip with Delete, carries the reason, and moves focus to the next chip', async () => {
    const onValueChange = vi.fn();
    render(<Orders defaultValue={TREE} onValueChange={onValueChange} />);
    const bodies = [...part('chips').querySelectorAll('[data-part="body"]')] as HTMLElement[];
    bodies[0]!.focus();
    fireEvent.keyDown(bodies[0]!, { key: 'Delete' });
    await act(() => Promise.resolve());
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [next, request] = onValueChange.mock.calls[0]!;
    expect(request.reason).toBe('remove');
    expect(
      (next as FilterGroup).rules.map((rule) => ('field' in rule ? rule.field : 'group')),
    ).toEqual(['status', 'customer']);
    expect(parts('chip')).toHaveLength(1);
    expect(document.activeElement?.getAttribute('data-part')).toBe('body');
  });

  it('keeps the value where the consumer owns it, and asks', () => {
    const onValueChange = vi.fn();
    render(<Orders onValueChange={onValueChange} value={TREE} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Amount greater than 100' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(parts('chip')).toHaveLength(2);
  });

  it('clears everything back to the required defaults, and says so', () => {
    const onValueChange = vi.fn();
    const fields: FilterBarField[] = [
      ...FIELDS,
      {
        defaultValue: {
          kind: 'text',
          join: 'and',
          conditions: [{ operator: 'equals', value: 'acme' }],
        },
        key: 'company',
        kind: 'text',
        label: 'Company',
        required: true,
      },
    ];
    render(<FilterBar defaultValue={TREE} fields={fields} onValueChange={onValueChange} />);
    fireEvent.click(part('clear'));
    const [next, request] = onValueChange.mock.calls[0]!;
    expect(request.reason).toBe('clear');
    expect(serializeFilterGroup(next as FilterGroup)).toBe('and(company~text~and~equals:acme)');
    /* A required field is pinned whether or not it says so. */
    expect(parts('pill').map((pill) => (pill as HTMLElement).dataset['field'])).toContain(
      'company',
    );
  });

  it('refuses to remove a required field’s rule and marks it', () => {
    const onValueChange = vi.fn();
    const fields: FilterBarField[] = [
      { key: 'company', kind: 'text', label: 'Company', required: true },
    ];
    const value: FilterGroup = {
      join: 'and',
      rules: [
        {
          field: 'company',
          filter: { kind: 'text', join: 'and', conditions: [{ operator: 'contains' }] },
        },
      ],
    };
    render(
      <FilterBar
        apply="manual"
        defaultValue={value}
        fields={fields}
        onValueChange={onValueChange}
      />,
    );
    expect(parts('pill')[0]!.hasAttribute('data-filtered')).toBe(false);
    expect(part('apply').hasAttribute('disabled')).toBe(true);
  });

  it('debounces the query under live and clears it with Escape, each with its reason', () => {
    vi.useFakeTimers();
    try {
      const onQueryChange = vi.fn();
      render(<Orders onQueryChange={onQueryChange} queryDelay={100} />);
      const input = screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ana' } });
      expect(onQueryChange).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(120);
      });
      expect(onQueryChange).toHaveBeenCalledTimes(1);
      expect(onQueryChange.mock.calls[0]![1].reason).toBe('keyboard');
      expect(input.value).toBe('ana');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onQueryChange).toHaveBeenCalledTimes(2);
      expect(onQueryChange.mock.calls[1]![0]).toBe('');
      expect(onQueryChange.mock.calls[1]![1].reason).toBe('clear');
    } finally {
      vi.useRealTimers();
    }
  });

  it('under manual edits a draft, marks the bar dirty, and applies with submit', () => {
    const onValueChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <Orders
        apply="manual"
        defaultValue={TREE}
        onQueryChange={onQueryChange}
        onValueChange={onValueChange}
      />,
    );
    expect(root().dataset['apply']).toBe('manual');
    expect(root().hasAttribute('data-dirty')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Amount greater than 100' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(root().hasAttribute('data-dirty')).toBe(true);
    expect(parts('chip')).toHaveLength(1);
    fireEvent.click(part('apply'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![1].reason).toBe('submit');
    expect(root().hasAttribute('data-dirty')).toBe(false);
  });

  it('under manual, Reset discards the draft', () => {
    render(<Orders apply="manual" defaultValue={TREE} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Amount greater than 100' }));
    expect(parts('chip')).toHaveLength(1);
    fireEvent.click(part('reset'));
    expect(parts('chip')).toHaveLength(2);
    expect(root().hasAttribute('data-dirty')).toBe(false);
  });

  it('chooses a preset with select, replaces the value, and marks the bar dirty when the value leaves it', () => {
    const onPresetChange = vi.fn();
    const onValueChange = vi.fn();
    function Owner() {
      const [value, setValue] = useState<FilterGroup | null>(null);
      return (
        <Orders
          onPresetChange={onPresetChange}
          onValueChange={(next, request) => {
            onValueChange(next, request);
            setValue(next);
          }}
          presets={[{ key: 'paid', label: 'Paid orders', value: TREE }]}
          value={value}
        />
      );
    }
    render(<Owner />);
    const trigger = screen.getByRole('combobox', { name: 'Saved view' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Paid orders' }));
    expect(onPresetChange.mock.calls[0]![0]).toBe('paid');
    expect(onPresetChange.mock.calls[0]![1].reason).toBe('select');
    expect(onValueChange.mock.calls[0]![1].reason).toBe('select');
    expect(root().hasAttribute('data-dirty')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Amount greater than 100' }));
    expect(root().hasAttribute('data-dirty')).toBe(true);
  });

  it('folds the chips past the limit and reveals them on request', () => {
    const onRevealedChange = vi.fn();
    render(<Orders chipLimit={1} defaultValue={TREE} onRevealedChange={onRevealedChange} />);
    const chips = parts('chip');
    expect(chips[0]!.hasAttribute('data-folded')).toBe(false);
    expect(chips[1]!.hasAttribute('data-folded')).toBe(true);
    const more = part('more');
    expect(more.textContent).toBe('+1 more');
    fireEvent.click(more);
    expect(onRevealedChange.mock.calls[0]![0]).toBe(true);
    expect(part('chips').hasAttribute('data-revealed')).toBe(true);
    expect(part('more').textContent).toBe('Show less');
  });

  it('draws a rule over an unknown field as an invalid chip that can still be removed', () => {
    const onValueChange = vi.fn();
    const value: FilterGroup = {
      join: 'and',
      rules: [
        {
          field: 'region',
          filter: {
            kind: 'set',
            join: 'and',
            conditions: [{ operator: 'anyOf', value: ['south'] }],
          },
        },
      ],
    };
    render(<Orders defaultValue={value} onValueChange={onValueChange} />);
    const chip = part('chip');
    expect(chip.hasAttribute('data-invalid')).toBe(true);
    expect(screen.getByRole('button', { name: 'Unknown field region: is south' })).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remove region is south' }));
    expect(onValueChange.mock.calls[0]![0]).toBeNull();
  });

  it('opens the builder from the summary control and reports the reason', () => {
    const onOpenChange = vi.fn();
    render(<Orders defaultValue={TREE} onOpenChange={onOpenChange} />);
    fireEvent.click(part('summary'));
    expect(onOpenChange.mock.calls[0]![0]).toBe(true);
    expect(onOpenChange.mock.calls[0]![1].reason).toBe('pointer');
    expect(root().hasAttribute('data-open')).toBe(true);
    const builder = document.querySelector(
      '[data-ui="filter-bar"][data-part="builder"]',
    ) as HTMLElement;
    expect(builder).not.toBeNull();
    expect(builder.querySelectorAll('[data-part="rule"]')).toHaveLength(3);
    expect(builder.querySelector('[data-part="group"]')?.getAttribute('data-depth')).toBe('0');
  });

  /* No stylesheet paints a glyph: each one is an `icon` holding the library's `Glyph`. */
  it('draws its glyphs as elements: magnifier, chevrons, plus, and a cross on each rule', () => {
    render(<Orders defaultOpen defaultValue={TREE} />);
    const glyph = (host: Element | null) =>
      host?.querySelector('[data-ui="icon"] > svg[data-glyph]')?.getAttribute('data-glyph');
    expect(glyph(part('search'))).toBe('search');
    expect(parts('pill').map(glyph)).toEqual(['chevron-down', 'chevron-down']);
    expect(glyph(part('add'))).toBe('plus');
    const builder = document.querySelector(
      '[data-ui="filter-bar"][data-part="builder"]',
    ) as HTMLElement;
    const removes = [...builder.querySelectorAll('[data-part="rule"] > [data-part="remove"]')];
    expect(removes).toHaveLength(3);
    expect(removes.map(glyph)).toEqual(['x', 'x', 'x']);
    expect(glyph(builder.querySelector('[data-part="add-rule"]'))).toBe('plus');
    expect(glyph(builder.querySelector('[data-part="add-group"]'))).toBe('plus');
  });

  it('lets the builder add a group and applies the tree with submit', () => {
    const onValueChange = vi.fn();
    render(<Orders defaultOpen defaultValue={TREE} onValueChange={onValueChange} />);
    const builder = document.querySelector(
      '[data-ui="filter-bar"][data-part="builder"]',
    ) as HTMLElement;
    fireEvent.click(builder.querySelector('[data-part="add-group"]') as HTMLElement);
    expect(builder.querySelectorAll('[data-part="group"]')).toHaveLength(2);
    expect(builder.querySelectorAll('[data-part="group"]')[1]!.getAttribute('data-depth')).toBe(
      '1',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    /* The new group holds an unfinished rule, so the tree applied is the one it started with. */
    expect(onValueChange).not.toHaveBeenCalled();
    expect(root().hasAttribute('data-open')).toBe(false);
  });

  it('draws the count as a polite live region and a spinner while loading', () => {
    const { rerender } = render(<Orders />);
    expect(part('count').getAttribute('aria-live')).toBe('polite');
    expect(part('count').textContent).toBe('128 of 3,412');
    rerender(<Orders loading />);
    expect(part('count').getAttribute('aria-busy')).toBe('true');
    expect(part('count').querySelector('[data-ui="spinner"]')).not.toBeNull();
  });

  it('focuses the search on the shortcut, unless the reader is typing', () => {
    render(<Orders shortcut="/" />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    fireEvent.keyDown(document.body, { key: '/' });
    expect(document.activeElement).toBe(input);
    expect(root().querySelector('[data-ui="kbd"]')).not.toBeNull();
    const other = document.createElement('input');
    document.body.append(other);
    other.focus();
    fireEvent.keyDown(other, { key: '/' });
    expect(document.activeElement).toBe(other);
    other.remove();
  });

  it('reads defaults from the provider and lets a prop win', () => {
    render(
      <FilterBarDefaultsProvider apply="manual" chipLimit={1} labels={{ add: 'Adicionar filtro' }}>
        <Orders defaultValue={TREE} />
      </FilterBarDefaultsProvider>,
    );
    expect(root().dataset['apply']).toBe('manual');
    expect(part('add').textContent).toBe('Adicionar filtro');
    expect(part('more')).not.toBeNull();
  });

  it('passes native props through to the root and composes a consumer handler', () => {
    const onKeyDown = vi.fn();
    render(<Orders data-testid="orders" id="orders" onKeyDown={onKeyDown} />);
    expect(root().id).toBe('orders');
    fireEvent.keyDown(root(), { key: 'a' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('exposes focusSearch and open on the handle', () => {
    const handle = { current: null as null | { focusSearch: () => void; open: () => void } };
    render(<Orders ref={handle as never} />);
    act(() => handle.current?.focusSearch());
    expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search' }));
    act(() => handle.current?.open());
    expect(root().hasAttribute('data-open')).toBe(true);
  });

  it('writes the applied sentence on a pinned pill from the same words the chips use', () => {
    render(<Orders defaultValue={TWO_VALUES} labels={{ operators: { anyOf: 'is one of' } }} />);
    expect(parts('pill')[0]!.textContent).toBe('Statusis one of Paid, Refunded');
  });

  /**
   * A list of one is the equality of that value, so the sentence says so; the
   * condition is still `anyOf`, and a second value returns the list form.
   */
  it('reads a set of one as an equality and a set of two as a list', () => {
    const one = render(<Orders defaultValue={TREE} />);
    expect(parts('pill')[0]!.textContent).toBe('Statusis Paid');
    one.unmount();
    render(<Orders defaultValue={TWO_VALUES} />);
    expect(parts('pill')[0]!.textContent).toBe('Statusany of Paid, Refunded');
  });
  it('under sticky reads the page offset for itself and publishes the sum for what follows, once', () => {
    let notify: (() => void) | undefined;
    class Observer {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', Observer);
    const height = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 48 } as DOMRect);
    try {
      const { container, unmount } = render(
        <div style={{ '--slotted-page-sticky-top': '56px' } as React.CSSProperties}>
          <FilterBar fields={FIELDS} sticky />
        </div>,
      );
      const parent = container.firstElementChild as HTMLElement;
      const root = parent.firstElementChild as HTMLElement;
      act(() => notify?.());
      act(() => notify?.());
      expect(root.style.getPropertyValue('--slotted-page-sticky-top')).toBe('56px');
      expect(parent.style.getPropertyValue('--slotted-page-sticky-top')).toBe('calc(56px + 48px)');
      unmount();
      expect(parent.style.getPropertyValue('--slotted-page-sticky-top')).toBe('56px');
    } finally {
      height.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  /**
   * A stand-in for the layout jsdom does not do. Without `data-bar-wrapped`
   * on the root the bar is drawn in the wide composition, and when `wraps` is
   * true every control after the second starts a second line there; with the
   * attribute the bar has a line of its own and every control fits on it.
   */
  function stubBarLayout(wraps: { current: boolean }) {
    return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const bar = this.parentElement;
      if (bar?.getAttribute('data-part') !== 'bar') return { height: 0, width: 0 } as DOMRect;
      const wide = !bar.closest('[data-ui="filter-bar"]')?.hasAttribute('data-bar-wrapped');
      const second = wide && wraps.current && [...bar.children].indexOf(this) > 1;
      const top = second ? 42 : 0;
      return { bottom: top + 34, height: 34, top, width: 80 } as DOMRect;
    });
  }

  it('gives the bar a line of its own when its controls would wrap beside the search', () => {
    const wraps = { current: true };
    const layout = stubBarLayout(wraps);
    try {
      render(<FilterBar fields={FIELDS} />);
      expect(screen.getByRole('search').hasAttribute('data-bar-wrapped')).toBe(true);
    } finally {
      layout.mockRestore();
    }
  });

  it('keeps the one-line composition while the controls fit beside the search', () => {
    const layout = stubBarLayout({ current: false });
    try {
      render(<FilterBar fields={FIELDS} />);
      expect(screen.getByRole('search').hasAttribute('data-bar-wrapped')).toBe(false);
    } finally {
      layout.mockRestore();
    }
  });

  /**
   * The bar fits on its own line, and it would wrap beside the search: the
   * decision is read in the one-line composition whichever one is drawn, so a
   * resize that finds the fallback in place keeps it, and only a bar that
   * fits beside the search again gives it up.
   */
  it('decides from the one-line composition, so the fallback holds until the bar fits there', () => {
    const notify: (() => void)[] = [];
    class Observer {
      constructor(callback: () => void) {
        notify.push(callback);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', Observer);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const wraps = { current: true };
    const layout = stubBarLayout(wraps);
    try {
      render(<FilterBar fields={FIELDS} />);
      const root = screen.getByRole('search');
      for (let frame = 0; frame < 3; frame += 1) {
        act(() => notify.forEach((callback) => callback()));
        expect(root.hasAttribute('data-bar-wrapped')).toBe(true);
      }
      wraps.current = false;
      act(() => notify.forEach((callback) => callback()));
      expect(root.hasAttribute('data-bar-wrapped')).toBe(false);
    } finally {
      layout.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
