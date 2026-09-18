import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

import { Avatar } from '../avatar';
import { Button } from '../button';
import { NotificationCenter } from './notification-center';
import type {
  NotificationCenterProps,
  NotificationCenterReadChange,
  NotificationItem,
} from './notification-center.types';

/** The instant every relative time in the pages is measured from. */
export const NOW = Date.parse('2026-09-17T10:20:00Z');

function person(name: string, tone: 'accent' | 'secondary' = 'accent') {
  return <Avatar decorative name={name} shape="circle" size="sm" tone={tone} />;
}

/** What happened to the Nexora sales desk in the last two days. */
export const NOTIFICATIONS: NotificationItem[] = [
  {
    actions: (
      <Button size="sm" tone="secondary" variant="outline">
        Ver expedição
      </Button>
    ),
    description:
      'A expedição SHP-009841 saiu de Columbus com 3 volumes. O restante fica para a próxima janela de embarque, a 24 de setembro.',
    href: '#SO-2026-01842',
    key: 'so-01842-partial',
    read: false,
    time: '2026-09-17T08:20:00Z',
    title: 'SO-2026-01842 parcialmente atendido: 6 unidades do Servo Motor MX-240 em pendência',
    tone: 'warning',
    visual: person('Expedição', 'secondary'),
  },
  {
    description:
      'US$ 44.560,00 por transferência. Ficam US$ 41.860,00 em aberto, 14 dias após o vencimento.',
    href: '#INV-2026-02891',
    key: 'inv-02891-payment',
    read: false,
    time: '2026-09-17T07:05:00Z',
    title: 'Marta Silva registou um pagamento parcial em INV-2026-02891',
    tone: 'danger',
    visual: person('Marta Silva'),
  },
  {
    href: '#TCK-10492',
    key: 'tck-10492-assigned',
    read: true,
    time: '2026-09-17T06:40:00Z',
    title: 'Daniel Okafor atribuiu-lhe o ticket TCK-10492 · Atraso na expedição',
    visual: person('Daniel Okafor'),
  },
  {
    description: 'Northwind Fabrication · US$ 12.480,00 · entrega pedida para 15 de setembro.',
    key: 'so-01841-approved',
    read: false,
    time: '2026-09-16T15:12:00Z',
    title: 'SO-2026-01841 aprovado dentro da alçada',
    tone: 'success',
  },
  {
    description: 'Pré-pago, US$ 4.120,00. A aprovação está com Contas-chave.',
    href: '#SO-2026-01843',
    key: 'so-01843-approval',
    read: true,
    time: '2026-09-16T09:30:00Z',
    title: 'Aprovação pedida para SO-2026-01843 · Helios Automation GmbH',
  },
];

/** A page that already went by: the older notifications a second page brings. */
export const OLDER: NotificationItem[] = [
  {
    key: 'report-weekly',
    read: true,
    time: '2026-09-15T12:00:00Z',
    title: 'Relatório semanal de vendas disponível',
    tone: 'accent',
  },
  {
    key: 'maintenance-oh1',
    read: true,
    time: '2026-09-14T22:00:00Z',
    title: 'A janela de manutenção de Columbus (OH-1) terminou',
    tone: 'secondary',
  },
];

/** What arrives while the reader is reading. */
export const ARRIVALS: NotificationItem[] = [
  {
    description: 'Meridian Controls Group · 3 linhas · US$ 18.900,00.',
    href: '#SO-2026-01844',
    key: 'so-01844-new',
    read: false,
    time: '2026-09-17T10:18:00Z',
    title: 'Novo pedido SO-2026-01844 recebido pelo portal',
    tone: 'accent',
  },
  {
    key: 'tck-10493-comment',
    read: false,
    time: '2026-09-17T10:19:00Z',
    title: 'Priya Raman comentou em TCK-10493',
    visual: person('Priya Raman'),
  },
];

/** The day an item is filed under, for the grouped pages. */
export function dayOf(item: NotificationItem): string {
  return String(item.time) >= '2026-09-17' ? 'Hoje' : 'Ontem';
}

/** A store that answers every request: read, remove, more, arrivals. */
export function useNotificationStore(initial: readonly NotificationItem[] = NOTIFICATIONS) {
  const [items, setItems] = useState<readonly NotificationItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const [paged, setPaged] = useState(false);

  const onReadChange = useCallback(({ keys, read }: NotificationCenterReadChange) => {
    setItems((previous) =>
      previous.map((item) => (keys.includes(item.key) ? { ...item, read } : item)),
    );
  }, []);
  const onRemove = useCallback((key: string) => {
    setItems((previous) => previous.filter((item) => item.key !== key));
  }, []);
  const onLoadMore = useCallback(() => {
    if (paged) return;
    setLoading(true);
    window.setTimeout(() => {
      setItems((previous) => [...previous, ...OLDER]);
      setPaged(true);
      setLoading(false);
    }, 900);
  }, [paged]);
  const arrive = useCallback(() => {
    setItems((previous) => {
      const fresh = ARRIVALS.filter((item) => !previous.some((known) => known.key === item.key));
      return [...fresh, ...previous];
    });
  }, []);
  const reset = useCallback(() => {
    setItems(initial);
    setPaged(false);
  }, [initial]);

  return { arrive, items, loading, onLoadMore, onReadChange, onRemove, reset, setItems };
}

/** The centre over the store, for the pages that vary one axis. */
export function Inbox({
  initial,
  ...props
}: Partial<NotificationCenterProps> & { initial?: readonly NotificationItem[] }) {
  const store = useNotificationStore(initial);
  return (
    <NotificationCenter
      items={store.items}
      loading={store.loading}
      locale="pt-PT"
      now={NOW}
      onLoadMore={store.onLoadMore}
      onReadChange={store.onReadChange}
      onRemove={store.onRemove}
      {...props}
    />
  );
}

/** A box the width of a popover, framed, for the `sm` pages. */
export function Panel({ children }: { children: ReactNode }) {
  return <div className="slotted-demo-frame slotted-demo-measure">{children}</div>;
}
