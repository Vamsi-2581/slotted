import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { provideSlotted } from '@slotted/angular/i18n';
import { PT_BR } from '@slotted/core/i18n/pt-BR';

import type { ChangeRequest } from '@slotted/core/state';
import { SlAppShell, SlAppShellBanner } from '@slotted/angular/app-shell';
import contract from '../../../../specs/components/top-navigation/contract.json';
import { SlTopNavigation } from './top-navigation';
import { provideTopNavigationDefaults } from './top-navigation-defaults';
import type { TopNavigationSize } from './top-navigation-defaults';
import {
  SlTopNavigationAccount,
  SlTopNavigationAction,
  SlTopNavigationActions,
  SlTopNavigationBrand,
  SlTopNavigationContext,
  SlTopNavigationCount,
  SlTopNavigationHelp,
  SlTopNavigationHome,
  SlTopNavigationItem,
  SlTopNavigationLink,
  SlTopNavigationList,
  SlTopNavigationMark,
  SlTopNavigationName,
  SlTopNavigationNav,
  SlTopNavigationNotifications,
  SlTopNavigationSearch,
  SlTopNavigationTrigger,
} from './top-navigation-parts';
import {
  SlNavigationMenuContent,
  SlNavigationMenuLink,
  SlNavigationMenuLinks,
} from '@slotted/angular/navigation-menu';

const PARTS = [
  SlNavigationMenuContent,
  SlNavigationMenuLink,
  SlNavigationMenuLinks,
  SlTopNavigation,
  SlTopNavigationBrand,
  SlTopNavigationHome,
  SlTopNavigationMark,
  SlTopNavigationName,
  SlTopNavigationContext,
  SlTopNavigationNav,
  SlTopNavigationList,
  SlTopNavigationItem,
  SlTopNavigationLink,
  SlTopNavigationTrigger,
  SlTopNavigationSearch,
  SlTopNavigationActions,
  SlTopNavigationHelp,
  SlTopNavigationNotifications,
  SlTopNavigationCount,
  SlTopNavigationAccount,
  SlTopNavigationAction,
];

const BAR = `<div slTopNavigationBrand>
  <a slTopNavigationHome href="#inicio">
    <span slTopNavigationMark><svg></svg></span>
    <span slTopNavigationName>Aurora Logística</span>
  </a>
</div>
<div slTopNavigationContext><span>Homologação</span></div>
<nav slTopNavigationNav>
  <ul slTopNavigationList>
    <li slTopNavigationItem value="painel" priority="high">
      <a slTopNavigationLink href="#painel">Painel</a>
    </li>
    <li slTopNavigationItem value="rotas"><a slTopNavigationLink href="#rotas">Rotas</a></li>
    <li slTopNavigationItem value="frota">
      <button slTopNavigationTrigger>Frota</button>
      <div slNavigationMenuContent>
        <ul slNavigationMenuLinks><li><a slNavigationMenuLink href="#veiculos">Veículos</a></li></ul>
      </div>
    </li>
    <li slTopNavigationItem value="relatorios" priority="low">
      <a slTopNavigationLink href="#relatorios">Relatórios</a>
    </li>
    <li slTopNavigationItem value="faturacao" priority="low" disabled>
      <a slTopNavigationLink href="#faturacao">Faturação</a>
    </li>
  </ul>
</nav>
<div slTopNavigationSearch><input aria-label="Procurar" type="search" /></div>
<div slTopNavigationActions>
  <a slTopNavigationHelp href="#ajuda"></a>
  <button slTopNavigationAction [label]="approvalsLabel()"><svg></svg><span slTopNavigationCount>7</span></button>
  <button slTopNavigationNotifications><span slTopNavigationCount>3</span></button>
  <button slTopNavigationAccount><span>AB</span></button>
</div>`;

@Component({
  standalone: true,
  imports: PARTS,
  template: `<header
    slTopNavigation
    skipTo="conteudo"
    [(value)]="value"
    [(moreOpen)]="moreOpen"
    [(searchOpen)]="searchOpen"
    [size]="size()"
    [frame]="frame()"
    (valueChangeRequest)="valueRequests.push($event)"
    (moreOpenChangeRequest)="moreRequests.push($event)"
    (searchOpenChangeRequest)="searchRequests.push($event)"
    (collapseChange)="collapses.push($event)"
  >
    ${BAR}
  </header>`,
})
class Host {
  readonly bar = viewChild.required(SlTopNavigation);
  readonly value = signal<string | null>(null);
  readonly moreOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly size = signal<TopNavigationSize | undefined>(undefined);
  readonly frame = signal<boolean | undefined>(undefined);
  readonly valueRequests: ChangeRequest<string | null>[] = [];
  readonly moreRequests: ChangeRequest<boolean>[] = [];
  readonly searchRequests: ChangeRequest<boolean>[] = [];
  readonly collapses: (readonly string[])[] = [];
  readonly approvalsLabel = signal('Aprovações, 7 pendentes');
}

