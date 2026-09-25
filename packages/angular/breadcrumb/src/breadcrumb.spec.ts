import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/breadcrumb/contract.json';
import {
  SlBreadcrumb,
  SlBreadcrumbItem,
  SlBreadcrumbLink,
  SlBreadcrumbList,
  SlBreadcrumbPage,
} from './breadcrumb';
import { collapsedRange, provideBreadcrumbDefaults } from './breadcrumb.constants';

@Component({
  imports: [SlBreadcrumb, SlBreadcrumbItem, SlBreadcrumbLink, SlBreadcrumbList, SlBreadcrumbPage],
  template: `<nav
    slBreadcrumb
    [label]="label()"
    [maxItems]="maxItems()"
    [expanded]="expanded()"
    (expandedChange)="onExpandedChange($event)"
  >
    <ol slBreadcrumbList>
      @for (level of levels(); track level) {
        <li slBreadcrumbItem>
          <a slBreadcrumbLink [href]="'#' + level">{{ level }}</a>
        </li>
      }
      <li slBreadcrumbItem><span slBreadcrumbPage>INV-0041</span></li>
    </ol>
  </nav>`,
})
class TestHost {
  readonly levels = signal(['Workspace', 'Northwind', 'Accounts', 'Billing', 'Invoices']);
  readonly label = signal<string | undefined>(undefined);
  readonly maxItems = signal<number | undefined>(0);
  readonly expanded = signal<boolean | undefined>(undefined);
  readonly onExpandedChange = vi.fn();
}

function setup(providers: unknown[] = []) {
  TestBed.configureTestingModule({ imports: [TestHost], providers: providers as never[] });
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector('[data-ui="breadcrumb"]') as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    root,
    ellipsis: () => root.querySelector('[data-part="ellipsis"]') as HTMLButtonElement | null,
    items: () => [...root.querySelectorAll('[data-part="item"]')] as HTMLElement[],
    settle: () => fixture.detectChanges(),
  };
}

describe('SlBreadcrumb', () => {
  it('is selected in public by the family identifier and its parts', () => {
    const { root } = setup();

    expect(root.tagName).toBe('NAV');
    expect(root?.getAttribute('data-part')).toBe('root');
    expect(root.querySelector('[data-part="list"]')?.tagName).toBe('OL');
    expect(root.querySelector('[data-part="link"]')?.tagName).toBe('A');
    expect(root.querySelector('[data-part="page"]')?.tagName).toBe('SPAN');
  });

  it('names the landmark, and takes the consumer name over its own', () => {
    const { root, host, settle } = setup();
    expect(root?.getAttribute('aria-label')).toBe('Breadcrumb');

    host.label.set('Fatura');
    settle();
    expect(root?.getAttribute('aria-label')).toBe('Fatura');
  });

  it('marks the current page as text rather than as a link', () => {
    const { root } = setup();

    const page = root.querySelector('[data-part="page"]') as HTMLElement;
    expect(page?.getAttribute('aria-current')).toBe('page');
    expect(contract.currentSource).toBe('aria-current');
  });

  it('draws a separator after every crumb but the last', () => {
    const { root, items } = setup();

    expect(root.querySelectorAll('[data-part="separator"]')).toHaveLength(items().length - 1);
    expect(items().at(-1)?.querySelector('[data-part="separator"]')).toBeNull();
  });

  describe('collapse', () => {
    it('keeps the same number of crumbs whatever it folds', () => {
      expect(collapsedRange(3, 1, 2)).toBeUndefined();
      expect(collapsedRange(4, 1, 2)).toEqual({ start: 1, end: 2 });
      expect(collapsedRange(9, 2, 3)).toEqual({ start: 2, end: 6 });
    });

    it('hides the middle and says how many it hides', () => {
      const { host, ellipsis, items, settle } = setup();
      host.maxItems.set(4);
      settle();

      expect(ellipsis()?.getAttribute('aria-label')).toBe('Show 3 hidden levels');
      expect(ellipsis()?.getAttribute('aria-expanded')).toBe('false');
      expect(
        ellipsis()?.querySelector('[data-ui="icon"] > svg[data-glyph="ellipsis"]'),
      ).not.toBeNull();
      expect(items().filter((item) => item.hasAttribute('hidden'))).toHaveLength(3);
    });

    it('reveals the trail and moves focus to the first crumb it revealed', async () => {
      const { fixture, host, ellipsis, items, root, settle } = setup();
      host.maxItems.set(4);
      settle();

      ellipsis()?.click();
      settle();
      await fixture.whenStable();

      expect(ellipsis()).toBeNull();
      expect(items().some((item) => item.hasAttribute('hidden'))).toBe(false);
      expect(document.activeElement).toBe(root.querySelectorAll('[data-part="link"]')[1]);
    });

    it('carries the reason a press and a key differ by', () => {
      const { host, ellipsis, settle } = setup();
      host.maxItems.set(4);
      settle();

      ellipsis()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      settle();

      expect(host.onExpandedChange).toHaveBeenCalledWith(
        expect.objectContaining({ previous: false, reason: 'keyboard', value: true }),
      );
    });

    it('never moves state the consumer owns', () => {
      const { host, ellipsis, settle } = setup();
      host.maxItems.set(4);
      host.expanded.set(false);
      settle();

      ellipsis()?.click();
      settle();

      expect(host.onExpandedChange).toHaveBeenCalledOnce();
      expect(ellipsis()).not.toBeNull();
    });

    it('writes the state a consumer may style', () => {
      const { host, root, settle } = setup();
      host.expanded.set(true);
      settle();

      expect(root?.getAttribute('data-expanded')).toBe('');
    });
  });

  it('takes the application defaults, and yields to an explicit input', () => {
    const { host, root, settle } = setup([provideBreadcrumbDefaults({ label: 'Trilha' })]);
    expect(root?.getAttribute('aria-label')).toBe('Trilha');

    host.label.set('Fatura');
    settle();
    expect(root?.getAttribute('aria-label')).toBe('Fatura');
  });

  /** A static attribute the consumer wrote survives the host binding. */
  it('keeps an aria-label written straight onto the element', () => {
    @Component({
      imports: [SlBreadcrumb, SlBreadcrumbItem, SlBreadcrumbList],
      template: `<nav slBreadcrumb aria-label="Caminho">
        <ol slBreadcrumbList>
          <li slBreadcrumbItem>Home</li>
        </ol>
      </nav>`,
    })
    class Static {}

    TestBed.configureTestingModule({ imports: [Static] });
    const fixture = TestBed.createComponent(Static);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-ui="breadcrumb"]')?.getAttribute('aria-label'),
    ).toBe('Caminho');
  });
});
