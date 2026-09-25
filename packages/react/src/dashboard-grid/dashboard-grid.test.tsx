import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardGrid } from './dashboard-grid';
import { DashboardGridDefaultsProvider } from './dashboard-grid-defaults';
import { DashboardWidget } from './dashboard-widget';
import type {
  DashboardEditingRequest,
  DashboardGridHandle,
  DashboardGridProps,
  DashboardLayout,
  DashboardLayoutRequest,
} from './dashboard-grid.types';
import { usePersistedDashboardLayout } from './use-persisted-dashboard-layout';

type LayoutSpy = ReturnType<
  typeof vi.fn<(layout: DashboardLayout, request: DashboardLayoutRequest) => void>
>;
type EditingSpy = ReturnType<
  typeof vi.fn<(editing: boolean, request: DashboardEditingRequest) => void>
>;

/* Revenue and Orders side by side on the first row, the trend under them. */
function widgets() {
  return [
    <DashboardWidget
      key="revenue"
      value="revenue"
      title="Revenue"
      defaultColumns={3}
      detailHref="/revenue"
    >
      <p>€ 482,190</p>
    </DashboardWidget>,
    <DashboardWidget key="orders" value="orders" title="Orders" defaultColumns={3}>
      <p>3,914</p>
    </DashboardWidget>,
    <DashboardWidget
      key="trend"
      value="trend"
      title="Revenue by week"
      defaultColumns={12}
      defaultRows={3}
      minColumns={6}
    >
      <p>chart</p>
    </DashboardWidget>,
  ];
}

