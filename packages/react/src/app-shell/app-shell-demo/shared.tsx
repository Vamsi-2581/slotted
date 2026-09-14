import { ChevronsUpDown } from 'lucide-react';
import { Fragment } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { Avatar } from '../../avatar';
import { Badge } from '../../badge';
import { Text } from '../../typography';
import {
  AppShell,
  AppShellActions,
  AppShellAside,
  AppShellAsideBody,
  AppShellAsideFooter,
  AppShellAsideHeader,
  AppShellAsideToggle,
  AppShellBanner,
  AppShellBrand,
  AppShellCentre,
  AppShellFooter,
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavFooter,
  AppShellNavHeader,
  AppShellNavToggle,
} from '../index';

/**
 * What every product on the reference page is built from. The shell publishes
 * the geometry of a row; these read it and draw what `side-navigation` and
 * `top-navigation` will draw in wave 8, so the page shows the region holding a
 * product rather than pretending the missing families are there.
 */

export const MONEY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export type Glyph = ComponentType<{ size?: number | string; 'aria-hidden'?: boolean }>;

/** A shell owns a screen, so every scene stands in a window the height of one. */
export function Viewport({
  children,
  size = 'screen',
}: {
  children: ReactNode;
  size?: 'screen' | 'tall' | undefined;
}) {
  return (
    <div className="slotted-demo-viewport" data-frame="window" data-layout="page" data-size={size}>
      {children}
    </div>
  );
}

export interface Destination {
  readonly id: string;
  readonly label: string;
  readonly icon: Glyph;
  readonly count?: number;
  readonly tone?: 'accent' | 'secondary';
}

/** A destination: a link, its mark, its label, and a count where a product has one. */
export function NavItem({ current, item }: { current?: boolean | undefined; item: Destination }) {
  const Icon = item.icon;
  return (
    <a
      aria-current={current === true ? 'page' : undefined}
      className="slotted-demo-nav-item"
      href={`#${item.id}`}
    >
      <span className="slotted-demo-nav-item__mark">
        <Icon aria-hidden size={16} />
      </span>
      <span className="slotted-demo-nav-item__label">{item.label}</span>
      {item.count === undefined ? null : (
        <Badge
          className="slotted-demo-nav-item__count"
          size="sm"
          tone={item.tone ?? 'secondary'}
          variant={item.tone === 'accent' ? 'solid' : 'soft'}
        >
          {item.count}
        </Badge>
      )}
    </a>
  );
}

/** The heading over a run of destinations. */
export function NavGroup({ children }: { children: ReactNode }) {
  return (
    <Text className="slotted-demo-nav-group" render={(props) => <p {...props} />} size="xs">
      {children}
    </Text>
  );
}

/**
 * A two-line row pinned at either end of the column: the workspace at the top,
 * the person at the bottom. Both are pressable, because both open something.
 */
export function NavAccount({
  initials,
  label,
  name,
  role,
  shape = 'circle',
  tone = 'secondary',
  variant = 'soft',
}: {
  initials: string;
  label: string;
  name: string;
  role: string;
  shape?: 'circle' | 'square' | undefined;
  tone?: 'accent' | 'secondary' | undefined;
  variant?: 'soft' | 'solid' | undefined;
}) {
  return (
    <button
      aria-label={label}
      className="slotted-demo-nav-brand slotted-demo-nav-account"
      type="button"
    >
      <span className="slotted-demo-nav-item__mark">
        <Avatar shape={shape} size="sm" tone={tone} variant={variant}>
          {initials}
        </Avatar>
      </span>
      <span className="slotted-demo-nav-aside">
        <Text size="sm" tone="default" weight="medium">
          {name}
        </Text>
        <Text size="xs" tone="muted">
          {role}
        </Text>
      </span>
      <span className="slotted-demo-nav-account__more">
        <ChevronsUpDown aria-hidden size={14} />
      </span>
    </button>
  );
}

/** The application's name beside its mark, in the bar. */
export function Wordmark({ children }: { children: ReactNode }) {
  return <span className="slotted-demo-bar-wordmark">{children}</span>;
}

/** A record's fields, on the pane's own inset. */
export function PaneFields({ fields }: { fields: readonly (readonly [string, ReactNode])[] }) {
  return (
    <dl className="slotted-demo-pane-fields">
      {fields.map(([term, value]) => (
        <Fragment key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

/** A part drawn as its own name, for the scene that shows the frame empty. */
export function Slot({ fill = true, note, part }: { fill?: boolean; note: string; part: string }) {
  return (
    <span className="slotted-demo-slot" {...(fill ? { 'data-fill': '' } : {})}>
      <span>{`[data-part="${part}"]`}</span>
      <span className="slotted-demo-slot__note">{note}</span>
    </span>
  );
}

/**
 * The frame with no product in it: every part the contract declares, drawn as
 * its own name. Every other scene puts a product in these boxes, and a reader
 * then has no way to tell the family's box from the product's furniture.
 */
export function Anatomy() {
  return (
    <Viewport>
      <AppShell asideMode="inline" navMode="inline">
        <AppShellBanner>
          <AppShellBrand>
            <AppShellNavToggle />
            <Slot fill={false} note="a marca" part="brand" />
          </AppShellBrand>
          <AppShellCentre>
            <Slot note="o que cresce: procura, trilho, título" part="centre" />
          </AppShellCentre>
          <AppShellActions>
            <Slot fill={false} note="o que é global" part="actions" />
          </AppShellActions>
        </AppShellBanner>
        <AppShellNav>
          <AppShellNavHeader>
            <Slot note="o espaço de trabalho" part="nav-header" />
          </AppShellNavHeader>
          <AppShellNavBody>
            <Slot note="os destinos, e o que rola" part="nav-body" />
          </AppShellNavBody>
          <AppShellNavFooter>
            <Slot note="a conta" part="nav-footer" />
          </AppShellNavFooter>
        </AppShellNav>
        <AppShellMain>
          <Slot note="a rota" part="main" />
        </AppShellMain>
        <AppShellAside>
          <AppShellAsideHeader>
            <Slot fill={false} note="o título do painel" part="aside-header" />
            <AppShellAsideToggle />
          </AppShellAsideHeader>
          <AppShellAsideBody>
            <Slot note="o painel, e o que rola" part="aside-body" />
          </AppShellAsideBody>
          <AppShellAsideFooter>
            <Slot fill={false} note="as ações do painel" part="aside-footer" />
          </AppShellAsideFooter>
        </AppShellAside>
        <AppShellFooter>
          <Slot note="o rodapé da aplicação" part="footer" />
        </AppShellFooter>
      </AppShell>
    </Viewport>
  );
}
