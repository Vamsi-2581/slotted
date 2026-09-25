import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SlDashboardGrid } from './dashboard-grid';
import {
  provideDashboardGridDefaults,
  type DashboardEditingRequest,
  type DashboardLayout,
  type DashboardLayoutRequest,
  type DashboardWidgetStatus,
} from './dashboard-grid-defaults';
import {
  SlDashboardWidget,
  SlDashboardWidgetActions,
  SlDashboardWidgetEmptyAction,
} from './dashboard-widget';
import { persistedDashboardLayout } from './persisted-dashboard-layout';

/* Revenue and Orders side by side on the first row, the trend under them. */
@Component({
  standalone: true,
  imports: [SlDashboardGrid, SlDashboardWidget, SlDashboardWidgetActions],
  template: `
    <div
      slDashboardGrid
      #grid="slDashboardGrid"
      id="board"
      aria-label="Sales"
      [defaultLayout]="defaultLayout()"
      [defaultEditing]="editing()"
      [editBar]="editBar()"
      [attr.dir]="dir()"
      (layoutChangeRequest)="onLayout($event)"
      (editingChangeRequest)="onEditing($event)"
    >
      <sl-dashboard-widget value="revenue" title="Revenue" defaultColumns="3" detailHref="/revenue">
        <p>€ 482,190</p>
        <button slDashboardWidgetActions type="button">Export</button>
      </sl-dashboard-widget>
      <sl-dashboard-widget
        value="orders"
        title="Orders"
        defaultColumns="3"
        [movable]="ordersMovable()"
      >
        <p>3,914</p>
      </sl-dashboard-widget>
      <sl-dashboard-widget
        value="trend"
        title="Revenue by week"
        defaultColumns="12"
        defaultRows="3"
        minColumns="6"
      >
        <p>chart</p>
      </sl-dashboard-widget>
    </div>
  `,
})
class Host {
  readonly defaultLayout = signal<DashboardLayout | undefined>(undefined);
  readonly editing = signal(false);
  readonly editBar = signal<boolean | undefined>(undefined);
  readonly dir = signal<string | null>(null);
  readonly ordersMovable = signal<boolean | undefined>(undefined);
  readonly cancelNext = signal(false);
  readonly layouts: DashboardLayoutRequest[] = [];
  readonly editings: DashboardEditingRequest[] = [];
  readonly grid = viewChild.required<SlDashboardGrid>('grid');

  onLayout(request: DashboardLayoutRequest) {
    this.layouts.push(request);
    if (this.cancelNext()) request.cancel();
  }

  onEditing(request: DashboardEditingRequest) {
    this.editings.push(request);
  }
}

@Component({
  standalone: true,
  imports: [SlDashboardGrid, SlDashboardWidget, SlDashboardWidgetEmptyAction],
  template: `
    <div slDashboardGrid aria-label="Sales">
      <sl-dashboard-widget
        value="a"
        title="A"
        detailHref="/a"
        emptyDescription="Nothing yet"
        retryable
        [status]="status()"
        [loading]="loading()"
        [busy]="busy()"
        (retry)="retries = retries + 1"
      >
        <p>content</p>
        <button slDashboardWidgetEmptyAction type="button">Create</button>
      </sl-dashboard-widget>
    </div>
  `,
})
class StatesHost {
  readonly status = signal<DashboardWidgetStatus>('ready');
  readonly loading = signal(false);
  readonly busy = signal(false);
  retries = 0;
}

async function settle<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function setup(configure?: (host: Host) => void): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  configure?.(fixture.componentInstance);
  await settle(fixture);
  return fixture;
}

async function setupStates(
  configure?: (host: StatesHost) => void,
): Promise<ComponentFixture<StatesHost>> {
  const fixture = TestBed.createComponent(StatesHost);
  configure?.(fixture.componentInstance);
  await settle(fixture);
  return fixture;
}

