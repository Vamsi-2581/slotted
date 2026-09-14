import { CalendarDays, ClipboardList, Pill, Stethoscope, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar } from '../../avatar';
import { Button } from '../../button';
import { Field, FieldLabel } from '../../field';
import { Page, PageBody } from '../../page';
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderSubheading,
  PageHeaderTitle,
  PageHeaderTitleArea,
  PageHeaderTitleRow,
} from '../../page-header';
import { TextField } from '../../text-field';
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
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavFooter,
  AppShellNavHeader,
  AppShellNavToggle,
} from '../index';
import type { AppShellProps } from '../app-shell.types';
import { NavAccount, NavItem, Viewport, Wordmark } from './shared';
import type { Destination } from './shared';

/**
 * Átrio: a clinic's front desk. The navigation on the end of the line and
 * overlaid at every width, the pane on the start holding a form rather than a
 * record, and labels a receptionist reads at arm's length. It is the product
 * that proves the overlay, the mirror and the pane as a layer.
 */

const DESTINATIONS: readonly Destination[] = [
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'utentes', label: 'Utentes', icon: Users },
  { id: 'consultas', label: 'Consultas', icon: Stethoscope, count: 9 },
  { id: 'receitas', label: 'Receitas', icon: Pill },
  { id: 'registos', label: 'Registos clínicos', icon: ClipboardList },
];

interface Slot {
  readonly time: string;
  readonly patient: string;
  readonly kind: string;
}

const AGENDA: readonly Slot[] = [
  { time: '09:00', patient: 'Carlos Amorim', kind: 'Consulta de rotina' },
  { time: '09:30', patient: 'Beatriz Lemos', kind: 'Primeira consulta' },
  { time: '10:00', patient: 'Joana Mesquita', kind: 'Reavaliação' },
  { time: '10:30', patient: '—', kind: 'Vaga' },
  { time: '11:00', patient: 'Tomás Reis', kind: 'Consulta de rotina' },
  { time: '11:30', patient: 'Inês Coutinho', kind: 'Exames' },
  { time: '14:00', patient: '—', kind: 'Vaga' },
  { time: '14:30', patient: 'Helena Sá', kind: 'Consulta de rotina' },
];

export function AtrioNav({ current = 'agenda' }: { current?: string | undefined }) {
  return (
    <AppShellNav className="slotted-demo-nav">
      <AppShellNavHeader>
        <NavAccount
          initials="Á"
          label="Átrio — mudar de unidade"
          name="Clínica do Átrio"
          role="Unidade de Cedofeita"
          shape="square"
          tone="accent"
          variant="solid"
        />
      </AppShellNavHeader>
      <AppShellNavBody>
        {DESTINATIONS.map((item) => (
          <NavItem current={item.id === current} item={item} key={item.id} />
        ))}
      </AppShellNavBody>
      <AppShellNavFooter>
        <NavAccount
          initials="MF"
          label="Marta Figueira — abrir menu da conta"
          name="Marta Figueira"
          role="Receção"
        />
      </AppShellNavFooter>
    </AppShellNav>
  );
}

export function AtrioBanner({ paneToggle = false }: { paneToggle?: boolean | undefined }) {
  return (
    <AppShellBanner>
      <AppShellBrand>
        <Wordmark>Átrio</Wordmark>
      </AppShellBrand>
      <AppShellCentre>
        <span className="slotted-demo-bar-crumbs">
          <span>Agenda</span>
          <span aria-hidden>/</span>
          <span aria-current="page">Terça, 16 de setembro</span>
        </span>
      </AppShellCentre>
      <AppShellActions>
        {paneToggle ? <AppShellAsideToggle /> : null}
        <Avatar size="sm" tone="secondary" variant="soft">
          MF
        </Avatar>
        <AppShellNavToggle />
      </AppShellActions>
    </AppShellBanner>
  );
}

export function AtrioContent({ children }: { children?: ReactNode | undefined }) {
  return (
    <Page landmark="none" scroll="ancestor" width="full">
      <PageHeader level="1" size="md">
        <PageHeaderTitleArea>
          <PageHeaderTitleRow>
            <PageHeaderTitle>
              <PageHeaderHeading>Agenda de terça-feira</PageHeaderHeading>
              <PageHeaderSubheading>9 consultas · 2 vagas · Dr.ª Helena Sá</PageHeaderSubheading>
            </PageHeaderTitle>
          </PageHeaderTitleRow>
        </PageHeaderTitleArea>
      </PageHeader>
      <PageBody>
        {children ?? (
          <dl className="slotted-demo-pane-fields">
            {AGENDA.map((slot) => (
              <Agenda key={slot.time} slot={slot} />
            ))}
          </dl>
        )}
      </PageBody>
    </Page>
  );
}

function Agenda({ slot }: { slot: Slot }) {
  return (
    <>
      <dt>{slot.time}</dt>
      <dd>
        <Text size="sm" tone={slot.patient === '—' ? 'muted' : 'default'} weight="medium">
          {slot.patient === '—' ? 'Vaga' : slot.patient}
        </Text>
        {slot.patient === '—' ? null : (
          <Text size="xs" tone="muted">
            {slot.kind}
          </Text>
        )}
      </dd>
    </>
  );
}

/** The pane as a form: booking the free slot. */
export function AtrioPane() {
  return (
    <AppShellAside>
      <AppShellAsideHeader>
        <span className="slotted-demo-pane-title">Nova consulta · 10:30</span>
        <AppShellAsideToggle />
      </AppShellAsideHeader>
      <AppShellAsideBody>
        <div className="slotted-demo-pane-form">
          <Field>
            <FieldLabel>Utente</FieldLabel>
            <TextField defaultValue="Joana Mesquita" size="md" />
          </Field>
          <Field>
            <FieldLabel>Motivo</FieldLabel>
            <TextField placeholder="Reavaliação, exames, rotina…" size="md" />
          </Field>
          <Field>
            <FieldLabel>Contacto</FieldLabel>
            <TextField defaultValue="+351 912 440 118" inputMode="tel" size="md" />
          </Field>
        </div>
      </AppShellAsideBody>
      <AppShellAsideFooter>
        <Button size="sm" tone="secondary" variant="ghost">
          Cancelar
        </Button>
        <Button size="sm" tone="accent">
          Marcar
        </Button>
      </AppShellAsideFooter>
    </AppShellAside>
  );
}

/** The whole application: navigation at the end and overlaid, pane at the start. */
export function Atrio({
  aside = true,
  children,
  shell,
  size = 'screen',
}: {
  aside?: boolean | undefined;
  children?: ReactNode | undefined;
  shell?: Partial<AppShellProps> | undefined;
  size?: 'screen' | 'tall' | undefined;
}) {
  return (
    <Viewport size={size}>
      <AppShell defaultNavOpen={false} navMode="overlay" navSide="end" {...shell}>
        <AtrioBanner />
        <AtrioNav />
        <AppShellMain>{children ?? <AtrioContent />}</AppShellMain>
        {aside ? <AtrioPane /> : null}
      </AppShell>
    </Viewport>
  );
}
