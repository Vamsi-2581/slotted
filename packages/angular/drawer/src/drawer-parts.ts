import {
  EXTENT_LARGE_STEP_PX,
  EXTENT_STEP_PX,
  anchorsAtStart,
  extentAtPoint,
  extentVelocity,
  holdResizeGesture,
  isInlineSide,
  nearestSnap,
  projectExtent,
  stepAmountFromPixels,
  stepExtent,
} from '@slotted/core/extent';
import type { ExtentSample } from '@slotted/core/extent';
import { clamp } from '@slotted/core/measure';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { SlDrawer } from './drawer';
import type { DrawerOpenReason } from './drawer-defaults';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is how `Enter`, `Space` and a pointer are told apart without
 * a key listener existing for something the platform already handles.
 */
function activationReason(event: MouseEvent): DrawerOpenReason {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

/**
 * The control that opens a drawer.
 *
 * It is the consumer's own element, which is what this ecosystem composes with:
 * `<button slButton [slDrawerTrigger]="d">` is the library's own button and
 * this adds the wiring to it. React reaches the same place with `render`,
 * because there the component owns the tag.
 *
 * The trigger is also an overlay layer's *branch*: a press on it is inside the
 * layer as far as `dismissable-layer` is concerned, or opening would
 * immediately be read as an outside press and close what it just opened.
 *
 * `aria-haspopup` is written only under `mode="overlay"`. An inline drawer is a
 * disclosure, not a popup, and the property would promise a layer that never
 * arrives.
 */
@Directive({
  selector: '[slDrawerTrigger]',
  standalone: true,
  exportAs: 'slDrawerTrigger',
  host: {
    'data-part': 'trigger',
    type: 'button',
    '[attr.aria-haspopup]': 'haspopup()',
    '[attr.aria-expanded]': 'drawer().open()',
    '[attr.aria-controls]': 'controls()',
    '[attr.data-open]': "drawer().open() ? '' : null",
    '[id]': 'drawer().triggerId',
    '(click)': 'press($event)',
  },
})
export class SlDrawerTrigger implements OnInit, OnDestroy {
  /** The drawer this control opens, reached with a template reference variable. */
  readonly drawer = input.required<SlDrawer>({ alias: 'slDrawerTrigger' });

  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly controls = computed(() =>
    this.drawer().mounted() ? this.drawer().panelId : null,
  );
  protected readonly haspopup = computed(() =>
    this.drawer().resolvedMode() === 'overlay' ? 'dialog' : null,
  );

  ngOnInit() {
    this.drawer().triggerNode.set(this.native);
  }

  ngOnDestroy() {
    if (this.drawer().triggerNode() === this.native) this.drawer().triggerNode.set(null);
  }

  protected press(event: MouseEvent) {
    /* The consumer's own handler ran first, and `preventDefault()` refuses the
       open — composed with, never replaced. */
    if (event.defaultPrevented) return;
    const drawer = this.drawer();
    drawer.request(!drawer.open(), activationReason(event), undefined, event);
  }
}

@Directive({
  selector: '[slDrawerHeader]',
  standalone: true,
  exportAs: 'slDrawerHeader',
  host: { 'data-part': 'header' },
})
export class SlDrawerHeader {}

/**
 * The visible name, which `aria-labelledby` points at — on the panel and, as
 * the Window Splitter pattern requires, on the separator that sizes it.
 */
@Directive({
  selector: '[slDrawerTitle]',
  standalone: true,
  exportAs: 'slDrawerTitle',
  host: { 'data-part': 'title', '[id]': 'drawer.titleId' },
})
export class SlDrawerTitle implements OnInit, OnDestroy {
  protected readonly drawer = inject(SlDrawer);

  ngOnInit() {
    this.drawer.hasTitle.set(true);
  }

  ngOnDestroy() {
    this.drawer.hasTitle.set(false);
  }
}

/** The sentence that says what the drawer is about. */
@Directive({
  selector: '[slDrawerDescription]',
  standalone: true,
  exportAs: 'slDrawerDescription',
  host: { 'data-part': 'description', '[id]': 'drawer.descriptionId' },
})
export class SlDrawerDescription implements OnInit, OnDestroy {
  protected readonly drawer = inject(SlDrawer);

  ngOnInit() {
    this.drawer.hasDescription.set(true);
  }

  ngOnDestroy() {
    this.drawer.hasDescription.set(false);
  }
}

/**
 * The one row that scrolls, and the row `aria-busy` belongs to while the
 * content is still on its way — the header, the close button, Escape and the
 * separator all stay operable, because a drawer a reader cannot leave is the
 * worse failure of the two.
 */
@Directive({
  selector: '[slDrawerBody]',
  standalone: true,
  exportAs: 'slDrawerBody',
  host: {
    'data-part': 'body',
    '[attr.aria-busy]': "drawer.loading() ? 'true' : null",
    '[attr.data-inset]': 'inset() ?? null',
  },
})
export class SlDrawerBody {
  protected readonly drawer = inject(SlDrawer);
  /** `none` drops the body's own padding, for content that brings its own inset — a page, a list on the panel's edges. */
  readonly inset = input<'none' | undefined>(undefined);
}

@Directive({
  selector: '[slDrawerFooter]',
  standalone: true,
  exportAs: 'slDrawerFooter',
  host: { 'data-part': 'footer' },
})
export class SlDrawerFooter {}

/**
 * The ✕ in the corner. It carries `dismiss`, which is the word the closed
 * vocabulary in `docs/state-and-events.md` already has for what a close button
 * means, and its `value` rides out on the request as the result.
 */
@Directive({
  selector: '[slDrawerClose]',
  standalone: true,
  exportAs: 'slDrawerClose',
  host: {
    'data-part': 'close',
    type: 'button',
    '[attr.aria-label]': 'label()',
    '(click)': 'press($event)',
  },
})
export class SlDrawerClose {
  /** The result the close carries out, which is the platform's `returnValue`. */
  readonly value = input<string | undefined>(undefined);

  private readonly drawer = inject(SlDrawer);
  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly label = computed(() =>
    this.native.hasAttribute('aria-label') ? null : 'Close',
  );

  protected press(event: MouseEvent) {
    if (event.defaultPrevented) return;
    this.drawer.request(false, 'dismiss', this.value(), event);
  }
}

/**
 * The separator the reader moves, from the WAI-ARIA Window Splitter pattern.
 *
 * **Rendering it is the capability.** There is no `resizable` input, so an
 * input with no separator, and a separator an input had switched off, are both
 * states this family cannot be in.
 *
 * The arrows are physical rather than logical, which is the pattern's own
 * reading: the key names a direction on the screen. `ArrowLeft` grows an
 * `end`-side panel in a left-to-right document and shrinks it in a mirrored
 * one, because there the panel is on the left and the reader is pushing its
 * edge toward the wall.
 */
/**
 * Fractions of the layer per second, past which a release asks to close
 * whatever distance it covered.
 *
 * Half the panel a second is a deliberate gesture and not a nudge: a hand
 * moving that fast has decided. Stated here rather than in the stylesheet
 * because it is a decision about intent and not about paint — no theme should
 * be able to retune what counts as meaning to dismiss something.
 */
const DISMISS_VELOCITY = 0.5;

@Component({
  selector: '[slDrawerResizer]',
  standalone: true,
  exportAs: 'slDrawerResizer',
  /**
   * A component rather than a directive, and the template is the whole reason:
   * the separator draws its own picture now — two hairlines and a grip, or a
   * pill on a block side — and a directive has nothing to draw them with.
   *
   * Three elements rather than pseudo-elements because
   * `packages/styles/src/fallbacks.test.mjs` forbids a system colour inside
   * `::before` or `::after`, and both steps these take have one as their last
   * resort. The selector is unchanged, so no consumer's template moves.
   */
  template: `
    <span data-part="line" aria-hidden="true"></span>
    <span data-part="grip" aria-hidden="true"></span>
    <span data-part="line" aria-hidden="true"></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'resizer',
    role: 'separator',
    tabindex: '0',
    '[attr.aria-controls]': 'drawer.panelId',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-valuemin]': 'percent(drawer.bounds().min)',
    '[attr.aria-valuemax]': 'percent(drawer.bounds().max)',
    '[attr.aria-valuenow]': 'valueNow()',
    '(pointerdown)': 'pointerDown($event)',
    '(pointermove)': 'pointerMove($event)',
    '(pointerup)': 'endDrag($event)',
    '(lostpointercapture)': 'endDrag($event)',
    '(keydown)': 'keyDown($event)',
    '(dblclick)': 'restore($event)',
  },
})
export class SlDrawerResizer {
  /**
   * How far one arrow press moves the separator, **in pixels**, when there are
   * no snap points. A distance and not a proportion: a reader adjusting a pane
   * is placing an edge against the content beside it, and a proportion of a
   * wide layer is a jump.
   */
  readonly step = input(EXTENT_STEP_PX);
  /** How far `Shift` and an arrow move it, in pixels. */
  readonly largeStep = input(EXTENT_LARGE_STEP_PX);

  protected readonly drawer = inject(SlDrawer);
  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  /** Where the pointer last was, which is what decides a dismissal on release. */
  private dragged: number | null = null;
  /** Where the pointer has been, for the velocity the release reads. */
  private samples: ExtentSample[] = [];
  /** What `Enter` restores to once it has collapsed the panel. */
  private collapsed: number | null = null;
  /** What the document looked like before the drag, and how to put it back. */
  private gesture: (() => void) | null = null;

  protected readonly orientation = computed(() =>
    isInlineSide(this.drawer.resolvedSide()) ? 'vertical' : 'horizontal',
  );
  protected readonly labelledBy = computed(() =>
    this.drawer.hasTitle() ? this.drawer.titleId : null,
  );
  protected readonly valueNow = computed(() => {
    const bounds = this.drawer.bounds();
    return this.percent(clamp(this.current(), bounds.min, bounds.max));
  });

  protected percent(value: number) {
    return Math.round(clamp(value, 0, 1) * 100);
  }

  private current() {
    return this.drawer.extent() ?? this.drawer.bounds().min;
  }

  private isRtl() {
    return getComputedStyle(this.native).direction === 'rtl';
  }

  private fractionAt(event: PointerEvent) {
    const box = this.drawer.measuringBox();
    if (box === null) return null;
    return extentAtPoint({
      point: { x: event.clientX, y: event.clientY },
      rect: box.getBoundingClientRect(),
      rtl: this.isRtl(),
      side: this.drawer.resolvedSide(),
    });
  }

  protected pointerDown(event: PointerEvent) {
    if (event.defaultPrevented || event.button !== 0) return;
    const fraction = this.fractionAt(event);
    if (fraction === null) return;

    event.preventDefault();
    this.native.setPointerCapture(event.pointerId);
    this.native.focus();
    /* The cursor has to survive the pointer leaving the separator, and a drag
       across the page must not select the text under it. Both are the
       document's and neither is reachable from the family's own stylesheet. */
    this.gesture?.();
    this.gesture = holdResizeGesture(
      this.native.ownerDocument,
      isInlineSide(this.drawer.resolvedSide()) ? 'col-resize' : 'row-resize',
    );
    this.drawer.dragging.set(true);
    this.dragged = fraction;
    this.drawer.requestExtent(fraction, 'pointer', event);
  }

  protected pointerMove(event: PointerEvent) {
    if (!this.drawer.dragging()) return;
    const fraction = this.fractionAt(event);
    if (fraction === null) return;
    this.dragged = fraction;
    /* Three samples is what `extentVelocity` reads; keeping more would only let
       an older, slower stretch of the same drag dilute the flick. */
    this.samples = [...this.samples, { at: event.timeStamp, fraction }].slice(-3);
    this.drawer.requestExtent(fraction, 'pointer', event);
  }

  /**
   * Two ways out on release, and the second one is new.
   *
   * **By distance**: a measure below the floor asks to close. On its own it
   * means a reader who flicks a sheet twenty pixels and lets go gets twenty
   * pixels of movement — a gesture the component ignored, and it was reported
   * as exactly that.
   *
   * **By velocity**: a hand still travelling toward the closed edge faster than
   * `DISMISS_VELOCITY` asks to close wherever it is. A flick is short by
   * definition, and distance cannot see it.
   *
   * Whichever comes first. A close the consumer cancels leaves the panel at the
   * floor, as it always did. What is not a dismissal settles on the stop
   * nearest the *projected* position, so a release still travelling lands where
   * the hand was aiming.
   */
  protected endDrag(event: PointerEvent) {
    if (!this.drawer.dragging()) return;
    if (this.native.hasPointerCapture(event.pointerId)) {
      this.native.releasePointerCapture(event.pointerId);
    }
    this.gesture?.();
    this.gesture = null;
    this.drawer.dragging.set(false);

    const bounds = this.drawer.bounds();
    const last = this.dragged ?? this.current();
    const velocity = extentVelocity(this.samples);
    this.dragged = null;
    this.samples = [];

    if (last < bounds.min || velocity < -DISMISS_VELOCITY) {
      this.drawer.request(false, 'pointer', undefined, event);
      this.drawer.requestExtent(bounds.min, 'pointer', event);
      return;
    }

    const settled = projectExtent({ fraction: last, velocity });
    this.drawer.requestExtent(
      nearestSnap(clamp(settled, bounds.min, bounds.max), this.drawer.snapPoints()),
      'pointer',
      event,
    );
  }

  /**
   * Back to the measure the size step gives it, which is what `undefined`
   * means for this state. It is the one gesture in the family that restores
   * rather than moves, and every desktop pane divider answers a double click
   * with it.
   */
  protected restore(event: MouseEvent) {
    if (event.defaultPrevented) return;
    event.preventDefault();
    this.drawer.restoreExtent('pointer', event);
  }

  protected keyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const side = this.drawer.resolvedSide();
    const bounds = this.drawer.bounds();
    const inline = isInlineSide(side);
    const atStart = anchorsAtStart(side, this.isRtl());
    const towardFirstEdge = inline ? 'ArrowLeft' : 'ArrowUp';
    const towardLastEdge = inline ? 'ArrowRight' : 'ArrowDown';

    /**
     * A distance and not a proportion. Five per cent of a twelve-hundred-pixel
     * layer is sixty pixels, which is a jump rather than an adjustment; the
     * fraction is still what the family stores, and the pixels are converted
     * against the layer measured at the moment of the press.
     */
    const box = this.drawer.measuringBox();
    const amount =
      box === null
        ? 0
        : stepAmountFromPixels({
            pixels: event.shiftKey ? this.largeStep() : this.step(),
            rect: box.getBoundingClientRect(),
            side,
          });

    const by = (direction: 1 | -1) => {
      event.preventDefault();
      this.drawer.requestExtent(
        stepExtent({
          amount,
          direction,
          fraction: this.current(),
          max: bounds.max,
          min: bounds.min,
          snapPoints: this.drawer.snapPoints(),
        }),
        'keyboard',
        event,
      );
    };

    switch (event.key) {
      case towardFirstEdge:
        return by(atStart ? -1 : 1);
      case towardLastEdge:
        return by(atStart ? 1 : -1);
      case 'Home':
        event.preventDefault();
        return this.drawer.requestExtent(bounds.min, 'keyboard', event);
      case 'End':
        event.preventDefault();
        return this.drawer.requestExtent(bounds.max, 'keyboard', event);
      /**
       * The pattern's own key, and the one departure from it: "collapses the
       * pane" would mean closing the drawer, and Escape already means that. A
       * reader who presses Enter on a separator expects the separator to still
       * be there afterwards.
       */
      case 'Enter': {
        event.preventDefault();
        if (this.current() > bounds.min) {
          this.collapsed = this.current();
          return this.drawer.requestExtent(bounds.min, 'keyboard', event);
        }
        return this.drawer.requestExtent(this.collapsed ?? bounds.max, 'keyboard', event);
      }
      default:
        return;
    }
  }
}
