import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/table-of-contents/contract.json';
import { TableOfContents } from './table-of-contents';
import { TableOfContentsDefaultsProvider } from './table-of-contents-defaults';
import {
  TableOfContentsGroup,
  TableOfContentsItem,
  TableOfContentsLink,
} from './table-of-contents-parts';
import type { TableOfContentsHandle, TableOfContentsProps } from './table-of-contents.types';

/** The observer is a stub: the rule under test is the family's, not the layout engine's. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  fire() {
    this.callback([], this as never);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const ITEMS = [
  { id: 'dados', label: 'Dados gerais' },
  {
    id: 'enderecos',
    label: 'Endereços',
    children: [
      { id: 'faturacao', label: 'Faturação' },
      { id: 'entrega', label: 'Entrega' },
    ],
  },
  { id: 'contactos', label: 'Contactos' },
];

/** Targets in the document, at stated tops. */
function targets(tops: Record<string, number>) {
  for (const [id, top] of Object.entries(tops)) {
    const section = document.createElement('section');
    section.id = id;
    section.getBoundingClientRect = () =>
      ({ top, bottom: top + 200, height: 200, width: 600, left: 0, right: 600 }) as DOMRect;
    document.body.append(section);
  }
}

function List(props: Partial<TableOfContentsProps>) {
  return <TableOfContents items={ITEMS} {...props} />;
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  window.scrollTo = vi.fn();
  window.history.replaceState(null, '', '/');
  /* jsdom lays nothing out: the document is given a height so the viewport is not at its end. */
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 4000,
  });

  /* And scrolled a little: at its start the first target is current before anything is measured. */
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 10 });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.documentElement.style.removeProperty('--slotted-page-sticky-top');
});

