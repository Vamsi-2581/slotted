import { computed, Directive, input } from '@angular/core';

import type { BadgeOverlap, BadgePlacement } from './badge-defaults';

/**
 * The frame that places a badge on the corner of something else. It is written
 * on the element the page already has around the host — a `span`, a `div`, the
 * `li` of a list — rather than wrapping it, which is the one place this binding
 * is the smaller of the two: React must render a wrapper of its own.
 *
 * It does not rewrite the host's semantics. The badge is read after the host in
 * document order, and an interactive host whose name must carry the count wires
 * `aria-describedby` to the badge's own id, or names the count in its own
 * `aria-label`. Both wirings are on the reference page.
 */
@Directive({
  selector: '[slBadgeAnchor]',
  standalone: true,
  exportAs: 'slBadgeAnchor',
  host: {
    'data-ui': 'badge',
    'data-part': 'anchor',
    '[attr.data-placement]': 'resolvedPlacement()',
    '[attr.data-overlap]': 'resolvedOverlap()',
  },
})
export class SlBadgeAnchor {
  /** Which corner of the host the badge sits on. Mirrors in a right-to-left document. */
  readonly placement = input<BadgePlacement>();
  /** `circle` moves the badge in from the corner far enough to meet the curve. */
  readonly overlap = input<BadgeOverlap>();

  protected readonly resolvedPlacement = computed(() => this.placement() ?? 'top-end');
  protected readonly resolvedOverlap = computed(() => this.overlap() ?? 'rectangle');
}
