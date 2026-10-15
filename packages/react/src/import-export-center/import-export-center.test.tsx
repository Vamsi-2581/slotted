import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import contract from '../../../../specs/components/import-export-center/contract.json';
import { SlottedProvider } from '../i18n';
import { createToaster } from '../toast';
import { ImportExportCenter } from './import-export-center';
import { ImportExportCenterDefaultsProvider } from './import-export-center-defaults';
import type { ImportExportCenterHandle, ImportExportCenterProps, ImportExportJob } from './index';
import { useJobToasts } from './use-job-toasts';

const NOW = Date.parse('2026-09-25T14:00:00Z');

const JOBS: ImportExportJob[] = [
  {
    createdAt: '2026-09-25T13:58:00Z',
    direction: 'import',
    format: 'CSV',
    key: 'crm',
    progress: { max: 5000, value: 1204 },
    source: { name: 'contatos-crm.csv', size: 4_200_000 },
    stage: 'Gravando registros',
    status: 'running',
    title: 'Contatos do CRM',
  },
  {
    counts: { created: 2210, failed: 12, processed: 2988, total: 3000, updated: 778 },
    direction: 'import',
    errorCount: 12,
    errors: [
      { column: 'SKU', message: 'Campo obrigatório vazio', row: 14 },
      { column: 'Preço', message: 'Não é um número', row: 208, value: '12,5O' },
    ],
    errorsFile: { href: '#erros', name: 'catalogo-erros.csv' },
    key: 'catalog',
    status: 'succeeded',
    title: 'Catálogo de produtos',
  },
  {
    direction: 'export',
    format: 'CSV',
    key: 'invoices',
    result: { expiresAt: '2026-10-02T09:40:00Z', href: '#faturas', name: 'faturas.csv' },
    status: 'succeeded',
    title: 'Faturas do 3.º trimestre',
  },
  {
    direction: 'export',
    key: 'debtors',
    message: 'O serviço de relatórios não respondeu.',
    status: 'failed',
    title: 'Clientes inadimplentes',
  },
];

/** The jobs are Brazilian, so the centre speaks Brazilian Portuguese around them. */
function Centre(props: Partial<ImportExportCenterProps>) {
  return (
    <SlottedProvider catalogs={{ 'pt-BR': PT_BR }} locale="pt-BR">
      <ImportExportCenter jobs={JOBS} now={NOW} {...props} />
    </SlottedProvider>
  );
}

const root = () => document.querySelector('[data-ui="import-export-center"]') as HTMLElement;
const job = (key: string) =>
  root().querySelector(`[data-part="job"][data-key="${key}"]`) as HTMLElement;

