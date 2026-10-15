import { ChevronLeft, ChevronRight, ClipboardList, Printer } from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar } from '../avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '../breadcrumb';
import { Button, IconButton } from '../button';
import { MenuItem } from '../menu';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderArea,
  PageHeaderBack,
  PageHeaderBreadcrumbs,
  PageHeaderContent,
  PageHeaderControls,
  PageHeaderDescription,
  PageHeaderFigure,
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
import {
  Section,
  SectionActions,
  SectionBody,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionHeading,
  SectionTitle,
} from '../section';
import { Stack } from '../stack';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumnHeader,
  TableContent,
  TableHead,
  TableRow,
  TableRowHeader,
} from '../table';
import { Tab, TabList, TabPanel, Tabs } from '../tabs';
import { Tag } from '../tag';
import { Toolbar, ToolbarItem, ToolbarOverflow } from '../toolbar';
import { Text } from '../typography';
import { Page, PageBody, PageFooter } from './page';
import type { PageProps } from './page.types';

/**
 * A box the size of a screen, that scrolls, read as a page. The demonstrations
 * of this family are about what happens while the reader scrolls past the
 * header, and a stage the height of a card would be a picture of a different
 * component.
 */
export function Viewport({
  children,
  size = 'screen',
}: {
  children: ReactNode;
  size?: 'screen' | 'tall' | undefined;
}) {
  return (
    <div className="slotted-demo-viewport" data-layout="page" data-scroll data-size={size}>
      {children}
    </div>
  );
}

/* ── One purchase order, in full ─────────────────────────────────────────── */

/** The supplier's mark, as an application would have it: an image the avatar shows whole. */
export const LOGO =
  'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%231d4ed8%27/%3E%3Ccircle cx=%2724%27 cy=%2736%27 r=%2714%27 fill=%27%2360a5fa%27/%3E%3Ccircle cx=%2742%27 cy=%2728%27 r=%2714%27 fill=%27%23bfdbfe%27 fill-opacity=%27.9%27/%3E%3C/svg%3E';

export const MONEY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export interface OrderLine {
  code: string;
  description: string;
  /** The description a narrow column can afford. */
  short: string;
  quantity: number;
  unit: number;
}

export const ORDER = {
  id: 'PC-2026-004521',
  supplier: 'Aurora Logística Ltda',
  document: 'CNPJ 12.345.678/0001-90',
  buyer: 'Marina Duarte',
  costCentre: 'Frota Sudeste · CC 4120',
  delivery: '24 de setembro de 2026',
  terms: '45 dias contra a fatura',
  status: 'Em análise',
  total: 148_320,
  description:
    'Reposição de pneus radiais aro 22.5 para a frota de Cariacica. Entrega prevista para 24 de setembro de 2026, com pagamento a 45 dias contra a fatura.',
};

export const LINES: OrderLine[] = Array.from({ length: 36 }, (_, index) => {
  const kinds = [
    ['Pneu radial 295/80 R22.5 Michelin X Multi Z', 'Pneu 295/80 R22.5', 2980],
    ['Pneu radial 275/80 R22.5 Bridgestone R268', 'Pneu 275/80 R22.5', 2640],
    ['Câmara de ar 22.5 Pirelli', 'Câmara 22.5', 190],
    ['Protetor de câmara 22.5', 'Protetor 22.5', 85],
    ['Serviço de recapagem a frio', 'Recapagem a frio', 1240],
    ['Alinhamento e balanceamento, eixo', 'Alinhamento, eixo', 320],
  ] as const;
  const [description, short, unit] = kinds[index % kinds.length] as (typeof kinds)[number];
  return {
    code: `SKU-${String(7891234 + index * 17).padStart(7, '0')}`,
    description,
    short,
    quantity: 4 + ((index * 7) % 20),
    unit,
  };
});

export const HISTORY = [
  ['02/09/2026 09:14', 'Marina Duarte', 'Solicitou aprovação com três cotações anexadas.'],
  ['03/09/2026 11:02', 'Carlos Prado', 'Aprovou o orçamento dentro da alçada da gerência.'],
  ['04/09/2026 16:40', 'Jurídico', 'Devolveu com ressalvas sobre a cláusula de reajuste.'],
  ['05/09/2026 10:21', 'Marina Duarte', 'Reenviou com a cláusula corrigida pelo fornecedor.'],
  ['08/09/2026 08:55', 'Carlos Prado', 'Aprovou a versão corrigida.'],
  ['09/09/2026 14:30', 'Financeiro', 'Reservou o valor no orçamento do centro de custo.'],
  ['10/09/2026 09:00', 'Sistema', 'Aguardando emissão da ordem de compra.'],
] as const;

