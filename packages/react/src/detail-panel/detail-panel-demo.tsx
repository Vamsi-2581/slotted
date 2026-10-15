import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { ReactNode } from 'react';

import { ActionBar, ActionBarAction, ActionBarActions } from '../action-bar';
import { Avatar } from '../avatar';
import { Button, IconButton } from '../button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import { MenuItem } from '../menu';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderArea,
  PageHeaderBack,
  PageHeaderContent,
  PageHeaderControls,
  PageHeaderHeading,
  PageHeaderMarks,
  PageHeaderNav,
  PageHeaderNavigation,
  PageHeaderPin,
  PageHeaderSubheading,
  PageHeaderTabs,
  PageHeaderTitle,
  PageHeaderTitleArea,
  PageHeaderTitleRow,
  PageHeaderToggle,
  PageHeaderVisual,
} from '../page-header';
import type { PageHeaderProps } from '../page-header';
import { Stack } from '../stack';
import {
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableContent,
  TableHead,
  TableRow,
  TableRowHeader,
} from '../table';
import { Tag } from '../tag';
import { Timeline, TimelineItem } from '../timeline';
import { Toolbar, ToolbarItem, ToolbarOverflow } from '../toolbar';
import { Text } from '../typography';
import { DetailPanel } from './detail-panel';
import { DetailPanelBody, DetailPanelSection, DetailPanelTabs } from './detail-panel-parts';
import type { DetailPanelBodyProps, DetailPanelProps } from './detail-panel.types';

/* ── One sales order of Nexora Operations ─────────────────────────────── */

export const MONEY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

export interface SalesOrder {
  id: string;
  customer: string;
  po: string;
  confirmed: string;
  status: string;
  tone: 'accent' | 'warning' | 'danger' | 'success';
  total: number;
  delivery: string;
  warehouse: string;
  owner: string;
  team: string;
  terms: string;
  approval: string;
  outstanding: number;
  invoice: string;
}

export const ORDERS: SalesOrder[] = [
  {
    id: 'SO-2026-01841',
    customer: 'Northwind Fabrication',
    po: 'NF-2026-118',
    confirmed: '3 de setembro de 2026',
    status: 'Confirmado',
    tone: 'accent',
    total: 12_480,
    delivery: '15 set 2026',
    warehouse: 'Dallas (TX-2)',
    owner: 'Daniel Okafor',
    team: 'Vendas internas — Sul',
    terms: 'Net 45',
    approval: 'Aprovado · 3 set',
    outstanding: 12_480,
    invoice: 'INV-2026-02887',
  },
  {
    id: 'SO-2026-01842',
    customer: 'Meridian Controls Group',
    po: 'MCG-77120',
    confirmed: '4 de setembro de 2026',
    status: 'Parcialmente atendido',
    tone: 'warning',
    total: 86_420,
    delivery: '18 set 2026',
    warehouse: 'Columbus (OH-1)',
    owner: 'Priya Raman',
    team: 'Vendas internas — Centro-Oeste',
    terms: 'Net 30',
    approval: 'Aprovado · 4 set',
    outstanding: 41_860,
    invoice: 'INV-2026-02891',
  },
  {
    id: 'SO-2026-01843',
    customer: 'Helios Automation GmbH',
    po: 'HA-DE-2026-Q3-00092817',
    confirmed: '5 de setembro de 2026',
    status: 'Em espera',
    tone: 'danger',
    total: 4_120,
    delivery: '22 set 2026',
    warehouse: 'Columbus (OH-1)',
    owner: 'Marta Silva',
    team: 'Contas-chave',
    terms: 'Pré-pago',
    approval: 'Pendente',
    outstanding: 4_120,
    invoice: '—',
  },
];

export const ORDER = ORDERS[1] as SalesOrder;

export const LINES = [
  { sku: 'MX-240', product: 'Servo Motor MX-240', quantity: 12, unit: 3_240, fulfilled: 6 },
  { sku: 'PLC-8', product: 'Controlador PLC-8 Series', quantity: 4, unit: 5_180, fulfilled: 4 },
  {
    sku: 'CB-4x15',
    product: 'Cabo blindado 4×1,5 mm²',
    quantity: 30,
    unit: 412,
    fulfilled: 30,
  },
  { sku: 'IS-18', product: 'Sensor indutivo IS-18', quantity: 60, unit: 148, fulfilled: 60 },
];

export const SHIPMENTS = [
  { id: 'SHP-009841', carrier: 'FedEx Freight', status: 'Em trânsito', packages: 3 },
];

