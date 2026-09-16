import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChangeRequest } from '@slotted/core/state';

import { SlCommandPalette, SlCommandPaletteItem, SlCommandPaletteTrigger } from './command-palette';
import { provideCommandPaletteDefaults } from './command-palette-defaults';
import type { CommandPaletteItem, CommandPaletteSelectRequest } from './command-palette-defaults';

const ITEMS: CommandPaletteItem[] = [
  { id: 'inbox', label: 'Inbox', group: 'nav', shortcut: 'g i', keywords: ['mail'] },
  { id: 'projects', label: 'Projects', group: 'nav', href: '/projects' },
  {
    id: 'team',
    label: 'Switch team…',
    group: 'nav',
    children: [
      { id: 'acme', label: 'Acme Robotics' },
      { id: 'globex', label: 'Globex Freight' },
    ],
  },
  { id: 'deploy', label: 'Deploy to production', group: 'actions', shortcut: 'mod+shift+d' },
  { id: 'rollback', label: 'Roll back deployment', group: 'actions', disabled: true },
  { id: 'theme', label: 'Toggle dark mode' },
];
const GROUPS = [
  { id: 'nav', label: 'Go to' },
  { id: 'actions', label: 'Actions' },
];

@Component({
  standalone: true,
  imports: [SlCommandPalette],
  template: `
    <sl-command-palette
      #palette
      presentation="inline"
      [items]="items()"
      [groups]="groups"
      [loading]="loading()"
      [(query)]="query"
      [(pages)]="pages"
      [(recent)]="recent"
      (queryChangeRequest)="queryRequests.push($event)"
      (highlightedIdChangeRequest)="highlightRequests.push($event)"
      (pagesChangeRequest)="pageRequests.push($event)"
      (recentChangeRequest)="recentRequests.push($event)"
      (select)="selected.push($event)"
    />
  `,
})
class InlineHost {
  readonly palette = viewChild.required<SlCommandPalette>('palette');
  readonly items = signal<CommandPaletteItem[]>(ITEMS);
  readonly groups = GROUPS;
  readonly loading = signal(false);
  readonly query = signal('');
  readonly pages = signal<readonly string[]>([]);
  readonly recent = signal<readonly string[]>([]);
  readonly queryRequests: ChangeRequest<string>[] = [];
  readonly highlightRequests: ChangeRequest<string | null>[] = [];
  readonly pageRequests: ChangeRequest<readonly string[]>[] = [];
  readonly recentRequests: ChangeRequest<readonly string[]>[] = [];
  readonly selected: CommandPaletteSelectRequest[] = [];
}

@Component({
  standalone: true,
  imports: [SlCommandPalette, SlCommandPaletteTrigger],
  template: `
    <button [slCommandPaletteTrigger]="palette" type="button">Search</button>
    <sl-command-palette
      #palette
      [items]="items"
      [(open)]="open"
      [hotkey]="hotkey()"
      (openChangeRequest)="openRequests.push($event)"
    />
  `,
})
class DialogHost {
  readonly palette = viewChild.required<SlCommandPalette>('palette');
  readonly items = ITEMS;
  readonly open = signal(false);
  readonly hotkey = signal<string | null | undefined>(undefined);
  readonly openRequests: ChangeRequest<boolean>[] = [];
}

@Component({
  standalone: true,
  imports: [SlCommandPalette, SlCommandPaletteItem],
  template: `
    <sl-command-palette presentation="inline" [items]="items">
      <ng-template slCommandPaletteItem let-item let-current="current">
        <b [attr.data-current-row]="current ? '' : null">{{ item.label }}</b>
      </ng-template>
    </sl-command-palette>
  `,
})
class TemplateHost {
  readonly items = ITEMS;
}

const key = (target: Element, key: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );

