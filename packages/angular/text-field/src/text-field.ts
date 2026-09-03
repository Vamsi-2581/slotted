import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { SlField } from '@slotted/angular/field';

import { injectTextFieldDefaults, SlTextFieldControl } from './text-field-defaults';
import type { TextFieldSize, TextFieldVariant } from './text-field-defaults';

export type { TextFieldSize, TextFieldType, TextFieldVariant } from './text-field-defaults';

/**
 * The frame: one line of text, and everything that sits inside its border.
 *
 * **It is not the control.** The element carrying `data-ui` is the consumer's
 * own box with no role; the `input` inside it holds the value, the identifier
 * and every native attribute. WAI-ARIA settles the shape: a `textbox` may hold
 * only non-interactive, presentational children, so the clear and reveal
 * buttons are the control's siblings rather than its children.
 *
 * **Angular pays one element for that frame, and React pays none.** React can
 * render a wrapper from inside a component; an Angular directive cannot create
 * a box around its own host. `slTextFieldInput` injects this class, so a
 * control written without the frame is a compile-time failure rather than a
 * silent one — the property `docs/superpowers/specs/2026-08-31-field-aware-controls-design.md`
 * asks of every control this library ships.
 */
@Component({
  selector: '[slTextField]',
  standalone: true,
  exportAs: 'slTextField',
  template: `<ng-content select="[slTextFieldStart]" />
    <ng-content />
    @if (showClear()) {
      <button
        data-part="clear"
        type="button"
        [attr.aria-label]="resolvedClearLabel()"
        (click)="control()!.clear($event)"
      ></button>
    }
    @if (showReveal()) {
      <button
        data-part="reveal"
        type="button"
        [attr.aria-label]="resolvedRevealLabel()"
        [attr.aria-pressed]="control()!.revealed()"
        (click)="control()!.toggleReveal($event)"
      ></button>
    }
    <ng-content select="[slTextFieldEnd]" />`,
  styleUrl: '../../../styles/src/text-field/text-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'text-field',
    'data-part': 'root',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-mono]': "resolvedMono() ? '' : null",
    '[attr.data-disabled]': "control()?.resolvedDisabled() === true ? '' : null",
    '[attr.data-invalid]': "control()?.resolvedInvalid() === true ? '' : null",
    '[attr.data-readonly]': "control()?.resolvedReadOnly() === true ? '' : null",
  },
})
export class SlTextField {
  /** Defaults to the field, then to the token, then to `md`. */
  readonly size = input<TextFieldSize | undefined>(undefined);
  /** Defaults to the token, then to `outline`. */
  readonly variant = input<TextFieldVariant | undefined>(undefined);
  /** Sets the value in the monospaced family, for identifiers, hashes and keys. */
  readonly mono = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Draws a button that empties the value and returns focus to the control. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Draws a toggle that turns a password from dots into characters. */
  readonly revealable = input(false, { transform: booleanAttribute });
  /** The clear button's accessible name. Defaults to the token's. */
  readonly clearLabel = input<string | undefined>(undefined);
  /** The reveal button's accessible name. It does not change with the state. */
  readonly revealLabel = input<string | undefined>(undefined);

  private readonly defaults = injectTextFieldDefaults();
  private readonly field = inject(SlField, { optional: true });

  /**
   * The control inside. It provides itself as `SlTextFieldControl`, so the
   * frame can read whether the value is empty and whether it is a password
   * without either directive importing the other.
   */
  readonly control = contentChild(SlTextFieldControl, { descendants: true });

  readonly resolvedSize = computed(
    () => this.size() ?? this.field?.resolvedSize() ?? this.defaults.size,
  );
  readonly resolvedVariant = computed(() => this.variant() ?? this.defaults.variant);
  readonly resolvedMono = computed(() => this.mono() ?? this.defaults.mono);
  protected readonly resolvedClearLabel = computed(
    () => this.clearLabel() ?? this.defaults.clearLabel,
  );
  protected readonly resolvedRevealLabel = computed(
    () => this.revealLabel() ?? this.defaults.revealLabel,
  );

  /**
   * A button that clears an empty control, or a value the reader cannot change,
   * is a button that lies. Both cases withdraw it rather than disabling it,
   * because a disabled control in the frame is one more thing to tab past.
   */
  protected readonly showClear = computed(() => {
    const control = this.control();
    if (control === undefined || !this.clearable()) return false;
    return (
      !control.empty() && control.resolvedDisabled() !== true && control.resolvedReadOnly() !== true
    );
  });

  /** A read-only password may still be read: only `disabled` withdraws it. */
  protected readonly showReveal = computed(() => {
    const control = this.control();
    if (control === undefined || !this.revealable()) return false;
    return control.password() && control.resolvedDisabled() !== true;
  });
}
