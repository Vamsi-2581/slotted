import type {
  DuplicatePolicy,
  FileKind,
  UploadAdapterLike,
  UploadFile,
  UploadRejectionReason,
} from '@slotted/core/upload';
import type { ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from 'react';

/** Which of the three shapes the consolidation names is drawn. */
export type UploadVariant = 'dropzone' | 'button' | 'field';

/** A column of rows, or a wall of pictures. The same rows, arranged. */
export type UploadLayout = 'list' | 'grid';

export type UploadSize = 'sm' | 'md' | 'lg';

/** Whether a thumbnail is made for an image, and whether a file can be opened. */
export type UploadPreview = 'auto' | 'none';
export type UploadView = 'auto' | 'none';

export type { DuplicatePolicy, FileKind, UploadFile, UploadRejectionReason };

export type UploadFilesReason =
  'select' | 'pointer' | 'keyboard' | 'remove' | 'clear' | 'programmatic';

export type UploadViewingReason =
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'dismiss' | 'programmatic';

/**
 * The sentence a refused file carries. The reason is the family's and the
 * message is the consumer's, because only they know whether a limit is a
 * policy, a plan or a bug — so this is the English default they replace.
 */
export type DescribeRejection = (file: UploadFile, formatters: UploadFormatters) => string;

export interface UploadFormatters {
  bytes(value: number): string;
  duration(seconds: number): string;
}

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

/** The word a row says for the state it is in. */
export type UploadStatusLabels = Record<UploadFile['status'], string>;

/**
 * The word the viewer says a file is. The kind is the family's — it is measured
 * from the media type and the extension — and the word for it is the
 * consumer's, for the reason every other visible string here is.
 */
export type UploadKindLabels = Record<UploadFile['kind'], string>;

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

export interface UploadDefaultsProviderProps extends Partial<
  Omit<UploadDefaults, 'labels' | 'statusLabels' | 'kindLabels'>
> {
  children?: ReactNode | undefined;
  /** Merged over the inherited set, so one word can be replaced alone. */
  labels?: Partial<UploadLabels> | undefined;
  statusLabels?: Partial<UploadStatusLabels> | undefined;
  kindLabels?: Partial<UploadKindLabels> | undefined;
}

/**
 * What `render` receives. Written against `HTMLAttributes<HTMLElement>` rather
 * than the element the part renders by default, because that is what makes
 * substitution real: a props object typed for a `div` cannot be spread onto a
 * `section`.
 */
export interface UploadRootProps extends HTMLAttributes<HTMLElement> {
  'data-complete'?: '' | undefined;
  'data-disabled'?: '' | undefined;
  'data-dragging'?: '' | undefined;
  'data-invalid'?: '' | undefined;
  'data-layout': UploadLayout;
  'data-loading'?: '' | undefined;
  'data-part': string;
  'data-readonly'?: '' | undefined;
  'data-required'?: '' | undefined;
  'data-size': UploadSize;
  'data-ui': string;
  'data-variant': UploadVariant;
}

/** The five a consumer cannot express declaratively, and nothing more. */
export interface UploadHandle {
  /** Opens the picker, as though the trigger had been pressed. */
  browse(): void;
  /** Sends every file that is waiting for the reader. */
  upload(): void;
  retryAll(): void;
  cancelAll(): void;
  clear(): void;
  /** Opens the viewer on a file, or closes it with `null`. */
  view(key: string | null): void;
}

export interface UploadProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onChange' | 'onPaste'
> {
  children?: ReactNode | undefined;

  /** Present means the consumer owns the selection. */
  files?: readonly UploadFile[] | undefined;
  defaultFiles?: readonly UploadFile[] | undefined;
  onFilesChange?:
    | ((files: readonly UploadFile[], request: ChangeRequest<readonly UploadFile[]>) => void)
    | undefined;

  /** Present means the consumer owns which file the viewer is open on. */
  viewing?: string | null | undefined;
  defaultViewing?: string | null | undefined;
  onViewingChange?:
    ((key: string | null, request: ChangeRequest<string | null>) => void) | undefined;

  /** Reported when a file is refused, before any message is written about it. */
  onReject?: ((files: readonly UploadFile[]) => void) | undefined;

  accept?: string | undefined;
  multiple?: boolean | undefined;
  directory?: boolean | undefined;
  capture?: 'user' | 'environment' | undefined;
  maxFiles?: number | undefined;
  minFiles?: number | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  maxTotalSize?: number | undefined;
  /** The consumer's own rule, run after the family's and before anything is kept. */
  validate?: ((file: File) => UploadRejectionReason | null | undefined) | undefined;
  /** Rewrites the selection before it is judged: compression, renaming, cropping. */
  transform?: ((files: File[]) => File[] | Promise<File[]>) | undefined;

  variant?: UploadVariant | undefined;
  layout?: UploadLayout | undefined;
  size?: UploadSize | undefined;
  preview?: UploadPreview | undefined;
  view?: UploadView | undefined;
  duplicates?: DuplicatePolicy | undefined;
  clickToBrowse?: boolean | undefined;
  allowDrop?: boolean | undefined;
  allowPaste?: boolean | undefined;
  preventDocumentDrop?: boolean | undefined;
  autoUpload?: boolean | undefined;
  pendingBlocksSubmit?: boolean | undefined;

  adapter?: UploadAdapterLike | undefined;
  concurrency?: number | undefined;
  retries?: number | undefined;
  retryDelay?: number | undefined;
  stallAfter?: number | undefined;
  maxRows?: number | undefined;
  locale?: string | undefined;
  fileKey?: ((file: File) => string) | undefined;
  describeRejection?: DescribeRejection | undefined;
  labels?: Partial<UploadLabels> | undefined;
  statusLabels?: Partial<UploadStatusLabels> | undefined;
  kindLabels?: Partial<UploadKindLabels> | undefined;

  /** The family's own label, for an upload that is not inside a `field`. */
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;

  /** Unstated rather than `false`, so the control defers to its field. */
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  id?: string | undefined;

  /** The consumer's own handler runs first, and the family composes with it. */
  onDrop?: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
  onDragEnter?: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
  onDragLeave?: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
  onDragOver?: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
  onPaste?: ((event: React.ClipboardEvent<HTMLDivElement>) => void) | undefined;
  onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;

  handleRef?: React.Ref<UploadHandle> | undefined;
  render?: ((props: UploadRootProps) => ReactNode) | undefined;
}
