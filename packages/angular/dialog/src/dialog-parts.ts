import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

import { SlDialogBase } from './dialog';
import type { DialogOpenReason } from './dialog-defaults';

/**
 * A click synthesised by the keyboard reports no detail; a real one reports the
 * click count. It is how `Enter`, `Space` and a pointer are told apart without
 * a key listener existing for something the platform already handles.
 */
function activationReason(event: MouseEvent): DialogOpenReason {
  return event.detail === 0 ? 'keyboard' : 'pointer';
}

/**
 * The control that opens a layer.
 *
 * It is the consumer's own element, which is what this ecosystem composes with:
 * `<button slButton slDialogTrigger [dialog]="d">` is the library's own button
 * and this adds the wiring to it. React reaches the same place with `render`,
 * because there the component owns the tag.
 *
 * The trigger is also the layer's *branch*: a press on it is inside the layer
 * as far as `dismissable-layer` is concerned, or opening would immediately be
 * read as an outside press and close what it just opened.
 */
@Directive({
  selector: '[slDialogTrigger]',
  standalone: true,
  exportAs: 'slDialogTrigger',
  host: {
    'data-part': 'trigger',
    type: 'button',
    '[attr.aria-haspopup]': "'dialog'",
    '[attr.aria-expanded]': 'dialog().open()',
    '[attr.aria-controls]': 'controls()',
    '[attr.data-open]': "dialog().open() ? '' : null",
    '[id]': 'dialog().triggerId',
    '(click)': 'press($event)',
  },
})
export class SlDialogTrigger implements OnInit, OnDestroy {
  /** The layer this control opens, reached with a template reference variable. */
  readonly dialog = input.required<SlDialogBase>({ alias: 'slDialogTrigger' });

  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly controls = computed(() =>
    this.dialog().mounted() ? this.dialog().contentId : null,
  );

  ngOnInit() {
    this.dialog().triggerNode.set(this.native);
  }

  ngOnDestroy() {
    if (this.dialog().triggerNode() === this.native) this.dialog().triggerNode.set(null);
  }

  protected press(event: MouseEvent) {
    /* The consumer's own handler ran first, and `preventDefault()` refuses the
       open — composed with, never replaced. */
    if (event.defaultPrevented) return;
    this.dialog().request(true, activationReason(event), undefined, event);
  }
}

/**
 * The header, and the one part of it the family renders rather than the
 * consumer: the full-screen toggle, when the layer was asked for one.
 *
 * It is written in the DOM after whatever the consumer projected. The title
 * and the description come first for a reader moving through the header, and
 * the two corner controls are adjacent peers whose order carries no meaning —
 * a toggle written first would be announced ahead of the name of the dialog it
 * belongs to. The stylesheet puts it in the column before the close, which is
 * where a window's controls put it.
 *
 * The element is created rather than declared, because the directive is on the
 * consumer's own `<header>` and a `ViewContainerRef` taken from it inserts a
 * sibling of that element rather than a child of it. React reaches the same
 * DOM by rendering the part, and the two have to land together.
 */
@Directive({
  selector: '[slDialogHeader]',
  standalone: true,
  exportAs: 'slDialogHeader',
  host: { 'data-part': 'header' },
})
export class SlDialogHeader implements OnDestroy {
  private readonly dialog = inject(SlDialogBase);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  private control: HTMLButtonElement | undefined;
  private release: (() => void) | undefined;

  constructor() {
    effect(() => {
      const wanted = this.dialog.resolvedFullscreenToggle();
      if (wanted && this.control === undefined) this.mount();
      if (!wanted && this.control !== undefined) this.unmount();
      if (this.control !== undefined) {
        /* `aria-pressed` says which way it is set, so the name stays one word
           in every state: a label that changed with the state would be read as
           a second control. */
        this.renderer.setAttribute(
          this.control,
          'aria-pressed',
          String(this.dialog.resolvedFullscreen()),
        );
      }
    });
  }

  ngOnDestroy() {
    this.unmount();
  }

  private mount() {
    const control: HTMLButtonElement = this.renderer.createElement('button');
    this.renderer.setAttribute(control, 'type', 'button');
    this.renderer.setAttribute(control, 'data-part', 'fullscreen');
    this.renderer.setAttribute(control, 'aria-label', 'Full screen');
    this.release = this.renderer.listen(control, 'click', (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      this.dialog.requestFullscreen(
        !this.dialog.resolvedFullscreen(),
        activationReason(event) === 'keyboard' ? 'keyboard' : 'pointer',
        event,
      );
    });
    this.renderer.appendChild(this.host, control);
    this.control = control;
  }

  private unmount() {
    this.release?.();
    this.release = undefined;
    if (this.control !== undefined) this.renderer.removeChild(this.host, this.control);
    this.control = undefined;
  }
}

/** The visible name, which `aria-labelledby` points at. */
@Directive({
  selector: '[slDialogTitle]',
  standalone: true,
  exportAs: 'slDialogTitle',
  host: { 'data-part': 'title', '[id]': 'dialog.titleId' },
})
export class SlDialogTitle implements OnInit, OnDestroy {
  protected readonly dialog = inject(SlDialogBase);

