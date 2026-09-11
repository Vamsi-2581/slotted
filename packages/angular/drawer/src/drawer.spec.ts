import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/drawer/contract.json';
import { SlDrawer } from './drawer';
import { provideDrawerDefaults } from './drawer-defaults';
import type { DrawerChangeRequest, DrawerExtentRequest } from './drawer-defaults';
import {
  SlDrawerBody,
  SlDrawerClose,
  SlDrawerDescription,
  SlDrawerFooter,
  SlDrawerHeader,
  SlDrawerResizer,
  SlDrawerTitle,
  SlDrawerTrigger,
} from './drawer-parts';

@Component({
  standalone: true,
  imports: [
    SlDrawer,
    SlDrawerTrigger,
    SlDrawerHeader,
    SlDrawerTitle,
    SlDrawerDescription,
    SlDrawerBody,
    SlDrawerFooter,
    SlDrawerClose,
    SlDrawerResizer,
  ],
  template: `<button [slDrawerTrigger]="d">Open details</button>
    <sl-drawer
      #d="slDrawer"
      [(open)]="open"
      [(extent)]="extent"
      [mode]="mode()"
      [side]="side()"
      [size]="size()"
      [mount]="mount()"
      [modal]="modal()"
      [escape]="escape()"
      [loading]="loading()"
      [snapPoints]="snapPoints()"
      (openChangeRequest)="requests.push($event)"
      (extentChangeRequest)="extents.push($event)"
      (closed)="results.push($event)"
    >
      <header slDrawerHeader>
        <h2 slDrawerTitle>Invoice 4471</h2>
        @if (described()) {
          <p slDrawerDescription>Issued on 12 August.</p>
        }
        <button slDrawerClose [value]="'dismissed'"></button>
      </header>
      <div slDrawerBody [inset]="bodyInset()"><input aria-label="Note" /></div>
      <footer slDrawerFooter><button type="button">Cancel</button></footer>
      <div slDrawerResizer></div>
    </sl-drawer>`,
})
class DrawerHost {
  readonly open = signal(false);
  readonly bodyInset = signal<'none' | undefined>(undefined);
  readonly extent = signal<number | undefined>(undefined);
  readonly mode = signal<'overlay' | 'inline' | undefined>(undefined);
  readonly side = signal<'start' | 'end' | 'top' | 'bottom' | undefined>(undefined);
  readonly size = signal<'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined>(undefined);
  readonly mount = signal<'active' | 'lazy' | 'eager' | undefined>(undefined);
  readonly modal = signal(true);
  readonly escape = signal<'close' | 'none' | undefined>(undefined);
  readonly loading = signal(false);
  readonly described = signal(true);
  readonly snapPoints = signal<readonly number[]>([]);
  readonly requests: DrawerChangeRequest[] = [];
  readonly extents: DrawerExtentRequest[] = [];
  readonly results: (string | undefined)[] = [];
}

/**
 * jsdom implements pointer events and not pointer *capture*, and lays nothing
 * out, so both are filled in here rather than guarded in the family: a guard
 * would be production code shaped by the test environment.
 */
beforeAll(() => {
  const element = Element.prototype as unknown as Record<string, unknown>;
  element['setPointerCapture'] ??= () => {};
  element['releasePointerCapture'] ??= () => {};
  element['hasPointerCapture'] ??= () => true;
});

function measureAs(width: number, height: number) {
  HTMLElement.prototype.getBoundingClientRect = () =>
    ({
      bottom: height,
      height,
      left: 0,
      right: width,
      toJSON: () => ({}),
      top: 0,
      width,
      x: 0,
      y: 0,
    }) as DOMRect;
}

