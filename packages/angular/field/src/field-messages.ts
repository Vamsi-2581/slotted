import { booleanAttribute, Directive, input } from '@angular/core';

import type {
  InlineMessageLive,
  InlineMessageMark,
  InlineMessageTone,
} from '@slotted/angular/inline-message';

/**
 * What the page wants said, and how — carried by the element the page writes
 * and read by the field, which renders the `inline-message` around it.
 *
 * The field renders the message rather than the page, because `SlInlineMessage`
 * takes its values as `input()` signals and nothing outside the template that
 * instantiates it can write one. A directive sharing the element could only set
 * attributes the component's own host bindings would then overwrite, and the
 * identifier the field derives is exactly such a value.
 */
@Directive()
export abstract class SlFieldMessage {
  /** Replaces the message's own tone. `inline-message` owns the five. */
  readonly tone = input<InlineMessageTone | undefined>(undefined);
  /** Whether the message announces itself when it arrives. */
  readonly live = input<InlineMessageLive | undefined>(undefined);
  /**
   * Which mark the message draws. A field's messages default to `dot`, and
   * `glyph` asks for the tone's own silhouette back.
   */
  readonly mark = input<InlineMessageMark | undefined>(undefined);
  /** The word read before the message; the empty string removes it. */
  readonly prefix = input<string | undefined>(undefined);
  /** Draws no mark, for a message that carries its own artwork. */
  readonly hideIcon = input(false, { transform: booleanAttribute });
  /** Holds one line box open so nothing below moves when the message arrives. */
  readonly reserve = input(false, { transform: booleanAttribute });
}

/**
 * Help about the field, projected into the `inline-message` the field renders.
 *
 * It arrives with a tone, a mark, a clipped severity word an application
 * translates once and a reserved line — none of which the field reimplements.
 * `docs/rebuild-order.md` states that as the reason `inline-message` was built
 * in wave 2.
 */
@Directive({
  selector: '[slFieldDescription]',
  standalone: true,
  exportAs: 'slFieldDescription',
})
export class SlFieldDescription extends SlFieldMessage {}

/**
 * What is wrong with the value, in words — which is what WCAG 2.2 SC 3.3.1
 * requires and what colour and a mark alone do not satisfy.
 *
 * `tone` accepts the other four, so a warning that does not block submission is
 * the same part in another tone rather than a member of its own. Fluent spends
 * a `validationState` axis on that distinction and Carbon a second component.
 */
@Directive({
  selector: '[slFieldError]',
  standalone: true,
  exportAs: 'slFieldError',
})
export class SlFieldError extends SlFieldMessage {}
