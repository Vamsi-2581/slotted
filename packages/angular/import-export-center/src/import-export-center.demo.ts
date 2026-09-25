import { DestroyRef, inject, signal } from '@angular/core';
import type { ImportExportJob } from '@slotted/core/import-export-center';

/**
 * The jobs of Marina Duarte, operations at Vale Norte Distribuidora: one
 * domain for every scene, so the page reads as one product. The same facts
 * the React pages show.
 */
export const NOW = Date.parse('2026-09-25T14:00:00Z');

const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

export const JOBS: readonly ImportExportJob[] = [
  {
    actor: 'Marina Duarte',
    createdAt: minutesAgo(2),
    direction: 'import',
    format: 'CSV',
    key: 'crm-contacts',
    progress: { max: 5000, value: 1204 },
    source: { name: 'contatos-crm-2026-09-24.csv', size: 4_200_000 },
    stage: 'Gravando registros',
    status: 'running',
    title: 'Contatos do CRM',
  },
  {
    actor: 'Marina Duarte',
    createdAt: minutesAgo(1),
    direction: 'export',
    format: 'XLSX',
    key: 'stock-september',
    stage: 'Começa depois de Contatos do CRM',
    status: 'queued',
    title: 'Movimentos de estoque — setembro',
  },
  {
    counts: { created: 2210, failed: 12, processed: 2988, total: 3000, updated: 778 },
    createdAt: minutesAgo(190),
    direction: 'import',
    errorCount: 12,
    errors: [
      { column: 'SKU', message: 'Campo obrigatório vazio', row: 14, value: '' },
      { column: 'Preço', message: 'Não é um número', row: 208, value: '12,5O' },
      { column: 'NCM', message: 'Código com 8 dígitos esperado', row: 391, value: '8471.3' },
      { column: 'Categoria', message: 'Categoria inexistente', row: 1027, value: 'Ferragens' },
      { column: 'SKU', message: 'SKU duplicado na linha 2.588', row: 2640, value: 'VN-00431' },
    ],
    errorsFile: { href: '#catalogo-erros', name: 'catalogo-outono-2026-erros.csv', size: 2_048 },
    finishedAt: minutesAgo(180),
    format: 'XLSX',
    key: 'catalog-autumn',
    source: {
      expiresAt: '2026-10-02T23:59:00Z',
      href: '#catalogo',
      name: 'catalogo-outono-2026.xlsx',
      size: 1_800_000,
    },
    status: 'succeeded',
    title: 'Catálogo de produtos',
  },
  {
    createdAt: minutesAgo(262),
    direction: 'export',
    finishedAt: minutesAgo(260),
    format: 'CSV',
    key: 'invoices-q3',
    result: {
      expiresAt: '2026-10-02T09:40:00Z',
      href: '#faturas',
      name: 'faturas-t3-2026.csv',
      size: 640_000,
    },
    status: 'succeeded',
    title: 'Faturas do 3.º trimestre',
  },
  {
    createdAt: minutesAgo(380),
    direction: 'export',
    finishedAt: minutesAgo(370),
    format: 'PDF',
    key: 'debtors',
    message: 'O serviço de relatórios não respondeu em 10 minutos.',
    status: 'failed',
    title: 'Extrato de clientes inadimplentes',
  },
  {
    actor: 'Rui Tavares',
    createdAt: '2026-09-24T17:30:00Z',
    direction: 'import',
    finishedAt: '2026-09-24T17:31:00Z',
    format: 'JSON',
    key: 'freight',
    stage: 'Nenhum registro gravado',
    status: 'canceled',
    title: 'Tabela de fretes',
  },
];

