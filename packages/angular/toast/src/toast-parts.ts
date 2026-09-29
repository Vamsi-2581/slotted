import { ChangeDetectionStrategy, Component, computed, Directive, inject } from '@angular/core';
import { SlGlyph, SlIcon } from '@slotted/angular/icon';

import { SlToastItem } from './toast';

/**
 * The parts, for a page that writes its own message body inside
 * `<ng-template slToastBody>` rather than taking the family's.
 *
 * They carry the part name and nothing else: the geometry, the tone and the
 * states are the item's and the region's, and a directive that repeated any of
 * them would be a second place to change them. The two that draw a glyph read
 * it from the item they sit in.
 */

/**
 * The tone's mark, or the page's own — a spinner while a promise is in flight.
 * Content the page writes replaces the tone's glyph; with none, the item's
 * glyph is drawn, and none while the message waits.
 */
@Component({
  selector: '[slToastIcon]',
  standalone: true,
  exportAs: 'slToastIcon',
  imports: [SlGlyph, SlIcon],
  template: `<ng-content>
    @if (mark(); as glyph) {
      <span slIcon><svg slGlyph [name]="glyph" solid></svg></span>
    }
  </ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-part': 'icon', 'aria-hidden': 'true' },
})
export class SlToastIcon {
  private readonly item = inject(SlToastItem, { optional: true });

  /* Outside an item there is no tone, and the default tone's glyph stands. */
  protected readonly mark = computed(() => (this.item === null ? 'circle-info' : this.item.mark()));
}

/** The words, and the one column that is allowed to shrink. */
@Directive({
  selector: '[slToastContent]',
  standalone: true,
  exportAs: 'slToastContent',
  host: { 'data-part': 'content' },
})
export class SlToastContent {}

/**
 * The message's name. Written on the page's own element, and not a heading: a
 * message that is gone in five seconds is not a section of the document.
 */
@Directive({
  selector: '[slToastTitle]',
  standalone: true,
  exportAs: 'slToastTitle',
  host: { 'data-part': 'title' },
})
export class SlToastTitle {}

/** The message. Written on a `p`, which is what a sentence of prose is. */
@Directive({
  selector: '[slToastDescription]',
  standalone: true,
  exportAs: 'slToastDescription',
  host: { 'data-part': 'description' },
})
export class SlToastDescription {}

/**
 * The controls that act on the message. What goes in is the page's own
 * buttons: `button` already owns what a button is.
 */
@Directive({
  selector: '[slToastActions]',
  standalone: true,
  exportAs: 'slToastActions',
  host: { 'data-part': 'actions' },
})
export class SlToastActions {}

/** The control that puts the message away. A real button with a real name. */
@Component({
  selector: 'button[slToastClose]',
  standalone: true,
  exportAs: 'slToastClose',
  imports: [SlGlyph, SlIcon],
  /* The cross is drawn unless the consumer wrote content of their own. */
  template: `<ng-content
    ><span slIcon><svg slGlyph name="x"></svg></span
  ></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-part': 'close', type: 'button' },
})
export class SlToastClose {}

/** How much of the duration is left, drawn from the number the timer reads. */
@Directive({
  selector: '[slToastProgress]',
  standalone: true,
  exportAs: 'slToastProgress',
  host: { 'data-part': 'progress', 'aria-hidden': 'true' },
})
export class SlToastProgress {}
