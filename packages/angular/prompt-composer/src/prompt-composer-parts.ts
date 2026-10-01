import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  HostAttributeToken,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { SlGlyph, SlIcon } from '@slotted/angular/icon';

import { SlPromptComposer } from './prompt-composer';

/** The band above the value: attachments, a quoted reply, a context chip. */
@Directive({
  selector: '[slPromptComposerHeader]',
  standalone: true,
  host: { 'data-part': 'header' },
})
export class SlPromptComposerHeader {}

/** The band below the value: tools on the start, the send at the end. */
@Directive({
  selector: '[slPromptComposerFooter]',
  standalone: true,
  host: { 'data-part': 'footer' },
})
export class SlPromptComposerFooter {}

/**
 * A button of the consumer's in a band: a model menu, a tool, Cancelar.
 * `slMenuTriggerFor` on the same element binds `data-part` to `null`, and the
 * binding is a constant, so the part is written back once after the first
 * render — the rule `menu` records for its own trigger.
 */
@Directive({
  selector: 'button[slPromptComposerAction]',
  standalone: true,
  exportAs: 'slPromptComposerAction',
  host: { 'data-part': 'action', '[attr.type]': 'type' },
})
export class SlPromptComposerAction {
  protected readonly type = inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  constructor() {
    const element: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => element.setAttribute('data-part', 'action'));
  }
}

/**
 * The paperclip. It opens a file chooser it creates and never attaches to the
 * page, with the composer's `accept` and `multiple`; content projected into
 * the button replaces the mark.
 */
@Component({
  selector: 'button[slPromptComposerAttach]',
  standalone: true,
  imports: [SlGlyph, SlIcon],
  template: `<ng-content
    ><span slIcon><svg slGlyph name="paperclip"></svg></span
  ></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'attach',
    type: 'button',
    '[attr.aria-label]': 'label ?? composer.defaults.attachLabel',
    '[disabled]': 'composer.off()',
    '(click)': 'open()',
  },
})
export class SlPromptComposerAttach {
  protected readonly composer = inject(SlPromptComposer);
  protected readonly label = inject(new HostAttributeToken('aria-label'), { optional: true });

  protected open() {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.multiple = this.composer.multiple();
    const accept = this.composer.accept();
    if (accept !== undefined) picker.accept = accept;
    picker.addEventListener(
      'change',
      (event) => this.composer.attachFiles(Array.from(picker.files ?? []), 'pointer', event),
      { once: true },
    );
    picker.click();
  }
}

/**
 * The send. Round and named by the provider's label for its status; a padded
 * word when given text, which then names it. It turns into a busy ring while
 * the request travels, a stop inside the ring while the answer streams, and a
 * retry after an error.
 */
@Component({
  selector: 'button[slPromptComposerSubmit]',
  standalone: true,
  imports: [SlGlyph, SlIcon],
  template: `<ng-content>
    @switch (composer.status()) {
      @case ('submitted') {
        <span data-ui="spinner" aria-hidden="true"></span>
      }
      @case ('streaming') {
        <span data-ui="spinner" aria-hidden="true"></span>
        <span slIcon><svg slGlyph name="stop"></svg></span>
      }
      @case ('error') {
        <span slIcon><svg slGlyph name="rotate-ccw"></svg></span>
      }
      @default {
        <span slIcon><svg slGlyph name="arrow-up"></svg></span>
      }
    }
  </ng-content>`,
  styleUrl: '../../../styles/src/spinner/spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'submit',
    '[attr.type]': "composer.busy() ? 'button' : 'submit'",
    '[attr.aria-label]': 'named() ? null : label()',
    '[attr.aria-disabled]': "composer.status() === 'submitted' ? 'true' : null",
    '[disabled]':
      "composer.status() === 'streaming' ? false : composer.status() !== 'submitted' && !composer.resolvedCanSubmit()",
    '(click)': 'activate($event)',
  },
})
export class SlPromptComposerSubmit {
  protected readonly composer = inject(SlPromptComposer);
  private readonly element: HTMLButtonElement = inject(ElementRef).nativeElement;
  /** Whether the consumer named the button with words of its own. */
  protected readonly named = signal(false);

  protected readonly label = computed(() => {
    const { defaults } = this.composer;
    switch (this.composer.status()) {
      case 'streaming':
        return defaults.stopLabel;
      case 'submitted':
        return defaults.sendingLabel;
      case 'error':
        return defaults.retryLabel;
      default:
        return defaults.sendLabel;
    }
  });

  constructor() {
    afterNextRender(() => this.named.set((this.element.textContent ?? '').trim() !== ''));
  }

  protected activate(event: MouseEvent) {
    event.preventDefault();
    const reason = event.detail === 0 ? 'keyboard' : 'pointer';
    const status = this.composer.status();
    if (status === 'streaming') this.composer.stopWith(reason, event);
    else if (status !== 'submitted') this.composer.submitWith(reason, event);
  }
}
