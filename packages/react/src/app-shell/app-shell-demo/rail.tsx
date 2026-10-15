import {
  BadgeCheck,
  Banknote,
  ChartNoAxesColumn,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  Truck,
  Undo2,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '../../avatar';
import { IconButton } from '../../button';
import { Text } from '../../typography';
import { AppShell } from '../app-shell';
import {
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavFooter,
  AppShellNavHeader,
  AppShellNavRail,
  AppShellNavToggle,
} from '../app-shell-parts';
import type { AppShellProps } from '../app-shell.types';
import { AuroraBanner, AuroraContent, AuroraPane } from './aurora';
import { NavAccount, NavColumn, Viewport } from './shared';
import type { Glyph, NavSection } from './shared';

/**
 * Aurora with a navigation of two levels: the modules in a strip of marks, the
 * destinations of the module in the column beside it. One `nav`, one open
 * state: closing the region keeps the strip, and the column goes.
 */

interface Module {
  readonly id: string;
  readonly label: string;
  readonly icon: Glyph;
  readonly sections: readonly NavSection[];
}

const MODULES: readonly Module[] = [
  {
    id: 'operacao',
    label: 'Operação',
    icon: Truck,
    sections: [
      {
        items: [
          { id: 'painel', label: 'Painel', icon: LayoutDashboard },
          { id: 'expedicoes', label: 'Expedições', icon: Truck, count: 19 },
          { id: 'encomendas', label: 'Encomendas', icon: Package, count: 412 },
        ],
      },
      {
        label: 'Armazém',
        items: [
          { id: 'armazens', label: 'Armazéns', icon: Warehouse },
          { id: 'devolucoes', label: 'Devoluções', icon: Undo2, count: 4, tone: 'accent' },
          { id: 'inventario', label: 'Inventário', icon: ClipboardList },
        ],
      },
    ],
  },
  {
    id: 'financas',
    label: 'Finanças',
    icon: Wallet,
    sections: [
      {
        items: [
          { id: 'faturacao', label: 'Faturação', icon: FileText, count: 7 },
          { id: 'recebimentos', label: 'Recebimentos', icon: Banknote },
          { id: 'reembolsos', label: 'Reembolsos', icon: RotateCcw, count: 2 },
          { id: 'despesas', label: 'Despesas', icon: Receipt },
        ],
      },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    sections: [
      {
        items: [
          { id: 'contas', label: 'Contas', icon: Users, count: 86 },
          { id: 'contratos', label: 'Contratos', icon: Handshake },
          { id: 'qualidade', label: 'Qualidade', icon: BadgeCheck },
        ],
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: ChartNoAxesColumn,
    sections: [
      {
        items: [
          { id: 'desempenho', label: 'Desempenho', icon: ChartNoAxesColumn },
          { id: 'margens', label: 'Margens', icon: Wallet },
        ],
      },
    ],
  },
];

/**
 * The region: the strip of modules, and the column of the module the reader is
 * in. The control that moves the region stands at the foot of the strip, the
 * one part of the region that survives closing it.
 */
export function RailNav({
  current = 'operacao',
  onModuleChange,
}: {
  current?: string | undefined;
  onModuleChange?: ((id: string) => void) | undefined;
}) {
  const active = MODULES.find((item) => item.id === current) ?? MODULES[0]!;
  const destination = active.id === 'operacao' ? 'encomendas' : active.sections[0]?.items[0]?.id;

  return (
    <AppShellNav className="slotted-demo-nav">
      <AppShellNavRail aria-label="Módulos">
        <Avatar shape="square" size="sm" tone="accent" variant="solid">
          AL
        </Avatar>
        {MODULES.map((item) => {
          const Mark = item.icon;
          const here = item.id === active.id;
          return (
            <IconButton
              aria-current={here ? 'true' : undefined}
              aria-label={item.label}
              key={item.id}
              onClick={() => onModuleChange?.(item.id)}
              size="md"
              tone="secondary"
              variant={here ? 'solid' : 'ghost'}
            >
              <Mark aria-hidden size={16} />
            </IconButton>
          );
        })}
        <span className="slotted-demo-rail-end">
          <IconButton aria-label="Definições" size="md" tone="secondary" variant="ghost">
            <Settings aria-hidden size={16} />
          </IconButton>
          <AppShellNavToggle />
        </span>
      </AppShellNavRail>
      <AppShellNavHeader>
        <span className="slotted-demo-rail-title">
          <Text size="sm" weight="semibold">
            {active.label}
          </Text>
          <Text size="xs" tone="muted">
            Aurora Logística · Porto
          </Text>
        </span>
      </AppShellNavHeader>
      <AppShellNavBody>
        <NavColumn current={destination} sections={active.sections} />
      </AppShellNavBody>
      <AppShellNavFooter>
        <NavAccount
          initials="AB"
          label="Ana Beltrão — abrir menu da conta"
          name="Ana Beltrão"
          role="Coordenadora"
        />
      </AppShellNavFooter>
    </AppShellNav>
  );
}

/**
 * The whole application with a two-level navigation. The module the reader is
 * in is the product's state; the shell holds only whether the region is open.
 */
export function AuroraRail({
  aside = false,
  shell,
}: {
  aside?: boolean | undefined;
  shell?: Partial<AppShellProps> | undefined;
}) {
  const [active, setActive] = useState('operacao');
  const primary = shell?.primary ?? 'main';
  return (
    <Viewport>
      <AppShell asideMode="inline" navMode="inline" primary={primary} {...shell}>
        <AuroraBanner toggle={false} wordmark={primary === 'banner'} />
        <RailNav current={active} onModuleChange={setActive} />
        <AppShellMain>
          <AuroraContent />
        </AppShellMain>
        {aside ? <AuroraPane /> : null}
      </AppShell>
    </Viewport>
  );
}
