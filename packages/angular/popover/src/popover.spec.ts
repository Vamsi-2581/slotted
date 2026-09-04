import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import contract from '../../../../specs/components/popover/contract.json';
import { SlPopover } from './popover';
import { providePopoverDefaults } from './popover-defaults';
import {
  SlPopoverArrow,
  SlPopoverBody,
  SlPopoverClose,
  SlPopoverContent,
  SlPopoverDescription,
  SlPopoverFooter,
  SlPopoverHeader,
  SlPopoverLayer,
  SlPopoverTitle,
  SlPopoverTrigger,
} from './popover-parts';

@Component({
  standalone: true,
  imports: [
    SlPopover,
    SlPopoverTrigger,
    SlPopoverLayer,
    SlPopoverContent,
    SlPopoverHeader,
    SlPopoverTitle,
    SlPopoverDescription,
    SlPopoverBody,
    SlPopoverFooter,
    SlPopoverClose,
    SlPopoverArrow,
  ],
  template: `
    <ng-container
      slPopover
      [(open)]="open"
      [disabled]="disabled()"
      [size]="size()"
      [autoFocus]="autoFocus()"
      [initialFocus]="initialFocus()"
      (openChangeRequest)="reasons.push($event.reason)"
    >
      <button slPopoverTrigger type="button">Filters</button>
      <ng-template slPopoverLayer>
        <div slPopoverContent>
          <div slPopoverHeader>
            <div slPopoverTitle>Filter invoices</div>
            <p slPopoverDescription>Applies to the current view only.</p>
            <button slPopoverClose></button>
          </div>
          <div slPopoverBody><input aria-label="Search" /></div>
          <div slPopoverFooter><button type="button">Apply</button></div>
          <div slPopoverArrow></div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly autoFocus = signal(true);
  readonly initialFocus = signal<string | undefined>(undefined);
  readonly reasons: string[] = [];
}

const layer = () => document.querySelector('[data-ui="popover"]');
const panel = () => document.querySelector('[role="dialog"]');
const guards = () => document.querySelectorAll('[data-part="focus-guard"]');

function trigger(fixture: ComponentFixture<Host>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button');
}

/**
 * The positioner measures asynchronously, and the family waits for the first
 * measurement before it moves the focus — a layer still at the origin would
 * scroll the page to itself. Settling therefore takes two passes: one for the
 * template, one for the frame the measurement lands in.
 */
async function settle(fixture: ComponentFixture<Host>) {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('SlPopover', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    await settle(fixture);
  });

  it('builds nothing until it is opened', () => {
    expect(layer()).toBeNull();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
    expect(trigger(fixture).getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('renders every part the contract declares', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const present = contract.members.popover.parts.filter(
      (part) => document.querySelector(`[data-part="${part}"]`) !== null,
    );
    expect(present).toEqual(contract.members.popover.parts);
  });

  it('opens from the trigger and says so on it', async () => {
    trigger(fixture).click();
    await settle(fixture);

    expect(layer()).not.toBeNull();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(trigger(fixture).getAttribute('aria-controls')).toBe(panel()?.id);
  });

  it('names the panel from its title and describes it from its description', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(panel()?.getAttribute('aria-labelledby')).toBe(
      document.querySelector('[data-part="title"]')?.id,
    );
    expect(panel()?.getAttribute('aria-describedby')).toBe(
      document.querySelector('[data-part="description"]')?.id,
    );
    expect(panel()?.getAttribute('aria-modal')).toBeNull();
  });

  it('takes the focus on open and gives it back on close', async () => {
    trigger(fixture).click();
    await settle(fixture);
    expect(document.activeElement).toBe(panel());

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('focuses what initialFocus names instead', async () => {
    fixture.componentInstance.initialFocus.set('input');
    trigger(fixture).click();
    await settle(fixture);

    expect(document.activeElement).toBe(document.querySelector('input'));
  });

  it('leaves the focus alone when autoFocus is off', async () => {
    fixture.componentInstance.autoFocus.set(false);
    trigger(fixture).focus();
    trigger(fixture).click();
    await settle(fixture);

    expect(document.activeElement).toBe(trigger(fixture));
  });

  /**
   * The question every surveyed library leaves open: what Tab does at the edge
   * of a layer that lives at the end of the document and is not modal.
   */
  it('closes and returns focus when Tab reaches the edge of the layer', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect(guards().length).toBe(2);

    (guards()[1] as HTMLElement).dispatchEvent(new FocusEvent('focus'));
    await settle(fixture);

    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.reasons).toContain('keyboard');
    expect(contract.focus.guards.emits).toBe('keyboard');
  });

  it('closes from the close control with the reason dismiss', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const close = document.querySelector('[data-part="close"]') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.click();
    await settle(fixture);

    expect(fixture.componentInstance.reasons).toContain('dismiss');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('closes on a press outside and not on one inside', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    (panel() as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(true);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.reasons).toContain('outsidePress');
  });

  it('never opens while it is disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect(layer()).toBeNull();
  });

  it('paints the axes the stylesheet reads', async () => {
    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(layer()?.getAttribute('data-size')).toBe('lg');
    expect(layer()?.getAttribute('data-width')).toBe('auto');
    expect(layer()?.getAttribute('data-align')).toBe('center');
  });
});

describe('providePopoverDefaults', () => {
  it('translates the close control once for an application', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [providePopoverDefaults({ closeLabel: 'Fechar', width: 'anchor' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    expect(document.querySelector('[data-part="close"]')?.getAttribute('aria-label')).toBe(
      'Fechar',
    );
    expect(layer()?.getAttribute('data-width')).toBe('anchor');
  });
});