export const HISTORY = [
  {
    title: 'Expedição SHP-009841 parcial',
    description: '6 unidades do Servo Motor MX-240 em pendência.',
    time: '2026-09-12T14:20:00Z',
    tone: 'warning' as const,
  },
  { title: 'Pedido confirmado', actor: 'Priya Raman', time: '2026-09-04T10:02:00Z' },
  { title: 'Pedido criado', actor: 'Daniel Okafor', time: '2026-09-03T16:45:00Z' },
];

const BRAZIL = {
  locale: 'pt-BR',
  now: Date.UTC(2026, 8, 17, 9),
  timeZone: 'America/Sao_Paulo',
} as const;

/* ── The pieces ───────────────────────────────────────────────────────── */

/** The key facts under the title, in the header area. */
export function OrderFacts({ order = ORDER }: { order?: SalesOrder }) {
  return (
    <DescriptionList columns={3} layout="row">
      <DescriptionListItem>
        <DescriptionListTerm>Total</DescriptionListTerm>
        <DescriptionListDescription>{MONEY.format(order.total)}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Entrega pedida</DescriptionListTerm>
        <DescriptionListDescription>{order.delivery}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Armazém</DescriptionListTerm>
        <DescriptionListDescription>{order.warehouse}</DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

/** The fields of the aside. */
export function OrderFields({ order = ORDER }: { order?: SalesOrder }) {
  return (
    <DescriptionList layout="stack">
      <DescriptionListItem>
        <DescriptionListTerm>Responsável</DescriptionListTerm>
        <DescriptionListDescription>{order.owner}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Equipa</DescriptionListTerm>
        <DescriptionListDescription>{order.team}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Condições</DescriptionListTerm>
        <DescriptionListDescription>{order.terms}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Aprovação</DescriptionListTerm>
        <DescriptionListDescription>{order.approval}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Pagamento</DescriptionListTerm>
        <DescriptionListDescription>
          {MONEY.format(order.outstanding)} em aberto
        </DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Fatura</DescriptionListTerm>
        <DescriptionListDescription copy={order.invoice !== '—'}>
          {order.invoice}
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

/** The order lines, as a table. */
export function OrderLines() {
  return (
    <Table aria-label="Linhas do pedido" columns={3} variant="plain">
      <TableContent>
        <TableHead>
          <TableRow>
            <TableColumnHeader>Produto</TableColumnHeader>
            <TableColumnHeader align="end">Qtd.</TableColumnHeader>
            <TableColumnHeader align="end">Unitário</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {LINES.map((line) => (
            <TableRow key={line.sku}>
              <TableRowHeader>{line.product}</TableRowHeader>
              <TableCell align="end">
                {line.fulfilled === line.quantity
                  ? line.quantity
                  : `${line.fulfilled} / ${line.quantity}`}
              </TableCell>
              <TableCell align="end">{MONEY.format(line.unit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

/** The history of the order, as a feed. */
export function OrderHistory() {
  return (
    <Timeline label="Histórico do pedido" order="newest-first" {...BRAZIL}>
      {HISTORY.map((event) => (
        <TimelineItem key={event.time} {...event} />
      ))}
    </Timeline>
  );
}

/**
 * The top of the record: a page-header with the back link, the identifier
 * and the customer as the heading, the status as a mark, the actions, the
 * previous and next controls, the facts in the header area, and the strip in
 * the tabs slot — which draws nothing under `layout="stacked"`.
 */
export function OrderHeader({
  close,
  order = ORDER,
  navigation = true,
  onNavigate,
  strip = true,
  ...props
}: Partial<PageHeaderProps> & {
  /** A host's own close control, after the toolbar. */
  close?: ReactNode;
  order?: SalesOrder;
  navigation?: boolean;
  onNavigate?: ((direction: -1 | 1) => void) | undefined;
  strip?: boolean;
}) {
  return (
    <PageHeader {...props}>
      <PageHeaderTitleArea>
        <PageHeaderNav>
          <PageHeaderBack href="#pedidos">Pedidos de venda</PageHeaderBack>
        </PageHeaderNav>
        <PageHeaderTitleRow>
          <PageHeaderVisual>
            <Avatar name="Pedido de venda" shape="square" size="lg" tone="accent">
              <Package aria-hidden="true" focusable="false" strokeWidth={1.75} />
            </Avatar>
          </PageHeaderVisual>
          <PageHeaderTitle>
            <PageHeaderHeading>
              {order.id} · {order.customer}
            </PageHeaderHeading>
            <PageHeaderMarks>
              <Tag shape="pill" size="sm" tone={order.tone}>
                {order.status}
              </Tag>
            </PageHeaderMarks>
            <PageHeaderSubheading>
              Confirmado a {order.confirmed} · PO do cliente {order.po}
            </PageHeaderSubheading>
          </PageHeaderTitle>
          <PageHeaderActions>
            <Toolbar aria-label="Ações do pedido" overflow="menu">
              <ToolbarItem counterpart={<MenuItem>Exportar</MenuItem>}>
                <Button variant="ghost">Exportar</Button>
              </ToolbarItem>
              <ToolbarItem counterpart={<MenuItem>Emitir fatura</MenuItem>}>
                <Button variant="outline">Emitir fatura</Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button tone="accent">Criar expedição</Button>
              </ToolbarItem>
              <ToolbarOverflow />
            </Toolbar>
            {close}
          </PageHeaderActions>
          {navigation ? (
            <PageHeaderNavigation>
              <IconButton
                aria-label="Pedido anterior"
                onClick={() => onNavigate?.(-1)}
                variant="ghost"
              >
                <ChevronLeft aria-hidden="true" />
              </IconButton>
              <IconButton
                aria-label="Pedido seguinte"
                onClick={() => onNavigate?.(1)}
                variant="ghost"
              >
                <ChevronRight aria-hidden="true" />
              </IconButton>
            </PageHeaderNavigation>
          ) : null}
        </PageHeaderTitleRow>
      </PageHeaderTitleArea>
      <PageHeaderArea>
        <PageHeaderContent>
          <OrderFacts order={order} />
        </PageHeaderContent>
      </PageHeaderArea>
      <PageHeaderControls>
        <PageHeaderToggle />
        <PageHeaderPin />
      </PageHeaderControls>
      {strip ? (
        <PageHeaderTabs>
          <DetailPanelTabs label="Secções do pedido" />
        </PageHeaderTabs>
      ) : null}
    </PageHeader>
  );
}

/** The three sections every order has. */
export function OrderSections({ actions = true }: { actions?: boolean }) {
  return (
    <>
      <DetailPanelSection
        actions={
          actions ? (
            <>
              <Button size="sm" variant="outline">
                Exportar
              </Button>
              <Button size="sm" tone="accent">
                Adicionar linha
              </Button>
            </>
          ) : undefined
        }
        count={LINES.length}
        label="Linhas"
        name="linhas"
      >
        <OrderLines />
      </DetailPanelSection>
      <DetailPanelSection count={SHIPMENTS.length} label="Expedições" name="expedicoes">
        <Stack gap={3}>
          {SHIPMENTS.map((shipment) => (
            <Text key={shipment.id} size="sm">
              <strong>{shipment.id}</strong> · {shipment.carrier} · {shipment.status} ·{' '}
              {shipment.packages} volumes
            </Text>
          ))}
        </Stack>
      </DetailPanelSection>
      <DetailPanelSection label="Histórico" name="historico">
        <OrderHistory />
      </DetailPanelSection>
    </>
  );
}

/** The footer a drawer host gives the record. */
export function OrderFooter({ onClose }: { onClose?: (() => void) | undefined }) {
  return (
    <ActionBar aria-label="Ações do pedido" variant="plain">
      <ActionBarActions>
        <ActionBarAction>
          <Button onClick={onClose} tone="secondary" variant="ghost">
            Fechar
          </Button>
        </ActionBarAction>
        <ActionBarAction>
          <Button tone="accent">Registar pagamento</Button>
        </ActionBarAction>
      </ActionBarActions>
    </ActionBar>
  );
}

/** The whole record: the header, the body with the sections and the aside, and an optional footer. */
export function OrderPanel({
  banner,
  children,
  fields = <OrderFields />,
  header,
  message,
  order = ORDER,
  ...props
}: Partial<DetailPanelProps> & {
  banner?: ReactNode;
  fields?: ReactNode;
  header?: ReactNode;
  message?: DetailPanelBodyProps['message'];
  order?: SalesOrder;
}) {
  return (
    <DetailPanel recordKey={order.id} {...props}>
      {header ?? <OrderHeader order={order} />}
      <DetailPanelBody aside={fields} banner={banner} message={message}>
        {children ?? <OrderSections />}
      </DetailPanelBody>
    </DetailPanel>
  );
}
