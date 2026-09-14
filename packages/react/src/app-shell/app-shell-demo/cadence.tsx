import {
  CircleCheck,
  Filter,
  FolderKanban,
  Inbox,
  Kanban,
  Map as MapIcon,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { ReactNode } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '../../breadcrumb';
import { Button } from '../../button';
import { Page, PageBody } from '../../page';
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderSubheading,
  PageHeaderTitle,
  PageHeaderTitleArea,
  PageHeaderTitleRow,
} from '../../page-header';
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
} from '../../table';
import { Tag } from '../../tag';
import {
  AppShell,
  AppShellActions,
  AppShellBanner,
  AppShellBrand,
  AppShellCentre,
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavFooter,
  AppShellNavHeader,
  AppShellNavToggle,
} from '../index';
import type { AppShellProps } from '../app-shell.types';
import { NavAccount, NavGroup, NavItem, Viewport } from './shared';
import type { Destination } from './shared';

/**
 * Cadence: a product team's tracker. The navigation reaches the corner, the
 * plane is flush, the column is painted dark by the product with one scheme
 * attribute and one custom property, and the control that moves the column
 * stands in the column's own head. No secondary pane: an issue opens as a
 * route.
 */

const TOP: readonly Destination[] = [
  { id: 'inbox', label: 'Caixa de entrada', icon: Inbox, count: 4, tone: 'accent' },
  { id: 'mine', label: 'Os meus itens', icon: CircleCheck },
];

const SPACE: readonly Destination[] = [
  { id: 'cycle', label: 'Ciclo 14', icon: RefreshCw },
  { id: 'projects', label: 'Projetos', icon: FolderKanban },
  { id: 'board', label: 'Quadro', icon: Kanban },
  { id: 'roadmap', label: 'Roteiro', icon: MapIcon },
];

interface Issue {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly estimate: string;
  readonly state: 'em curso' | 'em revisão' | 'bloqueado' | 'concluído';
}

const ISSUES: readonly Issue[] = [
  {
    id: 'PLT-812',
    title: 'Migrar filas para o novo broker',
    owner: 'RT',
    estimate: '5',
    state: 'em curso',
  },
  {
    id: 'PLT-809',
    title: 'Limites de taxa por inquilino',
    owner: 'MS',
    estimate: '3',
    state: 'em revisão',
  },
  {
    id: 'PLT-804',
    title: 'Rotação automática de segredos',
    owner: 'RT',
    estimate: '8',
    state: 'bloqueado',
  },
  {
    id: 'PLT-798',
    title: 'Painel de latência p99',
    owner: 'JC',
    estimate: '2',
    state: 'concluído',
  },
  { id: 'PLT-795', title: 'Retirar API v1', owner: 'MS', estimate: '5', state: 'em curso' },
];

const TONE = {
  'em curso': 'accent',
  'em revisão': 'warning',
  bloqueado: 'danger',
  concluído: 'success',
} as const;

export function CadenceNav({ current = 'cycle' }: { current?: string | undefined }) {
  return (
    <AppShellNav
      className="slotted-demo-nav slotted-demo-shell-repaint-nav"
      data-slotted-scheme="dark"
    >
      <AppShellNavHeader>
        <NavAccount
          initials="C"
          label="Cadence — mudar de espaço de trabalho"
          name="Cadence"
          role="Equipa Plataforma"
          shape="square"
          tone="accent"
          variant="solid"
        />
        <AppShellNavToggle />
      </AppShellNavHeader>
      <AppShellNavBody>
        {TOP.map((item) => (
          <NavItem item={item} key={item.id} />
        ))}
        <NavGroup>Espaço</NavGroup>
        {SPACE.map((item) => (
          <NavItem current={item.id === current} item={item} key={item.id} />
        ))}
      </AppShellNavBody>
      <AppShellNavFooter>
        <NavAccount
          initials="RT"
          label="Rui Tavares — abrir menu da conta"
          name="Rui Tavares"
          role="Engenharia"
        />
      </AppShellNavFooter>
    </AppShellNav>
  );
}

/** The bar holds the route: a trail in the middle and the route's actions at the end. */
export function CadenceBanner() {
  return (
    <AppShellBanner>
      <AppShellBrand />
      <AppShellCentre>
        <Breadcrumb label="Localização">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#platform">Plataforma</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#cycle">Ciclo 14</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Em curso</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </AppShellCentre>
      <AppShellActions>
        <Button
          className="slotted-demo-bar-optional"
          size="sm"
          start={<Filter aria-hidden size={14} />}
          tone="secondary"
          variant="ghost"
        >
          Filtrar
        </Button>
        <Button size="sm" start={<Plus aria-hidden size={14} />} tone="accent">
          Novo item
        </Button>
      </AppShellActions>
    </AppShellBanner>
  );
}

export function CadenceContent({ children }: { children?: ReactNode | undefined }) {
  return (
    <Page landmark="none" scroll="ancestor" width="full">
      <PageHeader level="1" size="md">
        <PageHeaderTitleArea>
          <PageHeaderTitleRow>
            <PageHeaderTitle>
              <PageHeaderHeading>Ciclo 14 · Em curso</PageHeaderHeading>
              <PageHeaderSubheading>
                18 itens · 6 concluídos · termina em 5 dias
              </PageHeaderSubheading>
            </PageHeaderTitle>
          </PageHeaderTitleRow>
        </PageHeaderTitleArea>
      </PageHeader>
      <PageBody>
        {children ?? (
          <Table columns={5} variant="plain">
            <TableContent>
              <TableCaption>Itens do ciclo</TableCaption>
              <TableHead>
                <TableRow>
                  <TableColumnHeader>Item</TableColumnHeader>
                  <TableColumnHeader>Título</TableColumnHeader>
                  <TableColumnHeader>Responsável</TableColumnHeader>
                  <TableColumnHeader numeric>Estimativa</TableColumnHeader>
                  <TableColumnHeader>Estado</TableColumnHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {ISSUES.map((issue) => (
                  <TableRow key={issue.id} value={issue.id}>
                    <TableRowHeader>{issue.id}</TableRowHeader>
                    <TableCell>{issue.title}</TableCell>
                    <TableCell>{issue.owner}</TableCell>
                    <TableCell numeric>{issue.estimate}</TableCell>
                    <TableCell>
                      <Tag shape="pill" size="sm" tone={TONE[issue.state]} variant="soft">
                        {issue.state}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContent>
          </Table>
        )}
      </PageBody>
    </Page>
  );
}

/** The whole application: `primary="nav"`, `canvas="flush"`, the column repainted. */
export function Cadence({
  children,
  shell,
  size = 'screen',
}: {
  children?: ReactNode | undefined;
  shell?: Partial<AppShellProps> | undefined;
  size?: 'screen' | 'tall' | undefined;
}) {
  return (
    <Viewport size={size}>
      <AppShell canvas="flush" primary="nav" {...shell}>
        <CadenceNav />
        <CadenceBanner />
        <AppShellMain>{children ?? <CadenceContent />}</AppShellMain>
      </AppShell>
    </Viewport>
  );
}
