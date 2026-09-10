import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';
import {
  createUploadRunner,
  estimateRemaining,
  isViewable,
  selectFiles,
  splitName,
  uploadSummary,
} from '@slotted/core/upload';
import type {
  DuplicatePolicy,
  UploadAdapterLike,
  UploadFile,
  UploadPatch,
  UploadRejectionReason,
  UploadRunner,
} from '@slotted/core/upload';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { SlProgressBar } from '@slotted/angular/progress-indicator';

import {
  injectUploadDefaults,
  uploadFormatters,
  type DescribeRejection,
  type UploadLabels,
  type UploadLayout,
  type UploadPreview,
  type UploadSize,
  type UploadKindLabels,
  type UploadStatusLabels,
  type UploadVariant,
  type UploadView,
} from './upload-defaults';
import { SlUploadViewer } from './upload-viewer';

/**
 * Files, and what happens to them.
 *
 * One family for what `docs/component-features.md` §17 lists as three: a drop
 * region, a file input, and the manager that shows what is being sent.
 *
 * **The trigger is the `<label>` and the region is not.** What the reader
 * focuses is an `<input type="file">` clipped to one pixel inside the trigger,
 * so the input's accessible name is the trigger's own text rather than every
 * word in the box.
 *
 * **The family calls an adapter and reports what it says.** It holds no URL, no
 * method, no header and no credential.
 */