describe('SlCommandPalette', () => {
  let fixture: ComponentFixture<InlineHost>;
  let host: InlineHost;
  const input = () => fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
  const options = () =>
    [...fixture.nativeElement.querySelectorAll('[role="option"]')] as HTMLElement[];
  const current = () => {
    const id = input().getAttribute('aria-activedescendant');
    return id === null ? null : (document.getElementById(id) as HTMLElement | null);
  };
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InlineHost] }).compileComponents();
    fixture = TestBed.createComponent(InlineHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('wires the combobox pattern and highlights the first row', () => {
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(input().getAttribute('aria-controls')).toBe(
      fixture.nativeElement.querySelector('[role="listbox"]').id,
    );
    expect(current()?.textContent).toContain('Inbox');
    expect(current()?.getAttribute('aria-selected')).toBe('true');
    expect(options().length).toBe(6);
    const labels = [...fixture.nativeElement.querySelectorAll('[data-part="group-label"]')].map(
      (node) => (node as HTMLElement).textContent?.trim(),
    );
    expect(labels).toEqual(['Go to', 'Actions']);
  });

  it('ranks what was typed, marks the match, and announces the count', () => {
    type('dep');
    expect(host.queryRequests.at(-1)?.reason).toBe('keyboard');
    expect(host.query()).toBe('dep');
    expect(options().map((o) => o.textContent?.trim().slice(0, 6))).toEqual(['Deploy', 'Roll b']);
    expect(fixture.nativeElement.querySelector('[data-part="match"]').textContent).toBe('Dep');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      '2 results',
    );
  });

  it('moves the highlight with the arrows, skips a disabled row and wraps', () => {
    key(input(), 'ArrowDown');
    fixture.detectChanges();
    expect(current()?.textContent).toContain('Projects');
    expect(host.highlightRequests.at(-1)?.reason).toBe('keyboard');
    key(input(), 'ArrowDown');
    key(input(), 'ArrowDown');
    key(input(), 'ArrowDown');
    fixture.detectChanges();
    expect(current()?.textContent).toContain('Toggle dark mode');
    key(input(), 'ArrowDown');
    fixture.detectChanges();
    expect(current()?.textContent).toContain('Inbox');
    key(input(), 'End', { ctrlKey: true });
    fixture.detectChanges();
    expect(current()?.textContent).toContain('Toggle dark mode');
  });

  it('executes on Enter with reason keyboard, records the recent, and never runs a disabled row', () => {
    type('deploy');
    key(input(), 'Enter');
    fixture.detectChanges();
    expect(host.selected.at(-1)?.item.id).toBe('deploy');
    expect(host.selected.at(-1)?.reason).toBe('keyboard');
    expect(host.recent()).toEqual(['deploy']);
    expect(host.recentRequests.at(-1)?.reason).toBe('select');

    type('roll back');
    expect(current()).toBeNull();
    key(input(), 'Enter');
    options()[0]?.click();
    fixture.detectChanges();
    expect(host.selected.length).toBe(1);
  });

  it('opens a page on an item with children, draws the trail, and returns on Backspace', () => {
    const team = options().find((o) => o.textContent?.includes('Switch team')) as HTMLElement;
    expect(team.hasAttribute('data-page')).toBe(true);
    team.click();
    fixture.detectChanges();
    expect(host.pages()).toEqual(['team']);
    expect(host.pageRequests.at(-1)?.reason).toBe('pointer');
    expect(fixture.nativeElement.querySelector('[data-part="page"]').textContent.trim()).toBe(
      'Switch team…',
    );
    expect(options().map((o) => o.textContent?.trim())).toEqual([
      'Acme Robotics',
      'Globex Freight',
    ]);
    key(input(), 'Backspace');
    fixture.detectChanges();
    expect(host.pages()).toEqual([]);
    expect(host.pageRequests.at(-1)?.reason).toBe('keyboard');
    expect(options().length).toBe(6);
  });

  it('opens on the recents when the consumer holds some', () => {
    host.recent.set(['theme']);
    fixture.detectChanges();
    const labels = [...fixture.nativeElement.querySelectorAll('[data-part="group-label"]')].map(
      (node) => (node as HTMLElement).textContent?.trim(),
    );
    expect(labels[0]).toBe('Recent');
    expect(options()[0]?.textContent).toContain('Toggle dark mode');
  });

  it('draws a destination as a link and announces a chord but not a sequence', () => {
    const projects = options().find((o) => o.textContent?.includes('Projects')) as HTMLElement;
    expect(projects.tagName).toBe('A');
    expect(projects.getAttribute('href')).toBe('/projects');
    const deploy = options().find((o) => o.textContent?.includes('Deploy')) as HTMLElement;
    expect(deploy.getAttribute('aria-keyshortcuts')).toMatch(/^(Meta|Control)\+Shift\+D$/);
    expect(deploy.querySelector('[data-part="shortcut"] [data-ui="kbd"]')).not.toBeNull();
    const inbox = options().find((o) => o.textContent?.includes('Inbox')) as HTMLElement;
    expect(inbox.hasAttribute('aria-keyshortcuts')).toBe(false);
  });

  it('keeps an asynchronous item busy and refuses a second run until it settles', async () => {
    let settle: () => void = () => {};
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          settle = resolve;
        }),
    );
    host.items.set([{ id: 'slow', label: 'Slow', onSelect: handler }]);
    fixture.detectChanges();
    const option = options()[0] as HTMLElement;
    option.click();
    option.click();
    fixture.detectChanges();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(option.hasAttribute('data-loading')).toBe(true);
    expect(option.getAttribute('aria-busy')).toBe('true');
    expect(host.selected.length).toBe(0);
    settle();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    expect(host.selected.length).toBe(1);
    expect(options()[0]?.hasAttribute('data-loading')).toBe(false);
  });

  it('says so, and stays put, when a handler rejects', async () => {
    host.items.set([
      { id: 'bad', label: 'Bad', onSelect: () => Promise.reject(new Error('nope')) },
    ]);
    fixture.detectChanges();
    (options()[0] as HTMLElement).click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      'The command failed: nope',
    );
    expect(host.selected.length).toBe(0);
  });

  it('shows the wait as three rows while loading with nothing to show', () => {
    host.items.set([]);
    host.loading.set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[data-part="placeholder"] [data-ui="skeleton"]')
        .length,
    ).toBe(3);
    expect(
      fixture.nativeElement.querySelector('[data-part="busy"][data-ui="spinner"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="listbox"]').getAttribute('aria-busy')).toBe(
      'true',
    );
  });

  it('says so when nothing matched', () => {
    type('xylophone');
    expect(options()).toEqual([]);
    expect(fixture.nativeElement.querySelector('[data-part="empty"]').textContent.trim()).toBe(
      'No results',
    );
    expect(
      fixture.nativeElement.querySelector('[data-ui="command-palette"]').hasAttribute('data-empty'),
    ).toBe(true);
  });

  it('exposes the handle', () => {
    host.palette().scrollToId('theme');
    fixture.detectChanges();
    expect(current()?.textContent).toContain('Toggle dark mode');
    host.palette().setQuery('inbox', 'programmatic');
    fixture.detectChanges();
    expect(host.query()).toBe('inbox');
    expect(host.queryRequests.at(-1)?.reason).toBe('programmatic');
  });
});

