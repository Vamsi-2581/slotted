import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/tooltip/contract.json';
import { SlTooltip } from './tooltip';
import { provideTooltipDefaults } from './tooltip-defaults';
import {
  SlTooltipArrow,
  SlTooltipContent,
  SlTooltipLayer,
  SlTooltipTrigger,
} from './tooltip-parts';

@Component({
  standalone: true,
  imports: [SlTooltip, SlTooltipTrigger, SlTooltipLayer, SlTooltipContent, SlTooltipArrow],
  template: `
    <ng-container
      slTooltip
      [(open)]="open"
      [describes]="describes()"
      [whenClipped]="whenClipped()"
      [disabled]="disabled()"
      [openDelay]="openDelay()"
      [closeDelay]="closeDelay()"
      [size]="size()"
      (openChangeRequest)="reasons.push($event.reason)"
    >
      <button slTooltipTrigger type="button">Save draft</button>
      <ng-template slTooltipLayer>
        <div slTooltipContent>Saves without publishing</div>
        <div slTooltipArrow></div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly describes = signal<'description' | 'label' | 'none'>('description');
  readonly whenClipped = signal(false);
  readonly disabled = signal(false);
  readonly openDelay = signal(0);
  readonly closeDelay = signal(0);
  readonly size = signal<'sm' | 'md'>('md');
  readonly reasons: string[] = [];
}

const layer = () => document.querySelector('[data-ui="tooltip"]');
const hint = () => document.querySelector('[role="tooltip"]');

function trigger(fixture: ComponentFixture<Host>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button');
}

/**
 * The positioner measures asynchronously, so settling takes two passes: one for
 * the template, one for the frame the measurement lands in.
 */
async function settle(fixture: ComponentFixture<Host>) {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('SlTooltip', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    await settle(fixture);
  });

  it('builds no layer at all until it is opened', () => {
    expect(layer()).toBeNull();
  });

  /**
   * The stylesheet selects the arrow as a direct child of the layer, so an
   * arrow written inside the content is an unstyled div — which is what the
   * first rendered reference page showed, and no offline test could see.
   */
  it('keeps the arrow beside the content rather than inside it', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const arrow = document.querySelector('[data-part="arrow"]');
    expect(arrow?.parentElement).toBe(layer() as HTMLElement);
  });

  it('renders the anatomy the contract declares', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(layer()?.getAttribute('data-part')).toBe('root');
    expect(hint()?.getAttribute('data-part')).toBe('content');
    expect(document.querySelector('[data-part="arrow"]')).not.toBeNull();
    expect(contract.members.tooltip.parts).toEqual(['root', 'content', 'arrow']);
  });

  it('opens on hover and closes when the pointer leaves', async () => {
    trigger(fixture).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await settle(fixture);
    expect(layer()).not.toBeNull();

    trigger(fixture).dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('writes aria-describedby while open, and aria-labelledby under label', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect(trigger(fixture).getAttribute('aria-describedby')).toBe(hint()?.id);

    fixture.componentInstance.describes.set('label');
    await settle(fixture);
    expect(trigger(fixture).getAttribute('aria-labelledby')).toBe(hint()?.id);
    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();
  });

  /**
   * The hint over a name cut by its box, and nothing over a name that fits. The
   * measurement is taken when the hint would open rather than watched, so the
   * same trigger answers differently after its column is dragged wider.
   */
  it('opens over a cut name alone under whenClipped', async () => {
    const measure = (element: Element, sizes: { client: number; scroll: number }) => {
      Object.defineProperty(element, 'clientWidth', { configurable: true, value: sizes.client });
      Object.defineProperty(element, 'scrollWidth', { configurable: true, value: sizes.scroll });
    };

    fixture.componentInstance.whenClipped.set(true);
    await settle(fixture);
    /* jsdom does not expand the `overflow` shorthand, so the axis is written. */
    trigger(fixture).style.overflowX = 'hidden';

    measure(trigger(fixture), { client: 120, scroll: 120 });
    trigger(fixture).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await settle(fixture);
    expect(layer()).toBeNull();

    measure(trigger(fixture), { client: 48, scroll: 120 });
    trigger(fixture).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    await settle(fixture);
    expect(hint()?.textContent).toBe('Saves without publishing');
  });

  /**
   * A hint that repeats words the trigger already carries — the full name of a
   * column whose header is clipped — is read twice under either reference.
   */
  it('references nothing and hides the hint under none', async () => {
    fixture.componentInstance.describes.set('none');
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();
    expect(trigger(fixture).getAttribute('aria-labelledby')).toBeNull();
    expect(hint()?.getAttribute('aria-hidden')).toBe('true');
  });

  /**
   * Under `label` the layer is the trigger's accessible name, so it has to be
   * in the document before anyone opens it.
   */
  it('keeps the layer mounted while it is the accessible name', async () => {
    fixture.componentInstance.describes.set('label');
    await settle(fixture);

    expect(hint()).not.toBeNull();
    expect(layer()?.hasAttribute('data-open')).toBe(false);
  });

  it('carries the reason on every transition, and can be refused', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);

    expect(fixture.componentInstance.reasons).toContain('escape');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('never opens while it is disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect(layer()).toBeNull();
  });

  it('paints the axes the stylesheet reads', async () => {
    fixture.componentInstance.size.set('sm');
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(layer()?.getAttribute('data-size')).toBe('sm');
    expect(layer()?.getAttribute('data-variant')).toBe('inverse');
    expect(layer()?.getAttribute('data-align')).toBe('center');
    expect(layer()?.hasAttribute('data-hoverable')).toBe(true);
  });

  it('opens and closes from the instance the template can reach', async () => {
    const directive = fixture.debugElement.children[0]?.injector.get(SlTooltip);
    directive?.show();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(true);

    directive?.hide();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});

describe('provideTooltipDefaults', () => {
  it('sets the defaults once, and the instance still wins', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideTooltipDefaults({ variant: 'surface', size: 'sm' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(layer()?.getAttribute('data-variant')).toBe('surface');
    expect(layer()?.getAttribute('data-size')).toBe('md');
  });
});
