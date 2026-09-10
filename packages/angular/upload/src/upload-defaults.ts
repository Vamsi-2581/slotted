import { formatBytes } from '@slotted/core/upload';
import type { DuplicatePolicy, UploadAdapterLike, UploadFile } from '@slotted/core/upload';
import { inject, InjectionToken } from '@angular/core';

/** Which of the three shapes the consolidation names is drawn. */
export type UploadVariant = 'dropzone' | 'button' | 'field';

/** A column of rows, or a wall of pictures. The same rows, arranged. */
export type UploadLayout = 'list' | 'grid';

export type UploadSize = 'sm' | 'md' | 'lg';
export type UploadPreview = 'auto' | 'none';
export type UploadView = 'auto' | 'none';

export type UploadFilesReason =
  'select' | 'pointer' | 'keyboard' | 'remove' | 'clear' | 'programmatic';

export type UploadViewingReason =
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'dismiss' | 'programmatic';

export interface UploadFormatters {
  bytes(value: number): string;
}

/**
 * The sentence a refused file carries. The reason is the family's and the
 * message is the consumer's, because only they know whether a limit is a
 * policy, a plan or a bug — so this is the English default they replace.
 */
export type DescribeRejection = (file: UploadFile, formatters: UploadFormatters) => string;

/** Every visible string, so an application translates once rather than per control. */
export interface UploadLabels {
  trigger: string;
  dropzone: string;
  clear: string;
  start: string;
  pause: string;
  resume: string;
  retry: string;
  cancel: string;
  remove: string;
  viewerExternal: string;
  viewerClose: string;
  viewerPrevious: string;
  viewerNext: string;
  viewerUnsupported: string;
  /** What the control says while a transfer is pending and a form is submitted. */
  pending: string;
}

export type UploadStatusLabels = Record<UploadFile['status'], string>;

/**
 * The word the viewer says a file is. The kind is the family's — it is measured
 * from the media type and the extension — and the word for it is the
 * consumer's, for the reason every other visible string here is.
 */
export type UploadKindLabels = Record<UploadFile['kind'], string>;

export const UPLOAD_LABELS: UploadLabels = {
  trigger: 'Browse files',
  dropzone: 'Drop files here',
  clear: 'Remove all',
  start: 'Upload',
  pause: 'Pause',
  resume: 'Resume',
  retry: 'Try again',
  cancel: 'Cancel',
  remove: 'Remove',
  viewerExternal: 'Open in a new tab',
  viewerClose: 'Close',
  viewerPrevious: 'Previous file',
  viewerNext: 'Next file',
  viewerUnsupported: 'This file cannot be previewed here.',
  pending: 'Wait for the files to finish uploading.',
};

/**
 * The word the viewer says a file is. `other` is what a kind nothing claims is
 * called, and it is deliberately the plainest of the nine.
 */
export const UPLOAD_KIND_LABELS: UploadKindLabels = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  pdf: 'PDF',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  archive: 'Archive',
  other: 'File',
};

export const UPLOAD_STATUS_LABELS: UploadStatusLabels = {
  rejected: 'Refused',
  ready: 'Waiting to upload',
  queued: 'Queued',
  uploading: 'Uploading',
  paused: 'Paused',
  stalled: 'Stalled',
  success: 'Uploaded',
  error: 'Failed',
  canceled: 'Stopped',
};

/** The English default a consumer replaces, word for word with React's. */
export const describeRejection: DescribeRejection = (file, formatters) => {
  switch (file.reason) {
    case 'type':
      return 'This kind of file is not accepted.';
    case 'size':
      return `This file is ${formatters.bytes(file.size)} and it is too large.`;
    case 'minSize':
      return 'This file is too small.';
    case 'multiple':
      return 'Only one file can be attached here.';
    case 'maxFiles':
      return 'There is no room for another file.';
    case 'totalSize':
      return 'These files are too large altogether.';
    case 'duplicate':
      return 'This file has already been attached.';
    case 'directory':
      return 'Folders are not accepted. Attach the files inside it.';
    default:
      return 'This file was not accepted.';
  }
};

export interface UploadDefaults {
  variant: UploadVariant;
  layout: UploadLayout;
  size: UploadSize;
  preview: UploadPreview;
  view: UploadView;
  duplicates: DuplicatePolicy;
  clickToBrowse: boolean;
  allowDrop: boolean;
  allowPaste: boolean;
  preventDocumentDrop: boolean;
  autoUpload: boolean;
  pendingBlocksSubmit: boolean;
  adapter: UploadAdapterLike | undefined;
  concurrency: number;
  retries: number;
  retryDelay: number;
  stallAfter: number;
  maxRows: number;
  locale: string | undefined;
  fileKey: ((file: File) => string) | undefined;
  describeRejection: DescribeRejection;
  labels: UploadLabels;
  statusLabels: UploadStatusLabels;
  kindLabels: UploadKindLabels;
}

const FALLBACK: UploadDefaults = {
  variant: 'dropzone',
  layout: 'list',
  size: 'md',
  preview: 'auto',
  view: 'auto',
  duplicates: 'reject',
  clickToBrowse: true,
  allowDrop: true,
  allowPaste: true,
  preventDocumentDrop: true,
  autoUpload: true,
  pendingBlocksSubmit: true,
  adapter: undefined,
  concurrency: 3,
  retries: 0,
  retryDelay: 1000,
  stallAfter: 10000,
  maxRows: 6,
  locale: undefined,
  fileKey: undefined,
  describeRejection,
  labels: UPLOAD_LABELS,
  statusLabels: UPLOAD_STATUS_LABELS,
  kindLabels: UPLOAD_KIND_LABELS,
};

export const UPLOAD_DEFAULTS = new InjectionToken<UploadDefaults>('slotted upload defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once what its uploads accept, where they send, how
 * many run at once and what every control is called. An upload that states any
 * of them itself still wins.
 *
 * The adapter is here for the same reason: an application sends to one place,
 * and repeating the sender on every form is how one of them ends up pointing
 * somewhere else.
 */
/** What `provideUploadDefaults` takes: one word may be replaced alone. */
export type UploadDefaultsInput = Partial<
  Omit<UploadDefaults, 'labels' | 'statusLabels' | 'kindLabels'>
> & {
  labels?: Partial<UploadLabels>;
  statusLabels?: Partial<UploadStatusLabels>;
  kindLabels?: Partial<UploadKindLabels>;
};

export function provideUploadDefaults(defaults: UploadDefaultsInput) {
  return {
    provide: UPLOAD_DEFAULTS,
    useFactory: (): UploadDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: { ...UPLOAD_LABELS, ...(defaults.labels ?? {}) },
      statusLabels: { ...UPLOAD_STATUS_LABELS, ...(defaults.statusLabels ?? {}) },
      kindLabels: { ...UPLOAD_KIND_LABELS, ...(defaults.kindLabels ?? {}) },
    }),
  };
}

export function injectUploadDefaults(): UploadDefaults {
  return inject(UPLOAD_DEFAULTS);
}

/** The formatter a row and a summary read, bound to one locale. */
export function uploadFormatters(locale: string | undefined): UploadFormatters {
  return { bytes: (value: number) => formatBytes(value, locale) };
}
