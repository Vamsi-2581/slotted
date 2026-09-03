import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  HostAttributeToken,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { SlInlineMessage } from '@slotted/angular/inline-message';

import {
  deriveFieldIds,
  injectFieldDefaults,
  SlFieldDefaultsSource,
  SlFieldIdFactory,
} from './field-defaults';
import type {
  FieldLabelPlacement,
  FieldNecessityWords,
  FieldRequiredMark,
  FieldSize,
} from './field-defaults';
import { formatFieldCount, isFieldCountOver, SlFieldCounter } from './field-counter';
import type { FieldCount } from './field-counter';
import { SlFieldDescription, SlFieldError } from './field-messages';

export type { FieldCount } from './field-counter';
export type {
  FieldIds,
  FieldLabelPlacement,
  FieldNecessityWords,
  FieldRequiredMark,
  FieldSize,
} from './field-defaults';

/**
 * One control, its name, its necessity, its help and its error — and the
 * identifiers that bind the four together.
 *
 * **Every shared state is unset rather than `false`.** `disabled`, `invalid`,
 * `required` and `readOnly` default to `undefined`, so a field defers to the
 * `slFieldGroup` around it and the group to the application. A field that
 * defaulted to `false` could not be told from a consumer saying "not disabled",
 * and it would quietly override a disabled section.
 *
 * **The identifiers are derived, not registered.** One base yields four, so
 * `label[for]` resolves to the identifier the control will use with no ordering
 * dependency between siblings and nothing to coordinate during hydration.
 *
 * **The field renders its own messages.** The page writes what it wants said —
 * `<span slFieldError>` — and the field puts it inside an `inline-message` it
 * renders itself, with the identifier, the step and the disabled state already
 * resolved. `SlInlineMessage` takes its values as `input()` signals, and nothing
 * outside the template that instantiates it can write one; a directive sharing
 * the element could only set attributes its host bindings would overwrite.
 */
@Component({
  selector: '[slField]',
  standalone: true,
  exportAs: 'slField',
  imports: [SlInlineMessage],
  template: `<ng-content select="[slFieldLabel]" />
    <ng-content select="[slFieldCounter]" />
    @if (drawnCount(); as count) {
      <span data-part="counter" [attr.data-invalid]="countOver() ? '' : null">{{
        formatCount(count)
      }}</span>
    }
    <ng-content />
    <p
      slInlineMessage
      [id]="ids().description"
      [size]="messageSize()"
      [disabled]="resolvedDisabled()"
      [mark]="description()?.mark() ?? 'dot'"
      [tone]="description()?.tone() ?? 'secondary'"
      [live]="description()?.live() ?? 'off'"
      [hideIcon]="description()?.hideIcon() ?? false"
      [reserve]="description()?.reserve() ?? false"
      [prefix]="description()?.prefix()"
    >
      <ng-content select="[slFieldDescription]" />
    </p>
    <p
      slInlineMessage
      [id]="ids().error"
      [size]="messageSize()"
      [disabled]="resolvedDisabled()"
      [mark]="error()?.mark() ?? 'dot'"
      [tone]="error()?.tone() ?? 'danger'"
      [live]="error()?.live() ?? 'off'"
      [hideIcon]="error()?.hideIcon() ?? false"
      [reserve]="error()?.reserve() ?? false"
      [prefix]="error()?.prefix()"
    >
      <ng-content select="[slFieldError]" />
    </p>`,
  styleUrl: '../../../styles/src/field/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'field',
    'data-part': 'root',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-label-placement]': 'resolvedLabelPlacement()',
    '[attr.data-required-mark]': 'resolvedRequiredMark()',
    '[attr.data-disabled]': "resolvedDisabled() === true ? '' : null",
    '[attr.data-invalid]': "invalid() === true ? '' : null",
    '[attr.data-readonly]': "resolvedReadOnly() === true ? '' : null",
    '[attr.data-required]': "required() === true ? '' : null",
  },
})
export class SlField {
  /** Defaults to the token, then to `md`. */
  readonly size = input<FieldSize | undefined>(undefined);
  /** Defaults to the token, then to `top`. */
  readonly labelPlacement = input<FieldLabelPlacement | undefined>(undefined);
  /** Defaults to the token, then to `mark`. */
  readonly requiredMark = input<FieldRequiredMark | undefined>(undefined);
  /** Merged over the token's pair, for one field that names necessity its own way. */
  readonly necessityWords = input<Partial<FieldNecessityWords> | undefined>(undefined);

