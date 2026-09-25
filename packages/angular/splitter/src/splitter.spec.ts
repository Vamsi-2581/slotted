import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/splitter/contract.json';
import { SlSplitter } from './splitter';
import type { SplitterLimit, SplitterOrientation } from './splitter-defaults';

/**
 * jsdom performs no layout, so every rectangle it reports is nought. A
 * separator whose whole arithmetic is a fraction of a measured container cannot
 * move at all here unless the container is given a size, and a test that
 * skipped this would be testing that nothing happens.
 */
const SPAN = 800;

@Component({
  imports: [SlSplitter],
  template: `
    <div id="workspace">
      <aside id="region">Contas</aside>
      <div
        slSplitter
        #bar="slSplitter"
        [collapsible]="collapsible()"
        [disabled]="disabled()"
        [max]="max()"
        [min]="min()"
        [orientation]="orientation()"
        [(value)]="value"
        (valueChangeRequest)="onValueRequest($event)"
        (collapsedChangeRequest)="onCollapsedRequest($event)"
      ></div>
      <main>NF-e 20 483</main>
    </div>
  `,
})
class Host {
  readonly bar = viewChild.required<SlSplitter>('bar');
  readonly collapsible = signal(false);
  readonly disabled = signal(false);
  readonly max = signal<SplitterLimit | undefined>(undefined);
  readonly min = signal<SplitterLimit | undefined>(undefined);
  readonly orientation = signal<SplitterOrientation | undefined>(undefined);
  readonly value = signal(0.5);

  readonly onValueRequest = vi.fn();
  readonly onCollapsedRequest = vi.fn();
}

function mount() {
  const fixture = TestBed.createComponent(Host);
  const workspace = fixture.nativeElement.querySelector('#workspace') as HTMLElement;
  workspace.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: SPAN,
      height: SPAN,
      top: 0,
      left: 0,
      right: SPAN,
      bottom: SPAN,
    }) as DOMRect;

  fixture.detectChanges();
  const bar = fixture.nativeElement.querySelector('[data-ui="splitter"]') as HTMLElement;
  return { bar, fixture, host: fixture.componentInstance, workspace };
}

function press(bar: HTMLElement, key: string, init: KeyboardEventInit = {}) {
  bar.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...init }));
}

