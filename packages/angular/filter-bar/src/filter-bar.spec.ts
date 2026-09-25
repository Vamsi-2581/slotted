import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { serializeFilterGroup } from '@slotted/core/filter';
import type { FilterGroup } from '@slotted/core/filter';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/filter-bar/contract.json';
import { SlFilterBar, SlFilterBarEnd, SlFilterBarOperand } from './filter-bar';
import {
  provideFilterBarDefaults,
  type FilterBarField,
  type FilterBarPreset,
} from './filter-bar.constants';

const FIELDS: FilterBarField[] = [
  {
    key: 'status',
    kind: 'set',
    label: 'Status',
    options: [
      { label: 'Paid', value: 'paid' },
      { label: 'Refunded', value: 'refunded' },
    ],
    pinned: true,
  },
  { key: 'owner', kind: 'text', label: 'Owner', pinned: true },
  { key: 'amount', kind: 'number', label: 'Amount' },
  { key: 'customer', kind: 'text', label: 'Customer' },
  { key: 'created', kind: 'date', label: 'Created', section: 'Dates' },
];

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

@Component({
  imports: [SlFilterBar, SlFilterBarEnd, SlFilterBarOperand],
  template: `<div
    slFilterBar
    #bar="slFilterBar"
    locale="en-US"
    [fields]="fields()"
    [(value)]="value"
    [(query)]="query"
    [(preset)]="preset"
    [(open)]="open"
    [(revealed)]="revealed"
    [presets]="presets()"
    [apply]="apply()"
    [chipLimit]="chipLimit()"
    [queryDelay]="queryDelay()"
    [shortcut]="shortcut()"
    [count]="count()"
    [total]="total()"
    [loading]="loading()"
    (valueChangeRequest)="onValue($event)"
    (queryChangeRequest)="onQuery($event)"
    (presetChangeRequest)="onPreset($event)"
    (openChangeRequest)="onOpen($event)"
    (revealedChangeRequest)="onRevealed($event)"
  >
    <button slFilterBarEnd type="button">Sort</button>
  </div>`,
})
class TestHost {
  readonly fields = signal<FilterBarField[]>(FIELDS);
  readonly value = signal<FilterGroup | null>(TREE);
  readonly query = signal('');
  readonly preset = signal<string | null>(null);
  readonly open = signal(false);
  readonly revealed = signal(false);
  readonly presets = signal<FilterBarPreset[] | undefined>(undefined);
  readonly apply = signal<'live' | 'manual' | undefined>(undefined);
  readonly chipLimit = signal<number | undefined>(undefined);
  readonly queryDelay = signal<number | undefined>(undefined);
  readonly shortcut = signal<string | null | undefined>(undefined);
  readonly count = signal<number | undefined>(128);
  readonly total = signal<number | undefined>(3412);
  readonly loading = signal(false);
  readonly onValue = vi.fn();
  readonly onQuery = vi.fn();
  readonly onPreset = vi.fn();
  readonly onOpen = vi.fn();
  readonly onRevealed = vi.fn();
}

function setup(providers: unknown[] = []) {
  TestBed.configureTestingModule({ imports: [TestHost], providers: providers as never[] });
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector(
    '[data-ui="filter-bar"][data-part="root"]',
  ) as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    root,
    part: (name: string) => root.querySelector(`[data-part="${name}"]`) as HTMLElement,
    parts: (name: string) => [...root.querySelectorAll(`[data-part="${name}"]`)] as HTMLElement[],
    settle: () => fixture.detectChanges(),
  };
}

const removeOf = (root: HTMLElement, label: string) =>
  [...root.querySelectorAll<HTMLButtonElement>('[data-part="chip"] [data-part="remove"]')].find(
    (button) =>
      button.getAttribute('aria-labelledby')?.length &&
      button.closest('[data-part="chip"]')?.textContent?.includes(label),
  ) as HTMLButtonElement;