function mount(props: Partial<DashboardGridProps> = {}) {
  const onLayoutChange: LayoutSpy = vi.fn();
  const onEditingChange: EditingSpy = vi.fn();
  const view = render(
    <DashboardGrid
      aria-label="Sales"
      onLayoutChange={onLayoutChange}
      onEditingChange={onEditingChange}
      {...props}
    >
      {props.children ?? widgets()}
    </DashboardGrid>,
  );
  return { ...view, onLayoutChange, onEditingChange };
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

describe('DashboardGrid', () => {
  it('draws a list of articles named by their titles, in reading order', () => {
    mount();
    expect(screen.getByRole('list', { name: 'Sales' })).toBe(part('grid'));
    expect(order()).toEqual(['revenue', 'orders', 'trend']);
    const article = screen.getByRole('article', { name: 'Revenue' });
    expect(article.getAttribute('data-ui')).toBe('card');
    expect(screen.getByRole('heading', { level: 3, name: 'Revenue' })).toBeTruthy();
    expect(root().hasAttribute('data-editing')).toBe(false);
  });

  it('places every widget at its cell, and draws the DOM by row, then column', () => {
    mount({
      defaultLayout: [
        { key: 'trend', x: 0, y: 0, w: 12, h: 3 },
        { key: 'orders', x: 0, y: 3, w: 3, h: 2 },
        { key: 'revenue', x: 6, y: 3, w: 3, h: 2 },
      ],
    });
    expect(order()).toEqual(['trend', 'orders', 'revenue']);
    expect(place('revenue')).toEqual([7, 4, 3, 2]);
    expect(widget('revenue').style.getPropertyValue('--_dg-span-medium')).toBe('3');
    expect(root().style.getPropertyValue('--_dg-columns-expanded')).toBe('12');
  });

  it('takes the columns and the heading level from a provider, and its own props over it', () => {
    render(
      <DashboardGridDefaultsProvider columns={8} headingLevel={2}>
        <DashboardGrid aria-label="Sales">
          <DashboardWidget value="a" title="A" />
          <DashboardWidget value="b" title="B" headingLevel={4} />
        </DashboardGrid>
      </DashboardGridDefaultsProvider>,
    );
    expect(root().style.getPropertyValue('--_dg-columns-expanded')).toBe('8');
    expect(screen.getByRole('heading', { level: 2, name: 'A' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 4, name: 'B' })).toBeTruthy();
  });

  it('draws no handle and no resize handle outside editing', () => {
    mount();
    expect(document.querySelector('[data-part="handle"]')).toBeNull();
    expect(document.querySelector('[data-part="resize-handle"]')).toBeNull();
    expect(document.querySelector('[data-part="edit-bar"]')).toBeNull();
  });

  it('stands a handle on each card and the five edges around it while editing', () => {
    mount({ defaultEditing: true });
    expect(root().hasAttribute('data-editing')).toBe(true);
    const button = handle('revenue');
    expect(button.parentElement).toBe(widget('revenue'));
    expect(button.hasAttribute('data-ui')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Rearrange Revenue');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-describedby')).toBe(part('edit-status').id);
    expect(button.getAttribute('aria-keyshortcuts')).toMatch(/Alt\+ArrowUp.*Delete$/);
    const edges = [...widget('revenue').querySelectorAll('[data-part="resize-handle"]')].map(
      (node) => node.getAttribute('data-edge'),
    );
    expect(edges).toEqual(['start', 'end', 'bottom', 'bottom-start', 'bottom-end']);
  });

  it('keeps the instructions for the handles when the edit bar is off', () => {
    mount({ defaultEditing: true, editBar: false });
    expect(document.querySelector('[data-part="edit-bar"]')).toBeNull();
    const status = part('edit-status');
    expect(status.dataset['ui']).toBe('visually-hidden');
    expect(handle('orders').getAttribute('aria-describedby')).toBe(status.id);
  });

  it('moves a widget a column on Alt and an arrow, and keeps focus on its handle', () => {
    const { onLayoutChange } = mount({ defaultEditing: true });
    handle('orders').focus();
    fireEvent.keyDown(handle('orders'), { key: 'ArrowRight', altKey: true });
    const [layout, request] = onLayoutChange.mock.calls[0]!;
    expect(itemOf(layout, 'orders')).toMatchObject({ x: 4, y: 0 });
    expect(request.reason).toBe('keyboard');
    expect(request.change).toEqual({ kind: 'move', key: 'orders' });
    expect(place('orders')).toEqual([5, 1, 3, 2]);
    expect(document.activeElement).toBe(handle('orders'));
  });

  it('exchanges places with the widget below on Alt and ArrowDown', () => {
    const { onLayoutChange } = mount({ defaultEditing: true });
    fireEvent.keyDown(handle('revenue'), { key: 'ArrowDown', altKey: true });
    const [layout] = onLayoutChange.mock.calls[0]!;
    expect(itemOf(layout, 'trend')).toMatchObject({ y: 0 });
    expect(itemOf(layout, 'revenue')?.y).toBe(3);
    expect(order()).toEqual(['trend', 'revenue', 'orders']);
  });

  it('mirrors the inline arrows in a right-to-left document', () => {
    const { onLayoutChange } = mount({ defaultEditing: true, dir: 'rtl' });
    fireEvent.keyDown(handle('orders'), { key: 'ArrowLeft', altKey: true });
    expect(itemOf(onLayoutChange.mock.calls[0]![0], 'orders')).toMatchObject({ x: 4 });
  });

  it('resizes by the end and the bottom edges on Shift and an arrow, within the limits', () => {
    const { onLayoutChange } = mount({ defaultEditing: true });
    fireEvent.keyDown(handle('trend'), { key: 'ArrowLeft', shiftKey: true });
    expect(itemOf(onLayoutChange.mock.calls[0]![0], 'trend')).toMatchObject({ w: 11 });
    expect(onLayoutChange.mock.calls[0]![1].change).toEqual({ kind: 'resize', key: 'trend' });
    fireEvent.keyDown(handle('revenue'), { key: 'ArrowDown', shiftKey: true });
    expect(itemOf(onLayoutChange.mock.calls[1]![0], 'revenue')).toMatchObject({ h: 3 });
    for (let step = 0; step < 8; step += 1) {
      fireEvent.keyDown(handle('trend'), { key: 'ArrowLeft', shiftKey: true });
    }
    expect(place('trend')[2]).toBe(6);
  });

  it('hides a widget on Delete, with the reason remove, and gives focus to the next', () => {
    const { onLayoutChange } = mount({ defaultEditing: true });
    handle('revenue').focus();
    fireEvent.keyDown(handle('revenue'), { key: 'Delete' });
    const [layout, request] = onLayoutChange.mock.calls[0]!;
    expect(itemOf(layout, 'revenue')?.hidden).toBe(true);
    expect(request.reason).toBe('remove');
    expect(order()).toEqual(['orders', 'trend']);
    expect(document.activeElement).toBe(handle('orders'));
    expect(part('add').textContent).toContain('Add widget');
    expect(glyphOf(part('add'))).toBe('plus');
  });

  it('draws the grip, the detail arrow and the retry mark as glyph elements', () => {
    render(
      <DashboardGrid aria-label="Sales" defaultEditing>
        <DashboardWidget value="a" title="A" detailHref="/a" status="error" onRetry={() => {}} />
      </DashboardGrid>,
    );
    expect(glyphOf(handle('a'))).toBe('grip-horizontal');
    const detail = widget('a').querySelector('[data-part="detail"]');
    expect(glyphOf(detail)).toBe('external');
    /* The arrow points out of the widget, so it turns with the writing direction. */
    expect(detail?.querySelector('[data-ui="icon"]')?.hasAttribute('data-directional')).toBe(true);
    expect(glyphOf(part('retry'))).toBe('rotate-ccw');
  });

  it('refuses a request the consumer cancels, and waits for the consumer when controlled', () => {
    const cancel = vi.fn((_: DashboardLayout, request: DashboardLayoutRequest) => request.cancel());
    const first = mount({ defaultEditing: true, onLayoutChange: cancel });
    fireEvent.keyDown(handle('orders'), { key: 'ArrowRight', altKey: true });
    expect(place('orders')).toEqual([4, 1, 3, 2]);
    first.unmount();
    const { onLayoutChange } = mount({ defaultEditing: true, layout: [] });
    fireEvent.keyDown(handle('orders'), { key: 'ArrowRight', altKey: true });
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(place('orders')).toEqual([4, 1, 3, 2]);
  });

  it('leaves a pinned widget where it is', () => {
    const { onLayoutChange } = mount({
      defaultEditing: true,
      children: [
        <DashboardWidget key="a" value="a" title="A" defaultColumns={3} movable={false} />,
        <DashboardWidget key="b" value="b" title="B" defaultColumns={3} />,
      ],
    });
    fireEvent.keyDown(handle('a'), { key: 'ArrowRight', altKey: true });
    expect(onLayoutChange).not.toHaveBeenCalled();
    fireEvent.keyDown(handle('b'), { key: 'ArrowLeft', altKey: true });
    expect(itemOf(onLayoutChange.mock.calls[0]![0], 'a')).toMatchObject({ x: 0, y: 0 });
  });

  it('cancels back to the layout editing began from, then leaves editing', () => {
    const { onLayoutChange, onEditingChange } = mount({ defaultEditing: true });
    fireEvent.keyDown(handle('revenue'), { key: 'ArrowDown', altKey: true });
    expect(order()).toEqual(['trend', 'revenue', 'orders']);
    fireEvent.click(part('cancel'), { detail: 1 });
    const [layout, request] = onLayoutChange.mock.calls[1]!;
    expect(itemOf(layout, 'revenue')).toMatchObject({ x: 0, y: 0 });
    expect(request.reason).toBe('dismiss');
    expect(request.change).toEqual({ kind: 'cancel', key: null });
    expect(onEditingChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(order()).toEqual(['revenue', 'orders', 'trend']);
    expect(root().hasAttribute('data-editing')).toBe(false);
  });

  it('leaves editing with the reason submit from Done, and keeps it on Escape', () => {
    const { onEditingChange } = mount({ defaultEditing: true });
    fireEvent.keyDown(handle('revenue'), { key: 'Escape' });
    expect(onEditingChange).not.toHaveBeenCalled();
    fireEvent.click(part('done'));
    expect(onEditingChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'submit' }),
    );
  });

  it('resets to every widget at its defaults', () => {
    const { onLayoutChange } = mount({
      defaultEditing: true,
      defaultLayout: [{ key: 'trend', x: 0, y: 0, w: 8, h: 4 }],
    });
    fireEvent.click(part('reset'), { detail: 1 });
    const [layout, request] = onLayoutChange.mock.calls[0]!;
    expect(layout.map((item) => [item.key, item.x, item.y, item.w])).toEqual([
      ['revenue', 0, 0, 3],
      ['orders', 3, 0, 3],
      ['trend', 0, 2, 12],
    ]);
    expect(request.change.kind).toBe('reset');
  });

  it('keeps an entry no widget holds in the value it asks for', () => {
    const { onLayoutChange } = mount({
      defaultEditing: true,
      defaultLayout: [{ key: 'gone', x: 0, y: 0, w: 2, h: 2 }],
    });
    fireEvent.keyDown(handle('orders'), { key: 'ArrowRight', altKey: true });
    expect(onLayoutChange.mock.calls[0]![0].at(-1)).toEqual({
      key: 'gone',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    });
  });

  it('shows the empty state when every widget is hidden', () => {
    mount({
      defaultLayout: ['revenue', 'orders', 'trend'].map((key) => ({
        key,
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        hidden: true,
      })),
    });
    expect(part('grid').hidden).toBe(true);
    expect(part('empty').textContent).toContain('No widgets');
  });

  it('reaches the imperative actions through its handle', () => {
    const ref = createRef<DashboardGridHandle>();
    const { onEditingChange } = mount({ defaultEditing: true, ref });
    expect(ref.current?.element).toBe(root());
    act(() => ref.current?.focusWidget('orders'));
    expect(document.activeElement).toBe(handle('orders'));
    act(() => ref.current?.commitEditing());
    expect(onEditingChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'programmatic' }),
    );
  });

  it('passes native props to the root and composes its handlers', () => {
    const onKeyDown = vi.fn();
    mount({ id: 'board', className: 'x', onKeyDown });
    expect(root().id).toBe('board');
    fireEvent.keyDown(root(), { key: 'a' });
    expect(onKeyDown).toHaveBeenCalled();
  });
});

