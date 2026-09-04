import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import contract from '../../../../specs/components/dialog/contract.json';
import { SlAlertDialog, SlDialog } from './dialog';
import { provideDialogDefaults } from './dialog-defaults';
import type { DialogChangeRequest } from './dialog-defaults';
import {
  SlAlertDialogAction,
  SlAlertDialogCancel,
  SlAlertDialogIcon,
  SlDialogBody,
  SlDialogClose,
  SlDialogDescription,
  SlDialogFooter,
  SlDialogHeader,
  SlDialogTitle,
  SlDialogTrigger,
} from './dialog-parts';

@Component({
  standalone: true,
  imports: [
    SlDialog,
    SlDialogTrigger,
    SlDialogHeader,
    SlDialogTitle,
    SlDialogDescription,
    SlDialogBody,
    SlDialogFooter,
    SlDialogClose,
  ],
  template: `<button [slDialogTrigger]="d">Edit project</button>
    <sl-dialog
      #d="slDialog"
      [(open)]="open"
      [size]="size()"
      [surface]="surface()"
      [modal]="modal()"
      [escape]="escape()"
      [outsidePress]="outsidePress()"
      [mount]="mount()"
      [loading]="loading()"
      (openChangeRequest)="requests.push($event)"
      (closed)="results.push($event)"
    >
      <header slDialogHeader>
        <h2 slDialogTitle>Edit project</h2>
        @if (described()) {
          <p slDialogDescription>Names are visible to everyone.</p>
        }
        <button slDialogClose [value]="'dismissed'"></button>
      </header>
      <div slDialogBody><input aria-label="Name" /></div>
      <footer slDialogFooter><button type="button">Cancel</button></footer>
    </sl-dialog>`,
})
class DialogHost {
  readonly open = signal(false);
  readonly size = signal<'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined>(undefined);
  readonly surface = signal<'panel' | 'plain' | undefined>(undefined);
  readonly modal = signal(true);
  readonly escape = signal<'close' | 'none' | undefined>(undefined);
  readonly outsidePress = signal<'close' | 'none' | undefined>(undefined);
  readonly mount = signal<'active' | 'lazy' | 'eager' | undefined>(undefined);
  readonly loading = signal(false);
  readonly described = signal(true);
  readonly requests: DialogChangeRequest[] = [];
  readonly results: (string | undefined)[] = [];
}

@Component({
  standalone: true,
  imports: [
    SlAlertDialog,
    SlDialogTrigger,
    SlDialogHeader,
    SlDialogTitle,
    SlDialogDescription,
    SlDialogBody,
    SlDialogFooter,
    SlAlertDialogIcon,
    SlAlertDialogCancel,
    SlAlertDialogAction,
  ],
  template: `<button [slDialogTrigger]="d">Delete</button>
    <sl-alert-dialog
      #d="slAlertDialog"
      [(open)]="open"
      [tone]="tone()"
      (openChangeRequest)="requests.push($event)"
    >
      <header slDialogHeader>
        <span slAlertDialogIcon></span>
        <h2 slDialogTitle>Delete this project?</h2>
        <p slDialogDescription>This cannot be undone.</p>
      </header>
      <div slDialogBody>The project and its 42 documents are removed for everyone.</div>
      <footer slDialogFooter>
        <button slAlertDialogCancel>Keep project</button>
        <button slAlertDialogAction>Delete project</button>
      </footer>
    </sl-alert-dialog>`,
})
class AlertHost {
  readonly open = signal(false);
  readonly tone = signal<'accent' | 'secondary' | 'success' | 'warning' | 'danger'>('danger');
  readonly requests: DialogChangeRequest[] = [];
}

const layer = () => document.querySelector('[data-ui="dialog"]') as HTMLElement | null;
const panel = () => document.querySelector('[data-part="content"]') as HTMLElement | null;
const part = (name: string) => document.querySelector(`[data-part="${name}"]`) as HTMLElement;

function press(node: Element, detail = 1) {
  node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail }));
}

