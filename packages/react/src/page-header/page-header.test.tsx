import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/page-header/contract.json';
import { Page } from '../page';
import { PageHeader } from './page-header';
import { PageHeaderDefaultsProvider } from './page-header-defaults';
import {
  PageHeaderActions,
  PageHeaderArea,
  PageHeaderBack,
  PageHeaderBreadcrumbs,
  PageHeaderContent,
  PageHeaderControls,
  PageHeaderDescription,
  PageHeaderFigure,
  PageHeaderHeading,
  PageHeaderMarks,
  PageHeaderNav,
  PageHeaderNavigation,
  PageHeaderPin,
  PageHeaderSubheading,
  PageHeaderTabs,
  PageHeaderTitle,
  PageHeaderTitleArea,
  PageHeaderTitleRow,
  PageHeaderToggle,
  PageHeaderVisual,
} from './page-header-parts';
import type { PageHeaderHandle, PageHeaderProps } from './page-header.types';

/**
 * The observers are stubs the test drives by hand: what is under test is the
 * binding's routing — the request, the reason, the attributes — and the
 * engine's rules are tested in `@slotted/core/sticky-header`.
 */
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
  static all: FakeResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.all.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

function Full({
  title = 'Pedido de compra PC-2026-004521',
  withPin = true,
  ...props
}: Partial<PageHeaderProps> & { title?: string; withPin?: boolean }) {
  return (
    <PageHeader {...props}>
      <PageHeaderTitleArea>
        <PageHeaderNav>
          <PageHeaderBack href="#pedidos">Pedidos</PageHeaderBack>
          <PageHeaderBreadcrumbs>
            <nav aria-label="Breadcrumb" />
          </PageHeaderBreadcrumbs>
        </PageHeaderNav>
        <PageHeaderTitleRow>
          <PageHeaderVisual>AL</PageHeaderVisual>
          <PageHeaderTitle>
            <PageHeaderHeading>{title}</PageHeaderHeading>
            <PageHeaderMarks>Em análise</PageHeaderMarks>
            <PageHeaderSubheading>Aurora Logística</PageHeaderSubheading>
          </PageHeaderTitle>
          <PageHeaderActions>
            <button type="button">Aprovar</button>
          </PageHeaderActions>
          <PageHeaderNavigation>
            <button type="button">Seguinte</button>
          </PageHeaderNavigation>
        </PageHeaderTitleRow>
      </PageHeaderTitleArea>
      <PageHeaderArea>
        <PageHeaderFigure>foto</PageHeaderFigure>
        <PageHeaderContent>
          <PageHeaderDescription>Reposição de pneus.</PageHeaderDescription>
          <button type="button">Filtrar</button>
        </PageHeaderContent>
      </PageHeaderArea>
      <PageHeaderControls>
        <PageHeaderToggle />
        {withPin ? <PageHeaderPin /> : null}
      </PageHeaderControls>
      <PageHeaderTabs>
        <div role="tablist" aria-label="Secções" />
      </PageHeaderTabs>
    </PageHeader>
  );
}

const root = () => document.querySelector('[data-ui="page-header"]') as HTMLElement;
const pin = () => screen.getByRole('button', { pressed: false });
const area = () => document.querySelector('[data-part="header-area"]') as HTMLElement;