export const RECORDS = ['PC-2026-004519', 'PC-2026-004520', 'PC-2026-004521', 'PC-2026-004522'];

/** The header of the order, with every part written, in the state the story asks for. */
export function OrderHeader({
  actions = 'full',
  breadcrumbs = true,
  controls = true,
  figure = false,
  marks = true,
  navigation = true,
  pin = true,
  progress,
  record = ORDER.id,
  tabs = true,
  visual = 'icon',
  ...props
}: Partial<PageHeaderProps> & {
  actions?: 'full' | 'two' | 'none';
  breadcrumbs?: boolean;
  controls?: boolean;
  figure?: boolean;
  marks?: boolean;
  navigation?: boolean;
  pin?: boolean;
  /** A refresh of the order, on the chrome's edge: written after the controls, before the tabs. */
  progress?: ReactNode;
  record?: string;
  tabs?: boolean;
  /** What stands before the title: the kind of record as an icon, the supplier's mark as an image, or initials. */
  visual?: 'icon' | 'image' | 'initials' | false;
}) {
  return (
    <PageHeader {...props}>
      <PageHeaderTitleArea>
        <PageHeaderNav>
          <PageHeaderBack href="#pedidos">Pedidos de compra</PageHeaderBack>
          {breadcrumbs ? (
            <PageHeaderBreadcrumbs>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#compras">Compras</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#pedidos">Pedidos</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{record}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </PageHeaderBreadcrumbs>
          ) : null}
        </PageHeaderNav>
        <PageHeaderTitleRow>
          {visual === false ? null : (
            <PageHeaderVisual>
              {visual === 'image' ? (
                <Avatar name={ORDER.supplier} shape="square" size="lg" src={LOGO} />
              ) : visual === 'initials' ? (
                <Avatar name={ORDER.supplier} shape="square" size="lg" tone="accent" />
              ) : (
                <Avatar name="Pedido de compra" shape="square" size="lg" tone="accent">
                  <ClipboardList aria-hidden="true" focusable="false" strokeWidth={1.75} />
                </Avatar>
              )}
            </PageHeaderVisual>
          )}
          <PageHeaderTitle>
            <PageHeaderHeading>Pedido de compra {record}</PageHeaderHeading>
            {marks ? (
              <PageHeaderMarks>
                <Tag shape="pill" size="sm" tone="warning">
                  {ORDER.status}
                </Tag>
              </PageHeaderMarks>
            ) : null}
            <PageHeaderSubheading>
              {ORDER.supplier} · {ORDER.document}
            </PageHeaderSubheading>
          </PageHeaderTitle>
          {actions === 'none' ? null : (
            <PageHeaderActions>
              <Toolbar aria-label="Ações do pedido" overflow="menu">
                {actions === 'full' ? (
                  <>
                    <ToolbarItem counterpart={<MenuItem>Duplicar</MenuItem>}>
                      <Button variant="ghost">Duplicar</Button>
                    </ToolbarItem>
                    <ToolbarItem counterpart={<MenuItem>Imprimir</MenuItem>}>
                      <Button
                        start={<Printer aria-hidden="true" focusable="false" strokeWidth={1.75} />}
                        variant="ghost"
                      >
                        Imprimir
                      </Button>
                    </ToolbarItem>
                    <ToolbarItem counterpart={<MenuItem>Exportar</MenuItem>}>
                      <Button variant="outline">Exportar</Button>
                    </ToolbarItem>
                  </>
                ) : null}
                <ToolbarItem counterpart={<MenuItem>Reprovar</MenuItem>}>
                  <Button variant="outline">Reprovar</Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Button tone="accent">Aprovar</Button>
                </ToolbarItem>
                <ToolbarOverflow />
              </Toolbar>
            </PageHeaderActions>
          )}
          {navigation ? (
            <PageHeaderNavigation>
              <IconButton aria-label="Pedido anterior" variant="ghost">
                <ChevronLeft aria-hidden="true" />
              </IconButton>
              <IconButton aria-label="Pedido seguinte" variant="ghost">
                <ChevronRight aria-hidden="true" />
              </IconButton>
            </PageHeaderNavigation>
          ) : null}
        </PageHeaderTitleRow>
      </PageHeaderTitleArea>
      <PageHeaderArea>
        {figure ? (
          <PageHeaderFigure>
            <Avatar name="Pneu radial" shape="square" size="xl" tone="secondary" />
          </PageHeaderFigure>
        ) : null}
        <PageHeaderContent>
          <PageHeaderDescription>{ORDER.description}</PageHeaderDescription>
          <OrderFacts />
        </PageHeaderContent>
      </PageHeaderArea>
      {controls ? (
        <PageHeaderControls>
          <PageHeaderToggle />
          {pin ? <PageHeaderPin /> : null}
        </PageHeaderControls>
      ) : null}
      {progress}
      {tabs ? (
        <PageHeaderTabs>
          <Tabs defaultValue="itens">
            <TabList aria-label="Secções do pedido">
              <Tab value="resumo">Resumo</Tab>
              <Tab value="itens">Itens</Tab>
              <Tab value="historico">Histórico</Tab>
            </TabList>
          </Tabs>
        </PageHeaderTabs>
      ) : null}
    </PageHeader>
  );
}