function escape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('SlDialog', () => {
  let fixture: ComponentFixture<DialogHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogHost] });
    fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();
  });

  it('renders the anatomy the contract declares', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const parts = [...document.querySelectorAll('[data-part]')].map((node) =>
      node.getAttribute('data-part'),
    );
    for (const declared of contract.members.dialog.parts) {
      expect(parts, `${declared} is declared and never rendered`).toContain(declared);
    }
    expect(layer()?.getAttribute('data-ui')).toBe('dialog');
  });

  /**
   * The host stays where the consumer wrote it and the layer is the element
   * that moves, which is what lets `mount="active"` remove the layer outright
   * and what makes the host the portal's origin.
   */
  it('leaves the layer out of the document entirely while it is closed', () => {
    expect(layer()).toBeNull();
    expect(document.querySelector('sl-dialog')).not.toBeNull();
  });

  it('keeps the layer in the document and inert when it is mounted eagerly', () => {
    fixture.componentInstance.mount.set('eager');
    fixture.detectChanges();

    expect(layer()).not.toBeNull();
    expect(layer()?.hasAttribute('data-open')).toBe(false);
    expect(layer()?.hasAttribute('inert')).toBe(true);
  });

  it('moves the layer into the portal rather than leaving it where it was written', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(layer()?.closest('sl-dialog')).toBeNull();
    expect(layer()?.closest('[data-slotted-portal]')).not.toBeNull();
  });

  it('opens from the trigger and says whether a pointer or a key did it', () => {
    press(document.querySelector('[data-part="trigger"]') as Element);
    fixture.detectChanges();

    expect(fixture.componentInstance.requests[0]?.reason).toBe('pointer');
    expect(fixture.componentInstance.open()).toBe(true);
    expect(panel()).not.toBeNull();
  });

  it('reports a keyboard activation as keyboard rather than as a pointer', () => {
    press(document.querySelector('[data-part="trigger"]') as Element, 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.requests[0]?.reason).toBe('keyboard');
  });

  it('wires the trigger to the layer it opens', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const trigger = document.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()?.id);
  });

  it('names the layer by its title and describes it by its description', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const content = panel() as HTMLElement;
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.getAttribute('aria-modal')).toBe('true');
    expect(
      document.getElementById(content.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toContain('Edit project');
    expect(
      document.getElementById(content.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toContain('Names are visible');
  });

  /** An `aria-labelledby` pointing at an id nothing carries is worse than none. */
  it('writes no aria-describedby when no description part was rendered', () => {
    fixture.componentInstance.described.set(false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(panel()?.hasAttribute('aria-describedby')).toBe(false);
  });

  /**
   * The APG warns that marking a dialog modal without making the background
   * inert has severe consequences for the readers who rely on the mark.
   */
  it('writes no aria-modal on a layer that leaves the background reachable', () => {
    fixture.componentInstance.modal.set(false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(panel()?.hasAttribute('aria-modal')).toBe(false);
    expect(layer()?.hasAttribute('data-modal')).toBe(false);
  });

  it('closes on Escape, carrying escape', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    escape();
    fixture.detectChanges();

    expect(fixture.componentInstance.requests.at(-1)?.reason).toBe('escape');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('refuses Escape when the consumer says the layer does not answer it', () => {
    fixture.componentInstance.escape.set('none');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    escape();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('closes on a press outside the layer, carrying outsidePress', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.requests.at(-1)?.reason).toBe('outsidePress');
  });

  /** The trigger is a branch of the layer, or opening would close it again. */
  it('does not read a press on its own trigger as a press outside', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    fixture.componentInstance.requests.length = 0;

    (document.querySelector('[data-part="trigger"]') as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.requests).toHaveLength(0);
  });

  it('refuses an outside press when the consumer says so', () => {
    fixture.componentInstance.outsidePress.set('none');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('lets the consumer refuse a close while a form is saving', () => {
    TestBed.resetTestingModule();

    @Component({
      standalone: true,
      imports: [SlDialog, SlDialogHeader, SlDialogTitle],
      template: `<sl-dialog [(open)]="open" (openChangeRequest)="refuse($event)">
        <header slDialogHeader><h2 slDialogTitle>Saving</h2></header>
      </sl-dialog>`,
    })
    class Refusing {
      readonly open = signal(true);
      refuse(request: DialogChangeRequest) {
        if (!request.value) request.cancel();
      }
    }

    const refusing = TestBed.createComponent(Refusing);
    refusing.detectChanges();

    escape();
    refusing.detectChanges();

    expect(refusing.componentInstance.open()).toBe(true);
  });

  it('closes from the close button carrying dismiss and the result it names', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    press(part('close'));
    fixture.detectChanges();

    const request = fixture.componentInstance.requests.at(-1);
    expect(request?.reason).toBe('dismiss');
    expect(request?.result).toBe('dismissed');
  });

  /** `afterClosed()` in Angular Material, as an output. */
  it('reports the result once the layer has actually closed', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    press(part('close'));
    fixture.detectChanges();

    expect(fixture.componentInstance.results).toContain('dismissed');
  });

  it('moves focus into the layer and gives it back to the trigger', () => {
    const trigger = document.querySelector('[data-part="trigger"]') as HTMLElement;
    trigger.focus();

    press(trigger);
    fixture.detectChanges();
    expect(panel()?.contains(document.activeElement)).toBe(true);

    escape();
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
  });

  it('marks the row that is still loading as busy without locking the way out', () => {
    fixture.componentInstance.loading.set(true);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(part('body').getAttribute('aria-busy')).toBe('true');
    expect(layer()?.hasAttribute('data-loading')).toBe(true);
    expect((part('close') as HTMLButtonElement).disabled).toBe(false);
  });

  /**
   * The layer without the picture: the portal, the scrim, the containment and
   * the dismissal policy all stay, and the family paints nothing.
   */
  it('turns the family’s own paint off and keeps everything that is not paint', () => {
    fixture.componentInstance.surface.set('plain');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(layer()?.getAttribute('data-surface')).toBe('plain');
    expect(document.querySelector('[data-part="backdrop"]')).not.toBeNull();
    expect(panel()?.getAttribute('aria-modal')).toBe('true');
    expect(panel()?.contains(document.activeElement)).toBe(true);
  });

  it('takes an explicit size over the one the application set', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DialogHost],
      providers: [provideDialogDefaults({ size: 'xl', placement: 'top' })],
    });
    const provided = TestBed.createComponent(DialogHost);
    provided.componentInstance.open.set(true);
    provided.detectChanges();

    expect(layer()?.getAttribute('data-size')).toBe('xl');
    expect(layer()?.getAttribute('data-placement')).toBe('top');

    provided.componentInstance.size.set('sm');
    provided.detectChanges();
    expect(layer()?.getAttribute('data-size')).toBe('sm');
  });

  it('opens and closes from the instance a template reference variable reaches', () => {
    const dialog = fixture.debugElement.query((node) => node.name === 'sl-dialog')
      .componentInstance as SlDialog;

    dialog.openDialog();
    fixture.detectChanges();
    expect(fixture.componentInstance.requests.at(-1)?.reason).toBe('programmatic');

    dialog.close('saved');
    fixture.detectChanges();
    expect(fixture.componentInstance.results).toContain('saved');
  });
});

