import type { JobTransition } from './import-export-center';

export interface AnnouncementInput {
  /** The direction in words: `messages.import` or `messages.export`. */
  readonly direction: string;
  readonly title: string;
  readonly transition: JobTransition;
  readonly failed: number;
}

/**
 * Every word the family writes. Both bindings read this one object, so the
 * status line, the announcer and the toast say the same thing about a job; a
 * provider or an instance replaces any of it.
 */
export interface ImportExportMessages {
  readonly title: string;
  readonly active: (count: number) => string;
  readonly clear: string;
  readonly views: string;
  readonly all: string;
  readonly imports: string;
  readonly exports: string;
  readonly import: string;
  readonly export: string;
  readonly queued: string;
  readonly running: string;
  readonly success: string;
  readonly partial: (failed: number) => string;
  readonly failed: string;
  readonly canceled: string;
  readonly download: string;
  readonly downloadErrors: string;
  readonly cancel: string;
  readonly retry: string;
  readonly regenerate: string;
  readonly details: string;
  readonly remove: string;
  readonly loadMore: string;
  readonly loading: string;
  readonly empty: string;
  readonly emptyImports: string;
  readonly emptyExports: string;
  readonly emptyDescription: string;
  readonly loadError: string;
  readonly loadErrorDescription: string;
  readonly reload: string;
  readonly rows: (count: string) => string;
  readonly ofRows: (value: string, max: string) => string;
  readonly ofBytes: (value: string, max: string) => string;
  readonly created: (count: string) => string;
  readonly updated: (count: string) => string;
  readonly skipped: (count: string) => string;
  readonly remaining: (duration: string) => string;
  readonly expires: (date: string) => string;
  readonly expired: (date: string) => string;
  readonly sample: (shown: string, total: string) => string;
  readonly countLabels: {
    readonly total: string;
    readonly processed: string;
    readonly created: string;
    readonly updated: string;
    readonly skipped: string;
    readonly failed: string;
  };
  readonly fileLabels: {
    readonly source: string;
    readonly result: string;
    readonly errors: string;
  };
  readonly errorsCaption: string;
  readonly errorColumns: {
    readonly row: string;
    readonly message: string;
    readonly column: string;
    readonly value: string;
  };
  readonly view: string;
  readonly announce: (input: AnnouncementInput) => string;
}

const PAST: Record<JobTransition, (input: AnnouncementInput) => string> = {
  started: ({ direction, title }) => `${direction} ${title} iniciada`,
  success: ({ direction, title }) => `${direction} ${title} concluída`,
  partial: ({ direction, title, failed }) =>
    `${direction} ${title} concluída com ${failed} ${failed === 1 ? 'erro' : 'erros'}`,
  failed: ({ direction, title }) => `${direction} ${title} falhou`,
  canceled: ({ direction, title }) => `${direction} ${title} cancelada`,
};

export const DEFAULT_IMPORT_EXPORT_MESSAGES: ImportExportMessages = {
  title: 'Importações e exportações',
  active: (count) => `${count} em andamento`,
  clear: 'Limpar concluídos',
  views: 'Vistas',
  all: 'Todos',
  imports: 'Importações',
  exports: 'Exportações',
  import: 'Importação',
  export: 'Exportação',
  queued: 'Na fila',
  running: 'Em andamento',
  success: 'Concluído',
  partial: (failed) => `Concluído com ${failed} ${failed === 1 ? 'erro' : 'erros'}`,
  failed: 'Falhou',
  canceled: 'Cancelado',
  download: 'Baixar',
  downloadErrors: 'Baixar erros',
  cancel: 'Cancelar',
  retry: 'Tentar de novo',
  regenerate: 'Gerar novamente',
  details: 'Detalhes',
  remove: 'Remover do histórico',
  loadMore: 'Carregar mais',
  loading: 'Carregando jobs',
  empty: 'Nenhuma importação ou exportação',
  emptyImports: 'Nenhuma importação',
  emptyExports: 'Nenhuma exportação',
  emptyDescription: 'Uma importação ou exportação iniciada em qualquer lista aparece aqui.',
  loadError: 'Não foi possível carregar os jobs',
  loadErrorDescription: 'Verifique a ligação e tente de novo.',
  reload: 'Tentar de novo',
  rows: (count) => `${count} linhas`,
  ofRows: (value, max) => `${value} de ${max} linhas`,
  ofBytes: (value, max) => `${value} de ${max}`,
  created: (count) => `${count} criadas`,
  updated: (count) => `${count} atualizadas`,
  skipped: (count) => `${count} ignoradas`,
  remaining: (duration) => `cerca de ${duration} restantes`,
  expires: (date) => `Disponível até ${date}`,
  expired: (date) => `Expirou em ${date}`,
  sample: (shown, total) => `Mostrando ${shown} de ${total}`,
  countLabels: {
    total: 'Total',
    processed: 'Processadas',
    created: 'Criadas',
    updated: 'Atualizadas',
    skipped: 'Ignoradas',
    failed: 'Com erro',
  },
  fileLabels: { source: 'Arquivo original', result: 'Resultado', errors: 'Relatório de erros' },
  errorsCaption: 'Linhas com erro',
  errorColumns: { row: 'Linha', message: 'Erro', column: 'Coluna', value: 'Valor' },
  view: 'Ver',
  announce: (input) => PAST[input.transition](input),
};
