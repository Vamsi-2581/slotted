import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  SlAppShell,
  SlAppShellActions,
  SlAppShellAside,
  SlAppShellAsideBody,
  SlAppShellAsideHeader,
  SlAppShellAsideToggle,
  SlAppShellBanner,
  SlAppShellBrand,
  SlAppShellFooter,
  SlAppShellMain,
  SlAppShellNav,
  SlAppShellNavBody,
  SlAppShellNavRail,
  SlAppShellNavToggle,
} from './app-shell';
import { provideAppShellDefaults } from './app-shell-defaults';
import type {
  AppShellCanvas,
  AppShellOpenRequest,
  AppShellPrimary,
  AppShellSeparation,
} from './app-shell-defaults';

const PARTS = [
  SlAppShell,
  SlAppShellActions,
  SlAppShellAside,
  SlAppShellAsideBody,
  SlAppShellAsideHeader,
  SlAppShellAsideToggle,
  SlAppShellBanner,
  SlAppShellBrand,
  SlAppShellFooter,
  SlAppShellMain,
  SlAppShellNav,
  SlAppShellNavBody,
  SlAppShellNavRail,
  SlAppShellNavToggle,
];

@Component({
  standalone: true,
  imports: PARTS,
  template: `<div
    slAppShell
    #shell="slAppShell"
    navMode="inline"
    asideMode="inline"
    [(navOpen)]="open"
    [(asideOpen)]="asideOpen"
    [canvas]="canvas()"
    [primary]="primary()"
    [separation]="separation()"
    (navOpenChangeRequest)="requests.push($event)"
    (asideOpenChangeRequest)="asideRequests.push($event)"
  >
    <header slAppShellBanner>
      <div slAppShellBrand><button slAppShellNavToggle></button></div>
      <div slAppShellActions><button type="button">Conta</button></div>
    </header>
    <nav slAppShellNav>
      <div slAppShellNavRail class="rail" aria-label="Secções"><a href="#vendas">Vendas</a></div>
      <div slAppShellNavBody><a href="#painel">Painel</a></div>
    </nav>
    <main slAppShellMain>Encomendas</main>
    <aside slAppShellAside>
      <div slAppShellAsideHeader><span>Detalhe</span><button slAppShellAsideToggle></button></div>
      <div slAppShellAsideBody>ENC-4521</div>
    </aside>
    <footer slAppShellFooter>Aurora 4.2.0</footer>
  </div>`,
})
class Host {
  readonly open = signal(true);
  readonly asideOpen = signal(true);
  readonly asideRequests: AppShellOpenRequest[] = [];
  readonly canvas = signal<AppShellCanvas>('inset');
  readonly primary = signal<AppShellPrimary | undefined>(undefined);
  readonly separation = signal<AppShellSeparation | undefined>(undefined);
  readonly requests: AppShellOpenRequest[] = [];
}

@Component({
  standalone: true,
  imports: PARTS,
  template: `<div
    slAppShell
    navMode="inline"
    [(navOpen)]="open"
    (navOpenChangeRequest)="$event.cancel()"
  >
    <header slAppShellBanner>
      <div slAppShellBrand><button slAppShellNavToggle></button></div>
    </header>
    <nav slAppShellNav>
      <div slAppShellNavBody><a href="#painel">Painel</a></div>
    </nav>
    <main slAppShellMain>Encomendas</main>
  </div>`,
})
class CancellingHost {
  readonly open = signal(true);
}

@Component({
  standalone: true,
  imports: PARTS,
  template: `<div
    slAppShell
    navMode="overlay"
    asideMode="overlay"
    [(navOpen)]="open"
    [(asideOpen)]="asideOpen"
    (navOpenChangeRequest)="requests.push($event)"
    (asideOpenChangeRequest)="requests.push($event)"
  >
    <header slAppShellBanner>
      <div slAppShellBrand><button slAppShellNavToggle></button></div>
    </header>
    <nav slAppShellNav>
      <div slAppShellNavBody><a href="#painel">Painel</a></div>
    </nav>
    <main slAppShellMain>Encomendas</main>
    <aside slAppShellAside><div slAppShellAsideBody>ENC-4521</div></aside>
  </div>`,
})
class ForcedHost {
  readonly open = signal(true);
  readonly asideOpen = signal(true);
  readonly requests: AppShellOpenRequest[] = [];
}

