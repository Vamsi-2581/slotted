import { SlHeadingLevel } from '@slotted/angular/typography';
import type { HeadingLevelValue } from '@slotted/angular/typography';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { injectSectionDefaults, SlSectionIdFactory } from './section-defaults';
import type { SectionGround, SectionLevel, SectionSize } from './section-defaults';

export type { SectionDefaults, SectionGround, SectionLevel, SectionSize } from './section-defaults';

/**
 * One unit of content inside a page: a header — eyebrow, heading,
 * description, actions — and a body one outline step deeper.
 *
 * **The rank is the outline's.** `typography` owns it: the heading takes the
 * rank `slHeadingLevel` gives — `h2` directly in a page body, one deeper
 * inside another section's body — unless `level` says otherwise. The element
 * is the consumer's: `<h2 slSectionHeading>` is a native heading and the
 * directive adds nothing to it; `<div slSectionHeading>` gets `role="heading"`
 * and the level the section resolved.
 *
 * **A region only when it has a name.** The root is `aria-labelledby` its
 * heading once one is rendered, which makes the `section` a region landmark.
 *
 * **The hooks anchor navigation needs.** The root carries an `id`, the
 * consumer's own or a generated one, and a scroll margin the height of the
 * page's fixed chrome, so a hash link lands under the header.
 */
@Component({
  selector: '[slSection]',
  standalone: true,
  exportAs: 'slSection',
  template: '<ng-content />',
  styleUrl: '../../../styles/src/section/section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'section',
    'data-part': 'root',
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': 'hasHeading() ? headingId() : null',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-level]': 'resolvedLevel()',
    '[attr.data-ground]': 'resolvedGround()',
    '[attr.data-divider]': "resolvedDivider() ? '' : null",
    '[attr.data-sticky]': "resolvedSticky() ? '' : null",
  },
})
export class SlSection {
  readonly size = input<SectionSize | undefined>(undefined);
  /** Defaults to `auto`: the rank the outline gives. */
  readonly level = input<SectionLevel | undefined>(undefined);
  readonly ground = input<SectionGround | undefined>(undefined);
  readonly divider = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });
  readonly sticky = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });

  private readonly defaults = injectSectionDefaults();
  private readonly outline = inject(SlHeadingLevel, { optional: true });
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  private readonly generated = inject(SlSectionIdFactory).next();

  /** Whether a heading is rendered, which is what makes the section a region. */
  readonly hasHeading = signal(false);

  readonly id = computed(() => this.writtenId ?? this.generated);
  readonly headingId = computed(() => `${this.id()}-heading`);
  readonly resolvedSize = computed(() => this.size() ?? this.defaults.size);
  readonly resolvedGround = computed(() => this.ground() ?? this.defaults.ground);
  readonly resolvedDivider = computed(() => (this.divider() ?? this.defaults.divider) === true);
  readonly resolvedSticky = computed(() => (this.sticky() ?? this.defaults.sticky) === true);
  readonly resolvedLevel = computed<HeadingLevelValue>(() => {
    const level = this.level();
    if (level === undefined || level === 'auto') return this.outline?.level ?? 1;
    return Number(level) as HeadingLevelValue;
  });
}
