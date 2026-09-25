import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from './app-shell';
import { AppShellDefaultsProvider } from './app-shell-defaults';
import {
  AppShellActions,
  AppShellAside,
  AppShellAsideBody,
  AppShellAsideHeader,
  AppShellAsideToggle,
  AppShellBanner,
  AppShellBrand,
  AppShellFooter,
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavToggle,
} from './app-shell-parts';
import type { AppShellHandle, AppShellOpenReason, AppShellProps } from './app-shell.types';

/** A click a pointer made reports a detail; one the keyboard synthesised does not. */
const press = (node: Element) => fireEvent.click(node, { detail: 1 });
const activateByKey = (node: Element) => fireEvent.click(node, { detail: 0 });
const escape = () =>
  fireEvent.keyDown(document, { key: 'Escape', bubbles: true, cancelable: true });

function Shell({ children, ...props }: Partial<AppShellProps> = {}) {
  return (
    <AppShell navMode="inline" {...props}>
      <AppShellBanner>
        <AppShellBrand>
          <AppShellNavToggle />
        </AppShellBrand>
        <AppShellActions>
          <button type="button">Conta</button>
        </AppShellActions>
      </AppShellBanner>
      <AppShellNav>
        <AppShellNavBody>
          <a href="#painel">Painel</a>
          <a href="#encomendas">Encomendas</a>
        </AppShellNavBody>
      </AppShellNav>
      <AppShellMain>{children ?? <p>Encomendas</p>}</AppShellMain>
      <AppShellAside>
        <AppShellAsideHeader>
          <span>Detalhe</span>
          <AppShellAsideToggle />
        </AppShellAsideHeader>
        <AppShellAsideBody>
          <p>ENC-4521</p>
        </AppShellAsideBody>
      </AppShellAside>
      <AppShellFooter>
        <small>Aurora 4.2.0</small>
      </AppShellFooter>
    </AppShell>
  );
}

