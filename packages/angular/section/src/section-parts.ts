import { SlHeadingLevel } from '@slotted/angular/typography';
import { computed, Directive, ElementRef, inject } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';

import { SlSection } from './section';

const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

/** The row above the body: the title column and the actions. */
@Directive({ selector: '[slSectionHeader]', standalone: true, host: { 'data-part': 'header' } })
export class SlSectionHeader {}

/** Eyebrow, heading, description, in that order. */
@Directive({ selector: '[slSectionTitle]', standalone: true, host: { 'data-part': 'title' } })
export class SlSectionTitle {}

/** A short overline above the heading — a count, a category. Structural, not status. */
@Directive({ selector: '[slSectionEyebrow]', standalone: true, host: { 'data-part': 'eyebrow' } })
export class SlSectionEyebrow {}

/** A paragraph under the heading, in the muted text, with a measure. */
@Directive({
  selector: '[slSectionDescription]',
  standalone: true,
  host: { 'data-part': 'description' },
})
export class SlSectionDescription {}

/** The end of the header row: a button, a toolbar, a link. */
@Directive({ selector: '[slSectionActions]', standalone: true, host: { 'data-part': 'actions' } })
export class SlSectionActions {}

/**
 * The heading, at the rank the section resolved. Rendering it is what makes
 * the section a region: the root names it through `aria-labelledby`. The
 * element is the consumer's own — a native heading gets nothing added, and
 * anything else gets `role="heading"` and `aria-level`.
 */
@Directive({
  selector: '[slSectionHeading]',
  standalone: true,
  exportAs: 'slSectionHeading',
  host: {
    'data-part': 'heading',
    '[attr.id]': 'section.headingId()',
    '[attr.role]': 'ariaRole()',
    '[attr.aria-level]': 'ariaLevel()',
  },
})
export class SlSectionHeading implements OnInit, OnDestroy {
  protected readonly section = inject(SlSection);
  private readonly native: HTMLElement = inject(ElementRef).nativeElement;
  private readonly isNativeHeading = HEADINGS.has(this.native.tagName);

  protected readonly ariaRole = computed(() => (this.isNativeHeading ? null : 'heading'));
  protected readonly ariaLevel = computed(() =>
    this.isNativeHeading ? null : this.section.resolvedLevel(),
  );

  ngOnInit() {
    this.section.hasHeading.set(true);
  }

  ngOnDestroy() {
    this.section.hasHeading.set(false);
  }
}

/** The content, one outline step deeper: `slHeadingLevel` is a host directive. */
@Directive({
  selector: '[slSectionBody]',
  standalone: true,
  hostDirectives: [SlHeadingLevel],
  host: { 'data-part': 'body' },
})
export class SlSectionBody {}