@Component({
  selector: 'div[slUpload]',
  standalone: true,
  exportAs: 'slUpload',
  imports: [NgTemplateOutlet, SlProgressBar, SlUploadViewer],
  styleUrls: [
    '../../../styles/src/upload/upload.css',
    '../../../styles/src/progress-indicator/progress-indicator.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SlUpload), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => SlUpload), multi: true },
  ],
  host: {
    'data-ui': 'upload',
    'data-part': 'root',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-layout]': 'resolvedLayout()',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.data-disabled]': "resolvedDisabled() ? '' : null",
    '[attr.data-readonly]': "readOnly() ? '' : null",
    '[attr.data-invalid]': "invalid() ? '' : null",
    '[attr.data-required]': "required() ? '' : null",
    '[attr.data-loading]': "summary().pending ? '' : null",
    '[attr.data-complete]': "summary().complete ? '' : null",
    '[attr.data-dragging]': "dragging() || documentDrag() ? '' : null",
  },
  template: `
    @if (label() && !insideField()) {
      <span data-part="label">{{ label() }}</span>
    }
    @if (description() && !insideField()) {
      <p [id]="descriptionId" data-part="description">{{ description() }}</p>
    }

    @if (resolvedVariant() === 'button') {
      <ng-container [ngTemplateOutlet]="triggerTemplate" />
    } @else {
      <div
        (dragenter)="onDragEnter($event)"
        (dragleave)="onDragLeave()"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
        (paste)="onPaste($event)"
        (click)="onZoneClick($event)"
        [attr.data-drop-target]="verdict() === 'target' ? '' : null"
        [attr.data-drop-invalid]="verdict() === 'invalid' ? '' : null"
        data-part="dropzone"
      >
        @if (resolvedVariant() === 'dropzone') {
          {{ labels().dropzone }}
        }
        <ng-container [ngTemplateOutlet]="triggerTemplate" />
        @if (resolvedVariant() === 'field') {
          <span data-part="meta">{{ fieldSummary() }}</span>
        }
      </div>
    }

    @if (files().length > 1) {
      <div data-part="summary">
        <span>{{ summaryText() }}</span>
        @if (!readOnly()) {
          <button (click)="clear($event)" data-part="clear" type="button">
            {{ labels().clear }}
          </button>
        }
      </div>
    }

    @if (showList()) {
      <ul [style.--slotted-upload-visible-rows]="visibleRows()" data-part="list">
        @for (file of files(); track file.key) {
          <li [attr.data-status]="file.status" data-part="item">
            @if (resolvedPreview() !== 'none' || resolvedLayout() === 'grid') {
              <span
                [attr.data-extension]="extensionLabel(file)"
                [attr.data-kind]="file.kind"
                data-part="preview"
              >
                @if (url(file) && file.type.startsWith('image/')) {
                  <img [src]="url(file)" alt="" />
                }
              </span>
            }

            <div data-part="body">
              @if (openable(file)) {
                <button (click)="open(file, $event)" data-part="filename" dir="auto" type="button">
                  <span data-part="name">{{ stem(file) }}</span>
                  @if (extension(file)) {
                    <span data-part="extension">{{ extension(file) }}</span>
                  }
                </button>
              } @else {
                <span data-part="filename" dir="auto">
                  <span data-part="name">{{ stem(file) }}</span>
                  @if (extension(file)) {
                    <span data-part="extension">{{ extension(file) }}</span>
                  }
                </span>
              }
              <div data-part="detail">
                <span data-part="meta">{{ formatters().bytes(file.size) }}</span>
                <span data-part="status">{{ statusText(file) }}</span>
              </div>
            </div>

            <span data-part="actions">
              @for (action of actions(file); track action.part) {
                <button
                  (click)="act(file, action.action, $event)"
                  [attr.aria-label]="action.label + ': ' + file.name"
                  [attr.data-part]="action.part"
                  type="button"
                ></button>
              }
            </span>

            @if (showBar(file)) {
              <div data-part="progress">
                <div
                  [tone]="file.status === 'uploading' ? 'accent' : 'warning'"
                  [value]="percent(file)"
                  decorative
                  size="sm"
                  slProgressBar
                ></div>
              </div>
            }

            @if (file.status === 'rejected' || file.status === 'error') {
              <p data-part="message">{{ messageText(file) }}</p>
            }
          </li>
        }
      </ul>
    }

    <ng-content />

    <div
      (viewingChange)="setViewing($event.key, $event.reason, $event.source)"
      [files]="files()"
      [kindLabels]="kindLabels()"
      [labels]="labels()"
      [locale]="resolvedLocale()"
      [size]="resolvedSize()"
      [urls]="urls()"
      [viewing]="resolvedView() === 'none' ? null : viewing()"
      slUploadViewer
    ></div>

    <ng-template #triggerTemplate>
      <label #trigger data-part="trigger">
        <input
          #control
          (change)="onPicked($event)"
          [attr.accept]="accept() ?? null"
          [attr.aria-describedby]="describedBy()"
          [attr.capture]="capture() ?? null"
          [attr.disabled]="resolvedDisabled() ? '' : null"
          [attr.id]="controlId"
          [attr.multiple]="multiple() ? '' : null"
          [attr.name]="name() ?? null"
          [attr.required]="required() ? '' : null"
          [attr.webkitdirectory]="directory() ? '' : null"
          data-part="input"
          type="file"
        />
        {{ labels().trigger }}
      </label>
    </ng-template>
  `,
})
export class SlUpload implements ControlValueAccessor, Validator {
  private readonly defaults = injectUploadDefaults();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  /**
   * A static `id` the consumer wrote, read before any binding computes, so the
   * binding never writes over it.
   */
  private static count = 0;
  private readonly writtenId = inject(new HostAttributeToken('id'), { optional: true });
  readonly controlId = this.writtenId ?? `slotted-upload-${(SlUpload.count += 1)}`;
  readonly descriptionId = `${this.controlId}-description`;

  /** Present means the consumer owns the selection. */
  readonly files = model<readonly UploadFile[]>([]);
  /** Present means the consumer owns which file the viewer is open on. */
  readonly viewing = model<string | null>(null);

  readonly filesChange2 = output<ChangeRequest<readonly UploadFile[]>>({ alias: 'filesRequest' });
  readonly viewingRequest = output<ChangeRequest<string | null>>();
  readonly reject = output<readonly UploadFile[]>();

  readonly accept = input<string | undefined>(undefined);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly directory = input(false, { transform: booleanAttribute });
  readonly capture = input<'user' | 'environment' | undefined>(undefined);
  readonly maxFiles = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly minFiles = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly maxSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly minSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly maxTotalSize = input<number | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  /**
   * The consumer's own rule. It is `fileValidator` in the class and `validate`
   * in a template, because `Validator.validate` is a method this class already
   * has and two members cannot share a name.
   */
  readonly fileValidator = input<
    ((file: File) => UploadRejectionReason | null | undefined) | undefined
  >(undefined, { alias: 'validate' });
  readonly transform = input<((files: File[]) => File[] | Promise<File[]>) | undefined>(undefined);