describe('ImportExportCenter', () => {
  it('names itself and its list by the title, and carries the identity the contract declares', () => {
    render(<Centre />);
    expect(root().dataset['ui']).toBe(contract.ui);
    expect(screen.getByRole('region', { name: /Importações e exportações/ })).toBe(root());
    expect(screen.getByRole('list', { name: /Importações e exportações/ })).toBeTruthy();
    expect(root().dataset['size']).toBe('md');
    expect(root().dataset['view']).toBe('all');
  });

  it('draws the count of active jobs beside the title', () => {
    render(<Centre />);
    expect(root().querySelector('[data-part="count"]')?.textContent).toBe('1 em andamento');
  });

  it('speaks English without a language in force, and lays its own messages over it', () => {
    render(
      <ImportExportCenter
        defaultExpanded={['catalog']}
        jobs={JOBS}
        messages={{ title: 'Jobs' }}
        now={NOW}
      />,
    );
    expect(screen.getByRole('region', { name: /^Jobs/ })).toBe(root());
    expect(job('catalog').querySelector('[data-part="status-label"]')?.textContent).toContain(
      'Completed with 12 errors',
    );
    expect(job('catalog').querySelector('[data-part="errors-note"]')?.textContent).toBe(
      'Showing 2 of 12',
    );
    expect(within(job('crm')).getByRole('button', { name: 'Cancel Contatos do CRM' })).toBeTruthy();
  });

  it('derives the partial outcome from the counts and paints the status it declares', () => {
    render(<Centre />);
    expect(job('catalog').dataset['outcome']).toBe('partial');
    expect(job('catalog').querySelector('[data-part="status-label"]')?.textContent).toContain(
      'Concluído com 12 erros',
    );
    expect(job('invoices').dataset['outcome']).toBe('success');
    expect(job('debtors').dataset['outcome']).toBe('failed');
    expect(job('crm').dataset['outcome']).toBeUndefined();
  });

  it('draws the ring of spinner for a running job and a glyph otherwise', () => {
    render(<Centre />);
    expect(job('crm').querySelector('[data-part="mark"] [data-ui="spinner"]')).toBeTruthy();
    expect(
      job('invoices').querySelector('[data-part="mark"] [data-glyph="circle-check"]'),
    ).toBeTruthy();
    expect(
      job('catalog').querySelector('[data-part="mark"] [data-glyph="circle-alert"]'),
    ).toBeTruthy();
  });

  it('names every control by its words and the job title', () => {
    render(<Centre />);
    const cancel = within(job('crm')).getByRole('button', { name: 'Cancelar Contatos do CRM' });
    expect(cancel).toBeTruthy();
    expect(
      within(job('invoices')).getByRole('link', { name: 'Baixar Faturas do 3.º trimestre' }),
    ).toBeTruthy();
    expect(
      within(job('catalog')).getByRole('link', { name: 'Baixar erros Catálogo de produtos' }),
    ).toBeTruthy();
  });

  it('shows progress with its value text and says the stage without wrapping it away', () => {
    render(<Centre />);
    const bar = within(job('crm')).getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('1204');
    expect(job('crm').querySelector('[data-part="stage"]')?.getAttribute('title')).toBe(
      'Gravando registros',
    );
    const text = [...job('crm').querySelectorAll('[data-part="progress-text"] > span')].map(
      (item) => item.textContent,
    );
    expect(text[0]).toMatch(/1\.204 de 5\.000 linhas|1,204 de 5,000 linhas/);
  });

  it('writes the deadline of an export and asks before a download', () => {
    const onDownload = vi.fn((_download, request) => request.cancel());
    render(<Centre locale="pt-BR" onDownload={onDownload} timeZone="UTC" />);
    expect(job('invoices').querySelector('[data-part="message"]')?.textContent).toMatch(
      /^Disponível até 2 de out/,
    );
    const link = within(job('invoices')).getByRole('link', { name: /^Baixar/ });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    link.dispatchEvent(event);
    expect(onDownload).toHaveBeenCalledWith(
      { file: 'result', key: 'invoices' },
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(event.defaultPrevented).toBe(true);
  });

  it('asks to cancel, retry and remove, with the reason', () => {
    const onCancel = vi.fn();
    const onRetry = vi.fn();
    const onRemove = vi.fn();
    render(<Centre onCancel={onCancel} onRemove={onRemove} onRetry={onRetry} />);
    fireEvent.click(within(job('crm')).getByRole('button', { name: /^Cancelar/ }), { detail: 1 });
    fireEvent.click(within(job('debtors')).getByRole('button', { name: /^Tentar de novo/ }), {
      detail: 0,
    });
    fireEvent.click(within(job('debtors')).getByRole('button', { name: 'Remover do histórico' }), {
      detail: 1,
    });
    expect(onCancel).toHaveBeenCalledWith('crm', expect.objectContaining({ reason: 'pointer' }));
    expect(onRetry).toHaveBeenCalledWith(
      'debtors',
      expect.objectContaining({ reason: 'keyboard' }),
    );
    expect(onRemove).toHaveBeenCalledWith(
      { keys: ['debtors'] },
      expect.objectContaining({ reason: 'pointer' }),
    );
  });

  it('clears every finished job with the reason clear', () => {
    const onRemove = vi.fn();
    render(<Centre onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar concluídos' }));
    expect(onRemove).toHaveBeenCalledWith(
      { keys: ['catalog', 'invoices', 'debtors'] },
      expect.objectContaining({ reason: 'clear' }),
    );
  });

  it('opens the details on the toggle, keeping its words, and holds the set uncontrolled', () => {
    const onExpandedChange = vi.fn();
    render(<Centre onExpandedChange={onExpandedChange} />);
    const toggle = within(job('catalog')).getByRole('button', { name: /^Detalhes/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle, { detail: 1 });
    expect(onExpandedChange).toHaveBeenCalledWith(
      ['catalog'],
      expect.objectContaining({ reason: 'pointer' }),
    );
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent).toBe('Detalhes');
    const details = screen.getByRole('region', { name: /^Detalhes/ });
    expect(toggle.getAttribute('aria-controls')).toBe(details.id);
    expect(within(details).getByRole('table')).toBeTruthy();
    expect(details.querySelector('[data-part="errors-note"]')?.textContent).toBe(
      'Mostrando 2 de 12',
    );
    expect(within(details).getAllByRole('row')).toHaveLength(3);
  });

  it('writes the note when the failed rows are a sample', () => {
    render(
      <Centre
        defaultExpanded={['catalog']}
        jobs={JOBS.map((each) => (each.key === 'catalog' ? { ...each, errorCount: 1284 } : each))}
      />,
    );
    expect(job('catalog').querySelector('[data-part="errors-note"]')?.textContent).toMatch(
      /Mostrando 2 de 1.284/,
    );
  });

  it('refuses an expanded request the consumer cancels, and follows a controlled set', () => {
    const { rerender } = render(<Centre expanded={[]} onExpandedChange={() => {}} />);
    fireEvent.click(within(job('catalog')).getByRole('button', { name: /^Detalhes/ }));
    expect(job('catalog').dataset['expanded']).toBeUndefined();
    rerender(<Centre expanded={['catalog']} onExpandedChange={() => {}} />);
    expect(job('catalog').dataset['expanded']).toBe('');
  });

  it('filters the built-in views and asks with the view model', () => {
    const onViewChange = vi.fn();
    render(<Centre onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Exportações' }));
    expect(onViewChange).toHaveBeenCalledWith(
      'export',
      expect.objectContaining({ value: 'export' }),
    );
    expect(root().dataset['view']).toBe('export');
    expect(
      [...root().querySelectorAll('[data-part="job"]')].map(
        (each) => (each as HTMLElement).dataset['key'],
      ),
    ).toEqual(['invoices', 'debtors']);
  });

  it('draws the empty page of the view, and the error page that asks to reload', () => {
    const onReload = vi.fn();
    const { rerender } = render(<Centre defaultView="import" jobs={[]} />);
    expect(root().querySelector('[data-part="empty"]')?.textContent).toContain(
      'Nenhuma importação',
    );
    rerender(<Centre jobs={[]} onReload={onReload} status="error" />);
    fireEvent.click(
      within(root().querySelector('[data-part="error"]') as HTMLElement).getByRole('button'),
      { detail: 1 },
    );
    expect(onReload).toHaveBeenCalledWith(expect.objectContaining({ reason: 'pointer' }));
    expect(root().dataset['status']).toBe('error');
  });

  it('stands skeleton jobs in while nothing has arrived, and marks the list busy', () => {
    render(<Centre jobs={[]} loading />);
    const list = screen.getByRole('list', { hidden: true });
    expect(list.getAttribute('aria-busy')).toBe('true');
    expect(list.querySelectorAll('[data-part="job"][aria-hidden="true"]')).toHaveLength(3);
  });

  it('asks for the next page from the more control', () => {
    const onLoadMore = vi.fn();
    render(<Centre growing="button" hasMore onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }), { detail: 1 });
    expect(onLoadMore).toHaveBeenCalledWith(expect.objectContaining({ reason: 'pointer' }));
  });

  it('announces a transition once, and nothing on the first render', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Centre />);
    const region = () =>
      [...document.querySelectorAll('[data-slotted-live-announcer] [aria-live="polite"]')]
        .map((node) => node.textContent)
        .join('');
    act(() => vi.advanceTimersByTime(500));
    expect(region()).not.toContain('Contatos');
    rerender(
      <Centre
        jobs={JOBS.map((each) => (each.key === 'crm' ? { ...each, status: 'succeeded' } : each))}
      />,
    );
    act(() => vi.advanceTimersByTime(500));
    expect(region()).toContain('Importação Contatos do CRM concluída');
    vi.useRealTimers();
  });

  it('keeps focus in a job whose control the status took away', () => {
    const { rerender } = render(<Centre />);
    const cancel = within(job('crm')).getByRole('button', { name: /^Cancelar/ });
    cancel.focus();
    rerender(
      <Centre
        jobs={JOBS.map((each) =>
          each.key === 'crm'
            ? {
                ...each,
                counts: { total: 5000 },
                result: { href: '#r', name: 'r.csv' },
                status: 'succeeded',
              }
            : each,
        )}
      />,
    );
    expect(document.activeElement?.closest('[data-part="download"]')).toBeTruthy();
    expect(document.activeElement?.closest('[data-part="job"]')).toBe(job('crm'));
  });

  it('moves focus to the same control of the next job when a job leaves', () => {
    const { rerender } = render(<Centre />);
    within(job('catalog')).getByRole('button', { name: 'Remover do histórico' }).focus();
    rerender(<Centre jobs={JOBS.filter((each) => each.key !== 'catalog')} />);
    expect(document.activeElement?.closest('[data-part="job"]')).toBe(job('invoices'));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Remover do histórico');
  });

  it('reveals a job from the handle: shows its details and focuses its title', () => {
    function Revealing() {
      const ref = useRef<ImportExportCenterHandle>(null);
      return (
        <>
          <button onClick={() => ref.current?.reveal('catalog')} type="button">
            ver
          </button>
          <Centre defaultView="export" ref={ref} />
        </>
      );
    }
    render(<Revealing />);
    fireEvent.click(screen.getByRole('button', { name: 'ver' }));
    expect(root().dataset['view']).toBe('all');
    expect(job('catalog').dataset['expanded']).toBe('');
    expect(document.activeElement?.getAttribute('data-part')).toBe('job-title');
    expect(document.activeElement?.closest('[data-part="job"]')).toBe(job('catalog'));
  });

  it('takes its defaults from the provider, and an explicit prop still wins', () => {
    render(
      <ImportExportCenterDefaultsProvider level="3" size="sm">
        <Centre messages={{ title: 'Jobs' }} size="md" />
      </ImportExportCenterDefaultsProvider>,
    );
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('Jobs');
    expect(root().dataset['size']).toBe('md');
  });

  it("passes native props through and renders the consumer's own job actions", () => {
    render(
      <Centre
        data-testid="centre"
        id="jobs"
        renderJobActions={(each) =>
          each.key === 'invoices' ? <a href="#share">Partilhar</a> : null
        }
      />,
    );
    expect(screen.getByTestId('centre').id).toBe('jobs');
    expect(job('invoices').querySelector('[data-part="job-actions"] a')?.textContent).toBe(
      'Partilhar',
    );
    expect(job('crm').querySelector('[data-part="job-actions"]')).toBeNull();
  });
});

