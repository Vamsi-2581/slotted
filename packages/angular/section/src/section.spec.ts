import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SlHeadingLevel } from '@slotted/angular/typography';
import { SlSection } from './section';
import { provideSectionDefaults } from './section-defaults';
import {
  SlSectionActions,
  SlSectionBody,
  SlSectionDescription,
  SlSectionEyebrow,
  SlSectionHeader,
  SlSectionHeading,
  SlSectionTitle,
} from './section-parts';

const PARTS = [
  SlSection,
  SlSectionHeader,
  SlSectionTitle,
  SlSectionEyebrow,
  SlSectionHeading,
  SlSectionDescription,
  SlSectionActions,
  SlSectionBody,
];

@Component({
  standalone: true,
  imports: [...PARTS, SlHeadingLevel],
  template: `<div slHeadingLevel>
    <section
      slSection
      [size]="size()"
      [level]="level()"
      [ground]="ground()"
      [divider]="divider()"
      [sticky]="sticky()"
      id="frota"
    >
      <div slSectionHeader>
        <div slSectionTitle>
          <span slSectionEyebrow>18 veículos</span>
          @if (heading()) {
            <div slSectionHeading>Frota</div>
          }
          <p slSectionDescription>Cavalos mecânicos e carretas.</p>
        </div>
        <div slSectionActions><button type="button">Exportar</button></div>
      </div>
      <div slSectionBody>
        <section slSection>
          <div slSectionHeader>
            <div slSectionTitle><div slSectionHeading>Veículos pesados</div></div>
          </div>
          <div slSectionBody>
            <section slSection>
              <div slSectionHeader>
                <div slSectionTitle><h4 slSectionHeading>Cavalos mecânicos</h4></div>
              </div>
              <div slSectionBody>Scania R 450</div>
            </section>
          </div>
        </section>
      </div>
    </section>
  </div>`,
})
class Host {
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly level = signal<'auto' | '1' | '2' | '3' | '4' | '5' | '6' | undefined>(undefined);
  readonly ground = signal<'none' | 'surface' | undefined>(undefined);
  readonly divider = signal<boolean | undefined>(undefined);
  readonly sticky = signal<boolean | undefined>(undefined);
  readonly heading = signal(true);
}

describe('SlSection', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const all = (selector: string) =>
    Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const root = () => all('[data-ui="section"]')[0] as HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the anatomy the contract declares', () => {
    for (const part of [
      'root',
      'header',
      'title',
      'eyebrow',
      'heading',
      'description',
      'actions',
      'body',
    ]) {
      expect(root().querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(root().tagName).toBe('SECTION');
    expect(root().id).toBe('frota');
  });

  /** A section with a heading is a region named by it. */
  it('is a region named by its heading, and nothing without one', () => {
    const heading = root().querySelector('[data-part="heading"]') as HTMLElement;
    expect(root().getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.id).toBe('frota-heading');
    host.heading.set(false);
    fixture.detectChanges();
    expect(root().hasAttribute('aria-labelledby')).toBe(false);
  });

  /** The outline: h2 under one level, one deeper each time. */
  it('takes its rank from the outline and steps it for its body', () => {
    const headings = all('[data-part="heading"]');
    expect(headings[0]?.getAttribute('aria-level')).toBe('2');
    expect(headings[0]?.getAttribute('role')).toBe('heading');
    expect(headings[1]?.getAttribute('aria-level')).toBe('3');
    /* A native heading gets nothing added. */
    expect(headings[2]?.tagName).toBe('H4');
    expect(headings[2]?.hasAttribute('role')).toBe(false);
    expect(all('[data-ui="section"]').map((s) => s.getAttribute('data-level'))).toEqual([
      '2',
      '3',
      '4',
    ]);
  });

  it('takes the level the consumer states over the outline', () => {
    host.level.set('5');
    fixture.detectChanges();
    expect(root().getAttribute('data-level')).toBe('5');
    expect(root().querySelector('[data-part="heading"]')?.getAttribute('aria-level')).toBe('5');
  });

  it('writes its axes', () => {
    host.size.set('lg');
    host.ground.set('surface');
    host.divider.set(true);
    host.sticky.set(true);
    fixture.detectChanges();
    expect(root().getAttribute('data-size')).toBe('lg');
    expect(root().getAttribute('data-ground')).toBe('surface');
    expect(root().hasAttribute('data-divider')).toBe(true);
    expect(root().hasAttribute('data-sticky')).toBe(true);
  });
});

describe('SlSection defaults', () => {
  @Component({
    standalone: true,
    imports: [SlSection, SlSectionBody],
    providers: [
      provideSectionDefaults({ divider: true, ground: 'surface', size: 'sm', sticky: true }),
    ],
    template: `<section slSection size="lg"><div slSectionBody>x</div></section>`,
  })
  class Provided {}

  it('takes its defaults from the provider, and its own inputs over them', () => {
    const fixture = TestBed.createComponent(Provided);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-ui="section"]') as HTMLElement;
    expect(root.getAttribute('data-size')).toBe('lg');
    expect(root.getAttribute('data-ground')).toBe('surface');
    expect(root.hasAttribute('data-divider')).toBe(true);
    expect(root.hasAttribute('data-sticky')).toBe(true);
    /* No heading, no name, and a generated id. */
    expect(root.hasAttribute('aria-labelledby')).toBe(false);
    expect(root.id).toMatch(/^slotted-section-/);
  });
});