describe('SlDrawer', () => {
  let fixture: ComponentFixture<DrawerHost>;
  let host: DrawerHost;

  const layer = () => document.querySelector('[data-ui="drawer"]') as HTMLElement | null;
  const panel = () => document.querySelector('[data-part="panel"]') as HTMLElement | null;
  const separator = () => document.querySelector('[data-part="resizer"]') as HTMLElement | null;
  const trigger = () => fixture.nativeElement.querySelector('[data-part="trigger"]') as HTMLElement;

  const press = (node: Element) => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    fixture.detectChanges();
  };
  const key = (node: Element, value: string, init: KeyboardEventInit = {}) => {
    node.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: value, ...init }),
    );
    fixture.detectChanges();
  };
  const escape = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }),
    );
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DrawerHost] });
    fixture = TestBed.createComponent(DrawerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the anatomy the contract declares', () => {
    host.open.set(true);
    fixture.detectChanges();

    const parts = [...document.querySelectorAll('[data-part]')].map((node) =>
      node.getAttribute('data-part'),
    );
    for (const part of contract.members.drawer.parts) {
      expect(parts, `${part} is declared and never rendered`).toContain(part);
    }
    expect(layer()?.dataset['ui']).toBe('drawer');
  });

  it('writes every axis the stylesheet keys on', () => {
    host.open.set(true);
    host.side.set('bottom');
    host.size.set('lg');
    fixture.detectChanges();

    const root = layer() as HTMLElement;
    expect(root.dataset['mode']).toBe('overlay');
    expect(root.dataset['side']).toBe('bottom');
    expect(root.dataset['size']).toBe('lg');
    expect(root.hasAttribute('data-modal')).toBe(true);
  });

  /* ------------------------------------------------------------- opening - */

  it('opens from the trigger and toggles back', () => {
    press(trigger());
    expect(host.open()).toBe(true);
    expect(host.requests.at(-1)?.reason).toBe('pointer');

    press(trigger());
    expect(host.open()).toBe(false);
  });

  it('promises a popup only where there is one', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    host.mode.set('inline');
    fixture.detectChanges();
    expect(trigger().hasAttribute('aria-haspopup')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('names the panel from the trigger, and the title from the panel', () => {
    host.open.set(true);
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-controls')).toBe(panel()?.id);
    expect(panel()?.getAttribute('aria-labelledby')).toBe(
      document.querySelector('[data-part="title"]')?.id,
    );
    expect(panel()?.getAttribute('aria-describedby')).toBe(
      document.querySelector('[data-part="description"]')?.id,
    );
  });

  /** A reference to an id nothing carries is worse than no name at all. */
  it('writes no description reference for a part that was not rendered', () => {
    host.open.set(true);
    host.described.set(false);
    fixture.detectChanges();

    expect(panel()?.hasAttribute('aria-describedby')).toBe(false);
  });

  /* -------------------------------------------------------------- closing - */

  it('closes from the close button, carrying dismiss and its value', () => {
    host.open.set(true);
    fixture.detectChanges();

    press(document.querySelector('[data-part="close"]') as HTMLElement);
    expect(host.open()).toBe(false);
    expect(host.requests.at(-1)?.reason).toBe('dismiss');
    expect(host.requests.at(-1)?.result).toBe('dismissed');
  });

  /** What `afterClosed()` is in Angular Material, as an output. */
  it('reports the result once the drawer has actually closed', () => {
    host.open.set(true);
    fixture.detectChanges();

    press(document.querySelector('[data-part="close"]') as HTMLElement);
    expect(host.results.at(-1)).toBe('dismissed');
  });

  it('closes on Escape, and refuses it when the policy says so', () => {
    host.open.set(true);
    fixture.detectChanges();
    escape();
    expect(host.open()).toBe(false);

    host.escape.set('none');
    host.open.set(true);
    fixture.detectChanges();
    escape();
    expect(host.open()).toBe(true);
  });

  /** DR1. The scrim is inside the layer's node; the panel is what a press is inside of. */
  it('closes on a press on the scrim, and not on one that began in the panel', () => {
    host.open.set(true);
    fixture.detectChanges();
    const scrim = document.querySelector('[data-part="backdrop"]') as HTMLElement;
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;

    panel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(true);

    scrim.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });

  /**
   * One cancellable request covers every way out. Angular Material's
   * `disableClose` refuses two of the four sources and cannot refuse the third.
   */
  it('lets one guard refuse every source', () => {
    const drawer = fixture.debugElement.children
      .map((child) => child.componentInstance)
      .find((instance): instance is SlDrawer => instance instanceof SlDrawer);

    host.open.set(true);
    fixture.detectChanges();
    fixture.componentRef.instance.requests.length = 0;

    const stop = (request: DrawerChangeRequest) => request.cancel();
    drawer?.openChangeRequest.subscribe(stop);

    escape();
    expect(host.open()).toBe(true);

    press(document.querySelector('[data-part="close"]') as HTMLElement);
    expect(host.open()).toBe(true);
  });

  /* --------------------------------------------------------------- modes - */

  it('is a dialog only where the background is out of reach', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(panel()?.getAttribute('aria-modal')).toBe('true');

    host.mode.set('inline');
    fixture.detectChanges();
    expect(panel()?.hasAttribute('role')).toBe(false);
    expect(panel()?.hasAttribute('aria-modal')).toBe(false);
  });

  it('keeps an inline drawer in the document and makes it inert when closed', () => {
    host.mode.set('inline');
    fixture.detectChanges();

    expect(layer()).not.toBeNull();
    expect(layer()?.hasAttribute('inert')).toBe(true);
    expect(layer()?.hasAttribute('data-open')).toBe(false);
  });

  it('paints no scrim where there is nothing to put out of reach', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(document.querySelector('[data-part="backdrop"]')).not.toBeNull();

    host.mode.set('inline');
    fixture.detectChanges();
    expect(document.querySelector('[data-part="backdrop"]')).toBeNull();
  });

  /* ------------------------------------------------------------- resizing - */

  it('wires the separator to the pane it sizes, both ways', () => {
    host.open.set(true);
    fixture.detectChanges();

    const bar = separator() as HTMLElement;
    expect(bar.getAttribute('role')).toBe('separator');
    expect(bar.getAttribute('tabindex')).toBe('0');
    expect(bar.getAttribute('aria-orientation')).toBe('vertical');
    expect(bar.getAttribute('aria-controls')).toBe(panel()?.id);
    expect(bar.getAttribute('aria-labelledby')).toBe(
      document.querySelector('[data-part="title"]')?.id,
    );
  });

  it('reports the measure as the range the pattern calls typical', () => {
    host.open.set(true);
    host.extent.set(0.4);
    fixture.detectChanges();

    const bar = separator() as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuemin')).toBe('20');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('turns the block axis around for a sheet', () => {
    host.open.set(true);
    host.side.set('bottom');
    fixture.detectChanges();
    expect(separator()?.getAttribute('aria-orientation')).toBe('horizontal');
  });

  /**
   * The arrows name a direction on the screen, which is the Window Splitter
   * pattern's own reading: the same key moves the separator the same way, and
   * two panels on opposite edges therefore move in opposite directions.
   */
  it('moves the separator by the screen rather than by the anchor', () => {
    measureAs(1600, 800);
    host.open.set(true);
    host.extent.set(0.4);
    host.side.set('end');
    fixture.detectChanges();

    key(separator() as HTMLElement, 'ArrowLeft');
    expect(host.extent()).toBeCloseTo(0.4 + 16 / 1600, 5);
    expect(host.extents.at(-1)?.reason).toBe('keyboard');

    host.extent.set(0.4);
    host.side.set('start');
    fixture.detectChanges();
    key(separator() as HTMLElement, 'ArrowLeft');
    expect(host.extent()).toBeCloseTo(0.4 - 16 / 1600, 5);
  });

  /**
   * A distance and not a proportion. Sixteen pixels is an adjustment at every
   * layer width; five per cent of a sixteen-hundred-pixel layer is eighty, and
   * a reader placing an edge against the words beside it cannot use eighty.
   */
  it('moves by sixteen pixels, and by sixty-four with Shift', () => {
    measureAs(1600, 800);
    host.open.set(true);
    host.extent.set(0.5);
    host.side.set('end');
    fixture.detectChanges();

    key(separator() as HTMLElement, 'ArrowLeft');
    expect(host.extent()).toBeCloseTo(0.5 + 16 / 1600, 5);

    host.extent.set(0.5);
    fixture.detectChanges();
    key(separator() as HTMLElement, 'ArrowLeft', { shiftKey: true });
    expect(host.extent()).toBeCloseTo(0.5 + 64 / 1600, 5);

    /* A block side measures against the block axis, so the same press is a
       different fraction of a layer that is not square. */
    host.extent.set(0.5);
    host.side.set('bottom');
    fixture.detectChanges();
    key(separator() as HTMLElement, 'ArrowUp');
    expect(host.extent()).toBeCloseTo(0.5 + 16 / 800, 5);
  });

  /**
   * Back to the measure the size step gives it, which is what `undefined`
   * means for this state and what every desktop pane divider answers a double
   * click with.
   */
  it('restores the measure it started from on a double click', () => {
    measureAs(1600, 800);
    /* The measure a double click restores is the one the consumer's binding
       said before anything moved, so it has to be bound before the drawer
       initialises rather than set after it. Angular holds one model where
       React holds a controlled input and an uncontrolled default. */
    fixture = TestBed.createComponent(DrawerHost);
    host = fixture.componentInstance;
    host.extent.set(0.5);
    host.open.set(true);
    fixture.detectChanges();

    key(separator() as HTMLElement, 'End');
    expect(host.extent()).toBe(1);

    (separator() as HTMLElement).dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(host.extent()).toBe(0.5);
    expect(host.extents.at(-1)?.reason).toBe('pointer');
  });

  it('restores to the size step itself when the consumer named no measure', () => {
    measureAs(1600, 800);
    host.open.set(true);
    fixture.detectChanges();

    key(separator() as HTMLElement, 'End');
    expect(host.extent()).toBe(1);

    (separator() as HTMLElement).dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(host.extent()).toBeUndefined();
  });

  /**
   * The cursor has to survive the pointer leaving the separator — capture
   * keeps the events coming and the cursor is decided by what is under the
   * pointer — and a drag across the page must not select the text under it.
   */
  it('holds the cursor and suspends selection for the life of a drag', () => {
    measureAs(1000, 800);
    host.open.set(true);
    host.side.set('end');
    fixture.detectChanges();

    (separator() as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 600, pointerId: 1 }),
    );
    fixture.detectChanges();
    expect(document.body.style.cursor).toBe('col-resize');
    expect(document.documentElement.style.userSelect).toBe('none');

    (separator() as HTMLElement).dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }),
    );
    fixture.detectChanges();
    expect(document.body.style.cursor).toBe('');
    expect(document.documentElement.style.userSelect).toBe('');
  });

  it('takes Home and End to the ends of the range', () => {
    host.open.set(true);
    host.extent.set(0.5);
    fixture.detectChanges();

    key(separator() as HTMLElement, 'End');
    expect(host.extent()).toBe(1);

    key(separator() as HTMLElement, 'Home');
    expect(host.extent()).toBe(0.2);
  });

  it('collapses and restores on Enter without closing', () => {
    host.open.set(true);
    host.extent.set(0.6);
    fixture.detectChanges();

    key(separator() as HTMLElement, 'Enter');
    expect(host.extent()).toBe(0.2);
    expect(host.open()).toBe(true);

    key(separator() as HTMLElement, 'Enter');
    expect(host.extent()).toBe(0.6);
  });

  it('moves between snap points rather than by the step', () => {
    host.open.set(true);
    host.side.set('bottom');
    host.snapPoints.set([0.25, 0.5, 1]);
    host.extent.set(0.25);
    fixture.detectChanges();

    key(separator() as HTMLElement, 'ArrowUp');
    expect(host.extent()).toBe(0.5);
  });

  it('takes its limits from the first and last stop', () => {
    host.open.set(true);
    host.snapPoints.set([0.3, 0.6, 0.9]);
    fixture.detectChanges();

    expect(separator()?.getAttribute('aria-valuemin')).toBe('30');
    expect(separator()?.getAttribute('aria-valuemax')).toBe('90');
  });

  it('follows the pointer while it is down, and says so in the DOM', () => {
    measureAs(1000, 800);
    host.open.set(true);
    host.side.set('end');
    fixture.detectChanges();

    const bar = separator() as HTMLElement;
    bar.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX: 700,
        clientY: 0,
        pointerId: 1,
      }),
    );
    fixture.detectChanges();

    expect(layer()?.hasAttribute('data-dragging')).toBe(true);
    expect(host.extent()).toBeCloseTo(0.3, 5);

    bar.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    fixture.detectChanges();
    expect(layer()?.hasAttribute('data-dragging')).toBe(false);
  });

  /**
   * One rule on release: a measure below the floor asks to close, carrying
   * `pointer`, which is what MUI's `SwipeableDrawer` and Vaul's dismiss gesture
   * both do — expressed as a consequence of the resize rather than as a second
   * mechanism.
   */
  it('asks to close when a drag is released below the floor', () => {
    measureAs(1000, 800);
    host.open.set(true);
    host.side.set('end');
    fixture.detectChanges();

    const bar = separator() as HTMLElement;
    bar.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX: 950,
        clientY: 0,
        pointerId: 1,
      }),
    );
    fixture.detectChanges();
    bar.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(host.requests.at(-1)?.reason).toBe('pointer');
  });

  /* --------------------------------------------------------------- state - */

  it('carries the loading state to the row that is waiting', () => {
    host.open.set(true);
    host.loading.set(true);
    fixture.detectChanges();

    expect(layer()?.hasAttribute('data-loading')).toBe(true);
    expect(document.querySelector('[data-part="body"]')?.getAttribute('aria-busy')).toBe('true');
  });

  /* --------------------------------------------------------- composition - */

  it('lets an application set the axes once', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DrawerHost],
      providers: [provideDrawerDefaults({ side: 'start', size: 'xl' })],
    });
    const scoped = TestBed.createComponent(DrawerHost);
    scoped.componentInstance.open.set(true);
    scoped.detectChanges();

    expect(layer()?.dataset['side']).toBe('start');
    expect(layer()?.dataset['size']).toBe('xl');
  });

  it('lets an explicit value win over the provider', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DrawerHost],
      providers: [provideDrawerDefaults({ size: 'xl' })],
    });
    const scoped = TestBed.createComponent(DrawerHost);
    scoped.componentInstance.open.set(true);
    scoped.componentInstance.size.set('sm');
    scoped.detectChanges();

    expect(layer()?.dataset['size']).toBe('sm');
  });
});