describe('anatomy', () => {
  it('renders a named navigation landmark with the parts the contract declares', () => {
    const { container } = render(<List label="Nesta página" />);
    const root = screen.getByRole('navigation', { name: 'Nesta página' });
    expect(root.tagName).toBe('NAV');
    expect(root.getAttribute('data-ui')).toBe(contract.ui);
    expect(root.getAttribute('data-layout')).toBe('vertical');
    expect(root.getAttribute('data-size')).toBe('md');
    for (const part of ['label', 'panel', 'list', 'item', 'link', 'group', 'marker']) {
      expect(container.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(screen.getAllByRole('link')).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Faturação' }).getAttribute('href')).toBe('#faturacao');
    expect(container.querySelector('[data-value="faturacao"]')?.getAttribute('data-depth')).toBe(
      '2',
    );
  });

  it('names the landmark from the messages when there is no label, and keeps a written name', () => {
    render(<List />);
    expect(screen.getByRole('navigation', { name: 'Nesta página' })).toBeTruthy();
    document.body.innerHTML = '';
    render(<List aria-label="Cláusulas" />);
    expect(screen.getByRole('navigation', { name: 'Cláusulas' })).toBeTruthy();
  });

  it('renders a div under landmark=false, and parts written by hand', () => {
    const { container } = render(
      <TableOfContents landmark={false}>
        <TableOfContentsItem value="a">
          <TableOfContentsLink>A</TableOfContentsLink>
          <TableOfContentsGroup>
            <TableOfContentsItem value="a1">
              <TableOfContentsLink href="#a1-custom">A1</TableOfContentsLink>
            </TableOfContentsItem>
          </TableOfContentsGroup>
        </TableOfContentsItem>
      </TableOfContents>,
    );
    expect(container.querySelector('[data-ui="table-of-contents"]')?.tagName).toBe('DIV');
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByRole('link', { name: 'A1' }).getAttribute('href')).toBe('#a1-custom');
  });

  it('marks the current link with aria-current=location and data-current on the link and its item', () => {
    const { container } = render(<List value="entrega" />);
    const link = screen.getByRole('link', { name: 'Entrega' });
    expect(link.getAttribute('aria-current')).toBe('location');
    expect(link.hasAttribute('data-current')).toBe(true);
    expect(container.querySelector('[data-value="entrega"]')?.hasAttribute('data-current')).toBe(
      true,
    );
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('draws skeleton rows while loading and hides itself while empty', () => {
    const { container, rerender } = render(<List items={[]} loading />);
    const root = container.querySelector('[data-ui="table-of-contents"]') as HTMLElement;
    expect(root.hasAttribute('data-loading')).toBe(true);
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('[data-part="skeleton"]')).toHaveLength(4);
    rerender(<List items={[]} />);
    expect(root.hasAttribute('data-empty')).toBe(true);
  });
});

describe('navigating', () => {
  it('asks value with pointer, scrolls the target under the chrome, pushes the URL and focuses the target', () => {
    targets({ dados: 100, enderecos: 900 });
    document.documentElement.style.setProperty('--slotted-page-sticky-top', '56px');
    const onValueChange = vi.fn();
    render(<List onValueChange={onValueChange} />);
    const push = vi.spyOn(window.history, 'pushState');

    const link = screen.getByRole('link', { name: 'Endereços' });
    const event = fireEvent.click(link, { detail: 1 });
    expect(event).toBe(false);
    expect(onValueChange).toHaveBeenCalledWith(
      'enderecos',
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 10 + 900 - 56, behavior: 'smooth' });
    expect(push).toHaveBeenCalledWith(null, '', '#enderecos');
    const target = document.getElementById('enderecos') as HTMLElement;
    expect(document.activeElement).toBe(target);
    expect(target.getAttribute('tabindex')).toBe('-1');
  });

  it('replaces or leaves the URL by history, and reports keyboard for a synthesised click', () => {
    targets({ dados: 100 });
    const onValueChange = vi.fn();
    const { rerender } = render(<List history="replace" onValueChange={onValueChange} />);
    const replace = vi.spyOn(window.history, 'replaceState');
    const push = vi.spyOn(window.history, 'pushState');
    fireEvent.click(screen.getByRole('link', { name: 'Dados gerais' }), { detail: 0 });
    expect(onValueChange).toHaveBeenCalledWith(
      'dados',
      expect.objectContaining({ reason: 'keyboard' }),
    );
    expect(replace).toHaveBeenCalledWith(null, '', '#dados');

    rerender(<List history="none" onValueChange={onValueChange} />);
    replace.mockClear();
    push.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Dados gerais' }));
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('leaves a modifier click and a cancelled click to the platform', () => {
    targets({ dados: 100 });
    const onValueChange = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <TableOfContents onValueChange={onValueChange}>
        <TableOfContentsItem value="dados">
          <TableOfContentsLink>Dados</TableOfContentsLink>
        </TableOfContentsItem>
        <TableOfContentsItem value="enderecos">
          <TableOfContentsLink onClick={onClick}>Endereços</TableOfContentsLink>
        </TableOfContentsItem>
      </TableOfContents>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Dados' }), { metaKey: true });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'Endereços' }));
    expect(onClick).toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('scrolls even when a controlled value refuses the request', () => {
    targets({ dados: 100, enderecos: 900 });
    render(<List value="dados" onValueChange={() => {}} />);
    fireEvent.click(screen.getByRole('link', { name: 'Endereços' }));
    expect(window.scrollTo).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Dados gerais' }).getAttribute('aria-current')).toBe(
      'location',
    );
  });

  it('exposes focus, refresh and scrollTo on the handle', () => {
    targets({ dados: 100, contactos: 1500 });
    const onValueChange = vi.fn();
    const push = vi.spyOn(window.history, 'pushState');
    function Host() {
      const handle = useRef<TableOfContentsHandle>(null);
      return (
        <>
          <button onClick={() => handle.current?.scrollTo('contactos')}>go</button>
          <button onClick={() => handle.current?.focus()}>focus</button>
          <List onValueChange={onValueChange} ref={handle} />
        </>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByText('go'));
    expect(onValueChange).toHaveBeenCalledWith(
      'contactos',
      expect.objectContaining({ reason: 'programmatic' }),
    );
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 10 + 1500, behavior: 'smooth' });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('focus'));
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Dados gerais' }));
  });
});

describe('observing', () => {
  it('asks value to move with the reason scroll as targets pass the line', async () => {
    targets({ dados: 100, enderecos: 900, contactos: 1700 });
    const onValueChange = vi.fn();
    render(<List onValueChange={onValueChange} />);
    expect(onValueChange).not.toHaveBeenCalled();

    (document.getElementById('dados') as HTMLElement).getBoundingClientRect = () =>
      ({ top: -50, bottom: 150, height: 200, width: 600, left: 0, right: 600 }) as DOMRect;
    act(() => FakeIntersectionObserver.instances.at(-1)?.fire());
    expect(onValueChange).toHaveBeenLastCalledWith(
      'dados',
      expect.objectContaining({ reason: 'scroll' }),
    );
    expect(screen.getByRole('link', { name: 'Dados gerais' }).getAttribute('aria-current')).toBe(
      'location',
    );

    (document.getElementById('enderecos') as HTMLElement).getBoundingClientRect = () =>
      ({ top: 2, bottom: 202, height: 200, width: 600, left: 0, right: 600 }) as DOMRect;
    fireEvent.scroll(window);
    await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));
    expect(onValueChange).toHaveBeenLastCalledWith(
      'enderecos',
      expect.objectContaining({ reason: 'scroll' }),
    );
  });

  it('keeps a controlled value the consumer does not move', () => {
    targets({ dados: -50, enderecos: 900 });
    function Host() {
      const [value, setValue] = useState<string | null>('enderecos');
      return (
        <List
          value={value}
          onValueChange={(next, request) => request.reason !== 'scroll' && setValue(next)}
        />
      );
    }
    render(<Host />);
    act(() => FakeIntersectionObserver.instances.at(-1)?.fire());
    expect(screen.getByRole('link', { name: 'Endereços' }).getAttribute('aria-current')).toBe(
      'location',
    );
  });
});