@Component({
  standalone: true,
  imports: [...PARTS, SlAppShell, SlAppShellBanner],
  template: `<div slAppShell>
    <header slAppShellBanner><div slTopNavigation>${BAR}</div></header>
  </div>`,
})
class InShell {
  readonly approvalsLabel = signal('Aprovações, 7 pendentes');
}

@Component({
  standalone: true,
  imports: PARTS,
  providers: [provideTopNavigationDefaults({ frame: false, size: 'lg' })],
  template: `<header slTopNavigation [messages]="{ more: 'Outros' }">${BAR}</header>`,
})
class WithDefaults {
  readonly approvalsLabel = signal('Aprovações, 7 pendentes');
}

/**
 * jsdom lays nothing out, so the bar's width is what this says it is: the
 * width gate reads `getBoundingClientRect` on the root, and nought means
 * "not measured", not "narrow".
 */
function widthOf(pixels: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    /* The directive's own attribute, which is on the element before the host attributes are. */
    const width = this.hasAttribute('slTopNavigation') ? pixels : 0;
    return { bottom: 0, height: 0, left: 0, right: width, top: 0, width, x: 0, y: 0 } as DOMRect;
  });
}

/** The bars the tests read are in Brazilian Portuguese: the words come from the pt-BR catalog. */
const locale = signal('pt-BR');

