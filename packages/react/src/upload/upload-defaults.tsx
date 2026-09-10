import { formatBytes } from '@slotted/core/upload';
import { createContext, useContext } from 'react';

import type {
  DescribeRejection,
  UploadDefaults,
  UploadDefaultsProviderProps,
  UploadLabels,
  UploadKindLabels,
  UploadStatusLabels,
} from './upload.types';

/**
 * Every visible string the family owns, in one place, so an application
 * translates them once rather than on every control in every form. Vaadin holds
 * the same set as an i18n object and Ark as `translations`; Ant Design's global
 * config marks nearly every Upload prop as unavailable to it.
 */
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

/** The word a row says for the state it is in. */
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

/**
 * The English default a consumer replaces. The reason a file was refused is the
 * family's; what to say about it is not, because only the application knows
 * whether a limit is a policy, a plan or a bug.
 */
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

const UploadDefaultsContext = createContext<UploadDefaults>(FALLBACK);

/** What an upload does here, before it states anything of its own. */
export function useUploadDefaults(): UploadDefaults {
  return useContext(UploadDefaultsContext);
}

/**
 * An application decides once what its uploads accept, where they send, how
 * many run at once and what every control is called. A control that states any
 * of them itself still wins.
 *
 * The adapter is here rather than on the family for the same reason: an
 * application sends to one place, and repeating the sender on every form is how
 * one of them ends up pointing somewhere else.
 */
export function UploadDefaultsProvider({
  children,
  labels,
  statusLabels,
  kindLabels,
  ...defaults
}: UploadDefaultsProviderProps) {
  const inherited = useUploadDefaults();

  return (
    <UploadDefaultsContext.Provider
      value={{
        ...inherited,
        ...(Object.fromEntries(
          Object.entries(defaults).filter(([, value]) => value !== undefined),
        ) as Partial<UploadDefaults>),
        labels: { ...inherited.labels, ...labels },
        statusLabels: { ...inherited.statusLabels, ...statusLabels },
        kindLabels: { ...inherited.kindLabels, ...kindLabels },
      }}
    >
      {children}
    </UploadDefaultsContext.Provider>
  );
}

/** The two formatters a row and a summary read, bound to one locale. */
export function useUploadFormatters(locale: string | undefined) {
  return {
    bytes: (value: number) => formatBytes(value, locale),
    duration: (seconds: number) => `${Math.round(seconds)}`,
  };
}