describe('useJobToasts', () => {
  function Shell({
    jobs,
    onView,
  }: {
    jobs: readonly ImportExportJob[];
    onView: (key: string) => void;
  }) {
    const [toaster] = useState(() => createToaster());
    useJobToasts(jobs, { onView, toaster });
    return <output data-testid="count">{toaster.store.snapshot.visible.length}</output>;
  }

  it('points one toast at a job, under its key, and replaces it when the job finishes', () => {
    const toaster = createToaster();
    const show = vi.spyOn(toaster, 'show');
    function Probe({ jobs }: { jobs: readonly ImportExportJob[] }) {
      useJobToasts(jobs, { onView: () => {}, toaster });
      return null;
    }
    const queued: ImportExportJob = {
      direction: 'export',
      key: 'x',
      status: 'queued',
      title: 'Faturas',
    };
    const { rerender } = render(<Probe jobs={[queued]} />);
    expect(show).not.toHaveBeenCalled();
    rerender(<Probe jobs={[{ ...queued, status: 'running' }]} />);
    rerender(<Probe jobs={[{ ...queued, status: 'succeeded' }]} />);
    expect(show).toHaveBeenCalledTimes(2);
    expect(show.mock.calls[0]?.[0]).toMatchObject({
      id: 'import-export-center:x',
      loading: true,
      title: 'Export Faturas started',
    });
    expect(show.mock.calls[1]?.[0]).toMatchObject({
      announcement: 'Export Faturas completed',
      id: 'import-export-center:x',
      loading: false,
      tone: 'success',
    });
  });

  it('renders nothing for a job that arrives already finished', () => {
    render(<Shell jobs={[]} onView={() => {}} />);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
