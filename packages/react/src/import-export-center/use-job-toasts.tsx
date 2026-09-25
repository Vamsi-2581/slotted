import { DEFAULT_IMPORT_EXPORT_MESSAGES, jobNotice } from '@slotted/core/import-export-center';
import type { ImportExportJob } from '@slotted/core/import-export-center';
import { useEffect, useRef } from 'react';

import { Button } from '../button';
import { useToaster } from '../toast';
import type { UseJobToastsOptions } from './import-export-center.types';

/**
 * A toast that points at a job, for a page that is not the centre: the job
 * started, finished, finished with failed rows, failed. It is mounted once,
 * where the application keeps its jobs — the shell — so the reader hears of a
 * job that finishes while they work elsewhere.
 *
 * The toast only points. It carries no progress, no cancel and no download;
 * its one action is View, which calls `onView(key)`, and the consumer takes
 * the reader to the centre and calls its `reveal(key)`. Its id is the job's
 * key under `import-export-center:`, so the finishing notice replaces the
 * starting one in place rather than stacking beside it. Its announcement is
 * the sentence the centre says for the same transition, which the shared
 * announcer does not repeat when both are mounted.
 *
 * The jobs present on the first render made no move the reader saw, and get
 * no toast.
 */
export function useJobToasts(
  jobs: readonly ImportExportJob[],
  { messages, onView, toaster }: UseJobToastsOptions = {},
): void {
  const shared = useToaster();
  const target = toaster ?? shared;
  const previous = useRef<ReadonlyMap<string, ImportExportJob> | null>(null);
  const latest = useRef({ messages, onView, target });
  latest.current = { messages, onView, target };

  useEffect(() => {
    const seen = previous.current;
    previous.current = new Map(jobs.map((job) => [job.key, job]));
    if (seen === null) return;
    const { messages: words, onView: view, target: sink } = latest.current;
    const resolved = { ...DEFAULT_IMPORT_EXPORT_MESSAGES, ...words };
    for (const job of jobs) {
      const notice = jobNotice(seen.get(job.key), job, resolved);
      if (notice === null) continue;
      sink.show({
        actions:
          view === undefined ? undefined : (
            <Button
              onClick={() => {
                sink.dismiss(notice.id, 'pointer');
                view(notice.key);
              }}
              size="sm"
              tone="secondary"
              variant="outline"
            >
              {resolved.view}
            </Button>
          ),
        announcement: notice.title,
        description: notice.description,
        id: notice.id,
        loading: notice.loading,
        title: notice.title,
        tone: notice.tone,
      });
    }
  }, [jobs]);
}
