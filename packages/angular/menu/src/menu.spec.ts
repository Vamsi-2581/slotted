import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SlMenu } from './menu';
import {
  SlMenuGroup,
  SlMenuItem,
  SlMenuItemDescription,
  SlMenuRadioGroup,
  SlMenuSeparator,
} from './menu-items';
import { SlMenuTrigger } from './menu-trigger';
import { provideMenuDefaults } from './menu-defaults';

@Component({
  standalone: true,
  imports: [
    SlMenu,
    SlMenuGroup,
    SlMenuItem,
    SlMenuItemDescription,
    SlMenuRadioGroup,
    SlMenuSeparator,
    SlMenuTrigger,
  ],
  template: `
    <button [slMenuTriggerFor]="document">Document</button>
    <sl-menu #document [size]="size()">
      <sl-menu-group label="File">
        <button slMenuItem shortcut="Mod+D" (select)="ran.set($event.reason)">Duplicate</button>
        <button slMenuItem [disabled]="true" (select)="ran.set($event.reason)">Publish</button>
      </sl-menu-group>
      <hr slMenuSeparator />
      <button slMenuCheckboxItem [(checked)]="comments">Show comments</button>
      <sl-menu-radio-group [(value)]="sort">
        <button slMenuRadioItem value="name">Name</button>
        <button slMenuRadioItem value="date">Date</button>
      </sl-menu-radio-group>
      <button slMenuItem [slMenuTriggerFor]="exports">Export as</button>
      <sl-menu #exports>
        <button slMenuItem>PDF</button>
      </sl-menu>
      <button slMenuItem tone="danger">
        Share
        <span slMenuItemDescription>Anyone with the link.</span>
      </button>
    </sl-menu>
    <button type="button">After</button>
  `,
})
class Host {
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly comments = signal(false);
  readonly sort = signal<string | undefined>('name');
  readonly ran = signal<string | undefined>(undefined);
}

const surface = () => document.querySelector<HTMLElement>("[data-ui='menu'] [data-part='content']");
const items = () => [...document.querySelectorAll<HTMLElement>("[data-part='item']")];
const item = (label: string) =>
  items().find((node) => node.querySelector("[data-part='label']")?.textContent?.trim() === label);

const press = (key: string, options: KeyboardEventInit = {}) =>
  document.activeElement?.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key, ...options }),
  );

const click = (node: Element | null | undefined, detail = 1) =>
  node?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));

