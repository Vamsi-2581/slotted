import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

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