/** Files that expire, expired, and may not be downloaded. */
export const FILE_JOBS: readonly ImportExportJob[] = [
  {
    createdAt: '2026-09-01T10:00:00Z',
    direction: 'export',
    finishedAt: '2026-09-01T10:04:00Z',
    format: 'ZIP',
    key: 'nfe-august',
    result: {
      expiresAt: '2026-09-08T10:00:00Z',
      href: '#nfe',
      name: 'notas-fiscais-agosto.zip',
      size: 312_000_000,
    },
    status: 'succeeded',
    title: 'Notas fiscais de agosto',
  },
  {
    actor: 'Rui Tavares',
    counts: { processed: 860, total: 860, updated: 860 },
    createdAt: '2026-09-20T15:30:00Z',
    direction: 'import',
    finishedAt: '2026-09-20T15:32:00Z',
    format: 'CSV',
    key: 'wholesale-prices',
    source: {
      denied: 'Só quem importou o arquivo ou um administrador pode baixar o original.',
      name: 'precos-atacado.csv',
      size: 96_000,
    },
    status: 'succeeded',
    title: 'Tabela de preços do atacado',
  },
  {
    createdAt: minutesAgo(262),
    direction: 'export',
    finishedAt: minutesAgo(260),
    format: 'CSV',
    key: 'invoices-q3',
    result: {
      expiresAt: '2026-10-02T09:40:00Z',
      href: '#faturas',
      name: 'faturas-t3-2026.csv',
      size: 640_000,
    },
    status: 'succeeded',
    title: 'Faturas do 3.º trimestre',
  },
];

/**
 * A store that answers every request the centre makes, and a server that
 * moves the running job forward. Created in an injection context: the timer
 * is torn down with the component that owns it.
 */
export class JobStore {
  readonly jobs = signal<readonly ImportExportJob[]>([]);

  constructor(
    seed: readonly ImportExportJob[] = JOBS,
    { live = true }: { live?: boolean | (() => boolean) } = {},
  ) {
    this.jobs.set(seed);
    if (live === false) return;
    const moving = typeof live === 'function' ? live : () => true;
    const timer = setInterval(() => {
      if (moving()) this.tick();
    }, 900);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  reseed(seed: readonly ImportExportJob[]) {
    this.jobs.set(seed);
  }

  add(job: ImportExportJob) {
    this.jobs.update((current) => [job, ...current]);
  }

  cancel(key: string) {
    this.patch(key, { stage: 'Nenhum registro gravado', status: 'canceled' });
  }

  retry(key: string) {
    this.patch(key, {
      counts: undefined,
      message: undefined,
      progress: undefined,
      result: undefined,
      stage: 'Na fila de reprocessamento',
      status: 'queued',
    });
  }

  remove(keys: readonly string[]) {
    this.jobs.update((current) => current.filter((job) => !keys.includes(job.key)));
  }

  private patch(key: string, patch: Partial<ImportExportJob>) {
    this.jobs.update((current) =>
      current.map((job) => (job.key === key ? { ...job, ...patch } : job)),
    );
  }

  private tick() {
    this.jobs.update((current) => {
      let started = current.some((job) => job.status === 'running');
      return current.map((job) => {
        if (job.status === 'queued' && !started) {
          started = true;
          return {
            ...job,
            progress: { max: 1200, value: 0 },
            stage: 'Lendo registros',
            status: 'running',
          };
        }
        if (job.status !== 'running' || job.progress?.value === undefined) return job;
        const max = job.progress.max ?? 100;
        const value = Math.min(max, job.progress.value + Math.ceil(max / 14));
        if (value < max) return { ...job, progress: { ...job.progress, value } };
        return {
          ...job,
          counts: {
            processed: max,
            total: max,
            ...(job.direction === 'import' ? { created: max } : {}),
          },
          finishedAt: new Date().toISOString(),
          progress: undefined,
          result:
            job.direction === 'export'
              ? {
                  expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
                  href: '#resultado',
                  name: `${job.key}.${(job.format ?? 'csv').toLowerCase()}`,
                  size: 184_000,
                }
              : job.result,
          stage: undefined,
          status: 'succeeded',
        };
      });
    });
  }
}

/** The jobs whose keys a scene names, in the fixture's order. */
export function jobsOf(keys: readonly string[]): readonly ImportExportJob[] {
  return JOBS.filter((job) => keys.includes(job.key));
}
