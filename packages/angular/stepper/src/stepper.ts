import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import { stepFocusIndex, stepPercent, stepReachable, stepStatus } from '@slotted/core/steps';

import {
  injectStepperDefaults,
  STEPPER_DEFAULT_LABEL,
  STEPPER_DEFAULT_LABELS,
  STEPPER_DEFAULT_LABEL_PLACEMENT,
  STEPPER_DEFAULT_NAVIGATION,
  STEPPER_DEFAULT_ORIENTATION,
  type StepperLabelPlacement,
  type StepperLabels,
  type StepperNavigation,
  type StepperOrientation,
  type StepperStepReason,
} from './stepper.constants';

let counter = 0;

/**
 * Where the reader is in a sequence of steps, which steps they may reach, and
 * the panel belonging to the step they are on.
 *
 * **It refuses the tab role.** Angular Material gives a horizontal stepper
 * `role="tablist"`; section 7 of the feature guide forbids it in the Tabs entry
 * itself — tabs are for peer views in one context, not for the steps of a
 * process. What replaces it is `ol` and `li` for the sequence,
 * `aria-current="step"` for where the reader is, and a visually hidden status
 * inside each header so a reader hears "Step 2 of 5, completed" rather than
 * "2".
 *
 * **It validates nothing.** A consumer refuses a move by cancelling the change
 * request, which every mutable value in this library already carries. Zag ships
 * `isStepValid` and `onStepInvalid` for that job; this family needs neither.
 *
 * **It never claims completion.** `complete` is the consumer's fact about one
 * step; `autoComplete` is the shorthand for the flow where reaching step three
 * does mean the first two are done, and it is off.
 */