const root = () => document.querySelector<HTMLElement>('[data-ui="dashboard-grid"]')!;
const order = () =>
  [...document.querySelectorAll<HTMLElement>('[data-part="widget"]')].map(
    (node) => node.dataset['key'],
  );
const widget = (key: string) =>
  document.querySelector<HTMLElement>(`[data-part="widget"][data-key="${key}"]`)!;
const handle = (key: string) =>
  widget(key).querySelector<HTMLButtonElement>('[data-part="handle"]')!;
const part = (name: string) => document.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
/* No stylesheet paints a glyph: each one is an `icon` holding the library's `Glyph`. */
const glyphOf = (host: Element | null) =>
  host?.querySelector('[data-ui="icon"] > svg[data-glyph]')?.getAttribute('data-glyph');
const place = (key: string) => {
  const style = widget(key).style;
  return ['--_dg-x', '--_dg-y', '--_dg-w', '--_dg-h'].map((name) =>
    Number(style.getPropertyValue(name)),
  );
};
const itemOf = (layout: DashboardLayout, key: string) => layout.find((item) => item.key === key);
const press = (target: HTMLElement, init: KeyboardEventInit) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));

describe('SlDashboardGrid', () => {
  it('draws a list of articles named by their titles, in reading order', async () => {
    await setup();
    const list = part('grid');
    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-label')).toBe('Sales');
    expect(root().hasAttribute('aria-label')).toBe(false);
    expect(root().id).toBe('board');
    expect(order()).toEqual(['revenue', 'orders', 'trend']);
    const article = widget('revenue').querySelector('article')!;
    expect(article.getAttribute('data-ui')).toBe('card');
    const title = article.querySelector('h3[data-part="title"]')!;
    expect(title.textContent?.trim()).toBe('Revenue');
    expect(article.getAttribute('aria-labelledby')).toBe(title.id);
    expect(widget('revenue').textContent).toContain('€ 482,190');
    expect(widget('revenue').textContent).toContain('Export');
    expect(root().hasAttribute('data-editing')).toBe(false);
  });

  it('places every widget at its cell, and draws the DOM by row, then column', async () => {
    await setup((host) =>
      host.defaultLayout.set([
        { key: 'trend', x: 0, y: 0, w: 12, h: 3 },
        { key: 'orders', x: 0, y: 3, w: 3, h: 2 },
        { key: 'revenue', x: 6, y: 3, w: 3, h: 2 },
      ]),
    );
    expect(order()).toEqual(['trend', 'orders', 'revenue']);
    expect(place('revenue')).toEqual([7, 4, 3, 2]);
    expect(widget('revenue').style.getPropertyValue('--_dg-span-medium')).toBe('3');
    expect(root().style.getPropertyValue('--_dg-columns-expanded')).toBe('12');
  });

  it('draws no handle and no resize handle outside editing', async () => {
    await setup();
    expect(document.querySelector('[data-part="handle"]')).toBeNull();
    expect(document.querySelector('[data-part="resize-handle"]')).toBeNull();
    expect(document.querySelector('[data-part="edit-bar"]')).toBeNull();
  });

  it('stands a handle on each card and the five edges around it while editing', async () => {
    await setup((host) => host.editing.set(true));
    expect(root().hasAttribute('data-editing')).toBe(true);
    expect(part('edit-bar').getAttribute('aria-label')).toBe('Layout');
    const button = handle('revenue');
    expect(button.parentElement).toBe(widget('revenue'));
    expect(button.hasAttribute('data-ui')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Rearrange Revenue');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-describedby')).toBe(part('edit-status').id);
    expect(button.getAttribute('aria-keyshortcuts')).toMatch(/Alt\+ArrowUp.*Delete$/);
    expect(glyphOf(button)).toBe('grip-horizontal');
    const edges = [...widget('revenue').querySelectorAll('[data-part="resize-handle"]')].map(
      (node) => node.getAttribute('data-edge'),
    );
    expect(edges).toEqual(['start', 'end', 'bottom', 'bottom-start', 'bottom-end']);
    expect(part('done').getAttribute('data-ui')).toBe('button');
  });

  it('keeps the instructions for the handles when the edit bar is off', async () => {
    await setup((host) => {
      host.editing.set(true);
      host.editBar.set(false);
    });
    expect(document.querySelector('[data-part="edit-bar"]')).toBeNull();
    const status = part('edit-status');
    expect(status.getAttribute('data-ui')).toBe('visually-hidden');
    expect(handle('orders').getAttribute('aria-describedby')).toBe(status.id);
  });

  it('moves a widget a column on Alt and an arrow, and keeps focus on its handle', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    handle('orders').focus();
    press(handle('orders'), { key: 'ArrowRight', altKey: true });
    await settle(fixture);
    const [request] = fixture.componentInstance.layouts;
    expect(itemOf(request!.value, 'orders')).toMatchObject({ x: 4, y: 0 });
    expect(request!.reason).toBe('keyboard');
    expect(request!.change).toEqual({ kind: 'move', key: 'orders' });
    expect(place('orders')).toEqual([5, 1, 3, 2]);
    expect(document.activeElement).toBe(handle('orders'));
    expect(document.querySelector('[data-ui="menu"][data-open]')).toBeNull();
  });

  it('exchanges places with the widget below on Alt and ArrowDown', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    handle('revenue').focus();
    press(handle('revenue'), { key: 'ArrowDown', altKey: true });
    await settle(fixture);
    const layout = fixture.componentInstance.layouts[0]!.value;
    expect(itemOf(layout, 'trend')).toMatchObject({ y: 0 });
    expect(itemOf(layout, 'revenue')?.y).toBe(3);
    expect(order()).toEqual(['trend', 'revenue', 'orders']);
    expect(document.activeElement).toBe(handle('revenue'));
  });

  it('mirrors the inline arrows in a right-to-left document', async () => {
    const fixture = await setup((host) => {
      host.editing.set(true);
      host.dir.set('rtl');
    });
    press(handle('orders'), { key: 'ArrowLeft', altKey: true });
    await settle(fixture);
    expect(itemOf(fixture.componentInstance.layouts[0]!.value, 'orders')).toMatchObject({ x: 4 });
  });

  it('resizes by the end and the bottom edges on Shift and an arrow, within the limits', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    const layouts = fixture.componentInstance.layouts;
    press(handle('trend'), { key: 'ArrowLeft', shiftKey: true });
    await settle(fixture);
    expect(itemOf(layouts[0]!.value, 'trend')).toMatchObject({ w: 11 });
    expect(layouts[0]!.change).toEqual({ kind: 'resize', key: 'trend' });
    press(handle('revenue'), { key: 'ArrowDown', shiftKey: true });
    await settle(fixture);
    expect(itemOf(layouts[1]!.value, 'revenue')).toMatchObject({ h: 3 });
    for (let step = 0; step < 8; step += 1) {
      press(handle('trend'), { key: 'ArrowLeft', shiftKey: true });
      await settle(fixture);
    }
    expect(place('trend')[2]).toBe(6);
  });

  it('hides a widget on Delete, with the reason remove, and gives focus to the next', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    handle('revenue').focus();
    press(handle('revenue'), { key: 'Delete' });
    await settle(fixture);
    const [request] = fixture.componentInstance.layouts;
    expect(itemOf(request!.value, 'revenue')?.hidden).toBe(true);
    expect(request!.reason).toBe('remove');
    expect(order()).toEqual(['orders', 'trend']);
    expect(document.activeElement).toBe(handle('orders'));
    expect(part('add').textContent).toContain('Add widget');
    expect(glyphOf(part('add'))).toBe('plus');
  });

  it('refuses a request the consumer cancels', async () => {
    const fixture = await setup((host) => {
      host.editing.set(true);
      host.cancelNext.set(true);
    });
    press(handle('orders'), { key: 'ArrowRight', altKey: true });
    await settle(fixture);
    expect(fixture.componentInstance.layouts).toHaveLength(1);
    expect(place('orders')).toEqual([4, 1, 3, 2]);
  });

  it('leaves a pinned widget where it is', async () => {
    const fixture = await setup((host) => {
      host.editing.set(true);
      host.ordersMovable.set(false);
    });
    press(handle('orders'), { key: 'ArrowRight', altKey: true });
    await settle(fixture);
    const layouts = fixture.componentInstance.layouts;
    expect(layouts).toHaveLength(0);
    press(handle('revenue'), { key: 'ArrowRight', altKey: true });
    await settle(fixture);
    expect(itemOf(layouts[0]!.value, 'orders')).toMatchObject({ x: 3, y: 0 });
    expect(widget('orders').hasAttribute('data-movable')).toBe(false);
  });

  it('cancels back to the layout editing began from, then leaves editing', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    press(handle('revenue'), { key: 'ArrowDown', altKey: true });
    await settle(fixture);
    expect(order()).toEqual(['trend', 'revenue', 'orders']);
    part('cancel').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    await settle(fixture);
    const host = fixture.componentInstance;
    expect(itemOf(host.layouts[1]!.value, 'revenue')).toMatchObject({ x: 0, y: 0 });
    expect(host.layouts[1]!.change).toEqual({ kind: 'cancel', key: null });
    expect(host.layouts[1]!.reason).toBe('dismiss');
    expect(host.editings.at(-1)!.value).toBe(false);
    expect(host.editings.at(-1)!.reason).toBe('pointer');
    expect(order()).toEqual(['revenue', 'orders', 'trend']);
    expect(root().hasAttribute('data-editing')).toBe(false);
  });

  it('leaves editing with the reason submit from Done, and keeps it on Escape', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    press(handle('revenue'), { key: 'Escape' });
    await settle(fixture);
    expect(fixture.componentInstance.editings).toHaveLength(0);
    part('done').click();
    await settle(fixture);
    expect(fixture.componentInstance.editings[0]!.reason).toBe('submit');
  });

  it('resets to every widget at its defaults', async () => {
    const fixture = await setup((host) => {
      host.editing.set(true);
      host.defaultLayout.set([{ key: 'trend', x: 0, y: 0, w: 8, h: 4 }]);
    });
    part('reset').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    await settle(fixture);
    const [request] = fixture.componentInstance.layouts;
    expect(request!.value.map((item) => [item.key, item.x, item.y, item.w])).toEqual([
      ['revenue', 0, 0, 3],
      ['orders', 3, 0, 3],
      ['trend', 0, 2, 12],
    ]);
    expect(request!.change.kind).toBe('reset');
  });

  it('keeps an entry no widget holds in the value it asks for', async () => {
    const fixture = await setup((host) => {
      host.editing.set(true);
      host.defaultLayout.set([{ key: 'gone', x: 0, y: 0, w: 2, h: 2 }]);
    });
    press(handle('orders'), { key: 'ArrowRight', altKey: true });
    await settle(fixture);
    expect(fixture.componentInstance.layouts[0]!.value.at(-1)).toEqual({
      key: 'gone',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    });
  });

  it('shows the empty state when every widget is hidden', async () => {
    await setup((host) =>
      host.defaultLayout.set(
        ['revenue', 'orders', 'trend'].map((key) => ({
          key,
          x: 0,
          y: 0,
          w: 3,
          h: 2,
          hidden: true,
        })),
      ),
    );
    expect(part('grid').hidden).toBe(true);
    expect(part('empty').textContent).toContain('No widgets');
  });

  it('reaches the imperative actions through exportAs', async () => {
    const fixture = await setup((host) => host.editing.set(true));
    const grid = fixture.componentInstance.grid();
    grid.focusWidget('orders');
    expect(document.activeElement).toBe(handle('orders'));
    grid.commitEditing();
    await settle(fixture);
    expect(fixture.componentInstance.editings.at(-1)!.reason).toBe('programmatic');
  });
});