/** The short facts of the order, as a row of terms. */
export function OrderFacts() {
  return (
    <DescriptionList columns={3} layout="stack">
      <DescriptionListItem>
        <DescriptionListTerm>Total</DescriptionListTerm>
        <DescriptionListDescription>{MONEY.format(ORDER.total)}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Itens</DescriptionListTerm>
        <DescriptionListDescription>{LINES.length}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Comprador</DescriptionListTerm>
        <DescriptionListDescription>{ORDER.buyer}</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Entrega</DescriptionListTerm>
        <DescriptionListDescription>{ORDER.delivery}</DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

/** The order's lines, as a table whose header sticks under the page chrome. */
/**
 * The order's lines, in three column sets. `compact` keeps a short description
 * and the quantity, for a column too narrow for more. `sticky` holds the
 * column header under the page chrome — and a table held that way is as wide
 * as its content, so it shows the code, the short description and the
 * quantity, which fit a 420-pixel page. Otherwise all four columns, and the
 * table scrolls inside its own box when they do not fit.
 */
export function OrderLines({
  compact = false,
  rows = LINES,
  sticky = false,
}: {
  compact?: boolean;
  rows?: OrderLine[];
  sticky?: boolean;
}) {
  const columns = compact ? 2 : sticky ? 3 : 4;
  const code = columns >= 3;
  const unit = columns === 4;
  return (
    <Table
      columns={columns}
      variant="ruled"
      {...(sticky ? { stickyHeader: true, stickyTo: 'page' as const } : {})}
    >
      <TableContent>
        <TableCaption>Itens do pedido</TableCaption>
        <TableHead>
          <TableRow>
            {code ? <TableColumnHeader>Código</TableColumnHeader> : null}
            <TableColumnHeader>Descrição</TableColumnHeader>
            <TableColumnHeader numeric>{unit ? 'Quantidade' : 'Qtd.'}</TableColumnHeader>
            {unit ? <TableColumnHeader numeric>Unitário</TableColumnHeader> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((line) => (
            <TableRow key={line.code} value={line.code}>
              {code ? (
                <TableRowHeader>{line.code}</TableRowHeader>
              ) : (
                <TableRowHeader>{line.short}</TableRowHeader>
              )}
              {code ? <TableCell>{unit ? line.description : line.short}</TableCell> : null}
              <TableCell numeric>{line.quantity}</TableCell>
              {unit ? <TableCell numeric>{MONEY.format(line.unit)}</TableCell> : null}
            </TableRow>
          ))}
        </TableBody>
      </TableContent>
    </Table>
  );
}

/** The sections a purchase order screen has, in order. */
export function OrderSections({
  compact = false,
  ground = 'none',
  sticky = false,
}: {
  compact?: boolean;
  ground?: 'none' | 'surface';
  sticky?: boolean;
}) {
  /* On a sunken canvas a section stands on a surface; on a surface a rule separates. */
  const separation = ground === 'surface' ? { ground: 'surface' as const } : { divider: true };
  return (
    <Stack gap={9}>
      <Section {...separation} id="itens" sticky={sticky}>
        <SectionHeader>
          <SectionTitle>
            <SectionEyebrow>{LINES.length} itens</SectionEyebrow>
            <SectionHeading>Itens do pedido</SectionHeading>
            <SectionDescription>
              Quantidades e preços unitários conforme a cotação aceite em 2 de setembro.
            </SectionDescription>
          </SectionTitle>
          <SectionActions>
            <Button size="sm" variant="outline">
              Exportar
            </Button>
            <Button size="sm" tone="accent">
              Adicionar item
            </Button>
          </SectionActions>
        </SectionHeader>
        <SectionBody>
          <OrderLines compact={compact} sticky={sticky} />
        </SectionBody>
      </Section>
      <Section {...separation} id="condicoes" sticky={sticky}>
        <SectionHeader>
          <SectionTitle>
            <SectionHeading>Condições comerciais</SectionHeading>
          </SectionTitle>
          <SectionActions>
            <Button size="sm" variant="ghost">
              Editar
            </Button>
          </SectionActions>
        </SectionHeader>
        <SectionBody>
          <DescriptionList columns={2}>
            <DescriptionListItem>
              <DescriptionListTerm>Prazo de pagamento</DescriptionListTerm>
              <DescriptionListDescription>{ORDER.terms}</DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Centro de custo</DescriptionListTerm>
              <DescriptionListDescription>{ORDER.costCentre}</DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Frete</DescriptionListTerm>
              <DescriptionListDescription>CIF, por conta do fornecedor</DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Garantia</DescriptionListTerm>
              <DescriptionListDescription>24 meses ou 120.000 km</DescriptionListDescription>
            </DescriptionListItem>
          </DescriptionList>
        </SectionBody>
      </Section>
      <Section {...separation} id="historico" sticky={sticky}>
        <SectionHeader>
          <SectionTitle>
            <SectionEyebrow>{HISTORY.length} eventos</SectionEyebrow>
            <SectionHeading>Histórico de aprovações</SectionHeading>
          </SectionTitle>
        </SectionHeader>
        <SectionBody>
          <Stack gap={4}>
            {HISTORY.map(([when, who, what]) => (
              <Text key={when} size="sm">
                <strong>
                  {when} · {who}
                </strong>{' '}
                — {what}
              </Text>
            ))}
          </Stack>
        </SectionBody>
      </Section>
    </Stack>
  );
}

/** The footer of the order: the actions that finish the task. */
export function OrderFooter() {
  return (
    <PageFooter>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="outline">Guardar rascunho</Button>
      <Button tone="accent">Enviar para aprovação</Button>
    </PageFooter>
  );
}

/** The whole screen: a page, its header, its sections and its footer, inside a scrolling viewport. */
export function OrderScreen({
  footer = true,
  header,
  page,
  sections,
  sticky = false,
}: {
  footer?: boolean;
  header?: Parameters<typeof OrderHeader>[0];
  page?: Partial<PageProps>;
  sections?: Omit<Parameters<typeof OrderSections>[0], 'sticky'>;
  sticky?: boolean;
}) {
  return (
    <Viewport>
      <Page footer={footer ? <OrderFooter /> : undefined} {...page}>
        <OrderHeader {...header} />
        <PageBody>
          <OrderSections {...sections} sticky={sticky} />
        </PageBody>
      </Page>
    </Viewport>
  );
}

/** The tabs of the order, with the panels they switch between. */
export function OrderTabs() {
  return (
    <Tabs defaultValue="itens">
      <TabList aria-label="Secções do pedido">
        <Tab value="resumo">Resumo</Tab>
        <Tab value="itens">Itens</Tab>
        <Tab value="historico">Histórico</Tab>
      </TabList>
      <TabPanel value="resumo">
        <Text size="sm">{ORDER.description}</Text>
      </TabPanel>
      <TabPanel value="itens">
        <OrderLines />
      </TabPanel>
      <TabPanel value="historico">
        <Stack gap={4}>
          {HISTORY.map(([when, who, what]) => (
            <Text key={when} size="sm">
              {when} · {who} — {what}
            </Text>
          ))}
        </Stack>
      </TabPanel>
    </Tabs>
  );
}
