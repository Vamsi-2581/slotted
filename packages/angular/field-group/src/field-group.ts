import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import {
  injectFieldDefaults,
  SlFieldDefaultsSource,
  SlFieldIdFactory,
} from '@slotted/angular/field';
import type {
  FieldDefaults,
  FieldLabelPlacement,
  FieldNecessityWords,
  FieldRequiredMark,
  FieldSize,
} from '@slotted/angular/field';
import { SlInlineMessage } from '@slotted/angular/inline-message';

import { SlFieldGroupDescription, SlFieldGroupError } from './field-group-parts';

/** How the fields inside the group flow. */
export type FieldGroupOrientation = 'vertical' | 'horizontal';

/** The three identifiers a group derives from one base. */
export interface FieldGroupIds {
  description: string;
  error: string;
  legend: string;
}

/**
 * A set of fields under one name.
 *
 * **The platform does the work.** The element is a native `fieldset` and the
 * name is a native `legend` — the technique the APG's naming practice calls for
 * under its Rule 3, prefer native techniques — so the `group` role and the
 * accessible name arrive without a single ARIA attribute. `disabled` is the
 * native attribute, and every control inside is disabled by the browser with
 * nothing passed down.
 *
 * **What is said about the set is said before the set.** The description and
 * the error come between the legend and the fields, which is where GOV.UK's
 * fieldset example puts a hint and an error, and the opposite of where a single
 * field puts its own.
 *
 * **`aria-describedby` goes on the fieldset.** A reader entering any control in
 * the group hears the group's hint and its error once, from the element that
 * names them both.
 *
 * **The group provides for its fields.** It answers `SlFieldDefaultsSource` for
 * its own subtree, so `size`, `labelPlacement`, `requiredMark`, the necessity
 * words, `disabled` and `readOnly` reach every field inside — the same six an
 * application sets once with `provideFieldDefaults()`. `required` is not among
 * them: it is a fact about one value, and a section cannot know it.
 */
@Component({
  selector: 'fieldset[slFieldGroup]',
  standalone: true,
  exportAs: 'slFieldGroup',
  imports: [SlInlineMessage],
  template: `<ng-content select="[slFieldGroupLegend]" />
    <p
      slInlineMessage
      [id]="ids().description"
      [size]="messageSize()"
      [mark]="description()?.mark() ?? 'glyph'"
      [tone]="description()?.tone() ?? 'secondary'"
      [live]="description()?.live() ?? 'off'"
      [hideIcon]="description()?.hideIcon() ?? false"
      [reserve]="description()?.reserve() ?? false"
      [prefix]="description()?.prefix()"
    >
      <ng-content select="[slFieldGroupDescription]" />
    </p>
    <p
      slInlineMessage
      [id]="ids().error"
      [size]="messageSize()"
      [mark]="error()?.mark() ?? 'glyph'"
      [tone]="error()?.tone() ?? 'danger'"
      [live]="error()?.live() ?? 'off'"
      [hideIcon]="error()?.hideIcon() ?? false"
      [reserve]="error()?.reserve() ?? false"
      [prefix]="error()?.prefix()"
    >
      <ng-content select="[slFieldGroupError]" />
    </p>
    <div data-part="content"><ng-content /></div>`,
  styleUrl: '../../../styles/src/field-group/field-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: SlFieldDefaultsSource, useExisting: forwardRef(() => SlFieldGroup) }],
  host: {
    'data-ui': 'field-group',
    'data-part': 'root',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-required-mark]': 'resolvedRequiredMark()',
    '[attr.data-disabled]': "disabled() === true ? '' : null",
    '[attr.data-invalid]': "invalid() === true ? '' : null",
    '[attr.data-readonly]': "readOnly() === true ? '' : null",
    '[attr.data-required]': "required() === true ? '' : null",
    '[attr.disabled]': "disabled() === true ? '' : null",
    '[attr.aria-describedby]': 'describedBy()',
  },
})
export class SlFieldGroup extends SlFieldDefaultsSource {
  /** Provided to every field inside. Defaults to the token, then to `md`. */
  readonly size = input<FieldSize | undefined>(undefined);
  /** How the fields inside flow. */
  readonly orientation = input<FieldGroupOrientation>('vertical');
  /** Provided to every field inside. Defaults to the token, then to `mark`. */
  readonly requiredMark = input<FieldRequiredMark | undefined>(undefined);
  /** Merged over the token's pair, and provided to every field inside. */
  readonly necessityWords = input<Partial<FieldNecessityWords> | undefined>(undefined);
  /** Provided to every field inside, unless the field states its own. */
  readonly labelPlacement = input<FieldLabelPlacement | undefined>(undefined);