describe('anatomy', () => {
  it('renders the three parts the contract declares, and nothing else', () => {
    const { bar } = mount();

    expect(bar.getAttribute('data-part')).toBe('root');
    expect(bar.querySelectorAll('[data-part="line"]')).toHaveLength(2);
    expect(bar.querySelectorAll('[data-part="grip"]')).toHaveLength(1);
    expect(bar.children).toHaveLength(3);
  });

  it('declares only the parts the contract declares', () => {
    const { bar } = mount();
    const rendered = new Set(
      [bar, ...bar.querySelectorAll('[data-part]')].map((node) => node.getAttribute('data-part')),
    );
    expect([...rendered].sort()).toEqual([...contract.members.splitter.parts].sort());
  });

  it('hides its own picture from the accessibility tree', () => {
    const { bar } = mount();
    for (const child of bar.children) {
      expect(child.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

describe('wiring', () => {
  it('is the focusable widget form of the separator role', () => {
    const { bar } = mount();
    expect(bar.getAttribute('role')).toBe('separator');
    expect(bar.getAttribute('tabindex')).toBe('0');
  });

  it('writes aria-orientation for the vertical bar only', () => {
    const { bar, fixture, host } = mount();
    expect(bar.getAttribute('aria-orientation')).toBe('vertical');

    host.orientation.set('horizontal');
    fixture.detectChanges();
    expect(bar.getAttribute('aria-orientation')).toBeNull();
  });

  it('announces the fraction and its limits, times a hundred', () => {
    const { bar, fixture, host } = mount();
    host.value.set(0.34);
    host.min.set(0.1);
    host.max.set(0.8);
    fixture.detectChanges();

    expect(bar.getAttribute('aria-valuenow')).toBe('34');
    expect(bar.getAttribute('aria-valuemin')).toBe('10');
    expect(bar.getAttribute('aria-valuemax')).toBe('80');
  });

  /** The element it sizes and the element it announces are one element. */
  it('names the region it sizes', () => {
    const { bar, fixture } = mount();
    const region = fixture.nativeElement.querySelector('#region') as HTMLElement;
    expect(bar.getAttribute('aria-controls')).toBe(region.id);
  });
});

describe('the measure it publishes', () => {
  it('writes the fraction on the region it sizes', () => {
    const { fixture, host } = mount();
    host.value.set(0.34);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('#region') as HTMLElement;
    expect(region.style.getPropertyValue('--slotted-splitter-value')).toBe('0.34');
  });
});

describe('the keyboard, against the pattern', () => {
  it('moves sixteen pixels on an arrow and sixty-four with Shift', () => {
    const { bar, fixture, host } = mount();

    press(bar, 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBeCloseTo(0.5 + 16 / SPAN);

    press(bar, 'ArrowLeft', { shiftKey: true });
    fixture.detectChanges();
    expect(host.value()).toBeCloseTo(0.5 + 16 / SPAN - 64 / SPAN);
  });

  /**
   * "If the splitter is horizontal, it does not listen for Left Arrow or Right
   * Arrow so those keys can provide their normal browser scrolling functions."
   */
  it('leaves the cross axis to the page', () => {
    const { bar, fixture, host } = mount();

    press(bar, 'ArrowUp');
    press(bar, 'ArrowDown');
    fixture.detectChanges();
    expect(host.value()).toBe(0.5);
  });

  it('takes Home to the floor and End to the ceiling', () => {
    const { bar, fixture, host } = mount();
    host.min.set(0.15);
    host.max.set(0.75);
    fixture.detectChanges();

    press(bar, 'Home');
    fixture.detectChanges();
    expect(host.value()).toBe(0.15);

    press(bar, 'End');
    fixture.detectChanges();
    expect(host.value()).toBe(0.75);
  });

  /**
   * The pattern's own words: "If the primary pane is not collapsed, collapses
   * the pane. If the pane is collapsed, restores the splitter to its previous
   * position." It was the argument for holding panels, and a bar that owns the
   * value answers it without one.
   */
  it('collapses and restores on Enter', () => {
    const { bar, fixture, host } = mount();
    host.collapsible.set(true);
    host.value.set(0.42);
    fixture.detectChanges();

    press(bar, 'Enter');
    fixture.detectChanges();
    expect(host.value()).toBe(0);
    expect(bar.hasAttribute('data-expanded')).toBe(false);

    press(bar, 'Enter');
    fixture.detectChanges();
    expect(host.value()).toBe(0.42);
    expect(bar.hasAttribute('data-expanded')).toBe(true);
  });

  it('does nothing on Enter when it is not collapsible', () => {
    const { bar, fixture, host } = mount();

    press(bar, 'Enter');
    fixture.detectChanges();
    expect(host.value()).toBe(0.5);
    expect(host.onCollapsedRequest).not.toHaveBeenCalled();
  });
});

describe('the request', () => {
  it('carries the reason and the previous value', () => {
    const { bar, fixture, host } = mount();

    press(bar, 'Home');
    fixture.detectChanges();
    expect(host.onValueRequest).toHaveBeenCalledWith(
      expect.objectContaining({ previous: 0.5, reason: 'keyboard', value: 0 }),
    );
  });

  it('refuses the move when the consumer cancels', () => {
    const { bar, fixture, host } = mount();
    host.onValueRequest.mockImplementation((request: { cancel(): void }) => request.cancel());

    press(bar, 'End');
    fixture.detectChanges();
    expect(host.value()).toBe(0.5);
  });
});

describe('reset', () => {
  it('returns to where it started on a double click', () => {
    const { bar, fixture, host } = mount();

    press(bar, 'End');
    fixture.detectChanges();
    expect(host.value()).toBe(1);

    bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe(0.5);
  });
});

describe('disabled', () => {
  it('keeps the tab stop and the announcement, and refuses to move', () => {
    const { bar, fixture, host } = mount();
    host.disabled.set(true);
    host.value.set(0.4);
    fixture.detectChanges();

    expect(bar.getAttribute('tabindex')).toBe('0');
    expect(bar.getAttribute('aria-disabled')).toBe('true');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.hasAttribute('data-disabled')).toBe(true);

    press(bar, 'Home');
    fixture.detectChanges();
    expect(host.value()).toBe(0.4);
  });
});

describe('the instance a template can reach', () => {
  it('collapses, expands and resets from code', () => {
    const { fixture, host } = mount();
    host.collapsible.set(true);
    host.value.set(0.38);
    fixture.detectChanges();

    host.bar().collapse();
    fixture.detectChanges();
    expect(host.value()).toBe(0);

    host.bar().expand();
    fixture.detectChanges();
    expect(host.value()).toBe(0.38);

    host.bar().reset();
    fixture.detectChanges();
    expect(host.value()).toBe(0.5);
  });
});

@Component({
  imports: [SlSplitter],
  template: `
    <div id="workspace">
      <aside>Fila</aside>
      @if (shown()) {
        <div slSplitter></div>
      }
    </div>
  `,
})
class BlockHost {
  readonly shown = signal(true);
}

describe('the container it measures', () => {
  /**
   * A bar that is the first node of an `@if` block is built before the block is
   * placed in the document, so it has no parent yet when it is constructed. It
   * watches the container once it is rendered, or its limits keep the measure of
   * whatever box they were first computed against.
   */
  it('watches its container when it is the root of a control-flow block', async () => {
    const observed: Element[] = [];
    class RecordingObserver {
      observe(target: Element) {
        observed.push(target);
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', RecordingObserver);
    try {
      const fixture = TestBed.createComponent(BlockHost);
      fixture.detectChanges();
      await fixture.whenStable();
      const workspace = fixture.nativeElement.querySelector('#workspace') as HTMLElement;
      expect(observed).toContain(workspace);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