describe('SlDashboardWidget', () => {
  it('shows the empty message with the consumer’s action', async () => {
    await setupStates((host) => host.status.set('empty'));
    expect(widget('a').getAttribute('data-status')).toBe('empty');
    expect(part('message').textContent).toContain('No data');
    expect(part('message').textContent).toContain('Nothing yet');
    expect(part('message').textContent).toContain('Create');
  });

  it('shows the error message with Try again, which emits retry', async () => {
    const fixture = await setupStates((host) => host.status.set('error'));
    expect(glyphOf(part('retry'))).toBe('rotate-ccw');
    part('retry').click();
    expect(fixture.componentInstance.retries).toBe(1);
  });

  it('keeps the header and waits in the body while loading, with aria-busy', async () => {
    await setupStates((host) => host.loading.set(true));
    expect(widget('a').hasAttribute('data-loading')).toBe(true);
    expect(part('title').textContent).toContain('A');
    expect(part('skeleton').querySelector('[data-ui="skeleton"]')).not.toBeNull();
    expect(widget('a').textContent).not.toContain('content');
    expect(widget('a').querySelector('article')!.getAttribute('aria-busy')).toBe('true');
  });

  it('keeps the content and draws the busy line while refreshing', async () => {
    await setupStates((host) => host.busy.set(true));
    expect(widget('a').textContent).toContain('content');
    expect(part('busy-indicator').getAttribute('aria-hidden')).toBe('true');
    expect(widget('a').querySelector('article')!.getAttribute('aria-busy')).toBe('true');
  });

  it('links to the widget’s own page', async () => {
    await setupStates();
    const link = widget('a').querySelector<HTMLAnchorElement>('a[data-part="detail"]')!;
    expect(link.getAttribute('href')).toBe('/a');
    expect(link.getAttribute('aria-label')).toBe('Open A');
    /* The arrow points out of the widget, so it turns with the writing direction. */
    expect(glyphOf(link)).toBe('external');
    expect(link.querySelector('[data-ui="icon"]')!.hasAttribute('data-directional')).toBe(true);
  });
});