  /**
   * The native attribute on the `fieldset`, which the platform propagates to
   * every control inside with nothing passed down. It is provided to the fields
   * as well, because the platform disables controls and a label is not one.
   */
  readonly disabled = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Unstated rather than `false`. Writes `data-invalid` on the fieldset. */
  readonly invalid = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Draws the necessity marker on the legend, and is not provided to the fields. */
  readonly required = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Provided to every field inside, unless the field states its own. */
  readonly readOnly = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * The application's own defaults, or an outer group's. A group inside a group
   * answers for the inner one and inherits everything it does not restate.
   */
  private readonly outer = inject(SlFieldDefaultsSource, { optional: true, skipSelf: true });
  private readonly token = injectFieldDefaults();
  private readonly inherited = computed(() => this.outer?.fieldDefaults() ?? this.token);

  private readonly base =
    inject(new HostAttributeToken('id'), { optional: true }) ??
    `${inject(SlFieldIdFactory).next()}-group`;

  private readonly writtenDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });

  readonly ids = computed<FieldGroupIds>(() => ({
    description: `${this.base}-description`,
    error: `${this.base}-error`,
    legend: `${this.base}-legend`,
  }));

  /**
   * The group's own markers rather than the field's, and direct content rather
   * than any descendant — so a description written inside one of the fields is
   * never read as the set's.
   */
  protected readonly description = contentChild(SlFieldGroupDescription, { descendants: false });
  protected readonly error = contentChild(SlFieldGroupError, { descendants: false });

  readonly resolvedSize = computed(() => this.size() ?? this.inherited().size);
  readonly resolvedRequiredMark = computed(
    () => this.requiredMark() ?? this.inherited().requiredMark,
  );
  readonly resolvedWords = computed<FieldNecessityWords>(() => ({
    ...this.inherited().necessityWords,
    ...this.necessityWords(),
  }));

  /**
   * One step louder than a field's own. `inline-message` defines `md` as the
   * message of a section and `sm` as the message of a field, and what a group
   * says is about the section — held at the field's step, the sentence about a
   * whole set read as the help under the control above it.
   */
  protected readonly messageSize = computed<'sm' | 'md'>(() =>
    this.resolvedSize() === 'sm' ? 'sm' : 'md',
  );

  protected readonly describedBy = computed(() => {
    const parts = [
      this.writtenDescribedBy,
      this.description() === undefined ? undefined : this.ids().description,
      this.error() === undefined ? undefined : this.ids().error,
    ].filter(Boolean);
    return parts.length === 0 ? null : parts.join(' ');
  });

  /**
   * What every field inside reads instead of the application's own defaults.
   *
   * It is a method rather than a value handed over once, because Angular
   * creates every directive a template declares before it binds any input: a
   * group that provided a snapshot would hand its fields the value its inputs
   * held before the consumer's bindings ran.
   */
  fieldDefaults(): FieldDefaults {
    return {
      disabled: this.disabled() ?? this.inherited().disabled,
      labelPlacement: this.labelPlacement() ?? this.inherited().labelPlacement,
      necessityWords: this.resolvedWords(),
      readOnly: this.readOnly() ?? this.inherited().readOnly,
      requiredMark: this.resolvedRequiredMark(),
      size: this.resolvedSize(),
    };
  }
}