describe('SlMenu', () => {
  let fixture: ComponentFixture<Host>;
  let trigger: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    trigger = fixture.nativeElement.querySelector('button') as HTMLElement;
  });

  const open = async () => {
    click(trigger);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('wires the control to the surface it discloses', async () => {
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await open();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(surface()?.id);
    expect(surface()?.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(surface()?.getAttribute('role')).toBe('menu');
  });

  it('opens onto the first item, as the pattern requires', async () => {
    await open();
    expect(document.activeElement).toBe(item('Duplicate'));
  });

  it('opens onto the last item when the control is arrowed up', async () => {
    trigger.focus();
    press('ArrowUp');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(items().at(-1));
  });

  it('moves along the items and reaches both ends', async () => {
    await open();

    press('ArrowDown');
    expect(document.activeElement).toBe(item('Publish'));

    press('End');
    expect(document.activeElement).toBe(items().at(-1));

    press('Home');
    expect(document.activeElement).toBe(item('Duplicate'));
  });

  it('keeps a disabled item in the ring and runs nothing from it', async () => {
    await open();

    press('ArrowDown');
    const publish = item('Publish');
    expect(document.activeElement).toBe(publish);
    expect(publish?.getAttribute('aria-disabled')).toBe('true');

    click(publish);
    fixture.detectChanges();

    expect(fixture.componentInstance.ran()).toBeUndefined();
    expect(surface()).not.toBeNull();
  });

  it('moves to the item a printable character names', async () => {
    await open();

    press('s');
    expect(document.activeElement).toBe(item('Show comments'));
  });

  it('runs an item, reports the device, and closes', async () => {
    await open();

    click(item('Duplicate'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.ran()).toBe('pointer');
    expect(surface()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('prints a shortcut for the platform and announces it', async () => {
    await open();

    const duplicate = item('Duplicate');
    expect(duplicate?.getAttribute('aria-keyshortcuts')).toBe('Control+D');
    expect(duplicate?.querySelector("[data-part='shortcut']")?.textContent).toBe('Ctrl+D');
    expect(duplicate?.querySelector("[data-part='shortcut']")?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('holds a checkbox item without closing the menu', async () => {
    await open();

    const checkbox = item('Show comments');
    expect(checkbox?.getAttribute('role')).toBe('menuitemcheckbox');
    expect(checkbox?.getAttribute('aria-checked')).toBe('false');

    click(checkbox);
    fixture.detectChanges();

    expect(fixture.componentInstance.comments()).toBe(true);
    expect(surface()).not.toBeNull();
  });

  it('toggles a checkbox item with Space, which the pattern makes optional', async () => {
    await open();
    item('Show comments')?.focus();

    press(' ');
    fixture.detectChanges();

    expect(fixture.componentInstance.comments()).toBe(true);
    expect(surface()).not.toBeNull();
  });

  it('holds one value across a radio group', async () => {
    await open();

    expect(item('Name')?.getAttribute('aria-checked')).toBe('true');

    click(item('Date'));
    fixture.detectChanges();

    expect(fixture.componentInstance.sort()).toBe('date');
    expect(item('Date')?.getAttribute('aria-checked')).toBe('true');
  });

  it('describes an item from the line under its label', async () => {
    await open();

    const share = item('Share');
    const description = share?.querySelector("[data-part='description']");
    expect(share?.getAttribute('aria-describedby')).toBe(description?.id);
    expect(share?.getAttribute('data-tone')).toBe('danger');
  });

  it('names a group by the label inside it', async () => {
    await open();

    const group = document.querySelector<HTMLElement>("[data-part='group'][role='group']");
    const label = group?.querySelector("[data-part='group-label']");
    expect(group?.getAttribute('aria-labelledby')).toBe(label?.id);
  });

  it('closes on Escape and gives focus back to the control', async () => {
    await open();

    press('Escape');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(surface()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Tab and moves focus past the control', async () => {
    await open();

    press('Tab');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(surface()).toBeNull();
    expect((document.activeElement as HTMLElement).textContent).toBe('After');
  });

  it('opens a submenu on the inline end and closes it back onto its item', async () => {
    await open();

    const parentItem = item('Export as');
    expect(parentItem?.getAttribute('aria-haspopup')).toBe('menu');

    parentItem?.focus();
    press('ArrowRight');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(item('PDF')).not.toBeUndefined();
    expect(document.activeElement).toBe(item('PDF'));

    press('ArrowLeft');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(item('PDF')).toBeUndefined();
    expect(document.activeElement).toBe(item('Export as'));
  });

  /**
   * Where a submenu lands (M2). A headless document lays nothing out, so the
   * surfaces are given the boxes a browser would give them: the parent surface
   * insets its items by five pixels (a border and a step of padding), and the
   * submenu surface insets its first item by the same five. The positioner is
   * real; only the measurements are stated.
   */
  it('lands one inset out from the parent edge, its first item level with the item that opened it', async () => {
    const boxOf = (element: Element) => {
      const text = element.textContent ?? '';
      const role = element.getAttribute('role');
      const part = element.getAttribute('data-part');
      if (role === 'menu' && text.includes('Export as')) {
        return { x: 100, y: 100, width: 200, height: 120 };
      }
      if (role === 'menuitem' && text.trim() === 'Export as') {
        return { x: 105, y: 140, width: 190, height: 32 };
      }
      if (element.getAttribute('data-ui') === 'menu' && part === 'root' && text.includes('PDF')) {
        return { x: 0, y: 0, width: 168, height: 90 };
      }
      if (role === 'menu' && text.includes('PDF')) return { x: 0, y: 0, width: 160, height: 90 };
      if (role === 'menuitem' && text.trim() === 'PDF')
        return { x: 5, y: 5, width: 150, height: 32 };
      return { x: 0, y: 0, width: 0, height: 0 };
    };
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const box = boxOf(this);
      return {
        ...box,
        left: box.x,
        top: box.y,
        right: box.x + box.width,
        bottom: box.y + box.height,
        toJSON: () => ({}),
      };
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return boxOf(this).width;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return boxOf(this).height;
    });

    await open();
    item('Export as')?.focus();
    press('ArrowRight');
    fixture.detectChanges();
    await fixture.whenStable();

    const layer = item('PDF')?.closest<HTMLElement>("[data-ui='menu']") ?? null;
    expect(layer).not.toBeNull();
    await vi.waitFor(() => expect(layer?.hasAttribute('data-positioned')).toBe(true));
    /* The item's right edge is at 295; the parent surface's inset of 5 puts
       the layer at 300, and the submenu's inset of 5 lifts it from 140 to 135. */
    expect(layer?.style.left).toBe('300px');
    expect(layer?.style.top).toBe('135px');
    vi.restoreAllMocks();
  });

  it('waits a hundred and fifty milliseconds before hover opens a submenu', async () => {
    await open();
    vi.useFakeTimers();
    try {
      item('Export as')?.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
      await vi.advanceTimersByTimeAsync(100);
      fixture.detectChanges();
      expect(item('PDF')).toBeUndefined();

      await vi.advanceTimersByTimeAsync(50);
      fixture.detectChanges();
      expect(item('PDF')).not.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('takes the size an application set once', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideMenuDefaults({ size: 'lg' })],
    });
    const scoped = TestBed.createComponent(Host);
    scoped.detectChanges();
    await scoped.whenStable();

    (scoped.nativeElement.querySelector('button') as HTMLElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1 }),
    );
    scoped.detectChanges();
    await scoped.whenStable();

    expect(document.querySelector("[data-ui='menu']")?.getAttribute('data-size')).toBe('lg');
  });
});