@Component({
  selector: '[slStepper]',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrls: [
    '../../../styles/src/stepper/stepper.css',
    '../../../styles/src/visually-hidden/visually-hidden.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slStepper',
  host: {
    'data-ui': 'stepper',
    'data-part': 'root',
    '[attr.data-orientation]': 'orientationValue()',
    '[attr.data-label-placement]': 'labelPlacementValue()',
    '[attr.data-navigation]': 'navigationValue()',
  },
})
export class SlStepper {
  /** Present means controlled, for the life of the component. */
  readonly stepValue = input(undefined, { alias: 'step', transform: optionalNumber });
  /** What an uncontrolled stepper starts from, read once. */
  readonly defaultStep = input(0, { transform: numberAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly labels = input<Partial<StepperLabels> | undefined>(undefined);
  readonly orientation = input<StepperOrientation | undefined>(undefined);
  readonly labelPlacement = input<StepperLabelPlacement | undefined>(undefined);
  readonly navigation = input<StepperNavigation | undefined>(undefined);
  readonly linear = input(false, { transform: booleanAttribute });
  readonly autoComplete = input(false, { transform: booleanAttribute });

  /**
   * Emitted before the step moves, carrying what it replaces, the reason and
   * the event. It is not the second half of a two-way binding: one slot can
   * carry none of those, and cancelling the request is how a consumer refuses
   * a move.
   */
  readonly stepChange = output<ChangeRequest<number>>();

  private readonly defaults = injectStepperDefaults();
  private readonly own = signal<number | undefined>(undefined);
  private readonly steps = signal<readonly SlStepperStep[]>([]);

  readonly id = `slotted-stepper-${(counter += 1)}`;
  readonly step = computed(() => this.stepValue() ?? this.own() ?? this.defaultStep());
  readonly count = computed(() => this.steps().length);

  readonly orientationValue = computed(
    () => this.orientation() ?? this.defaults.orientation ?? STEPPER_DEFAULT_ORIENTATION,
  );
  readonly labelPlacementValue = computed(
    () => this.labelPlacement() ?? this.defaults.labelPlacement ?? STEPPER_DEFAULT_LABEL_PLACEMENT,
  );
  readonly navigationValue = computed(
    () => this.navigation() ?? this.defaults.navigation ?? STEPPER_DEFAULT_NAVIGATION,
  );
  readonly linearValue = computed(() => this.linear() || this.defaults.linear === true);
  readonly labelSet = computed<StepperLabels>(() => ({
    ...STEPPER_DEFAULT_LABELS,
    ...this.defaults.labels,
    ...this.labels(),
  }));
  readonly listLabel = computed(() => this.label() ?? this.defaults.label ?? STEPPER_DEFAULT_LABEL);

  /** How far along the row the reader has travelled, nought to a hundred. */
  readonly percent = computed(() => stepPercent({ count: this.count(), step: this.step() }));
  readonly canGoPrevious = computed(() => this.step() > 0);
  readonly canGoNext = computed(
    () => this.count() > 0 && this.step() < this.count() - 1 && this.reachable(this.step() + 1),
  );

  register(steps: readonly SlStepperStep[]) {
    this.steps.set(steps);
  }

  statusOf(index: number) {
    return stepStatus({
      autoComplete: this.autoComplete(),
      complete: this.steps()[index]?.complete(),
      index,
      step: this.step(),
    });
  }

  reachable(index: number) {
    return stepReachable({
      autoComplete: this.autoComplete(),
      complete: this.steps()[index]?.complete(),
      count: this.count(),
      disabled: this.steps()[index]?.disabled(),
      index,
      isComplete: (candidate) => this.statusOf(candidate) === 'complete',
      linear: this.linearValue(),
      step: this.step(),
    });
  }

  goToStep(next: number, reason: StepperStepReason = 'pointer', source?: Event) {
    if (next < 0 || (this.count() > 0 && next >= this.count())) return;
    const state = createControllable<number>({
      controlled: untracked(() => this.stepValue()),
      initial: untracked(() => this.step()),
      onRequest: (request) => this.stepChange.emit(request),
    });
    if (state.request(next, reason, source)) this.own.set(next);
  }

  next(reason: StepperStepReason = 'pointer', source?: Event) {
    this.goToStep(this.step() + 1, reason, source);
  }

  previous(reason: StepperStepReason = 'pointer', source?: Event) {
    this.goToStep(this.step() - 1, reason, source);
  }

  reset(source?: Event) {
    this.goToStep(this.defaultStep(), 'programmatic', source);
  }

  triggerId(index: number) {
    return `${this.id}-trigger-${index}`;
  }

  panelId(index: number) {
    return `${this.id}-panel-${index}`;
  }
}

/**
 * The ordered list, and the one part that knows how many steps there are.
 *
 * The keyboard is handled here rather than on each header, because the
 * destination of an arrow is another header and only the list knows them all.
 * Every header stays in the tab sequence: the arrows are added on top of it
 * rather than replacing it with a roving tab stop, which is the model a
 * `tablist` has and the model this family declined.
 */
@Directive({
  selector: 'ol[slStepperList]',
  standalone: true,
  exportAs: 'slStepperList',
  host: {
    'data-part': 'list',
    '[attr.aria-label]': 'accessibleLabel()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SlStepperList {
  private readonly stepper = inject(SlStepper);
  private readonly items = contentChildren(SlStepperStep);
  private readonly element = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly ownLabel = inject(new HostAttributeToken('aria-label'), { optional: true });

  readonly accessibleLabel = computed(() => this.ownLabel ?? this.stepper.listLabel());

  constructor() {
    effect(() => {
      const items = this.items();
      this.stepper.register(items);
      for (const [index, item] of items.entries()) {
        item.index.set(index);
        item.last.set(index === items.length - 1);
      }
    });
  }

  onKeydown(event: KeyboardEvent) {
    const trigger = (event.target as HTMLElement | null)?.closest?.('[data-part="trigger"]');
    const from = Number(trigger?.getAttribute('data-index') ?? -1);
    if (!Number.isInteger(from) || from < 0) return;

    const view = this.element.ownerDocument.defaultView;
    const direction = view?.getComputedStyle(this.element).direction === 'rtl' ? 'rtl' : 'ltr';

    /**
     * Every header, reachable or not. The arrows move focus exactly where Tab
     * moves it, because that is the whole reason they were added on top of the
     * tab sequence: a step a linear flow has not opened is still one a reader
     * is allowed to find.
     */
    const next = stepFocusIndex({
      count: this.stepper.count(),
      direction,
      from,
      key: event.key,
      orientation: this.stepper.orientationValue(),
    });
    if (next === -1) return;

    event.preventDefault();
    this.element.ownerDocument.getElementById(this.stepper.triggerId(next))?.focus();
  }
}

/**
 * One step: its marker, its name, the second line under it, and the connector
 * that runs to the next one.
 *
 * A step a linear flow has not reached carries `aria-disabled` rather than
 * `disabled`, so it stays in the tab sequence: a reader can find out the step
 * exists and that it is not yet available.
 */
@Component({
  selector: 'li[slStepperStep]',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @switch (stepper.navigationValue()) {
      @case ('none') {
        <span
          [attr.aria-current]="current() ? 'step' : null"
          [attr.data-index]="index()"
          [id]="stepper.triggerId(index())"
          data-part="trigger"
        >
          <ng-container *ngTemplateOutlet="header"></ng-container>
        </span>
      }
      @case ('link') {
        <a
          [attr.aria-current]="current() ? 'step' : null"
          [attr.aria-disabled]="unreachable() ? 'true' : null"
          [attr.data-index]="index()"
          [attr.href]="unreachable() ? null : (href() ?? null)"
          [id]="stepper.triggerId(index())"
          data-part="trigger"
          (click)="activate($event)"
        >
          <ng-container *ngTemplateOutlet="header"></ng-container>
        </a>
      }
      @default {
        <button
          [attr.aria-current]="current() ? 'step' : null"
          [attr.aria-disabled]="unreachable() ? 'true' : null"
          [attr.data-index]="index()"
          [id]="stepper.triggerId(index())"
          data-part="trigger"
          type="button"
          (click)="activate($event)"
        >
          <ng-container *ngTemplateOutlet="header"></ng-container>
        </button>
      }
    }
    <ng-content></ng-content>
    @if (!last()) {
      <span
        [attr.data-complete]="travelled() ? '' : null"
        aria-hidden="true"
        data-part="separator"
      ></span>
    }

    <ng-template #header>
      <span aria-hidden="true" data-part="marker">{{ index() + 1 }}</span>
      <span data-part="label">
        {{ label() }}
        @if (description()) {
          <span data-part="description">{{ description() }}</span>
        }
      </span>
      <!--
        The visible name and this run concatenate into one accessible name, and
        nothing separates two elements' text: without the comma a reader hears
        "CartStep 1 of 4".
      -->
      <span data-part="status" data-ui="visually-hidden">{{ ', ' + announced() }}</span>
    </ng-template>
  `,
  styleUrls: [
    '../../../styles/src/stepper/stepper.css',
    '../../../styles/src/visually-hidden/visually-hidden.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slStepperStep',
  host: {
    'data-part': 'item',
    '[attr.data-current]': 'current() ? "" : null',
    '[attr.data-complete]': 'status() === "complete" ? "" : null',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-disabled]': 'unreachable() ? "" : null',
  },
})
export class SlStepperStep {
  readonly stepper = inject(SlStepper);

  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly complete = input(undefined, { transform: optionalBoolean });
  readonly disabled = input(undefined, { transform: optionalBoolean });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly href = input<string | undefined>(undefined);

  /** Written by the list, the only part that can see the whole sequence. */
  readonly index = signal(0);
  readonly last = signal(false);

  readonly current = computed(() => this.index() === this.stepper.step());
  readonly travelled = computed(() => this.index() < this.stepper.step());
  readonly status = computed(() => this.stepper.statusOf(this.index()));
  readonly unreachable = computed(
    () => this.disabled() === true || !this.stepper.reachable(this.index()),
  );

  readonly announced = computed(() => {
    const labels = this.stepper.labelSet();
    const state = this.invalid()
      ? labels.invalid
      : this.current()
        ? labels.current
        : this.status() === 'complete'
          ? labels.complete
          : undefined;
    return [
      labels.position(this.index(), this.stepper.count()),
      state,
      this.loading() ? labels.loading : undefined,
      this.unreachable() && !this.current() ? labels.unavailable : undefined,
    ]
      .filter(Boolean)
      .join(', ');
  });

  activate(event: Event) {
    if (this.unreachable() || this.loading()) return;
    this.stepper.goToStep(this.index(), 'pointer', event);
  }
}

/**
 * The content of the step it is written inside. It is a `group` labelled by its
 * own header rather than a `tabpanel`, for the reason the root refuses the tab
 * role, and it is focusable so a consumer moving focus after a step change has
 * somewhere to put it.
 */
@Directive({
  selector: '[slStepperPanel]',
  standalone: true,
  exportAs: 'slStepperPanel',
  host: {
    'data-part': 'panel',
    role: 'group',
    tabindex: '-1',
    '[attr.id]': 'stepper.panelId(step.index())',
    '[attr.aria-labelledby]': 'stepper.triggerId(step.index())',
    '[hidden]': '!step.current()',
  },
})
export class SlStepperPanel {
  readonly stepper = inject(SlStepper);
  readonly step = inject(SlStepperStep);
}

/**
 * The two directives that move the flow, on the consumer's own button.
 *
 * Angular Material reaches the same shape with `matStepperNext`: a family that
 * shipped its own advance button would ship a second button nobody could theme
 * with the first.
 */
@Directive({
  selector: 'button[slStepperNext]',
  standalone: true,
  exportAs: 'slStepperNext',
  host: {
    '[disabled]': '!stepper.canGoNext()',
    '(click)': 'stepper.next("pointer", $event)',
  },
})
export class SlStepperNext {
  readonly stepper = inject(SlStepper);
}

@Directive({
  selector: 'button[slStepperPrevious]',
  standalone: true,
  exportAs: 'slStepperPrevious',
  host: {
    '[disabled]': '!stepper.canGoPrevious()',
    '(click)': 'stepper.previous("pointer", $event)',
  },
})
export class SlStepperPrevious {
  readonly stepper = inject(SlStepper);
}

/** Absence has to survive the transform, so an unset input stays unset. */
function optionalBoolean(value: boolean | string | undefined) {
  return value === undefined ? undefined : booleanAttribute(value);
}

function optionalNumber(value: number | string | undefined) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = numberAttribute(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