describe('SlTopNavigation', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const root = () =>
    fixture.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
  const part = (name: string) =>
    fixture.nativeElement.querySelector(`[data-part="${name}"]`) as HTMLElement;
  const item = (value: string) =>
    fixture.nativeElement.querySelector(`[data-part="item"][data-value="${value}"]`) as HTMLElement;
  const link = (value: string) => item(value).querySelector('[data-part="link"]') as HTMLElement;
  const click = (element: HTMLElement, detail = 1) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail }));
    fixture.detectChanges();
  };
  const key = (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }));
    fixture.detectChanges();
  };

  async function mount(width: number) {
    widthOf(width);
    locale.set('pt-BR');
    await TestBed.configureTestingModule({
      imports: [Host, InShell, WithDefaults],
      providers: [provideSlotted({ locale, catalogs: { 'pt-BR': PT_BR } })],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders every part the contract declares', async () => {
    await mount(1280);
    for (const name of contract.members.topNavigation.parts) {
      expect(fixture.nativeElement.querySelector(`[data-part="${name}"]`), name).not.toBeNull();
    }
    expect(root().hasAttribute('data-frame')).toBe(true);
    expect(root().getAttribute('data-size')).toBe('md');
    expect(part('nav').getAttribute('aria-label')).toBe('Navegação');
    expect(part('skip').getAttribute('href')).toBe('#conteudo');
    expect(part('skip').textContent?.trim()).toBe('Pular para o conteúdo');
    /* The panel stands right after the nav, so Tab from more lands in it. */
    expect(part('nav').nextElementSibling).toBe(part('panel'));
  });

  it('follows a change of the language in place', async () => {
    await mount(1280);
    locale.set('en-US');
    fixture.detectChanges();
    expect(part('nav').getAttribute('aria-label')).toBe('Navigation');
    expect(part('skip').textContent?.trim()).toBe('Skip to content');
    expect(part('more').getAttribute('aria-label')).toBe('More');
  });

  /** The shell's banner is already the banner landmark and already paints. */
  it('paints no frame inside app-shell', async () => {
    await mount(1280);
    const shell = TestBed.createComponent(InShell);
    shell.detectChanges();
    const inside = shell.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
    expect(inside.hasAttribute('data-frame')).toBe(false);

    host.frame.set(false);
    fixture.detectChanges();
    expect(root().hasAttribute('data-frame')).toBe(false);
  });

  it('names every icon-only control and puts the count inside the bell', async () => {
    await mount(1280);
    expect(part('help').textContent?.trim()).toBe('Ajuda');
    expect(part('help').hasAttribute('aria-label')).toBe(false);
    expect(part('notifications').getAttribute('aria-label')).toBe('Notificações');
    expect(part('notifications').querySelector('[data-part="count"]')).not.toBeNull();
    expect(part('account').getAttribute('aria-label')).toBe('Conta');
    expect(part('more').getAttribute('aria-label')).toBe('Mais');
    expect(part('more').getAttribute('aria-expanded')).toBe('false');
    expect(part('more').getAttribute('aria-controls')).toBe(part('panel').id);
    expect(part('search-toggle').getAttribute('aria-label')).toBe('Pesquisar');
    expect(part('trigger').querySelector('[data-part="indicator"]')).not.toBeNull();

    /* Each control leads with the family's mark, and the section's trigger ends in one. */
    const mark = (name: string) =>
      part(name).firstElementChild?.querySelector('svg[data-glyph]')?.getAttribute('data-glyph');
    expect(mark('more')).toBe('ellipsis');
    expect(mark('search-toggle')).toBe('search');
    expect(mark('help')).toBe('circle-question');
    expect(mark('notifications')).toBe('bell');
    expect(mark('search-close')).toBe('x');
    expect(
      part('trigger').querySelector(
        '[data-part="indicator"] > [data-ui="icon"] > svg[data-glyph="chevron-down"]',
      ),
    ).not.toBeNull();
  });

  it('names a control of the product’s own from label, live, and keeps the count inside it', async () => {
    await mount(1280);
    const action = part('action');
    expect(action.tagName).toBe('BUTTON');
    expect(action.getAttribute('type')).toBe('button');
    expect(action.getAttribute('aria-label')).toBe('Aprovações, 7 pendentes');
    expect(action.contains(action.querySelector('[data-part="count"]'))).toBe(true);
    host.approvalsLabel.set('Aprovações, 8 pendentes');
    fixture.detectChanges();
    expect(action.getAttribute('aria-label')).toBe('Aprovações, 8 pendentes');
  });

  it('marks the current destination on the link and asks value to move on a press', async () => {
    await mount(1280);
    host.value.set('painel');
    fixture.detectChanges();
    expect(link('painel').getAttribute('aria-current')).toBe('page');
    expect(item('painel').hasAttribute('data-current')).toBe(true);
    click(link('rotas'));
    expect(host.valueRequests.at(-1)).toMatchObject({ reason: 'pointer', value: 'rotas' });
    expect(host.value()).toBe('rotas');
    expect(link('painel').hasAttribute('aria-current')).toBe(false);
    click(link('painel'), 0);
    expect(host.valueRequests.at(-1)).toMatchObject({ reason: 'keyboard', value: 'painel' });
  });

  it('refuses a disabled link and keeps its destination', async () => {
    await mount(1280);
    expect(link('faturacao').getAttribute('aria-disabled')).toBe('true');
    expect(link('faturacao').getAttribute('href')).toBe('#faturacao');
    click(link('faturacao'));
    expect(host.valueRequests).toHaveLength(0);
  });

  it('folds nothing at 1280 and the low items at 1000, counting them on more', async () => {
    await mount(1280);
    expect(fixture.nativeElement.querySelectorAll('[data-collapsed]')).toHaveLength(0);
    expect(part('more').hasAttribute('data-overflow')).toBe(false);
    expect(host.collapses).toHaveLength(0);
    fixture.destroy();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();

    await mount(1000);
    expect(item('relatorios').hasAttribute('data-collapsed')).toBe(true);
    expect(item('faturacao').hasAttribute('data-collapsed')).toBe(true);
    expect(item('rotas').hasAttribute('data-collapsed')).toBe(false);
    expect(part('more').getAttribute('data-overflow')).toBe('2');
    expect(part('more').getAttribute('aria-label')).toBe('Mais, 2');
    expect(host.collapses.at(-1)).toEqual(['relatorios', 'faturacao']);
  });

  it('moves the context to the panel under 600, and help only under 480', async () => {
    await mount(560);
    click(part('more'));
    expect(part('panel').firstElementChild).toBe(part('context'));
    expect(part('panel').contains(part('help'))).toBe(false);
  });

  it('folds the high items under 480 and marks more current', async () => {
    await mount(400);
    host.value.set('painel');
    fixture.detectChanges();
    expect(item('painel').hasAttribute('data-collapsed')).toBe(true);
    expect(part('more').getAttribute('data-overflow')).toBe('5');
    expect(part('more').hasAttribute('data-current')).toBe(true);
  });

  it('opens the panel from more and moves the folded items into it, the same elements', async () => {
    await mount(400);
    const rotas = item('rotas');
    const help = part('help');
    const context = part('context');
    expect(part('panel').hasAttribute('data-open')).toBe(false);
    expect(part('panel-list').children).toHaveLength(0);

    click(part('more'));
    expect(host.moreRequests.at(-1)).toMatchObject({ reason: 'pointer', value: true });
    expect(part('more').getAttribute('aria-expanded')).toBe('true');
    expect(part('panel').hasAttribute('data-open')).toBe(true);
    expect(part('panel-list').contains(rotas)).toBe(true);
    expect(item('rotas')).toBe(rotas);
    expect(
      [...part('panel-list').children].map((child) => child.getAttribute('data-value')),
    ).toEqual(['painel', 'rotas', 'frota', 'relatorios', 'faturacao']);
    expect(part('panel').firstElementChild).toBe(context);
    expect(part('panel').lastElementChild).toBe(help);
    expect(part('list').contains(rotas)).toBe(false);
  });

  it('closes the panel when a link inside it is pressed, with the reason select', async () => {
    await mount(400);
    click(part('more'));
    click(link('rotas'));
    expect(host.moreRequests.at(-1)).toMatchObject({ reason: 'select', value: false });
    expect(part('panel').hasAttribute('data-open')).toBe(false);
  });

  it('is a navigation menu: the nav carries both identities and a section opens its panel', async () => {
    await mount(1280);
    const nav = part('nav');
    expect(nav.getAttribute('data-ui')).toBe('navigation-menu');
    expect(nav.getAttribute('data-part')).toBe('nav');
    expect(nav.getAttribute('aria-label')).toBe('Navegação');
    const trigger = item('frota').querySelector('[data-part="trigger"]') as HTMLElement;
    const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
    expect(trigger.nextElementSibling).toBe(panel);
    expect(panel?.hidden).toBe(true);
    click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(item('frota').hasAttribute('data-open')).toBe(true);
    expect(panel?.hidden).toBe(false);
  });

  it('opens a folded section in line inside the panel, and a link there closes both', async () => {
    await mount(400);
    click(part('more'));
    expect(part('panel-list').contains(item('frota'))).toBe(true);
    const trigger = item('frota').querySelector('[data-part="trigger"]') as HTMLElement;
    click(trigger);
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(
      part('nav').querySelector(':scope > [data-part="viewport"]')?.hasAttribute('data-open'),
    ).toBe(false);
    click(fixture.nativeElement.querySelector('a[href="#veiculos"]') as HTMLElement);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.moreRequests.at(-1)).toMatchObject({ reason: 'select', value: false });
  });

  it('closes the panel on Escape and returns focus to more', async () => {
    await mount(400);
    click(part('more'));
    link('rotas').focus();
    key(link('rotas'), 'Escape');
    expect(host.moreRequests.at(-1)).toMatchObject({ reason: 'escape', value: false });
    expect(document.activeElement).toBe(part('more'));
  });

  it('opens the search over the bar under 600, focuses the field, and closes on Escape', async () => {
    await mount(560);
    expect(root().hasAttribute('data-search-open')).toBe(false);
    click(part('search-toggle'));
    expect(host.searchRequests.at(-1)).toMatchObject({ reason: 'pointer', value: true });
    expect(root().hasAttribute('data-search-open')).toBe(true);
    const field = fixture.nativeElement.querySelector('input') as HTMLElement;
    expect(document.activeElement).toBe(field);

    key(field, 'Escape');
    expect(host.searchRequests.at(-1)).toMatchObject({ reason: 'escape', value: false });
    expect(root().hasAttribute('data-search-open')).toBe(false);
    expect(document.activeElement).toBe(part('search-toggle'));
  });

  it('closes the search when focus leaves it, and from its close control', async () => {
    await mount(560);
    click(part('search-toggle'));
    const field = fixture.nativeElement.querySelector('input') as HTMLElement;
    field.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: part('account') }),
    );
    fixture.detectChanges();
    expect(host.searchRequests.at(-1)).toMatchObject({ reason: 'blur', value: false });

    click(part('search-toggle'));
    click(part('search-close'));
    expect(host.searchRequests.at(-1)).toMatchObject({ reason: 'pointer', value: false });
  });

  it('writes no search state above 600, where the field is always there', async () => {
    await mount(1280);
    host.searchOpen.set(true);
    fixture.detectChanges();
    expect(root().hasAttribute('data-search-open')).toBe(false);
  });

  it('takes its defaults from the provider', async () => {
    await mount(1280);
    const provided = TestBed.createComponent(WithDefaults);
    provided.detectChanges();
    const bar = provided.nativeElement.querySelector('[data-ui="top-navigation"]') as HTMLElement;
    expect(bar.getAttribute('data-size')).toBe('lg');
    expect(bar.hasAttribute('data-frame')).toBe(false);
    expect(bar.querySelector('[data-part="more"]')?.getAttribute('aria-label')).toBe('Outros');
  });

  it('exposes the imperative surface', async () => {
    await mount(560);
    const bar = host.bar();
    bar.openMore();
    fixture.detectChanges();
    expect(part('panel').hasAttribute('data-open')).toBe(true);
    bar.closeMore();
    fixture.detectChanges();
    expect(part('panel').hasAttribute('data-open')).toBe(false);
    bar.focusSearch();
    fixture.detectChanges();
    expect(root().hasAttribute('data-search-open')).toBe(true);
    bar.focus();
    expect(document.activeElement).toBe(part('skip'));
  });
});