  ngOnInit() {
    this.dialog.hasTitle.set(true);
  }

  ngOnDestroy() {
    this.dialog.hasTitle.set(false);
  }
}

/**
 * The sentence that says what the dialog is about. The alert dialog pattern
 * makes it mandatory; the modal dialog pattern makes it optional and advises
 * against it for structured content.
 */
@Directive({
  selector: '[slDialogDescription]',
  standalone: true,
  exportAs: 'slDialogDescription',
  host: { 'data-part': 'description', '[id]': 'dialog.descriptionId' },
})
export class SlDialogDescription implements OnInit, OnDestroy {
  protected readonly dialog = inject(SlDialogBase);

  ngOnInit() {
    this.dialog.hasDescription.set(true);
  }

  ngOnDestroy() {
    this.dialog.hasDescription.set(false);
  }
}

/**
 * The one row that scrolls, and the row `aria-busy` belongs to while the
 * content is still on its way — the header, the close button and Escape all
 * stay operable, because a loading dialog a reader cannot leave is the worse
 * failure of the two.
 */
@Directive({
  selector: '[slDialogBody]',
  standalone: true,
  exportAs: 'slDialogBody',
  host: { 'data-part': 'body', '[attr.aria-busy]': "dialog.loading() ? 'true' : null" },
})
export class SlDialogBody {
  protected readonly dialog = inject(SlDialogBase);
}

@Directive({
  selector: '[slDialogFooter]',
  standalone: true,
  exportAs: 'slDialogFooter',
  host: { 'data-part': 'footer' },
})
export class SlDialogFooter {}

/**
 * The ✕ in the corner. It carries `dismiss`, which is the word the closed
 * vocabulary in `docs/state-and-events.md` already has for what a close button
 * means; `docs/component-features.md` §8 calls the source `closeButton`, and a
 * twelfth reason would be a change to a contract outside this family.
 */
@Directive({
  selector: '[slDialogClose]',
  standalone: true,
  exportAs: 'slDialogClose',
  host: {
    'data-part': 'close',
    type: 'button',
    '[attr.aria-label]': 'label()',
    '(click)': 'press($event)',
  },
})
export class SlDialogClose {
  /** The result the close carries out, which is the platform's `returnValue`. */
  readonly value = input<string | undefined>(undefined);

  private readonly dialog = inject(SlDialogBase);
  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly label = computed(() =>
    this.native.hasAttribute('aria-label') ? null : 'Close',
  );

  constructor() {
    if (this.dialog.isAlert()) {
      throw new Error(
        'sl-alert-dialog has no close part: a confirmation is answered with slAlertDialogCancel or slAlertDialogAction, not dismissed by an ✕.',
      );
    }
  }

  protected press(event: MouseEvent) {
    if (event.defaultPrevented) return;
    this.dialog.request(false, 'dismiss', this.value(), event);
  }
}

/** The tone's own mark, which is geometry rather than a character. */
@Directive({
  selector: '[slAlertDialogIcon]',
  standalone: true,
  exportAs: 'slAlertDialogIcon',
  host: { 'data-part': 'icon', 'aria-hidden': 'true' },
})
export class SlAlertDialogIcon {}

/**
 * The least destructive action, and where focus lands when the layer opens.
 * That is the APG's own advice for a step that is not easily reversible, and it
 * is a default of the member rather than something a consumer remembers.
 */
@Directive({
  selector: '[slAlertDialogCancel]',
  standalone: true,
  exportAs: 'slAlertDialogCancel',
  host: { 'data-part': 'cancel', type: 'button', '(click)': 'press($event)' },
})
export class SlAlertDialogCancel implements OnInit, OnDestroy {
  readonly value = input<string>('cancel');

  private readonly dialog = inject(SlDialogBase);
  private readonly native: HTMLElement = inject(ElementRef).nativeElement;

  ngOnInit() {
    this.dialog.cancelNode.set(this.native);
  }

  ngOnDestroy() {
    if (this.dialog.cancelNode() === this.native) this.dialog.cancelNode.set(null);
  }

  protected press(event: MouseEvent) {
    if (event.defaultPrevented) return;
    this.dialog.request(false, 'dismiss', this.value(), event);
  }
}

/**
 * The action being confirmed. It carries `submit`, because confirming is what
 * the reader came to do, and `dismiss` is what the other two controls mean.
 */
@Directive({
  selector: '[slAlertDialogAction]',
  standalone: true,
  exportAs: 'slAlertDialogAction',
  host: { 'data-part': 'action', type: 'button', '(click)': 'press($event)' },
})
export class SlAlertDialogAction {
  readonly value = input<string>('confirm');

  private readonly dialog = inject(SlDialogBase);

  protected press(event: MouseEvent) {
    if (event.defaultPrevented) return;
    this.dialog.request(false, 'submit', this.value(), event);
  }
}