describe('SlCommandPalette in a dialog', () => {
  let fixture: ComponentFixture<DialogHost>;
  let host: DialogHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DialogHost] }).compileComponents();
    fixture = TestBed.createComponent(DialogHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing of the panel while closed, and opens from its trigger', () => {
    expect(document.querySelector('[role="combobox"]')).toBeNull();
    const trigger = fixture.nativeElement.querySelector(
      '[data-part="trigger"]',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    fixture.detectChanges();
    expect(host.open()).toBe(true);
    expect(host.openRequests.at(-1)?.reason).toBe('pointer');
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('[role="combobox"]')).not.toBeNull();
    expect(
      document.querySelector('[role="dialog"]')?.getAttribute('aria-labelledby'),
    ).not.toBeNull();
  });

  it('opens on the hotkey and closes with Escape in steps', () => {
    key(document.body, 'k', { ctrlKey: true });
    fixture.detectChanges();
    expect(host.open()).toBe(true);
    expect(host.openRequests.at(-1)?.reason).toBe('keyboard');
    const field = document.querySelector('[role="combobox"]') as HTMLInputElement;
    field.value = 'in';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    key(field, 'Escape');
    fixture.detectChanges();
    expect(field.value).toBe('');
    expect(host.open()).toBe(true);
    key(field, 'Escape');
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(host.openRequests.at(-1)?.reason).toBe('escape');
  });

  it('turns the hotkey off with null', () => {
    host.hotkey.set(null);
    fixture.detectChanges();
    key(document.body, 'k', { ctrlKey: true });
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });
});

describe('SlCommandPalette with a template and defaults', () => {
  it('lets the consumer write the row content', async () => {
    await TestBed.configureTestingModule({ imports: [TemplateHost] }).compileComponents();
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-current-row]').textContent).toBe('Inbox');
    expect(fixture.nativeElement.querySelector('[data-part="icon"]')).toBeNull();
  });

  it('takes its defaults from the provider', async () => {
    await TestBed.configureTestingModule({
      imports: [InlineHost],
      providers: [provideCommandPaletteDefaults({ size: 'lg', placeholder: 'Buscar…' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(InlineHost);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-ui="command-palette"]').getAttribute('data-size'),
    ).toBe('lg');
    expect(
      fixture.nativeElement.querySelector('[role="combobox"]').getAttribute('placeholder'),
    ).toBe('Buscar…');
  });
});