describe('SlAlertDialog', () => {
  let fixture: ComponentFixture<AlertHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AlertHost] });
    fixture = TestBed.createComponent(AlertHost);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
  });

  it('renders the anatomy the contract declares for its member', () => {
    const parts = [...document.querySelectorAll('[data-part]')].map((node) =>
      node.getAttribute('data-part'),
    );
    for (const declared of contract.members.alertDialog.parts) {
      expect(parts, `${declared} is declared and never rendered`).toContain(declared);
    }
  });

  it('takes the role the pattern gives it and a tone of its own', () => {
    expect(panel()?.getAttribute('role')).toBe('alertdialog');
    expect(layer()?.getAttribute('data-tone')).toBe('danger');
  });

  /**
   * Ark and React Aria make the role a prop, so a consumer who sets it and
   * forgets the dismissal policy ships a destructive confirmation a stray click
   * dismisses. Here the member fixes it.
   */
  it('never closes on an outside press, whatever the consumer asks for', () => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('is modal whatever the consumer asks for', () => {
    expect(panel()?.getAttribute('aria-modal')).toBe('true');
  });

  /** The APG's own advice for a step that is not easily reversible. */
  it('focuses the least destructive action rather than the first tabbable one', () => {
    expect(document.activeElement).toBe(part('cancel'));
  });

  it('closes from the action with submit and from cancel with dismiss', () => {
    press(part('action'));
    fixture.detectChanges();
    const confirmed = fixture.componentInstance.requests.at(-1);
    expect(confirmed?.reason).toBe('submit');
    expect(confirmed?.result).toBe('confirm');

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    press(part('cancel'));
    fixture.detectChanges();
    const cancelled = fixture.componentInstance.requests.at(-1);
    expect(cancelled?.reason).toBe('dismiss');
    expect(cancelled?.result).toBe('cancel');
  });

  it('answers Escape, because a member with a cancel action can always cancel', () => {
    escape();
    fixture.detectChanges();
    expect(fixture.componentInstance.requests.at(-1)?.reason).toBe('escape');
  });

  it('refuses a close button, which is two controls for one outcome', () => {
    TestBed.resetTestingModule();

    @Component({
      standalone: true,
      imports: [SlAlertDialog, SlDialogHeader, SlDialogTitle, SlDialogDescription, SlDialogClose],
      template: `<sl-alert-dialog [open]="true">
        <header slDialogHeader>
          <h2 slDialogTitle>Delete?</h2>
          <p slDialogDescription>Gone for good.</p>
          <button slDialogClose></button>
        </header>
      </sl-alert-dialog>`,
    })
    class WithClose {}

    expect(() => TestBed.createComponent(WithClose).detectChanges()).toThrow(/no close part/i);
  });

  /** The alertdialog pattern makes `aria-describedby` mandatory. */
  it('refuses to ship without the description the pattern requires', () => {
    TestBed.resetTestingModule();

    @Component({
      standalone: true,
      imports: [SlAlertDialog, SlDialogHeader, SlDialogTitle],
      template: `<sl-alert-dialog [open]="true">
        <header slDialogHeader><h2 slDialogTitle>Delete?</h2></header>
      </sl-alert-dialog>`,
    })
    class WithoutDescription {}

    expect(() => TestBed.createComponent(WithoutDescription).detectChanges()).toThrow(
      /slDialogDescription|aria-describedby/i,
    );
  });
});