describe('PageHeader', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    vi.unstubAllGlobals();
    FakeIntersectionObserver.last = undefined;
  });

  it('renders the anatomy the contract declares', () => {
    render(<Full />);
    for (const part of contract.members.pageHeader.parts) {
      expect(document.querySelector(`[data-part="${part}"]`)).not.toBeNull();
    }
    expect(root().tagName).toBe('HEADER');
    expect(document.querySelector('h1[data-part="heading"]')).not.toBeNull();
  });

  it('writes the disclosure wiring on the toggle and names the region', () => {
    render(<Full />);
    const control = screen.getByRole('button', { name: 'Recolher cabeçalho' });
    expect(control).toHaveAttribute('aria-expanded', 'true');
    expect(control.getAttribute('aria-controls')).toBe(area().id);
    expect(screen.getByRole('region', { name: 'Cabeçalho da página' })).toBe(area());
    expect(root()).toHaveAttribute('data-expanded');
  });

  it('collapses from the toggle with the reason the device gave, and stays a button', () => {
    const onExpandedChange = vi.fn();
    render(<Full onExpandedChange={onExpandedChange} />);
    const control = screen.getByRole('button', { name: 'Recolher cabeçalho' });

    fireEvent.click(control, { detail: 1 });
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(root()).not.toHaveAttribute('data-expanded');
    expect(control).toHaveAttribute('aria-expanded', 'false');
    expect(control).toHaveAccessibleName('Expandir cabeçalho');
    /* Collapsed by the control, the area leaves the tab sequence. */
    expect(area()).toHaveAttribute('inert');
    expect(area()).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(control, { detail: 0 });
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'keyboard' }),
    );
    expect(area()).not.toHaveAttribute('inert');
  });

  it('collapses with the reason scroll when the area leaves the scrollport, and writes the fact', () => {
    const onExpandedChange = vi.fn();
    render(<Full onExpandedChange={onExpandedChange} />);

    /* The document has scrolled: only then can the area have left. */
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 300 });
    act(() => FakeIntersectionObserver.last?.report(false));
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'scroll' }),
    );
    expect(root()).toHaveAttribute('data-scrolled');
    expect(root()).not.toHaveAttribute('data-expanded');
    /* Scrolled past, the area stays in the tab sequence. */
    expect(area()).not.toHaveAttribute('inert');

    act(() => FakeIntersectionObserver.last?.report(true));
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'scroll' }),
    );
    expect(root()).not.toHaveAttribute('data-scrolled');
  });

  it('reveals in place when the toggle opens the area after the scroll has passed it', () => {
    render(<Full />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 300 });
    act(() => FakeIntersectionObserver.last?.report(false));
    const control = screen.getByRole('button', { name: 'Expandir cabeçalho' });

    fireEvent.click(control);
    expect(root()).toHaveAttribute('data-expanded');
    expect(root()).toHaveAttribute('data-revealed');
    expect(root()).toHaveAttribute('data-scrolled');
  });

  it('never moves expanded on scroll under manual collapse', () => {
    const onExpandedChange = vi.fn();
    render(<Full collapse="manual" onExpandedChange={onExpandedChange} />);
    expect(FakeIntersectionObserver.last).toBeUndefined();
    expect(root()).toHaveAttribute('data-collapse', 'manual');
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it('pins as a pressed toggle button, and a pin opens a collapsed area', () => {
    const onPinnedChange = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <Full
        defaultExpanded={false}
        onPinnedChange={onPinnedChange}
        onExpandedChange={onExpandedChange}
      />,
    );
    const control = pin();
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(control).toHaveAccessibleName('Fixar cabeçalho');

    fireEvent.click(control, { detail: 1 });
    expect(onPinnedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'programmatic' }),
    );
    expect(control).toHaveAttribute('aria-pressed', 'true');
    expect(control).toHaveAttribute('data-pressed');
    expect(control).toHaveAccessibleName('Soltar cabeçalho');
    expect(root()).toHaveAttribute('data-expanded');
  });

  it('lets the pin go before collapsing by the toggle', () => {
    const onPinnedChange = vi.fn();
    render(<Full defaultPinned onPinnedChange={onPinnedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recolher cabeçalho' }));
    expect(onPinnedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'programmatic' }),
    );
    expect(root()).not.toHaveAttribute('data-expanded');
  });

  it('stays where the consumer puts it while controlled', () => {
    const onExpandedChange = vi.fn();
    render(<Full expanded onExpandedChange={onExpandedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recolher cabeçalho' }));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-expanded');
  });

  it('follows the consumer once their new value arrives', () => {
    function Owner() {
      const [expanded, setExpanded] = useState(true);
      return <Full expanded={expanded} onExpandedChange={setExpanded} />;
    }
    render(<Owner />);
    fireEvent.click(screen.getByRole('button', { name: 'Recolher cabeçalho' }));
    expect(root()).not.toHaveAttribute('data-expanded');
  });

  it('lets a request be refused before anything commits', () => {
    render(<Full onExpandedChange={(_next, request) => request.cancel()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recolher cabeçalho' }));
    expect(root()).toHaveAttribute('data-expanded');
  });

  it("composes with the consumer's own click handler rather than replacing it", () => {
    const onClick = vi.fn();
    render(
      <PageHeader>
        <PageHeaderArea />
        <PageHeaderControls>
          <PageHeaderToggle onClick={onClick} />
        </PageHeaderControls>
      </PageHeader>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(root()).not.toHaveAttribute('data-expanded');
  });

  it('refuses the move when the consumer prevents the click', () => {
    render(
      <PageHeader>
        <PageHeaderArea />
        <PageHeaderControls>
          <PageHeaderToggle onClick={(event) => event.preventDefault()} />
        </PageHeaderControls>
      </PageHeader>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(root()).toHaveAttribute('data-expanded');
  });

  it('moves from the handle with the reason programmatic', () => {
    const ref = createRef<PageHeaderHandle>();
    const onExpandedChange = vi.fn();
    const onPinnedChange = vi.fn();
    render(<Full ref={ref} onExpandedChange={onExpandedChange} onPinnedChange={onPinnedChange} />);
    expect(ref.current?.element).toBe(root());

    act(() => ref.current?.collapse());
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'programmatic' }),
    );
    act(() => ref.current?.pin());
    expect(onPinnedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'programmatic' }),
    );
    expect(root()).toHaveAttribute('data-expanded');
    act(() => ref.current?.unpin());
    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  });

  it('renders the heading at the level asked for, with the full text in its title', () => {
    render(<Full level="2" title="Um título" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('title', 'Um título');
    expect(heading).toHaveAttribute('data-part', 'heading');
  });

  it("stands skeleton's text shape in for the words while loading", () => {
    render(<Full loading />);
    expect(root()).toHaveAttribute('data-loading');
    expect(root()).toHaveAttribute('aria-busy', 'true');
    const heading = document.querySelector('[data-part="heading"]') as HTMLElement;
    expect(heading.querySelector('[data-ui="skeleton"]')).not.toBeNull();
    expect(heading.textContent).toBe('');
    expect(screen.getByRole('button', { name: 'Aprovar' })).toBeEnabled();
  });

  it('takes its defaults from the provider, and its own props over them', () => {
    render(
      <PageHeaderDefaultsProvider
        collapse="manual"
        level="2"
        messages={{ collapse: 'Fechar' }}
        size="lg"
      >
        <Full size="sm" />
      </PageHeaderDefaultsProvider>,
    );
    expect(root()).toHaveAttribute('data-collapse', 'manual');
    expect(root()).toHaveAttribute('data-level', '2');
    expect(root()).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });

  it('aligns its rows to the page around it', () => {
    render(
      <Page inset={4} width="measure">
        <Full />
      </Page>,
    );
    const container = root().querySelector('[data-ui="container"]');
    expect(container).toHaveAttribute('data-size', 'measure');
    expect(container).toHaveAttribute('data-inset', '4');
  });

  it('passes native props and substitutes the heading through render', () => {
    render(
      <PageHeader data-testid="ph" lang="pt-BR">
        <PageHeaderTitleArea>
          <PageHeaderTitleRow>
            <PageHeaderTitle>
              <PageHeaderHeading
                render={(props) => (
                  <input {...props} aria-label="Título" children={undefined} defaultValue="x" />
                )}
              >
                x
              </PageHeaderHeading>
            </PageHeaderTitle>
          </PageHeaderTitleRow>
        </PageHeaderTitleArea>
      </PageHeader>,
    );
    expect(screen.getByTestId('ph')).toHaveAttribute('lang', 'pt-BR');
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveAttribute('data-part', 'heading');
  });
});

describe('PageHeader parts', () => {
  it('throw outside the family rather than rendering a control that does nothing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<PageHeaderToggle />)).toThrow(/inside PageHeader/);
    vi.restoreAllMocks();
  });

  /**
   * Too much of the screen to hold: on a phone the pin is not offered, and a
   * header held when the fact turns true is let go.
   */
  it('writes data-tall on a phone-wide header and lets a held one go', () => {
    /* The engine publishes on the next frame; every frame runs at once here,
       from the first, or a frame the mount scheduled would still be pending. */
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    FakeResizeObserver.all = [];
    const onPinnedChange = vi.fn();
    render(<Full defaultPinned onPinnedChange={onPinnedChange} />);
    const pin = document.querySelector('[data-part="pin"]') as HTMLElement;
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    expect(root()).not.toHaveAttribute('data-tall');

    Object.defineProperty(root(), 'clientWidth', { configurable: true, value: 390 });
    act(() => {
      for (const observer of FakeResizeObserver.all) observer.callback([], {} as ResizeObserver);
    });
    expect(root()).toHaveAttribute('data-tall');
    expect(pin).toHaveAttribute('aria-pressed', 'false');
    expect(onPinnedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'programmatic' }),
    );
  });
});
