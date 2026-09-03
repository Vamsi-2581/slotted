import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SlToolbar, SlToolbarGroup, SlToolbarSeparator, SlToolbarSpacer } from './toolbar';
import { provideToolbarDefaults } from './toolbar-defaults';

@Component({
  standalone: true,
  imports: [SlToolbar, SlToolbarGroup, SlToolbarSeparator, SlToolbarSpacer],
  template: `<div
    slToolbar
    aria-label="Formatação"
    [orientation]="orientation()"
    [loop]="loop()"
    [size]="size()"
  >
    <div slToolbarGroup aria-label="Alinhamento">
      <button type="button">Negrito</button>
      <button type="button" [attr.aria-disabled]="ariaDisabled() ? 'true' : null">Itálico</button>
    </div>
    <div slToolbarSeparator></div>
    <div slToolbarSpacer></div>
    @if (field()) {
      <input aria-label="Buscar" type="search" />
    } @else {
      <button type="button">Link</button>
    }
    @if (extra()) {
      <button type="button">Citação</button>
    }
  </div>`,
})
class Host {
  readonly orientation = signal<'horizontal' | 'vertical' | undefined>(undefined);
  readonly loop = signal<boolean | undefined>(undefined);
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly ariaDisabled = signal(false);
  readonly field = signal(false);
  readonly extra = signal(false);
}

describe('SlToolbar', () => {
  let fixture: ComponentFixture<Host>;

  const all = (selector: string) => [
    ...(fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>),
  ];
  const bar = () => fixture.nativeElement.querySelector('[data-ui="toolbar"]') as HTMLElement;
  const items = () => all('button, input');
  const item = (index: number) => items()[index] as HTMLElement;
  const press = (element: HTMLElement, key: string) =>
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders the role, the label and every part the contract names', () => {
    expect(bar().getAttribute('role')).toBe('toolbar');
    expect(bar().getAttribute('aria-label')).toBe('Formatação');

    const parts = new Set(all('[data-part]').map((node) => node.getAttribute('data-part')));
    parts.add(bar().getAttribute('data-part'));
    for (const part of ['root', 'group', 'separator', 'spacer']) expect(parts).toContain(part);

    expect(all('[data-part="separator"]')[0]?.getAttribute('aria-orientation')).toBe('vertical');
    expect(all('[data-part="group"]')[0]?.getAttribute('role')).toBe('group');
  });

  it('holds one tab stop', () => {
    expect(item(0).getAttribute('tabindex')).toBe('0');
    expect(item(1).getAttribute('tabindex')).toBe('-1');
    expect(item(2).getAttribute('tabindex')).toBe('-1');
  });

  it('moves along the bar with the arrows and wraps at both ends', async () => {
    item(0).focus();
    press(item(0), 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(1));

    press(item(1), 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(2));

    press(item(2), 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(0));
  });

  /** "Up Arrow and Down Arrow can duplicate Left Arrow and Right Arrow." */
  it('duplicates the cross-axis pair, which the pattern permits', async () => {
    item(0).focus();
    press(item(0), 'ArrowDown');
    await fixture.whenStable();

    expect(document.activeElement).toBe(item(1));
  });

  it('reaches both ends with Home and End', async () => {
    item(0).focus();
    press(item(0), 'End');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(2));

    press(item(2), 'Home');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(0));
  });

  it('clamps at the ends when looping is off', async () => {
    fixture.componentInstance.loop.set(false);
    await fixture.whenStable();

    item(0).focus();
    press(item(0), 'ArrowLeft');
    await fixture.whenStable();

    expect(document.activeElement).toBe(item(0));
  });

  it('turns the arrows and announces the axis when the bar is vertical', async () => {
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();

    expect(bar().getAttribute('aria-orientation')).toBe('vertical');
    expect(all('[data-part="separator"]')[0]?.getAttribute('aria-orientation')).toBe('horizontal');

    item(0).focus();
    press(item(0), 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(1));
  });

  /**
   * The APG allows a focusable disabled control "where discoverability of a
   * function is crucial", which is what `button`'s `focusableWhenDisabled`
   * renders.
   */
  it('keeps an aria-disabled control in the ring', async () => {
    fixture.componentInstance.ariaDisabled.set(true);
    await fixture.whenStable();

    item(0).focus();
    press(item(0), 'ArrowRight');
    await fixture.whenStable();

    expect(document.activeElement).toBe(item(1));
  });

  /**
   * The APG asks an author to avoid a control that needs the navigation pair;
   * the bar enforces it, so the caret keeps its keys and focus leaves on the
   * cross axis.
   */
  it('leaves the flow arrows to an item that operates with them', async () => {
    fixture.componentInstance.field.set(true);
    await fixture.whenStable();

    const field = all('input')[0] as HTMLElement;
    field.focus();
    press(field, 'ArrowLeft');
    await fixture.whenStable();
    expect(document.activeElement).toBe(field);

    press(field, 'ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(1));
  });

  it('finds a control that arrives after the bar was built', async () => {
    fixture.componentInstance.extra.set(true);
    await fixture.whenStable();

    item(0).focus();
    press(item(0), 'End');
    await fixture.whenStable();

    expect(document.activeElement).toBe(item(3));
  });

  it('takes the defaults an application sets once, and lets a bar win over them', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideToolbarDefaults({ size: 'sm', variant: 'outline' })],
    });
    const scoped = TestBed.createComponent(Host);
    scoped.autoDetectChanges();
    await scoped.whenStable();

    const root = scoped.nativeElement.querySelector('[data-ui="toolbar"]') as HTMLElement;
    expect(root.getAttribute('data-size')).toBe('sm');
    expect(root.getAttribute('data-variant')).toBe('outline');

    scoped.componentInstance.size.set('lg');
    await scoped.whenStable();
    expect(root.getAttribute('data-size')).toBe('lg');
  });
});
