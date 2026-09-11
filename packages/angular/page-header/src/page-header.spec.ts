import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChangeRequest } from '@slotted/core/state';
import { SlPage } from '@slotted/angular/page';
import { SlPageHeader } from './page-header';
import { providePageHeaderDefaults } from './page-header-defaults';
import {
  SlPageHeaderActions,
  SlPageHeaderArea,
  SlPageHeaderBack,
  SlPageHeaderBreadcrumbs,
  SlPageHeaderContent,
  SlPageHeaderControls,
  SlPageHeaderDescription,
  SlPageHeaderFigure,
  SlPageHeaderHeading,
  SlPageHeaderMarks,
  SlPageHeaderNav,
  SlPageHeaderNavigation,
  SlPageHeaderPin,
  SlPageHeaderSubheading,
  SlPageHeaderTabs,
  SlPageHeaderTitle,
  SlPageHeaderTitleArea,
  SlPageHeaderTitleRow,
  SlPageHeaderToggle,
  SlPageHeaderVisual,
} from './page-header-parts';

class FakeIntersectionObserver {
  static last: FakeIntersectionObserver | undefined;
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.last = this;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  report(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as never);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const PARTS = [
  SlPageHeader,
  SlPageHeaderTitleArea,
  SlPageHeaderNav,
  SlPageHeaderBack,
  SlPageHeaderBreadcrumbs,
  SlPageHeaderTitleRow,
  SlPageHeaderVisual,
  SlPageHeaderTitle,
  SlPageHeaderHeading,
  SlPageHeaderMarks,
  SlPageHeaderSubheading,
  SlPageHeaderActions,
  SlPageHeaderNavigation,
  SlPageHeaderArea,
  SlPageHeaderFigure,
  SlPageHeaderContent,
  SlPageHeaderDescription,
  SlPageHeaderControls,
  SlPageHeaderToggle,
  SlPageHeaderPin,
  SlPageHeaderTabs,
];

@Component({
  standalone: true,
  imports: [...PARTS, SlPage],
  template: `<main slPage [width]="width()" [inset]="inset()">
    <header
      slPageHeader
      #header="slPageHeader"
      [(expanded)]="expanded"
      [(pinned)]="pinned"
      [size]="size()"
      [level]="level()"
      [collapse]="collapse()"
      [loading]="loading()"
      (expandedRequest)="expandedRequests.push($event)"
      (pinnedRequest)="pinnedRequests.push($event)"
    >
      <div slPageHeaderTitleArea>
        <div slPageHeaderNav>
          <a slPageHeaderBack href="#pedidos">Pedidos</a>
          <div slPageHeaderBreadcrumbs><nav aria-label="Breadcrumb"></nav></div>
        </div>
        <div slPageHeaderTitleRow>
          <span slPageHeaderVisual>AL</span>
          <div slPageHeaderTitle>
            @if (nativeHeading()) {
              <h1 slPageHeaderHeading>Pedido de compra</h1>
            } @else {
              <div slPageHeaderHeading>Pedido de compra</div>
            }
            <span slPageHeaderMarks>Em análise</span>
            <p slPageHeaderSubheading>Aurora Logística</p>
          </div>
          <div slPageHeaderActions><button type="button">Aprovar</button></div>
          <div slPageHeaderNavigation><button type="button">Seguinte</button></div>
        </div>
      </div>
      <div slPageHeaderArea>
        <div slPageHeaderFigure>foto</div>
        <div slPageHeaderContent>
          <p slPageHeaderDescription>Reposição de pneus.</p>
          <button type="button">Filtrar</button>
        </div>
      </div>
      <div slPageHeaderControls>
        <button slPageHeaderToggle></button>
        <button slPageHeaderPin></button>
      </div>
      <div slPageHeaderTabs><div role="tablist" aria-label="Secções"></div></div>
    </header>
  </main>`,
})
class Host {
  readonly header = viewChild.required<SlPageHeader>('header');
  readonly expanded = signal(true);
  readonly pinned = signal(false);
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly level = signal<'1' | '2' | '3' | undefined>(undefined);
  readonly collapse = signal<'scroll' | 'manual' | undefined>(undefined);
  readonly loading = signal(false);
  readonly nativeHeading = signal(true);
  readonly width = signal<'measure' | 'content' | 'wide' | 'full' | undefined>(undefined);
  readonly inset = signal<0 | 4 | 6 | undefined>(undefined);
  readonly expandedRequests: ChangeRequest<boolean>[] = [];
  readonly pinnedRequests: ChangeRequest<boolean>[] = [];
}

describe('SlPageHeader', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const query = <T extends HTMLElement>(selector: string) =>
    fixture.nativeElement.querySelector(selector) as T;
  const root = () => query('[data-ui="page-header"]');
  const area = () => query('[data-part="header-area"]');
  const toggle = () => query<HTMLButtonElement>('[data-part="toggle"]');
  const pin = () => query<HTMLButtonElement>('[data-part="pin"]');
  const click = (element: HTMLElement, detail = 1) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    FakeIntersectionObserver.last = undefined;
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the anatomy the contract declares', () => {
    for (const part of [
      'root',
      'title-area',
      'nav',
      'back',
      'breadcrumbs',
      'title-row',
      'visual',
      'title',
      'heading',
      'marks',
      'subheading',
      'actions',
      'navigation',
      'header-area',
      'figure',
      'content',
      'description',
      'controls',
      'toggle',
      'pin',
      'tabs',
    ]) {
      expect(query(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(root().tagName).toBe('HEADER');
    expect(root().querySelector(':scope > [data-ui="container"]')).not.toBeNull();
  });

  it('writes the disclosure wiring on the toggle and names the region', () => {
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(toggle().getAttribute('aria-controls')).toBe(area().id);
    expect(toggle().getAttribute('aria-label')).toBe('Recolher cabeçalho');
    expect(area().getAttribute('role')).toBe('region');
    expect(area().getAttribute('aria-label')).toBe('Cabeçalho da página');
    expect(root().hasAttribute('data-expanded')).toBe(true);
  });

  it('collapses from the toggle with the reason the device gave', () => {
    click(toggle(), 1);
    expect(host.expandedRequests.at(-1)?.reason).toBe('pointer');
    expect(host.expanded()).toBe(false);
    expect(root().hasAttribute('data-expanded')).toBe(false);
    expect(toggle().getAttribute('aria-label')).toBe('Expandir cabeçalho');
    expect(area().hasAttribute('inert')).toBe(true);

    click(toggle(), 0);
    expect(host.expandedRequests.at(-1)?.reason).toBe('keyboard');
    expect(host.expanded()).toBe(true);
    expect(area().hasAttribute('inert')).toBe(false);
  });

  it('collapses with the reason scroll when the area leaves the scrollport, and writes the fact', () => {
    expect(FakeIntersectionObserver.last).toBeDefined();
    FakeIntersectionObserver.last?.report(false);
    fixture.detectChanges();
    expect(host.expandedRequests.at(-1)?.reason).toBe('scroll');
    expect(host.expanded()).toBe(false);
    expect(root().hasAttribute('data-scrolled')).toBe(true);
    expect(area().hasAttribute('inert')).toBe(false);

    FakeIntersectionObserver.last?.report(true);
    fixture.detectChanges();
    expect(host.expanded()).toBe(true);
    expect(root().hasAttribute('data-scrolled')).toBe(false);
  });

  it('reveals in place when the toggle opens the area after the scroll has passed it', () => {
    FakeIntersectionObserver.last?.report(false);
    fixture.detectChanges();
    click(toggle());
    expect(root().hasAttribute('data-expanded')).toBe(true);
    expect(root().hasAttribute('data-revealed')).toBe(true);
    expect(root().hasAttribute('data-scrolled')).toBe(true);
  });

  it('pins as a pressed toggle button, and a pin opens a collapsed area', () => {
    click(toggle());
    expect(host.expanded()).toBe(false);
    expect(pin().getAttribute('aria-pressed')).toBe('false');
    click(pin());
    expect(host.pinnedRequests.at(-1)?.reason).toBe('pointer');
    expect(host.pinned()).toBe(true);
    expect(pin().getAttribute('aria-pressed')).toBe('true');
    expect(pin().hasAttribute('data-pressed')).toBe(true);
    expect(pin().getAttribute('aria-label')).toBe('Soltar cabeçalho');
    expect(host.expandedRequests.at(-1)?.reason).toBe('programmatic');
    expect(host.expanded()).toBe(true);
  });

  it('lets the pin go before collapsing by the toggle', () => {
    host.pinned.set(true);
    fixture.detectChanges();
    click(toggle());
    expect(host.pinnedRequests.at(-1)?.reason).toBe('programmatic');
    expect(host.pinned()).toBe(false);
    expect(host.expanded()).toBe(false);
  });

  it('lets a request be refused before anything commits', () => {
    host.expandedRequests.length = 0;
    const handle = host.header();
    const stop = handle.expandedRequest.subscribe((request) => request.cancel());
    click(toggle());
    expect(host.expanded()).toBe(true);
    stop.unsubscribe();
  });

  it('follows a value the template moved, with the reason programmatic for the engine', () => {
    host.expanded.set(false);
    fixture.detectChanges();
    expect(root().hasAttribute('data-expanded')).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('moves from the instance with the reason programmatic', () => {
    host.header().collapseArea();
    fixture.detectChanges();
    expect(host.expandedRequests.at(-1)?.reason).toBe('programmatic');
    expect(host.expanded()).toBe(false);
    host.header().pin();
    fixture.detectChanges();
    expect(host.pinned()).toBe(true);
    expect(host.expanded()).toBe(true);
    host.header().unpin();
    fixture.detectChanges();
    expect(host.pinned()).toBe(false);
  });

  it('never moves expanded on scroll under manual collapse', async () => {
    FakeIntersectionObserver.last = undefined;
    host.collapse.set('manual');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root().getAttribute('data-collapse')).toBe('manual');
    /* The refresh rebuilt no observer for a manual header. */
    const rebuilt = FakeIntersectionObserver.last as FakeIntersectionObserver | undefined;
    if (rebuilt !== undefined) {
      const before = host.expandedRequests.length;
      rebuilt.report(false);
      expect(host.expandedRequests.length).toBe(before);
    }
  });

  it('adds heading semantics only when the element is not a heading', () => {
    const heading = query('[data-part="heading"]');
    expect(heading.tagName).toBe('H1');
    expect(heading.hasAttribute('role')).toBe(false);
    host.nativeHeading.set(false);
    host.level.set('2');
    fixture.detectChanges();
    const substitute = query('[data-part="heading"]');
    expect(substitute.tagName).toBe('DIV');
    expect(substitute.getAttribute('role')).toBe('heading');
    expect(substitute.getAttribute('aria-level')).toBe('2');
  });

  it("stands skeleton's text shape in for the words while loading", () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(root().hasAttribute('data-loading')).toBe(true);
    expect(root().getAttribute('aria-busy')).toBe('true');
    expect(query('[data-part="heading"] [data-ui="skeleton"]')).not.toBeNull();
    expect(query('[data-part="description"] [data-ui="skeleton"]')).not.toBeNull();
  });

  it('aligns its rows to the page around it', () => {
    host.width.set('measure');
    host.inset.set(4);
    fixture.detectChanges();
    const container = root().querySelector(':scope > [data-ui="container"]');
    expect(container?.getAttribute('data-size')).toBe('measure');
    expect(container?.getAttribute('data-inset')).toBe('4');
  });
});

describe('SlPageHeader defaults', () => {
  @Component({
    standalone: true,
    imports: [SlPageHeader, SlPageHeaderArea, SlPageHeaderControls, SlPageHeaderToggle],
    providers: [
      providePageHeaderDefaults({
        collapse: 'manual',
        level: '2',
        size: 'lg',
        messages: { collapse: 'Fechar' },
      }),
    ],
    template: `<header slPageHeader size="sm">
      <div slPageHeaderArea></div>
      <div slPageHeaderControls><button slPageHeaderToggle></button></div>
    </header>`,
  })
  class Provided {}

  it('takes its defaults from the provider, and its own inputs over them', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const fixture = TestBed.createComponent(Provided);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-ui="page-header"]') as HTMLElement;
    expect(root.getAttribute('data-collapse')).toBe('manual');
    expect(root.getAttribute('data-level')).toBe('2');
    expect(root.getAttribute('data-size')).toBe('sm');
    expect(root.querySelector('[data-part="toggle"]')?.getAttribute('aria-label')).toBe('Fechar');
    vi.unstubAllGlobals();
  });
});
