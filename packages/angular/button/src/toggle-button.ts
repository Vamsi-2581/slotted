import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  ViewEncapsulation,
} from '@angular/core';
import type { ChangeRequest } from '@slotted/core/state';

import {
  BUTTON_WAIT,
  blockActivation,
  optionalBoolean,
  PressedState,
  resolveAppearance,
  resolveInertness,
  resolveLoadingIndicator,
  SlButtonEnd,
  SlButtonStart,
  stateAttribute,
} from './button-appearance';
import type { ButtonWait } from './button-appearance';
import {
  BUTTON_LOADING_LABEL,
  TOGGLE_BUTTON_DEFAULTS,
  type ButtonSize,
  type ButtonTone,
  type ButtonType,
  type ButtonVariant,
} from './button.constants';

/**
 * A two-state action. The APG is explicit that the label of a toggle must not
 * change with its state — "Mute" stays "Mute" and the state is announced
 * beside it — so this is a component of its own rather than an input on
 * SlButton: reaching for it is what makes that obligation visible.
 *
 * It waits, because a toggle that persists is the common one: "Follow",
 * "Subscribe" and "Watch" all reach a server before the state is true. While
 * it waits it holds the state it still has, so the person is never shown a
 * value that has not been agreed to.
 */
@Component({
  selector: 'button[slToggleButton]',
  standalone: true,
  template: `<ng-content select="[slButtonStart]"></ng-content
    ><span data-part="label"><ng-content></ng-content></span
    ><ng-content select="[slButtonEnd]"></ng-content>
    @if (waiting() && !hasVisualSlot()) {
      <span
        data-part="indicator"
        data-ui="spinner"
        role="progressbar"
        [attr.aria-label]="loadingLabel()"
      ></span>
    }`,
  styleUrls: ['../../../styles/src/button/button.css', '../../../styles/src/spinner/spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slToggleButton',
  providers: [{ provide: BUTTON_WAIT, useExisting: forwardRef(() => SlToggleButton) }],
  host: {
    'data-ui': 'button',
    'data-part': 'root',
    '[attr.aria-disabled]': 'inert.ariaDisabled()',
    '[attr.aria-pressed]': 'isPressed()',
    '[attr.data-tone]': 'appearance.tone()',
    '[attr.data-variant]': 'appearance.variant()',
    '[attr.data-size]': 'appearance.size()',
    '[attr.data-full-width]': 'stateAttribute(fullWidth())',
    '[attr.data-disabled]': 'stateAttribute(disabled())',
    '[attr.data-loading]': 'stateAttribute(loading())',
    '[attr.data-pressed]': 'stateAttribute(isPressed())',
    '[disabled]': 'inert.nativelyDisabled()',
    '[attr.type]': 'type()',
  },
})
export class SlToggleButton implements AfterViewInit, ButtonWait {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly focusableWhenDisabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingDelay = input(0, { transform: numberAttribute });
  readonly loadingLabel = input(BUTTON_LOADING_LABEL);
  readonly size = input<ButtonSize | undefined>(undefined);
  readonly tone = input<ButtonTone | undefined>(undefined);
  readonly type = input<ButtonType>('button');
  readonly variant = input<ButtonVariant | undefined>(undefined);

  /** Present means controlled, for the life of the component. */
  readonly pressed = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: optionalBoolean,
  });
  readonly defaultPressed = input(false, { transform: booleanAttribute });
  /**
   * One output for one transition, carrying the value, the value it replaces,
   * the reason, the originating event and `cancel()`. There is no
   * `[(pressed)]` because a two-way binding has one slot and cannot carry any
   * of those, and a second output for the same transition would be the same
   * failure stated twice.
   */
  readonly pressedChange = output<ChangeRequest<boolean>>();

  readonly stateAttribute = stateAttribute;
  protected readonly appearance = resolveAppearance(this, TOGGLE_BUTTON_DEFAULTS);
  protected readonly inert = resolveInertness(this);
  readonly waiting = resolveLoadingIndicator(this.loading, this.loadingDelay);

  private readonly start = contentChild(SlButtonStart);
  private readonly end = contentChild(SlButtonEnd);
  readonly hasStart = computed(() => this.start() !== undefined);
  protected readonly hasVisualSlot = computed(
    () => this.start() !== undefined || this.end() !== undefined,
  );

  private readonly state = new PressedState({
    pressed: this.pressed,
    defaultPressed: this.defaultPressed,
    emit: (request) => this.pressedChange.emit(request),
  });
  readonly isPressed = computed(() => this.state.value());

  private readonly element = inject(ElementRef<HTMLButtonElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The capture phase, because a control that is unavailable or still working
   * must refuse the activation before any listener the consumer attached to it
   * can run.
   */
  constructor() {
    const capture = (event: Event) => {
      if (this.inert.refuses()) blockActivation(event);
    };
    this.element.addEventListener('click', capture, { capture: true });
    this.destroyRef.onDestroy(() =>
      this.element.removeEventListener('click', capture, { capture: true }),
    );
  }

  /**
   * After the view, not in the constructor. A `(click)` written on the same
   * element is bound when the view is created, so a listener registered any
   * earlier runs first and reads `defaultPrevented` before the consumer has
   * had the chance to set it — and a refused activation would move the state
   * anyway.
   */
  ngAfterViewInit() {
    const listener = (event: Event) => {
      if (this.inert.refuses() || event.defaultPrevented) return;
      this.state.request(event);
    };
    this.element.addEventListener('click', listener);
    this.destroyRef.onDestroy(() => this.element.removeEventListener('click', listener));
  }
}
