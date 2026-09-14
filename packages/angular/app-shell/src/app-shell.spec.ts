import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  SlAppShellNavToggle,
} from './app-shell';
import { provideAppShellDefaults } from './app-shell-defaults';
import type { AppShellOpenRequest } from './app-shell-defaults';

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
    (navOpenChangeRequest)="requests.push($event)"
    (asideOpenChangeRequest)="asideRequests.push($event)"
  >
    <header slAppShellBanner>
      <div slAppShellBrand><button slAppShellNavToggle></button></div>
      <div slAppShellActions><button type="button">Conta</button></div>
    </header>
    <nav slAppShellNav>
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
  readonly canvas = signal<'inset' | 'flush'>('inset');
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

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(host.requests.at(-1)?.reason).toBe('pointer');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Abrir navegação');

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
    expect(root.hasAttribute('data-dividers')).toBe(true);
    expect(root.hasAttribute('data-open')).toBe(true);

    fixture.componentInstance.canvas.set('flush');
    fixture.detectChanges();
    expect(root.getAttribute('data-canvas')).toBe('flush');
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
});