@Component({
  standalone: true,
  imports: PARTS,
  template: `<div slAppShell navMode="overlay" [(navOpen)]="open">
    <header slAppShellBanner>
      <div slAppShellBrand><button slAppShellNavToggle></button></div>
    </header>
    <nav slAppShellNav>
      <div slAppShellNavBody><a href="#painel">Painel</a></div>
    </nav>
    <main slAppShellMain>Encomendas</main>
  </div>`,
})
class ClosedOverlayHost {
  readonly open = signal(false);
}

@Component({
  standalone: true,
  imports: [...PARTS, RouterLink],
  template: `<div slAppShell navMode="overlay" [(navOpen)]="open">
    <nav slAppShellNav>
      <div slAppShellNavBody>
        <a routerLink="/painel">Painel</a>
        <a routerLink="/cargas" aria-disabled="true" (click)="$event.preventDefault()">Cargas</a>
      </div>
    </nav>
    <main slAppShellMain>Encomendas</main>
  </div>`,
})
class RoutedHost {
  readonly open = signal(true);
}

@Component({ standalone: true, template: '' })
class Destination {}

function setup(providers: unknown[] = []) {
  TestBed.configureTestingModule({ imports: [Host], providers: providers as never[] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

const query = (fixture: ReturnType<typeof setup>, selector: string) =>
  fixture.nativeElement.querySelector(selector) as HTMLElement;

describe('SlAppShell', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('earns five landmarks from the elements, with no role written', () => {
    const fixture = setup();

    expect(query(fixture, '[data-part="root"]').tagName).toBe('DIV');
    expect(query(fixture, '[data-part="banner"]').tagName).toBe('HEADER');
    expect(query(fixture, '[data-part="nav"]').tagName).toBe('NAV');
    expect(query(fixture, '[data-part="main"]').tagName).toBe('MAIN');
    expect(query(fixture, '[data-part="aside"]').tagName).toBe('ASIDE');
    expect(query(fixture, '[data-part="footer"]').tagName).toBe('FOOTER');
    expect(fixture.nativeElement.querySelectorAll('[role]')).toHaveLength(0);
  });

  /** Without it the link moves the scroll and leaves the focus behind. */
  it('makes the content region focusable, because the skip link lands there', () => {
    const fixture = setup();
    expect(query(fixture, '[data-part="main"]').getAttribute('tabindex')).toBe('-1');
  });

  it('writes one skip link per region that rendered', () => {
    const fixture = setup();
    const links = [...fixture.nativeElement.querySelectorAll('[data-part="skip"] a')];

    expect(links.map((link: HTMLAnchorElement) => link.textContent?.trim())).toEqual([
      'Saltar para o conteúdo',
      'Saltar para a navegação',
      'Saltar para o painel lateral',
    ]);
    expect(links[0]?.getAttribute('href')).toBe(`#${query(fixture, '[data-part="main"]').id}`);
  });

  it('wires the toggle to the region it controls, by the Disclosure pattern', () => {
    const fixture = setup();
    const toggle = query(fixture, '[data-part="nav-toggle"]');

    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe(query(fixture, '[data-part="nav"]').id);
    expect(toggle.getAttribute('aria-label')).toBe('Fechar navegação');
  });

  it('names the navigation region from the family’s own strings', () => {
    const fixture = setup();
    expect(query(fixture, '[data-part="nav"]').getAttribute('aria-label')).toBe(
      'Navegação principal',
    );
  });

  it('moves the two-way value and says why, telling a press from a keystroke', () => {
    const fixture = setup();
    const host = fixture.componentInstance;
    const toggle = query(fixture, '[data-part="nav-toggle"]');

    const glyph = () =>
      toggle.querySelector('[data-ui="icon"] > svg[data-glyph]')?.getAttribute('data-glyph');
    /* The mark says what a press does: the region closes while it is open. */
    expect(glyph()).toBe('panel-close');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(host.requests.at(-1)?.reason).toBe('pointer');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Abrir navegação');
    expect(glyph()).toBe('panel-open');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    fixture.detectChanges();
    expect(host.open()).toBe(true);
    expect(host.requests.at(-1)?.reason).toBe('keyboard');
  });

  it('commits nothing when the consumer cancels the request', () => {
    TestBed.configureTestingModule({ imports: [CancellingHost] });
    const fixture = TestBed.createComponent(CancellingHost);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('[data-part="nav-toggle"]') as HTMLElement;
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('writes every axis into the DOM, so a consumer can style any of them', () => {
    const fixture = setup();
    const root = query(fixture, '[data-ui="app-shell"]');

    expect(root.getAttribute('data-primary')).toBe('banner');
    expect(root.getAttribute('data-canvas')).toBe('inset');
    expect(root.getAttribute('data-nav-mode')).toBe('inline');
    expect(root.getAttribute('data-nav-side')).toBe('start');
    expect(root.getAttribute('data-nav-size')).toBe('md');
    expect(root.getAttribute('data-aside-size')).toBe('md');
    expect(root.getAttribute('data-collapsed-to')).toBe('rail');
    expect(root.getAttribute('data-scroll')).toBe('content');
    expect(root.getAttribute('data-separation')).toBe('rule');
    expect(root.hasAttribute('data-dividers')).toBe(false);
    expect(root.hasAttribute('data-open')).toBe(true);

    fixture.componentInstance.canvas.set('flush');
    fixture.detectChanges();
    expect(root.getAttribute('data-canvas')).toBe('flush');
  });

  it('draws every canvas, every primary region and both separations it declares', () => {
    const fixture = setup();
    const root = query(fixture, '[data-ui="app-shell"]');

    fixture.componentInstance.canvas.set('floating');
    fixture.componentInstance.primary.set('main');
    fixture.componentInstance.separation.set('tone');
    fixture.detectChanges();
    expect(root.getAttribute('data-canvas')).toBe('floating');
    expect(root.getAttribute('data-primary')).toBe('main');
    expect(root.getAttribute('data-separation')).toBe('tone');

    fixture.componentInstance.canvas.set('panel');
    fixture.detectChanges();
    expect(root.getAttribute('data-canvas')).toBe('panel');
  });

  it('takes the separation from the provider, and an instance overrules it', () => {
    const fixture = setup([provideAppShellDefaults({ separation: 'tone' })]);
    const root = query(fixture, '[data-ui="app-shell"]');
    expect(root.getAttribute('data-separation')).toBe('tone');

    fixture.componentInstance.separation.set('rule');
    fixture.detectChanges();
    expect(root.getAttribute('data-separation')).toBe('rule');
  });

  it('renders a rail of its own inside the one navigation landmark', () => {
    const fixture = setup();
    const rail = query(fixture, '.rail');

    expect(rail.getAttribute('data-part')).toBe('nav-rail');
    expect(rail.getAttribute('aria-label')).toBe('Secções');
    expect(rail.parentElement?.getAttribute('data-part')).toBe('nav');
    expect(fixture.nativeElement.querySelectorAll('nav').length).toBe(1);
  });

  it('lets an application state the axes once, and an instance overrule any of them', () => {
    const fixture = setup([provideAppShellDefaults({ navSize: 'lg', primary: 'nav' })]);
    const root = query(fixture, '[data-ui="app-shell"]');

    expect(root.getAttribute('data-primary')).toBe('nav');
    expect(root.getAttribute('data-nav-size')).toBe('lg');
    /* The template writes navMode itself, and the instance still wins. */
    expect(root.getAttribute('data-nav-mode')).toBe('inline');
  });

  it('takes the strings from the provider', () => {
    const fixture = setup([provideAppShellDefaults({ messages: { close: 'Recolher' } })]);
    expect(query(fixture, '[data-part="nav-toggle"]').getAttribute('aria-label')).toBe('Recolher');
  });

  it('publishes the imperative actions an input cannot express', () => {
    const fixture = setup();
    const shell = fixture.debugElement.children[0]?.injector.get(SlAppShell);

    shell?.closeNav();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.requests.at(-1)?.reason).toBe('programmatic');

    shell?.openNav();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
  });

  /**
   * The secondary pane holds the second open state, under the same capability
   * and with the same shape: a two-way model, a request with a reason, a
   * control wired by the shell, and its own attribute on the region.
   */
  describe('the secondary pane', () => {
    it('is open by default, says so on the region, and closes from its own control', () => {
      const fixture = setup();
      const host = fixture.componentInstance;
      const aside = query(fixture, '[data-part="aside"]');
      const toggle = query(fixture, '[data-part="aside-toggle"]');

      expect(aside.hasAttribute('data-open')).toBe(true);
      expect(aside.getAttribute('aria-label')).toBe('Painel lateral');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.getAttribute('aria-controls')).toBe(aside.getAttribute('id'));
      expect(toggle.getAttribute('aria-label')).toBe('Fechar painel lateral');

      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      fixture.detectChanges();
      expect(host.asideOpen()).toBe(false);
      expect(host.asideRequests.at(-1)?.reason).toBe('pointer');
      expect(aside.hasAttribute('data-open')).toBe(false);
      /* The host's attribute is the navigation's, and it does not move. */
      expect(query(fixture, '[data-part="root"]').hasAttribute('data-open')).toBe(true);
      expect(toggle.getAttribute('aria-label')).toBe('Abrir painel lateral');
    });

    it('writes no skip link to a pane the reader closed', () => {
      const fixture = setup();
      fixture.componentInstance.asideOpen.set(false);
      fixture.detectChanges();
      const labels = [...fixture.nativeElement.querySelectorAll('[data-part="skip"] a')].map(
        (a: Element) => a.textContent?.trim(),
      );
      expect(labels).not.toContain('Saltar para o painel lateral');
    });

    it('publishes the pane on the instance, with the reason programmatic', () => {
      const fixture = setup();
      const shell = fixture.debugElement.children[0]?.injector.get(SlAppShell);

      shell?.closeAside();
      fixture.detectChanges();
      expect(fixture.componentInstance.asideOpen()).toBe(false);
      expect(fixture.componentInstance.asideRequests.at(-1)?.reason).toBe('programmatic');

      shell?.openAside();
      fixture.detectChanges();
      expect(fixture.componentInstance.asideOpen()).toBe(true);
    });

    it('writes the pane mode into the DOM, from the provider when the instance says nothing', () => {
      TestBed.configureTestingModule({
        imports: [CancellingHost],
        providers: [provideAppShellDefaults({ asideMode: 'overlay' })],
      });
      const fixture = TestBed.createComponent(CancellingHost);
      fixture.detectChanges();
      const root = fixture.nativeElement.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.getAttribute('data-aside-mode')).toBe('overlay');
    });

    it('lets the instance win over the provider', () => {
      const stated = setup([provideAppShellDefaults({ asideMode: 'overlay' })]);
      expect(query(stated, '[data-part="root"]').getAttribute('data-aside-mode')).toBe('inline');
    });
  });

  /**
   * A mode forced to overlay is where the region starts, not a width it
   * crossed: the first run of the crossing effect closed a region the template
   * had just opened, and the overlay scenes photographed a closed panel.
   */
  it('keeps a region the template opened in a forced overlay mode open', async () => {
    TestBed.configureTestingModule({ imports: [ForcedHost] });
    const fixture = TestBed.createComponent(ForcedHost);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(host.open()).toBe(true);
    expect(host.asideOpen()).toBe(true);
    expect(host.requests).toEqual([]);
  });

  /**
   * The stylesheet fades the veil in from `entering` and out through
   * `exiting`, and a veil mounted straight at `open` gives that transition no
   * closed style to start from: it appeared in one frame beside a panel that
   * took two hundred milliseconds to arrive. The presence module holds the two
   * extra statuses, as it does for `dialog`.
   */
  it('fades the veil in through entering, and holds it through exiting', async () => {
    TestBed.configureTestingModule({ imports: [ClosedOverlayHost] });
    const fixture = TestBed.createComponent(ClosedOverlayHost);
    fixture.detectChanges();
    const scrim = () =>
      fixture.nativeElement.querySelector('[data-part="scrim"]') as HTMLElement | null;
    const frame = async () => {
      await new Promise<void>((done) => requestAnimationFrame(() => done()));
      fixture.detectChanges();
    };

    expect(scrim()).toBeNull();

    query(fixture as never, '[data-part="nav-toggle"]').dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1 }),
    );
    fixture.detectChanges();
    expect(scrim()?.getAttribute('data-status')).toBe('entering');

    await frame();
    expect(scrim()?.getAttribute('data-status')).toBe('open');

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(scrim()?.getAttribute('data-status')).toBe('exiting');

    await frame();
    expect(scrim()).toBeNull();
  });

  describe('a destination in the overlaid navigation', () => {
    async function routed() {
      TestBed.configureTestingModule({
        imports: [RoutedHost],
        providers: [provideRouter([{ path: '**', component: Destination }])],
      });
      const fixture = TestBed.createComponent(RoutedHost);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const choose = async (name: string) => {
        const link = [...fixture.nativeElement.querySelectorAll('a')].find(
          (a: HTMLAnchorElement) => a.textContent?.trim() === name,
        ) as HTMLAnchorElement;
        link.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
        fixture.detectChanges();
        await fixture.whenStable();
      };
      return { fixture, choose };
    }

    /**
     * RouterLink calls preventDefault on its anchor's click before the click
     * reaches the root. Reading defaultPrevented as a refusal kept every
     * routed destination open, and a phone paid two taps per destination.
     */
    it('closes on a RouterLink, whose router prevented the native navigation', async () => {
      const { fixture, choose } = await routed();
      await choose('Painel');
      expect(fixture.componentInstance.open()).toBe(false);
    });

    it('stays open on a disabled destination', async () => {
      const { fixture, choose } = await routed();
      await choose('Cargas');
      expect(fixture.componentInstance.open()).toBe(true);
    });
  });
});