describe('source', () => {
  it('reads the headings of a region between the levels, writes missing ids, and re-reads on change', async () => {
    function Host({ levels }: { levels?: readonly [number, number] }) {
      const region = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={region}>
            <h1>Título</h1>
            <h2>Dados gerais</h2>
            <h3 id="kept">Faturação</h3>
            <h4>Fundo</h4>
          </div>
          <TableOfContents source={region} {...(levels ? { levels } : {})} />
        </>
      );
    }
    const { container } = render(<Host />);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '#dados-gerais',
      '#kept',
    ]);
    expect(container.querySelector('h2')?.id).toBe('dados-gerais');

    const region = container.querySelector('div') as HTMLElement;
    const added = document.createElement('h2');
    added.textContent = 'Contactos';
    await act(async () => {
      region.append(added);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.getByRole('link', { name: 'Contactos' })).toBeTruthy();
  });
});

describe('collapsed', () => {
  function Collapsed(props: Partial<TableOfContentsProps>) {
    return <List label="Nesta página" layout="collapsed" value="enderecos" {...props} />;
  }

  it('renders a trigger with the label and the current text that opens the list', () => {
    const { container } = render(<Collapsed />);
    const trigger = screen.getByRole('button', { name: /Nesta página/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-part="current"]')?.textContent).toBe('Endereços');
    const panel = container.querySelector('[data-part="panel"]') as HTMLElement;
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    const root = container.querySelector('[data-ui="table-of-contents"]') as HTMLElement;

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(root.hasAttribute('data-open')).toBe(true);
  });

  it('opens on ArrowDown onto the first link, and closes on Escape back onto the trigger', () => {
    const onOpenChange = vi.fn();
    render(<Collapsed onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: /Nesta página/ });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'keyboard' }),
    );
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Dados gerais' }));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    );
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on a choice with the reason select', () => {
    targets({ contactos: 400 });
    const onOpenChange = vi.fn();
    render(<Collapsed defaultOpen onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('link', { name: 'Contactos' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'select' }),
    );
  });

  it('closes on a press outside with the reason outsidePress', () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <button>fora</button>
        <Collapsed defaultOpen onOpenChange={onOpenChange} />
      </>,
    );
    fireEvent.pointerDown(screen.getByText('fora'));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outsidePress' }),
    );
  });
});

describe('keyboard', () => {
  it('walks the links with the arrows, Home and End', () => {
    render(<List />);
    const links = screen.getAllByRole('link');
    links[0]?.focus();
    fireEvent.keyDown(links[0] as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(links[1]);
    fireEvent.keyDown(links[1] as HTMLElement, { key: 'End' });
    expect(document.activeElement).toBe(links[4]);
    fireEvent.keyDown(links[4] as HTMLElement, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(links[3]);
    fireEvent.keyDown(links[3] as HTMLElement, { key: 'Home' });
    expect(document.activeElement).toBe(links[0]);
  });

  it('walks the bar with ArrowRight and ArrowLeft', () => {
    render(<List layout="horizontal" />);
    const links = screen.getAllByRole('link');
    links[0]?.focus();
    fireEvent.keyDown(links[0] as HTMLElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(links[1]);
    fireEvent.keyDown(links[1] as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(links[0]);
  });
});

describe('defaults', () => {
  it('reads the axes and the messages from the provider, and lets a list win', () => {
    render(
      <TableOfContentsDefaultsProvider
        layout="horizontal"
        messages={{ navigation: 'Secções' }}
        numbered
        size="sm"
        sticky
      >
        <List />
        <List size="lg" />
      </TableOfContentsDefaultsProvider>,
    );
    const [first, second] = screen.getAllByRole('navigation', { name: 'Secções' });
    expect(first?.getAttribute('data-layout')).toBe('horizontal');
    expect(first?.getAttribute('data-size')).toBe('sm');
    expect(first?.hasAttribute('data-numbered')).toBe(true);
    expect(first?.hasAttribute('data-sticky')).toBe(true);
    expect(second?.getAttribute('data-size')).toBe('lg');
  });
});