describe('provideDashboardGridDefaults', () => {
  it('sets the columns and the heading level once', async () => {
    TestBed.configureTestingModule({
      providers: [provideDashboardGridDefaults({ columns: 8, headingLevel: 2 })],
    });
    await setup();
    expect(root().style.getPropertyValue('--_dg-columns-expanded')).toBe('8');
    expect(root().style.getPropertyValue('--_dg-columns-medium')).toBe('4');
    expect(widget('revenue').querySelector('h2[data-part="title"]')).not.toBeNull();
  });
});

describe('persistedDashboardLayout', () => {
  it('reads the stored layout and writes every change', () => {
    const store = new Map<string, string>([['sales', '{"v":2,"items":[["trend",0,0,12,3]]}']]);
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    };
    const persisted = TestBed.runInInjectionContext(() =>
      persistedDashboardLayout({ key: 'sales', storage }),
    );
    expect(persisted.layout()).toEqual([{ key: 'trend', x: 0, y: 0, w: 12, h: 3 }]);
    persisted.layout.set([{ key: 'orders', x: 4, y: 3, w: 3, h: 2 }]);
    TestBed.tick();
    expect(store.get('sales')).toBe('{"v":2,"items":[["orders",4,3,3,2]]}');
    persisted.clear();
    TestBed.tick();
    expect(store.has('sales')).toBe(false);
  });

  it('starts from the default when the store holds text it cannot read', () => {
    const storage = { getItem: () => 'not a layout', setItem: () => {}, removeItem: () => {} };
    const persisted = TestBed.runInInjectionContext(() =>
      persistedDashboardLayout({ key: 'sales', storage }),
    );
    expect(persisted.layout()).toEqual([]);
  });
});