describe('AppShell', () => {
  it('earns five landmarks from the elements, with no role written', () => {
    const { container } = render(<Shell />);

    expect(container.querySelector('[data-part="root"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-part="banner"]')?.tagName).toBe('HEADER');
    expect(container.querySelector('[data-part="nav"]')?.tagName).toBe('NAV');
    expect(container.querySelector('[data-part="main"]')?.tagName).toBe('MAIN');
    expect(container.querySelector('[data-part="aside"]')?.tagName).toBe('ASIDE');
    expect(container.querySelector('[data-part="footer"]')?.tagName).toBe('FOOTER');
    expect(container.querySelectorAll('[role]')).toHaveLength(0);
  });

  /** Without it the link moves the scroll and leaves the focus behind. */
  it('makes the content region focusable, because the skip link lands there', () => {
    render(<Shell />);
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('writes one skip link per region that rendered, and no more', () => {
    const { container, rerender } = render(<Shell />);
    const links = () => [...container.querySelectorAll('[data-part="skip"] a')];

    expect(links().map((link) => link.textContent)).toEqual([
      'Saltar para o conteúdo',
      'Saltar para a navegação',
      'Saltar para o painel lateral',
    ]);
    expect(links()[0]?.getAttribute('href')).toBe(`#${screen.getByRole('main').id}`);

    rerender(
      <AppShell navMode="inline">
        <AppShellMain>
          <p>Só o conteúdo</p>
        </AppShellMain>
      </AppShell>,
    );
    expect(links()).toHaveLength(1);
  });

  it('wires the toggle to the region it controls, by the Disclosure pattern', () => {
    render(<Shell />);
    const toggle = screen.getByRole('button', { name: 'Fechar navegação' });

    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle.getAttribute('aria-controls')).toBe(screen.getByRole('navigation').id);
  });

  it('names the navigation region, and lets an instance rename it', () => {
    const { rerender } = render(<Shell />);
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Navegação principal');

    rerender(
      <AppShell navMode="inline">
        <AppShellNav aria-label="Rotas">
          <AppShellNavBody>
            <a href="#p">Painel</a>
          </AppShellNavBody>
        </AppShellNav>
        <AppShellMain>
          <p>…</p>
        </AppShellMain>
      </AppShell>,
    );
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Rotas');
  });

  it('moves itself when uncontrolled, and says why', () => {
    const onNavOpenChange = vi.fn();
    render(<Shell onNavOpenChange={onNavOpenChange} />);

    press(screen.getByRole('button', { name: 'Fechar navegação' }));

    expect(onNavOpenChange).toHaveBeenCalledTimes(1);
    expect(onNavOpenChange.mock.calls[0]?.[0]).toBe(false);
    expect(onNavOpenChange.mock.calls[0]?.[1].reason).toBe('pointer');
    expect(onNavOpenChange.mock.calls[0]?.[1].previous).toBe(true);
    expect(screen.getByRole('button', { name: 'Abrir navegação' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  /** A click synthesised by the keyboard reports no detail; a real one does. */
  it('tells a press from a keystroke, because a product persists one and not the other', () => {
    const reasons: AppShellOpenReason[] = [];
    render(<Shell onNavOpenChange={(_, request) => reasons.push(request.reason)} />);

    activateByKey(screen.getByRole('button', { name: 'Fechar navegação' }));
    expect(reasons).toEqual(['keyboard']);
  });

  it('reports and waits when controlled, and never moves itself', () => {
    const onNavOpenChange = vi.fn();
    render(<Shell navOpen onNavOpenChange={onNavOpenChange} />);

    press(screen.getByRole('button', { name: 'Fechar navegação' }));

    expect(onNavOpenChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Fechar navegação' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('commits nothing when the consumer cancels the request', () => {
    render(<Shell onNavOpenChange={(_, request) => request.cancel()} />);

    press(screen.getByRole('button', { name: 'Fechar navegação' }));

    expect(screen.getByRole('button', { name: 'Fechar navegação' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('takes the consumer’s own handler first, and composes rather than replaces', () => {
    const order: string[] = [];
    render(
      <AppShell navMode="inline" onNavOpenChange={() => order.push('family')}>
        <AppShellBanner>
          <AppShellBrand>
            <AppShellNavToggle onClick={() => order.push('consumer')} />
          </AppShellBrand>
        </AppShellBanner>
        <AppShellNav>
          <AppShellNavBody>
            <a href="#p">Painel</a>
          </AppShellNavBody>
        </AppShellNav>
        <AppShellMain>
          <p>…</p>
        </AppShellMain>
      </AppShell>,
    );

    press(screen.getByRole('button'));
    expect(order).toEqual(['consumer', 'family']);
  });

  it('lets the consumer’s handler stop the family by preventing the event', () => {
    const onNavOpenChange = vi.fn();
    render(
      <AppShell navMode="inline" onNavOpenChange={onNavOpenChange}>
        <AppShellBanner>
          <AppShellBrand>
            <AppShellNavToggle onClick={(event) => event.preventDefault()} />
          </AppShellBrand>
        </AppShellBanner>
        <AppShellNav>
          <AppShellNavBody>
            <a href="#p">Painel</a>
          </AppShellNavBody>
        </AppShellNav>
        <AppShellMain>
          <p>…</p>
        </AppShellMain>
      </AppShell>,
    );

    press(screen.getByRole('button'));
    expect(onNavOpenChange).not.toHaveBeenCalled();
  });

  it('writes every axis into the DOM, so a consumer can style any of them', () => {
    const { container } = render(
      <Shell
        asideSize="lg"
        canvas="flush"
        collapsedTo="hidden"
        dividers={false}
        navSide="end"
        navSize="sm"
        primary="nav"
        scroll="document"
      />,
    );
    const root = container.querySelector('[data-ui="app-shell"]');

    expect(root).toHaveAttribute('data-primary', 'nav');
    expect(root).toHaveAttribute('data-canvas', 'flush');
    expect(root).toHaveAttribute('data-nav-side', 'end');
    expect(root).toHaveAttribute('data-nav-size', 'sm');
    expect(root).toHaveAttribute('data-aside-size', 'lg');
    expect(root).toHaveAttribute('data-collapsed-to', 'hidden');
    expect(root).toHaveAttribute('data-scroll', 'document');
    expect(root).toHaveAttribute('data-nav-mode', 'inline');
    expect(root).toHaveAttribute('data-open', '');
    expect(root).not.toHaveAttribute('data-dividers');
  });

  it('lets an application state the thirteen axes once, and a shell overrule any of them', () => {
    const { container } = render(
      <AppShellDefaultsProvider canvas="flush" navSize="lg" primary="nav">
        <Shell navSize="sm" />
      </AppShellDefaultsProvider>,
    );
    const root = container.querySelector('[data-ui="app-shell"]');

    expect(root).toHaveAttribute('data-primary', 'nav');
    expect(root).toHaveAttribute('data-canvas', 'flush');
    /* The shell's own value wins over the provider's. */
    expect(root).toHaveAttribute('data-nav-size', 'sm');
  });

  it('takes the strings from the provider, and from the instance over it', () => {
    render(
      <AppShellDefaultsProvider messages={{ close: 'Recolher' }}>
        <Shell />
      </AppShellDefaultsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Recolher' })).toBeInTheDocument();
  });

  /**
   * The overlaid region: a dismissable layer, a focus scope and `inert` on the
   * rest — none of which CSS can hold, which is why the mode is answered twice.
   */
  describe('overlaid', () => {
    it('closes on Escape, and says escape', () => {
      const onNavOpenChange = vi.fn();
      render(<Shell navMode="overlay" onNavOpenChange={onNavOpenChange} />);

      escape();

      expect(onNavOpenChange).toHaveBeenCalledTimes(1);
      expect(onNavOpenChange.mock.calls[0]?.[1].reason).toBe('escape');
    });

    it('refuses Escape when the policy says none', () => {
      const onNavOpenChange = vi.fn();
      render(<Shell escape="none" navMode="overlay" onNavOpenChange={onNavOpenChange} />);

      escape();
      expect(onNavOpenChange).not.toHaveBeenCalled();
    });

    /**
     * The modal contract, whole: the reader is in the panel and everything
     * beside it is inert — the banner and its toggle included, exactly as a
     * dialog's trigger is. The ways out are Escape, the veil, a destination,
     * and whatever the consumer put inside the panel.
     */
    it('makes every region beside it inert while it is modal', () => {
      const { container } = render(<Shell navMode="overlay" />);

      expect(container.querySelector('[data-part="main"]')).toHaveAttribute('inert');
      expect(container.querySelector('[data-part="aside"]')).toHaveAttribute('inert');
      expect(container.querySelector('[data-part="footer"]')).toHaveAttribute('inert');
      expect(container.querySelector('[data-part="banner"]')).toHaveAttribute('inert');
      expect(container.querySelector('[data-part="nav"]')).not.toHaveAttribute('inert');
    });

    /**
     * The stylesheet fades the veil in from `entering` and out through
     * `exiting`, and a veil mounted straight at `open` gives that transition
     * no closed style to start from: it appeared in one frame beside a panel
     * that took two hundred milliseconds to arrive. The presence module holds
     * the two extra statuses, as it does for `dialog`.
     */
    it('fades the veil in through entering, and holds it through exiting', async () => {
      const { container } = render(<Shell defaultNavOpen={false} navMode="overlay" />);
      const scrim = () => container.querySelector('[data-part="scrim"]');
      const frame = () =>
        act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));

      expect(scrim()).toBeNull();

      press(screen.getByRole('button', { name: 'Abrir navegação' }));
      expect(scrim()).toHaveAttribute('data-status', 'entering');

      await frame();
      expect(scrim()).toHaveAttribute('data-status', 'open');

      escape();
      expect(scrim()).toHaveAttribute('data-status', 'exiting');

      await frame();
      expect(scrim()).toBeNull();
    });

    it('inerts nothing when it is not modal, and draws no veil', () => {
      const { container } = render(<Shell modal={false} navMode="overlay" />);

      expect(container.querySelector('[data-part="main"]')).not.toHaveAttribute('inert');
      expect(container.querySelector('[data-part="scrim"]')).toBeNull();
    });

    it('closes when a destination is chosen, and says select', () => {
      const onNavOpenChange = vi.fn();
      render(<Shell navMode="overlay" onNavOpenChange={onNavOpenChange} />);

      const link = screen.getByRole('link', { name: 'Painel' });
      /* The press has to begin where it lands, or the layer reads the click as
         a press that started outside it. */
      fireEvent.pointerDown(link);
      press(link);

      expect(onNavOpenChange.mock.calls.at(-1)?.[1].reason).toBe('select');
    });

    /**
     * A client-side router's link calls preventDefault on its own click before
     * the click reaches the root: React Router's Link and Next's Link both do.
     * Reading defaultPrevented as a refusal kept every routed destination open.
     */
    it('closes on a destination whose router prevented the native navigation', () => {
      const onNavOpenChange = vi.fn();
      render(
        <AppShell navMode="overlay" onNavOpenChange={onNavOpenChange}>
          <AppShellNav>
            <AppShellNavBody>
              <a href="/painel" onClick={(event) => event.preventDefault()}>
                Painel
              </a>
            </AppShellNavBody>
          </AppShellNav>
          <AppShellMain>Encomendas</AppShellMain>
        </AppShell>,
      );

      const link = screen.getByRole('link', { name: 'Painel' });
      fireEvent.pointerDown(link);
      press(link);

      expect(onNavOpenChange.mock.calls.at(-1)?.[1].reason).toBe('select');
    });

    it('leaves the region open on a disabled destination', () => {
      const onNavOpenChange = vi.fn();
      render(
        <AppShell navMode="overlay" onNavOpenChange={onNavOpenChange}>
          <AppShellNav>
            <AppShellNavBody>
              <a aria-disabled="true" href="/painel" onClick={(event) => event.preventDefault()}>
                Painel
              </a>
            </AppShellNavBody>
          </AppShellNav>
          <AppShellMain>Encomendas</AppShellMain>
        </AppShell>,
      );

      const link = screen.getByRole('link', { name: 'Painel' });
      fireEvent.pointerDown(link);
      press(link);

      expect(onNavOpenChange).not.toHaveBeenCalled();
    });

    it('leaves the region open on a destination when the axis says so', () => {
      const onNavOpenChange = vi.fn();
      render(<Shell closeOnNavigate={false} navMode="overlay" onNavOpenChange={onNavOpenChange} />);

      const link = screen.getByRole('link', { name: 'Painel' });
      fireEvent.pointerDown(link);
      press(link);
      expect(onNavOpenChange).not.toHaveBeenCalled();
    });
  });

  it('publishes the imperative actions a prop cannot express', () => {
    function Harness() {
      const [handle, setHandle] = useState<{ openNav: () => void; closeNav: () => void } | null>(
        null,
      );
      return (
        <>
          <button onClick={() => handle?.closeNav()} type="button">
            fechar
          </button>
          <AppShell navMode="inline" ref={setHandle}>
            <AppShellBanner>
              <AppShellBrand>
                <AppShellNavToggle />
              </AppShellBrand>
            </AppShellBanner>
            <AppShellNav>
              <AppShellNavBody>
                <a href="#p">Painel</a>
              </AppShellNavBody>
            </AppShellNav>
            <AppShellMain>
              <p>…</p>
            </AppShellMain>
          </AppShell>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Fechar navegação' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('substitutes the root element and keeps every attribute on it', () => {
    const { container } = render(
      <AppShell data-testid="frame" navMode="inline" render={(props) => <section {...props} />}>
        <AppShellMain>
          <p>…</p>
        </AppShellMain>
      </AppShell>,
    );
    const root = container.querySelector('[data-ui="app-shell"]');

    expect(root?.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-testid', 'frame');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  /**
   * The secondary pane holds the second open state, under the same capability
   * and with the same shape: a pair, a request with a reason, a control wired
   * by context, and a layer composed from the same three modules.
   */
  describe('the secondary pane', () => {
    it('is open by default, says so on the region, and closes from its own control', () => {
      const onAsideOpenChange = vi.fn();
      const { container } = render(
        <Shell asideMode="inline" onAsideOpenChange={onAsideOpenChange} />,
      );
      const aside = container.querySelector('[data-part="aside"]');
      const toggle = screen.getByRole('button', { name: 'Fechar painel lateral' });

      expect(aside).toHaveAttribute('data-open');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveAttribute('aria-controls', aside?.getAttribute('id'));
      /* The root's attribute is the navigation's, and it does not move. */
      expect(container.querySelector('[data-ui="app-shell"]')).toHaveAttribute('data-open');

      press(toggle);
      expect(onAsideOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'pointer' }),
      );
      expect(aside).not.toHaveAttribute('data-open');
      expect(container.querySelector('[data-ui="app-shell"]')).toHaveAttribute('data-open');
      expect(screen.getByRole('button', { name: 'Abrir painel lateral' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    /* The mark says what a press does: the pane closes while it is open. */
    it('draws the panel mark for the press it offers', () => {
      render(<Shell asideMode="inline" />);
      const glyph = (name: string) =>
        screen
          .getByRole('button', { name })
          .querySelector('[data-ui="icon"] > svg[data-glyph]')
          ?.getAttribute('data-glyph');

      expect(glyph('Fechar navegação')).toBe('panel-close');
      expect(glyph('Fechar painel lateral')).toBe('panel-close');

      press(screen.getByRole('button', { name: 'Fechar navegação' }));
      press(screen.getByRole('button', { name: 'Fechar painel lateral' }));
      expect(glyph('Abrir navegação')).toBe('panel-open');
      expect(glyph('Abrir painel lateral')).toBe('panel-open');
    });

    it('starts closed when told, and reports and waits when controlled', () => {
      const onAsideOpenChange = vi.fn();
      const { container, rerender } = render(
        <Shell asideMode="inline" asideOpen={false} onAsideOpenChange={onAsideOpenChange} />,
      );
      const aside = container.querySelector('[data-part="aside"]');
      expect(aside).not.toHaveAttribute('data-open');

      activateByKey(screen.getByRole('button', { name: 'Abrir painel lateral' }));
      expect(onAsideOpenChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ reason: 'keyboard' }),
      );
      expect(aside).not.toHaveAttribute('data-open');

      rerender(<Shell asideMode="inline" asideOpen onAsideOpenChange={onAsideOpenChange} />);
      expect(aside).toHaveAttribute('data-open');
    });

    it('writes no skip link to a pane the reader closed', () => {
      render(<Shell asideMode="inline" defaultAsideOpen={false} />);
      expect(screen.queryByRole('link', { name: 'Saltar para o painel lateral' })).toBeNull();
    });

    it('names the region, and lets an instance rename it', () => {
      const { rerender } = render(<Shell asideMode="inline" />);
      expect(screen.getByRole('complementary', { name: 'Painel lateral' })).toBeInTheDocument();
      rerender(<Shell asideMode="inline" messages={{ aside: 'Detalhe da encomenda' }} />);
      expect(
        screen.getByRole('complementary', { name: 'Detalhe da encomenda' }),
      ).toBeInTheDocument();
    });

    it('publishes the pane on the handle, with the reason programmatic', () => {
      const onAsideOpenChange = vi.fn();
      function Harness() {
        const ref = useRef<AppShellHandle | null>(null);
        return (
          <>
            <button onClick={() => ref.current?.closeAside()} type="button">
              fechar
            </button>
            <Shell asideMode="inline" onAsideOpenChange={onAsideOpenChange} ref={ref} />
          </>
        );
      }
      render(<Harness />);
      press(screen.getByRole('button', { name: 'fechar' }));
      expect(onAsideOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'programmatic' }),
      );
    });

    it('lets an application set the pane mode once', () => {
      const { container } = render(
        <AppShellDefaultsProvider asideMode="overlay">
          <Shell />
        </AppShellDefaultsProvider>,
      );
      expect(container.querySelector('[data-ui="app-shell"]')).toHaveAttribute(
        'data-aside-mode',
        'overlay',
      );
    });

    describe('overlaid', () => {
      it('closes on Escape, and says escape', () => {
        const onAsideOpenChange = vi.fn();
        render(<Shell asideMode="overlay" onAsideOpenChange={onAsideOpenChange} />);
        escape();
        expect(onAsideOpenChange).toHaveBeenCalledTimes(1);
        expect(onAsideOpenChange.mock.calls[0]?.[1].reason).toBe('escape');
      });

      it('makes every region beside it inert while it is modal, the navigation included', () => {
        const { container } = render(<Shell asideMode="overlay" />);
        expect(container.querySelector('[data-part="main"]')).toHaveAttribute('inert');
        expect(container.querySelector('[data-part="nav"]')).toHaveAttribute('inert');
        expect(container.querySelector('[data-part="banner"]')).toHaveAttribute('inert');
        expect(container.querySelector('[data-part="aside"]')).not.toHaveAttribute('inert');
        expect(container.querySelector('[data-part="scrim"]')).not.toBeNull();
      });

      it('returns focus to the control that opened it', () => {
        render(<Shell asideMode="overlay" defaultAsideOpen={false} />);
        const open = screen.getByRole('button', { name: 'Abrir painel lateral' });
        open.focus();
        press(open);
        escape();
        expect(document.activeElement).toBe(open);
      });
    });
  });
});