describe('DashboardWidget', () => {
  it('shows the empty message with the consumer’s action', () => {
    render(
      <DashboardGrid aria-label="Sales">
        <DashboardWidget
          value="a"
          title="A"
          status="empty"
          emptyDescription="Nothing yet"
          emptyAction={<button type="button">Create</button>}
        />
      </DashboardGrid>,
    );
    expect(widget('a').dataset['status']).toBe('empty');
    expect(part('message').textContent).toContain('No data');
    expect(part('message').textContent).toContain('Nothing yet');
    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  });

  it('shows the error message with Try again, which calls onRetry', () => {
    const onRetry = vi.fn();
    render(
      <DashboardGrid aria-label="Sales">
        <DashboardWidget value="a" title="A" status="error" onRetry={onRetry} />
      </DashboardGrid>,
    );
    fireEvent.click(part('retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps the header and waits in the body while loading, with aria-busy', () => {
    render(
      <DashboardGrid aria-label="Sales">
        <DashboardWidget value="a" title="A" loading>
          <p>content</p>
        </DashboardWidget>
      </DashboardGrid>,
    );
    expect(widget('a').hasAttribute('data-loading')).toBe(true);
    expect(screen.getByRole('heading', { name: 'A' })).toBeTruthy();
    expect(part('skeleton').querySelector('[data-ui="skeleton"]')).not.toBeNull();
    expect(screen.queryByText('content')).toBeNull();
    expect(screen.getByRole('article', { name: 'A' }).getAttribute('aria-busy')).toBe('true');
  });

  it('keeps the content and draws the busy line while refreshing', () => {
    render(
      <DashboardGrid aria-label="Sales">
        <DashboardWidget value="a" title="A" busy>
          <p>content</p>
        </DashboardWidget>
      </DashboardGrid>,
    );
    expect(screen.getByText('content')).toBeTruthy();
    expect(part('busy-indicator').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('article', { name: 'A' }).getAttribute('aria-busy')).toBe('true');
  });

  it('links to the widget’s own page', () => {
    mount();
    const link = screen.getByRole('link', { name: 'Open Revenue' });
    expect(link.getAttribute('href')).toBe('/revenue');
    expect(link.dataset['part']).toBe('detail');
  });
});

describe('usePersistedDashboardLayout', () => {
  function Persisted({ storage }: { storage: Storage }) {
    const persisted = usePersistedDashboardLayout({ key: 'sales', storage });
    const [editing] = useState(true);
    return (
      <DashboardGrid aria-label="Sales" editing={editing} {...persisted}>
        {widgets()}
      </DashboardGrid>
    );
  }

  it('reads the stored layout and writes every change', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    } as Storage;
    store.set('sales', '{"v":2,"items":[["trend",0,0,12,3]]}');
    render(<Persisted storage={storage} />);
    expect(order()).toEqual(['trend', 'revenue', 'orders']);
    fireEvent.keyDown(handle('orders'), { key: 'ArrowRight', altKey: true });
    const stored = JSON.parse(store.get('sales')!).items as unknown[][];
    expect(stored.find((item) => item[0] === 'orders')).toEqual(['orders', 4, 3, 3, 2]);
  });

  it('starts from the default when the store holds text it cannot read', () => {
    const storage = {
      getItem: () => 'not a layout',
      setItem: () => {},
      removeItem: () => {},
    } as unknown as Storage;
    render(<Persisted storage={storage} />);
    expect(order()).toEqual(['revenue', 'orders', 'trend']);
  });
});