  /**
   * Unstated rather than `false`, so the field defers to its group and the group
   * to the application. Stated, it wins, and it reaches the control as the
   * native attribute: removing it from the tab order and from submission is what
   * the word means.
   */
  readonly disabled = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Unstated rather than `false`. Reaches the control as `aria-invalid`. */
  readonly invalid = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /**
   * Unstated rather than `false`. Reaches the control as `aria-required` and
   * never as the native `required`, which would engage browser constraint
   * validation and change submit behaviour.
   */
  readonly required = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Unstated rather than `false`. Reaches the control as the native `readonly`. */
  readonly readOnly = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * What the control inside published about its value. A control this library
   * ships calls `setCount`; the field draws the counter in the spare column of
   * its label row, and only when the page wrote none of its own.
   */
  private readonly countState = signal<FieldCount | undefined>(undefined);
  protected readonly counter = contentChild(SlFieldCounter, { descendants: true });
  protected readonly drawnCount = computed(() =>
    this.counter() === undefined ? this.countState() : undefined,
  );
  protected readonly countOver = computed(() => {
    const count = this.drawnCount();
    return count !== undefined && isFieldCountOver(count);
  });
  protected readonly formatCount = formatFieldCount;

  /** The count a control this library ships publishes, whenever its value changes. */
  setCount(count: FieldCount | undefined) {
    this.countState.set(count);
  }

  /** What the control published, for a page that draws the counter itself. */
  readonly count = this.countState.asReadonly();

  private readonly token = injectFieldDefaults();
  /**
   * The group around this field, if there is one. It answers before the
   * application's own token, and it is read on every change rather than
   * captured, because Angular binds a component's inputs after it has created
   * the directives its template declares.
   */
  private readonly source = inject(SlFieldDefaultsSource, { optional: true });
  private readonly defaults = computed(() => this.source?.fieldDefaults() ?? this.token);

  /**
   * The base every identifier is derived from. A consumer's own `id` is the
   * base and stays on the element; the generated one is not written anywhere,
   * because the field is addressable through its parts rather than as a box.
   */
  private readonly base =
    inject(new HostAttributeToken('id'), { optional: true }) ?? inject(SlFieldIdFactory).next();

  readonly ids = computed(() => deriveFieldIds(this.base));

  /**
   * Direct content rather than any descendant: a field nested inside another
   * field's control — a composed control, a fieldset of its own — must not have
   * its message read as this field's.
   */
  protected readonly description = contentChild(SlFieldDescription, { descendants: false });
  protected readonly error = contentChild(SlFieldError, { descendants: false });

  readonly resolvedSize = computed(() => this.size() ?? this.defaults().size);
  readonly resolvedLabelPlacement = computed(
    () => this.labelPlacement() ?? this.defaults().labelPlacement,
  );
  readonly resolvedRequiredMark = computed(
    () => this.requiredMark() ?? this.defaults().requiredMark,
  );
  readonly resolvedDisabled = computed(() => this.disabled() ?? this.defaults().disabled);
  readonly resolvedReadOnly = computed(() => this.readOnly() ?? this.defaults().readOnly);
  readonly resolvedWords = computed<FieldNecessityWords>(() => ({
    ...this.defaults().necessityWords,
    ...this.necessityWords(),
  }));

  /**
   * A message is quieter than the control it is about, so it starts one step
   * below and only the largest field's message reaches the second step.
   */
  protected readonly messageSize = computed<'sm' | 'md'>(() =>
    this.resolvedSize() === 'lg' ? 'md' : 'sm',
  );

  /**
   * Description first, error second, and only the ones with something to say.
   * Two known slots have one correct reading order, so it is stated rather than
   * read from the DOM.
   */
  readonly describedBy = computed(() => {
    const parts = [
      this.description() === undefined ? undefined : this.ids().description,
      this.error() === undefined ? undefined : this.ids().error,
    ].filter(Boolean);
    return parts.length === 0 ? null : parts.join(' ');
  });
}