describe('SlFilterBar', () => {
  it('is selected in public by the family identifier, and is a search landmark holding a toolbar and a grid', () => {
    const { root, part } = setup();
    expect(root.getAttribute('data-ui')).toBe(contract.ui);
    expect(root.getAttribute('role')).toBe('search');
    expect(root.getAttribute('aria-label')).toBe('Filter');
    expect(part('bar').getAttribute('role')).toBe('toolbar');
    expect(part('chips').getAttribute('role')).toBe('grid');
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
      'end',
    ]) {
      expect(part(name)).not.toBeNull();
    }
    /* The consumer's control survives in the end slot. */
    expect(part('end').textContent).toContain('Sort');
    /* A button of this family's carries its part over the button directive's. */
    expect(part('add').getAttribute('data-ui')).toBe('button');
  });

  /**
   * The plus before "Add filter" is the button family's own glyph box: in the
   * label it was a bare svg with no size, drawn at the label's height.
   */
  it("draws the add trigger's glyph in the button's start slot", () => {
    const { part } = setup();
    const start = part('add').querySelector('[data-part="start"]');
    expect(start).not.toBeNull();
    expect(start?.querySelector('[data-ui="icon"] > svg[data-glyph="plus"]')).not.toBeNull();
    expect(part('add').querySelector(':scope > svg, [data-part="label"] > svg')).toBeNull();
  });

  /* No stylesheet paints a glyph: each one is an `icon` holding the library's `Glyph`. */
  it('draws its glyphs as elements: magnifier, chevrons, plus, and a cross on each rule', () => {
    const { part, parts, settle } = setup();
    const glyph = (host: Element | null) =>
      host?.querySelector('[data-ui="icon"] > svg[data-glyph]')?.getAttribute('data-glyph');
    expect(glyph(part('search'))).toBe('search');
    expect(parts('pill').map(glyph)).toEqual(['chevron-down', 'chevron-down']);
    part('summary').click();
    settle();
    const builder = document.querySelector(
      '[data-ui="filter-bar"][data-part="builder"]',
    ) as HTMLElement;
    const removes = [...builder.querySelectorAll('[data-part="rule"] > [data-part="remove"]')];
    expect(removes).toHaveLength(3);
    expect(removes.map(glyph)).toEqual(['x', 'x', 'x']);
    expect(glyph(builder.querySelector('[data-part="add-rule"]'))).toBe('plus');
    expect(glyph(builder.querySelector('[data-part="add-group"]'))).toBe('plus');
  });

  it('draws a pinned field as a pill, filled while it holds a rule, and an unpinned one as a chip', () => {
    const { parts } = setup();
    const pills = parts('pill');
    expect(pills.map((pill) => pill.textContent?.replace(/\s+/g, '').trim())).toEqual([
      'StatusisPaid',
      'Owner',
    ]);
    expect(pills[0]!.hasAttribute('data-filtered')).toBe(true);
    expect(pills[1]!.hasAttribute('data-filtered')).toBe(false);
    const chips = parts('chip');
    expect(chips).toHaveLength(2);
    expect(chips[0]!.getAttribute('role')).toBe('gridcell');
    expect(chips[0]!.querySelector('[data-part="body"]')?.getAttribute('aria-label')).toBe(
      'Amount: greater than 100',
    );
    /* The name and the sentence are two runs with a space between them. An
       Angular template drops a typed space, so the markup writes &ngsp;: the
       space separates the words of the chip's own accessible name as well as
       the words on the screen. */
    expect(chips[0]!.querySelector('[data-part="label"]')?.textContent).toBe(
      'Amount greater than 100',
    );
  });

  /**
   * A list of one is the equality of that value, so the sentence says so; the
   * condition is still `anyOf`, and a second value returns the list form.
   */
  it('reads a set of one as an equality and a set of two as a list', () => {
    const { host, parts, settle } = setup();
    expect(parts('pill')[0]!.textContent?.replace(/\s+/g, '')).toBe('StatusisPaid');
    host.value.set({
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
    });
    settle();
    expect(parts('pill')[0]!.textContent?.replace(/\s+/g, '')).toBe('StatusanyofPaid,Refunded');
  });

  it('holds one tab stop for the bar and one for the chips, with arrows between', () => {
    const { parts, part } = setup();
    const [status, owner] = parts('pill');
    expect(status!.getAttribute('tabindex')).toBe('0');
    expect(owner!.getAttribute('tabindex')).toBe('-1');
    expect(part('add').getAttribute('tabindex')).toBe('-1');
    status!.focus();
    status!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    expect(document.activeElement).toBe(owner);
    const bodies = [...part('chips').querySelectorAll('[data-part="body"]')] as HTMLElement[];
    expect(bodies[0]!.getAttribute('tabindex')).toBe('0');
    expect(bodies[1]!.getAttribute('tabindex')).toBe('-1');
  });

  it('removes a chip from its control, carries the reason, and moves the model', () => {
    const { host, root, parts, settle } = setup();
    removeOf(root, 'Amount').click();
    settle();
    expect(host.onValue).toHaveBeenCalledTimes(1);
    expect(host.onValue.mock.calls[0]![0].reason).toBe('remove');
    expect(host.value()!.rules.map((rule) => ('field' in rule ? rule.field : 'group'))).toEqual([
      'status',
      'customer',
    ]);
    expect(parts('chip')).toHaveLength(1);
  });

  it('refuses a cancelled request', () => {
    const { host, root, parts, settle } = setup();
    host.onValue.mockImplementation((request: { cancel(): void }) => request.cancel());
    removeOf(root, 'Amount').click();
    settle();
    expect(host.value()).toBe(TREE);
    expect(parts('chip')).toHaveLength(2);
  });

  it('clears everything back to the required defaults', () => {
    const { host, part, parts, settle } = setup();
    host.fields.set([
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
    ]);
    settle();
    expect(parts('pill').map((pill) => pill.getAttribute('data-field'))).toContain('company');
    part('clear').click();
    settle();
    expect(host.onValue.mock.calls[0]![0].reason).toBe('clear');
    expect(serializeFilterGroup(host.value())).toBe('and(company~text~and~equals:acme)');
  });

  it('debounces the query under live and clears it with Escape, each with its reason', () => {
    vi.useFakeTimers();
    try {
      const { host, root, settle } = setup();
      host.queryDelay.set(100);
      settle();
      const input = root.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'ana';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      settle();
      expect(host.onQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(120);
      settle();
      expect(host.onQuery).toHaveBeenCalledTimes(1);
      expect(host.onQuery.mock.calls[0]![0].reason).toBe('keyboard');
      expect(host.query()).toBe('ana');
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
      settle();
      expect(host.onQuery.mock.calls[1]![0].value).toBe('');
      expect(host.onQuery.mock.calls[1]![0].reason).toBe('clear');
    } finally {
      vi.useRealTimers();
    }
  });

  it('under manual edits a draft, marks the bar dirty, and applies with submit', () => {
    const { host, root, part, parts, settle } = setup();
    host.apply.set('manual');
    settle();
    expect(root.getAttribute('data-apply')).toBe('manual');
    removeOf(root, 'Amount').click();
    settle();
    expect(host.onValue).not.toHaveBeenCalled();
    expect(root.hasAttribute('data-dirty')).toBe(true);
    expect(parts('chip')).toHaveLength(1);
    part('apply').click();
    settle();
    expect(host.onValue.mock.calls[0]![0].reason).toBe('submit');
    expect(root.hasAttribute('data-dirty')).toBe(false);
    part('reset');
  });

  /** With no view chosen the select says so, as the React binding's does; an empty trigger named nothing. */
  it('draws the preset select with the no-view words while none is chosen', () => {
    const { host, part, settle } = setup();
    host.value.set(null);
    host.presets.set([{ key: 'paid', label: 'Paid orders', value: TREE }]);
    settle();
    const trigger = part('preset').querySelector('[data-part="trigger"]') as HTMLElement;
    expect(trigger.textContent).toContain('No saved view');
  });

  it('chooses a preset with select and marks the bar dirty when the value leaves it', () => {
    const { host, root, part, settle } = setup();
    host.value.set(null);
    host.presets.set([{ key: 'paid', label: 'Paid orders', value: TREE }]);
    settle();
    const trigger = part('preset').querySelector('[data-part="trigger"]') as HTMLElement;
    trigger.click();
    settle();
    const option = document.querySelector('[role="option"]') as HTMLElement;
    option.click();
    settle();
    expect(host.onPreset.mock.calls[0]![0].value).toBe('paid');
    expect(host.onPreset.mock.calls[0]![0].reason).toBe('select');
    expect(host.onValue.mock.calls[0]![0].reason).toBe('select');
    expect(root.hasAttribute('data-dirty')).toBe(false);
    removeOf(root, 'Amount').click();
    settle();
    expect(root.hasAttribute('data-dirty')).toBe(true);
  });

  /** Leaving a view is the select's own clear; without it the one way out was deleting the view. */
  it('leaves a chosen preset through the select clear and keeps the value standing', () => {
    const { host, part, settle } = setup();
    host.value.set(null);
    host.presets.set([{ key: 'paid', label: 'Paid orders', value: TREE }]);
    host.preset.set('paid');
    settle();
    const clear = part('preset').querySelector('[data-part="clear"]') as HTMLElement;
    expect(clear).toBeTruthy();
    clear.click();
    settle();
    const last = host.onPreset.mock.calls.at(-1)![0];
    expect(last.value).toBe(null);
    expect(last.reason).toBe('clear');
    expect(host.onValue.mock.calls.length).toBe(0);
  });

  it('folds the chips past the limit and reveals them on request', () => {
    const { host, part, parts, settle } = setup();
    host.chipLimit.set(1);
    settle();
    const chips = parts('chip');
    expect(chips[1]!.hasAttribute('data-folded')).toBe(true);
    expect(part('more').textContent?.trim()).toBe('+1 more');
    part('more').click();
    settle();
    expect(host.onRevealed.mock.calls[0]![0].value).toBe(true);
    expect(host.revealed()).toBe(true);
    expect(part('chips').hasAttribute('data-revealed')).toBe(true);
    expect(part('more').textContent?.trim()).toBe('Show less');
  });

  it('draws a rule over an unknown field as an invalid chip that can still be removed', () => {
    const { host, root, part, settle } = setup();
    host.value.set({
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
    });
    settle();
    expect(part('chip').hasAttribute('data-invalid')).toBe(true);
    expect(part('chip').querySelector('[data-part="body"]')?.getAttribute('aria-label')).toBe(
      'Unknown field region: is south',
    );
    removeOf(root, 'region').click();
    settle();
    expect(host.value()).toBeNull();
  });

  it('keeps the space between the summary word and its count', () => {
    const { part } = setup();
    expect(part('summary').textContent?.trim()).toMatch(/^\S+ \(\d+\)$/);
  });

  it('opens the builder from the summary control, draws the tree, and applies with submit', () => {
    const { host, root, part, settle } = setup();
    part('summary').click();
    settle();
    expect(host.onOpen.mock.calls[0]![0].reason).toBe('pointer');
    expect(host.open()).toBe(true);
    expect(root.hasAttribute('data-open')).toBe(true);
    const builder = document.querySelector(
      '[data-ui="filter-bar"][data-part="builder"]',
    ) as HTMLElement;
    expect(builder).not.toBeNull();
    expect(builder.querySelectorAll('[data-part="rule"]')).toHaveLength(3);
    expect(builder.querySelector('[data-part="group"]')?.getAttribute('data-depth')).toBe('0');
    (builder.querySelector('[data-part="add-group"]') as HTMLElement).click();
    settle();
    expect(builder.querySelectorAll('[data-part="group"]')).toHaveLength(2);
    (
      builder
        .querySelectorAll('[data-part="group"]')[1]!
        .querySelector('[data-part="remove-group"]') as HTMLElement
    ).click();
    settle();
    expect(builder.querySelectorAll('[data-part="group"]')).toHaveLength(1);
  });

  it('draws the count as a polite live region with the reader’s figures, and a spinner while loading', () => {
    const { host, part, settle } = setup();
    expect(part('count').getAttribute('aria-live')).toBe('polite');
    expect(part('count').textContent?.trim()).toBe('128 of 3,412');
    host.loading.set(true);
    settle();
    expect(part('count').getAttribute('aria-busy')).toBe('true');
    expect(part('count').querySelector('[data-ui="spinner"]')).not.toBeNull();
  });

  it('focuses the search on the shortcut, unless the reader is typing', () => {
    const { host, root, settle } = setup();
    host.shortcut.set('/');
    settle();
    const input = root.querySelector('input[type="search"]') as HTMLInputElement;
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '/' }));
    expect(document.activeElement).toBe(input);
    expect(root.querySelector('[data-ui="kbd"]')).not.toBeNull();
  });

  it('reads defaults from the token and lets an input win', () => {
    const { root, part } = setup([
      provideFilterBarDefaults({
        apply: 'manual',
        chipLimit: 1,
        labels: { add: 'Adicionar filtro' },
      }),
    ]);
    expect(root.getAttribute('data-apply')).toBe('manual');
    expect(part('add').textContent?.trim()).toBe('Adicionar filtro');
    expect(part('more')).not.toBeNull();
  });

  it('exposes focusSearch and openBuilder through exportAs', () => {
    const { fixture, host, root, settle } = setup();
    const bar = fixture.debugElement
      .query((node) => node.attributes['slFilterBar'] !== undefined)
      ?.injector.get(SlFilterBar) as SlFilterBar;
    bar.focusSearch();
    expect(document.activeElement).toBe(root.querySelector('input[type="search"]'));
    bar.openBuilder();
    settle();
    expect(host.open()).toBe(true);
  });

  it('renders the consumer’s operand template for a field', () => {
    @Component({
      imports: [SlFilterBar, SlFilterBarOperand],
      template: `<div slFilterBar [fields]="fields" [value]="value" [open]="true">
        <ng-template slFilterBarOperand="amount" let-context
          ><input data-custom [attr.aria-label]="context.label"
        /></ng-template>
      </div>`,
    })
    class Custom {
      readonly fields = FIELDS;
      readonly value = TREE;
    }
    TestBed.configureTestingModule({ imports: [Custom] });
    const fixture = TestBed.createComponent(Custom);
    fixture.detectChanges();
    expect(document.querySelector('[data-part="builder"] [data-custom]')).not.toBeNull();
  });
  it('starts an unbound bar from the default inputs, and moves on its own', () => {
    @Component({
      imports: [SlFilterBar],
      template: `<div
        slFilterBar
        [fields]="fields"
        [defaultValue]="value"
        defaultQuery="ana"
        defaultOpen
        [chipLimit]="1"
        defaultRevealed
      ></div>`,
    })
    class Uncontrolled {
      readonly fields = FIELDS;
      readonly value = TREE;
    }
    TestBed.configureTestingModule({ imports: [Uncontrolled] });
    const fixture = TestBed.createComponent(Uncontrolled);
    fixture.detectChanges();
    const root = document.querySelector('[data-ui="filter-bar"]') as HTMLElement;
    expect(root.hasAttribute('data-open')).toBe(true);
    expect((root.querySelector('input[type="search"]') as HTMLInputElement).value).toBe('ana');
    expect(root.querySelector('[data-part="chips"]')?.hasAttribute('data-revealed')).toBe(true);
    expect(root.querySelector('[data-part="more"]')?.textContent?.trim()).toBe('Show less');
    (root.querySelector('[data-part="more"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.querySelector('[data-part="chips"]')?.hasAttribute('data-revealed')).toBe(false);
  });
  it('under sticky reads the page offset for itself and publishes the sum for what follows, once', () => {
    const notify: (() => void)[] = [];
    class Observer {
      constructor(callback: () => void) {
        notify.push(callback);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', Observer);
    const height = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 48 } as DOMRect);
    @Component({
      imports: [SlFilterBar],
      template: `<div style="--slotted-page-sticky-top: 56px">
        <div slFilterBar [fields]="fields" sticky></div>
      </div>`,
    })
    class Sticky {
      readonly fields = FIELDS;
    }
    try {
      TestBed.configureTestingModule({ imports: [Sticky] });
      const fixture = TestBed.createComponent(Sticky);
      fixture.detectChanges();
      const parent = fixture.nativeElement.firstElementChild as HTMLElement;
      const root = parent.firstElementChild as HTMLElement;
      notify.forEach((callback) => callback());
      notify.forEach((callback) => callback());
      expect(root.style.getPropertyValue('--slotted-page-sticky-top')).toBe('56px');
      expect(parent.style.getPropertyValue('--slotted-page-sticky-top')).toBe('calc(56px + 48px)');
      fixture.destroy();
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

  function mountBar() {
    @Component({
      imports: [SlFilterBar],
      template: `<div slFilterBar [fields]="fields"></div>`,
    })
    class Plain {
      readonly fields = FIELDS;
    }
    TestBed.configureTestingModule({ imports: [Plain] });
    const fixture = TestBed.createComponent(Plain);
    fixture.detectChanges();
    return fixture.nativeElement.firstElementChild as HTMLElement;
  }

  it('gives the bar a line of its own when its controls would wrap beside the search', () => {
    const layout = stubBarLayout({ current: true });
    try {
      expect(mountBar().hasAttribute('data-bar-wrapped')).toBe(true);
    } finally {
      layout.mockRestore();
    }
  });

  it('keeps the one-line composition while the controls fit beside the search', () => {
    const layout = stubBarLayout({ current: false });
    try {
      expect(mountBar().hasAttribute('data-bar-wrapped')).toBe(false);
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
      const root = mountBar();
      for (let frame = 0; frame < 3; frame += 1) {
        notify.forEach((callback) => callback());
        expect(root.hasAttribute('data-bar-wrapped')).toBe(true);
      }
      wraps.current = false;
      notify.forEach((callback) => callback());
      expect(root.hasAttribute('data-bar-wrapped')).toBe(false);
    } finally {
      layout.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