  readonly variant = input<UploadVariant | undefined>(undefined);
  readonly layout = input<UploadLayout | undefined>(undefined);
  readonly size = input<UploadSize | undefined>(undefined);
  readonly preview = input<UploadPreview | undefined>(undefined);
  readonly view = input<UploadView | undefined>(undefined);
  readonly duplicates = input<DuplicatePolicy | undefined>(undefined);
  readonly clickToBrowse = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  readonly allowDrop = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  readonly allowPaste = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  readonly preventDocumentDrop = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  readonly autoUpload = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  readonly pendingBlocksSubmit = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });

  readonly adapter = input<UploadAdapterLike | undefined>(undefined);
  readonly concurrency = input<number | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  readonly retries = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly retryDelay = input<number | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  readonly stallAfter = input<number | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  readonly maxRows = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly locale = input<string | undefined>(undefined);
  readonly fileKey = input<((file: File) => string) | undefined>(undefined);
  readonly describeRejection = input<DescribeRejection | undefined>(undefined);
  readonly labelsInput = input<Partial<UploadLabels> | undefined>(undefined, { alias: 'labels' });
  readonly statusLabelsInput = input<Partial<UploadStatusLabels> | undefined>(undefined, {
    alias: 'statusLabels',
  });
  readonly kindLabelsInput = input<Partial<UploadKindLabels> | undefined>(undefined, {
    alias: 'kindLabels',
  });

  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  private readonly formDisabled = signal(false);
  readonly dragging = signal(false);
  readonly documentDrag = signal(false);
  readonly verdict = signal<'target' | 'invalid' | null>(null);
  readonly urls = signal<ReadonlyMap<string, string>>(new Map());
  private readonly pausable = signal(false);
  private readonly samples = signal<Array<{ at: number; loaded: number }>>([]);
  private depth = 0;
  private runner: UploadRunner | null = null;
  private onChangeFn: (value: readonly UploadFile[]) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly resolvedVariant = computed(() => this.variant() ?? this.defaults.variant);
  readonly resolvedLayout = computed(() => this.layout() ?? this.defaults.layout);
  readonly resolvedSize = computed(() => this.size() ?? this.defaults.size);
  readonly resolvedPreview = computed(() => this.preview() ?? this.defaults.preview);
  readonly resolvedView = computed(() => this.view() ?? this.defaults.view);
  readonly resolvedLocale = computed(() => this.locale() ?? this.defaults.locale);
  readonly resolvedDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly labels = computed(() => ({ ...this.defaults.labels, ...this.labelsInput() }));
  readonly statusLabels = computed(() => ({
    ...this.defaults.statusLabels,
    ...this.statusLabelsInput(),
  }));
  readonly kindLabels = computed(() => ({
    ...this.defaults.kindLabels,
    ...this.kindLabelsInput(),
  }));
  readonly formatters = computed(() => uploadFormatters(this.resolvedLocale()));
  readonly summary = computed(() => uploadSummary(this.files()));
  readonly insideField = computed(() => this.host.closest('[data-ui="field"]') !== null);

  readonly visibleRows = computed(() => {
    const rows = this.maxRows() ?? this.defaults.maxRows;
    return rows === 0 ? this.files().length : rows;
  });

  readonly showList = computed(
    () =>
      this.files().length > 0 && !(this.resolvedVariant() === 'field' && this.files().length === 1),
  );

  readonly fieldSummary = computed(() => {
    const list = this.files();
    if (list.length === 0) return '—';
    const first = list[0];
    if (list.length === 1 && first !== undefined) {
      return `${first.name} · ${this.formatters().bytes(first.size)}`;
    }
    return `${list.length} files`;
  });

  readonly summaryText = computed(() => {
    const summary = this.summary();
    const remaining = summary.pending ? estimateRemaining(this.samples(), summary) : null;
    const left = remaining === null ? '' : ` · about ${Math.round(remaining)} seconds left`;
    return `${summary.counts.success} of ${summary.total} uploaded${left}`;
  });

  protected readonly describedBy = computed(() => {
    const parts = [this.description() === undefined ? undefined : this.descriptionId].filter(
      Boolean,
    );
    return parts.length === 0 ? null : parts.join(' ');
  });

  constructor() {
    /* The runner is rebuilt when the adapter or its policy changes, and torn
       down with the component: an aborted transfer is what a page navigating
       away owes the reader. */
    effect((onCleanup) => {
      const adapter = this.adapter() ?? this.defaults.adapter;
      if (adapter === undefined) {
        this.runner = null;
        this.pausable.set(false);
        return;
      }
      const runner = createUploadRunner({
        adapter,
        concurrency: this.concurrency() ?? this.defaults.concurrency,
        retries: this.retries() ?? this.defaults.retries,
        retryDelay: this.retryDelay() ?? this.defaults.retryDelay,
        stallAfter: this.stallAfter() ?? this.defaults.stallAfter,
        onPatch: (key, patch) => this.patch(key, patch),
      });
      this.runner = runner;
      this.pausable.set(runner.pausable);
      onCleanup(() => runner.destroy());
    });

    /*
     * The family created the object URLs, so the family revokes them. §14
     * requires the revocation by name; Ant Design leaves it to the consumer and
     * Uppy owns a plugin for it.
     */
    effect(() => {
      const list = this.files();
      const wanted = new Map(this.urls());
      let moved = false;

      for (const file of list) {
        if (file.file === undefined || wanted.has(file.key) || !isViewable(file)) continue;
        wanted.set(file.key, URL.createObjectURL(file.file));
        moved = true;
      }
      const live = new Set(list.map((file) => file.key));
      for (const [key, url] of wanted) {
        if (live.has(key)) continue;
        URL.revokeObjectURL(url);
        wanted.delete(key);
        moved = true;
      }
      if (moved) this.urls.set(wanted);
    });

    /* The throughput window the remaining time is read from. */
    effect(() => {
      const loaded = this.summary().loaded;
      const samples = this.samples();
      if (samples.at(-1)?.loaded === loaded) return;
      this.samples.set([...samples, { at: Date.now(), loaded }].slice(-8));
    });

    /*
     * None of the nine surveyed implementations answers what happens when a
     * form is submitted while the bytes are still moving. The native submit is
     * refused on the control the reader can see, and Reactive Forms hears the
     * same thing through `Validator`.
     */
    effect(() => {
      const blocked = this.pendingBlocked();
      const element = this.host.querySelector<HTMLInputElement>('[data-part="input"]');
      element?.setCustomValidity(blocked ? this.labels().pending : '');
      this.onValidatorChange();
    });

    this.destroyRef.onDestroy(() => {
      for (const url of this.urls().values()) URL.revokeObjectURL(url);
      this.runner?.destroy();
      this.documentGuard?.();
    });

    effect((onCleanup) => {
      if (!(this.preventDocumentDrop() ?? this.defaults.preventDocumentDrop)) return;
      onCleanup(this.guardDocument());
    });
  }

  private documentGuard: (() => void) | null = null;

  /**
   * A file dropped beside the region navigates the browser to that file and
   * loses the form. The drag it knows about is published so an application can
   * draw its own full-screen zone — which is a decision about the application,
   * not about a control.
   */
  private guardDocument() {
    const inside = (event: DragEvent) =>
      (event.target as Element | null)?.closest?.('[data-ui="upload"]') !== null &&
      (event.target as Element | null)?.closest?.('[data-ui="upload"]') !== undefined;

    const over = (event: DragEvent) => {
      if (![...(event.dataTransfer?.types ?? [])].includes('Files')) return;
      this.documentDrag.set(true);
      if (!inside(event)) {
        event.preventDefault();
        if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'none';
      }
    };
    const drop = (event: DragEvent) => {
      this.documentDrag.set(false);
      if (!inside(event)) event.preventDefault();
    };

    document.addEventListener('dragover', over);
    document.addEventListener('drop', drop);
    document.addEventListener('dragend', drop);
    this.documentGuard = () => {
      document.removeEventListener('dragover', over);
      document.removeEventListener('drop', drop);
      document.removeEventListener('dragend', drop);
      this.documentGuard = null;
    };
    return this.documentGuard;
  }

  /* ── Reactive Forms ─────────────────────────────────────────────────── */

  writeValue(value: readonly UploadFile[] | readonly File[] | null) {
    if (value === null) {
      this.files.set([]);
      return;
    }
    /* A form may hand back either shape; the value the family emits is always
       the richer one, because a row draws more than its bytes. */
    const normalised = value.map((entry) =>
      entry instanceof File
        ? {
            key: `${entry.name}:${entry.size}:${entry.lastModified}`,
            file: entry,
            name: entry.name,
            size: entry.size,
            type: entry.type,
            kind: 'other' as const,
            status: 'success' as const,
            loaded: entry.size,
            attempts: 0,
          }
        : entry,
    );
    this.files.set(normalised as readonly UploadFile[]);
  }

  registerOnChange(fn: (value: readonly UploadFile[]) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.formDisabled.set(isDisabled);
  }

  registerOnValidatorChange(fn: () => void) {
    this.onValidatorChange = fn;
  }

  validate(): ValidationErrors | null {
    const errors: ValidationErrors = {};
    const summary = this.summary();
    const min = this.minFiles();
    const max = this.maxFiles();

    if (this.required() && summary.counts.success === 0) errors['required'] = true;
    if (min !== undefined && summary.counts.success < min) errors['minFiles'] = { min };
    if (max !== undefined && summary.total - summary.counts.rejected > max) {
      errors['maxFiles'] = { max };
    }
    if (this.pendingBlocked()) errors['uploadPending'] = true;

    return Object.keys(errors).length === 0 ? null : errors;
  }

  private pendingBlocked() {
    return (
      (this.pendingBlocksSubmit() ?? this.defaults.pendingBlocksSubmit) && this.summary().pending
    );
  }

  /* ── The selection ──────────────────────────────────────────────────── */

  private accepting() {
    return !this.resolvedDisabled() && !this.readOnly();
  }

  private request(next: readonly UploadFile[], reason: string, source: unknown) {
    const state = createControllable<readonly UploadFile[]>({
      controlled: undefined,
      initial: this.files(),
      onRequest: (change) => this.filesChange2.emit(change),
      equals: (a, b) => a === b,
    });
    state.request(next, reason as ChangeReason, source);
    this.files.set(next);
    this.onChangeFn(next);
    this.onValidatorChange();
  }

  private patch(key: string, changes: UploadPatch) {
    this.files.set(
      this.files().map((file) =>
        file.key === key ? ({ ...file, ...changes } as UploadFile) : file,
      ),
    );
    this.onChangeFn(this.files());
    this.onValidatorChange();
  }

  private async take(incoming: readonly File[], reason: string, source: unknown) {
    if (!this.accepting() || incoming.length === 0) return;
    const transform = this.transform();
    const prepared = transform === undefined ? [...incoming] : await transform([...incoming]);

    const before = this.files().length;
    const outcome = selectFiles(prepared, this.files(), {
      accept: this.accept(),
      multiple: this.multiple(),
      directory: this.directory(),
      maxFiles: this.maxFiles(),
      maxSize: this.maxSize(),
      minSize: this.minSize(),
      maxTotalSize: this.maxTotalSize(),
      duplicates: this.duplicates() ?? this.defaults.duplicates,
      validate: this.fileValidator(),
      fileKey: this.fileKey() ?? this.defaults.fileKey,
    });

    this.request(outcome.files, reason, source);

    const kept = outcome.files.length - before + outcome.rejected.length;
    const announcer = getLiveAnnouncer();
    if (kept > 0) announcer?.announce(`${kept} ${kept === 1 ? 'file' : 'files'} added`);
    if (outcome.rejected.length > 0) {
      this.reject.emit(outcome.rejected);
      for (const file of outcome.rejected) {
        announcer?.announce(`${file.name}: ${this.messageText(file)}`);
      }
    }

    if (!(this.autoUpload() ?? this.defaults.autoUpload)) return;
    for (const file of outcome.files) {
      if (file.status !== 'ready' || file.file === undefined) continue;
      this.runner?.enqueue(file.key, file.file);
    }
  }

  protected onPicked(event: Event) {
    const element = event.target as HTMLInputElement;
    void this.take([...(element.files ?? [])], 'select', event);
    /* Emptied so that choosing the same file twice is two selections rather
       than one silent nothing. */
    element.value = '';
  }

  /* ── The drag ───────────────────────────────────────────────────────── */

  private judge(transferred: DataTransfer | null): 'target' | 'invalid' {
    const items = [...(transferred?.items ?? [])].filter((item) => item.kind === 'file');
    const max = this.maxFiles();
    if (items.length === 0) return 'invalid';
    if (!this.multiple() && items.length > 1) return 'invalid';
    if (max !== undefined && items.length > max) return 'invalid';

    const accept = this.accept();
    if (accept === undefined || accept.trim() === '') return 'target';
    return items.some((item) => item.type !== '' && !matchesTypeOnly(item.type, accept))
      ? 'invalid'
      : 'target';
  }

  protected onDragEnter(event: DragEvent) {
    if (!(this.allowDrop() ?? this.defaults.allowDrop) || !this.accepting()) return;
    /*
     * `dragenter` and `dragleave` fire for every element the pointer crosses, so
     * a drag moving onto a child fires `dragleave` on the region. Clearing the
     * state there makes the highlight flicker across the whole zone.
     */
    this.depth += 1;
    this.dragging.set(true);
    this.verdict.set(this.judge(event.dataTransfer));
  }

  protected onDragLeave() {
    if (!(this.allowDrop() ?? this.defaults.allowDrop) || !this.accepting()) return;
    this.depth -= 1;
    if (this.depth > 0) return;
    this.depth = 0;
    this.dragging.set(false);
    this.verdict.set(null);
  }

  protected onDragOver(event: DragEvent) {
    if (!(this.allowDrop() ?? this.defaults.allowDrop) || !this.accepting()) return;
    /* The default action of `dragover` is to refuse the drop. */
    event.preventDefault();
  }

  protected onDrop(event: DragEvent) {
    if (!(this.allowDrop() ?? this.defaults.allowDrop) || !this.accepting()) return;
    event.preventDefault();
    this.depth = 0;
    this.dragging.set(false);
    this.verdict.set(null);
    void this.take([...(event.dataTransfer?.files ?? [])], 'pointer', event);
  }

  protected onPaste(event: ClipboardEvent) {
    if (!(this.allowPaste() ?? this.defaults.allowPaste) || !this.accepting()) return;
    const pasted = [...(event.clipboardData?.files ?? [])];
    if (pasted.length > 0) void this.take(pasted, 'keyboard', event);
  }

  protected onZoneClick(event: MouseEvent) {
    if (!(this.clickToBrowse() ?? this.defaults.clickToBrowse) || !this.accepting()) return;
    if ((event.target as Element).closest('[data-part="trigger"]')) return;
    this.host.querySelector<HTMLElement>('[data-part="trigger"]')?.click();
  }

  /* ── One row ────────────────────────────────────────────────────────── */

  protected stem(file: UploadFile) {
    return splitName(file.name).stem;
  }

  protected extension(file: UploadFile) {
    return splitName(file.name).extension;
  }

  protected extensionLabel(file: UploadFile) {
    const extension = splitName(file.name).extension;
    return extension === '' ? 'FILE' : extension.slice(1).toUpperCase();
  }

  protected url(file: UploadFile) {
    return this.urls().get(file.key);
  }

  protected openable(file: UploadFile) {
    return this.resolvedView() !== 'none' && this.url(file) !== undefined && isViewable(file);
  }

  protected showBar(file: UploadFile) {
    return ['uploading', 'paused', 'stalled'].includes(file.status);
  }

  protected percent(file: UploadFile): number | null {
    return file.total !== undefined && file.total > 0 ? (file.loaded / file.total) * 100 : null;
  }

  protected statusText(file: UploadFile) {
    const word = this.statusLabels()[file.status];
    const percent = this.percent(file);
    return this.showBar(file) && percent !== null ? `${word} · ${Math.round(percent)}%` : word;
  }

  protected messageText(file: UploadFile) {
    if (file.status !== 'rejected') return this.statusLabels().error;
    const describe = this.describeRejection() ?? this.defaults.describeRejection;
    return describe(file, this.formatters());
  }

  protected actions(file: UploadFile) {
    if (this.readOnly()) return [];
    const labels = this.labels();
    const start = { part: 'start', label: labels.start, action: 'start' as const };
    const resume = { part: 'start', label: labels.resume, action: 'resume' as const };
    const pause = { part: 'pause', label: labels.pause, action: 'pause' as const };
    const retry = { part: 'retry', label: labels.retry, action: 'retry' as const };
    const cancel = { part: 'cancel', label: labels.cancel, action: 'cancel' as const };
    const remove = { part: 'remove', label: labels.remove, action: 'remove' as const };

    switch (file.status) {
      case 'ready':
        return [start, remove];
      case 'queued':
        return [cancel, remove];
      case 'uploading':
        return this.pausable() ? [pause, cancel] : [cancel];
      case 'paused':
        return [resume, cancel];
      case 'stalled':
        return [cancel];
      case 'error':
        return [retry, remove];
      case 'canceled':
        return [start, remove];
      default:
        return [remove];
    }
  }

  protected act(
    file: UploadFile,
    action: 'start' | 'pause' | 'resume' | 'retry' | 'cancel' | 'remove',
    source: Event,
  ) {
    if (action === 'remove') {
      this.runner?.remove(file.key);
      this.request(
        this.files().filter((entry) => entry.key !== file.key),
        'remove',
        source,
      );
      if (this.viewing() === file.key) this.setViewing(null, 'dismiss', source);
      this.onTouchedFn();
      return;
    }
    if (file.file === undefined || this.runner === null) return;
    if (action === 'start' || action === 'retry') this.runner.start(file.key, file.file);
    else if (action === 'pause') this.runner.pause(file.key);
    else if (action === 'resume') this.runner.resume(file.key);
    else this.runner.cancel(file.key);
  }

  protected clear(source: Event) {
    for (const file of this.files()) this.runner?.remove(file.key);
    this.request([], 'clear', source);
  }

  protected open(file: UploadFile, source: Event) {
    this.setViewing(file.key, 'pointer', source);
  }

  setViewing(key: string | null, reason: string, source: unknown) {
    const state = createControllable<string | null>({
      controlled: undefined,
      initial: this.viewing(),
      onRequest: (change) => this.viewingRequest.emit(change),
    });
    state.request(key, reason as ChangeReason, source);
    this.viewing.set(key);
  }

  /* ── The five a template cannot write ───────────────────────────────── */

  browse() {
    this.host.querySelector<HTMLInputElement>('[data-part="input"]')?.click();
  }

  upload() {
    for (const file of this.files()) {
      if (file.status !== 'ready' || file.file === undefined) continue;
      this.runner?.start(file.key, file.file);
    }
  }

  retryAll() {
    for (const file of this.files()) {
      if (file.status !== 'error' || file.file === undefined) continue;
      this.runner?.start(file.key, file.file);
    }
  }

  cancelAll() {
    for (const file of this.files()) this.runner?.cancel(file.key);
  }
}

function optionalNumber(value: unknown) {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

function optionalBoolean(value: unknown) {
  return value === undefined ? undefined : booleanAttribute(value);
}

/**
 * The half of `accept` a drag can answer. A token that names an extension says
 * nothing about an item whose name the platform has not given us yet.
 */
function matchesTypeOnly(type: string, accept: string) {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0 && !token.startsWith('.'));
  if (tokens.length === 0) return true;

  const [group, subtype] = type.toLowerCase().split('/');
  return tokens.some((token) => {
    const [tokenGroup, tokenSubtype] = token.split('/');
    return (
      (tokenGroup === '*' || tokenGroup === group) &&
      (tokenSubtype === '*' || tokenSubtype === subtype)
    );
  });
}
