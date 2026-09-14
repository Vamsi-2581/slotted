import type { ReactNode } from 'react';

import { Inline } from '../inline';
import { Stack } from '../stack';
import { Text } from '../typography';

/**
 * The content a scroll area is demonstrated with: one product, the billing
 * back office the other families already live in, so the page reads as one
 * screen rather than as a bag of specimens. Every measure comes from a family
 * or from the workbench, because a story may not paint inline.
 */

export interface Release {
  readonly version: string;
  readonly area: string;
  readonly note: string;
}

export const RELEASES: readonly Release[] = [
  {
    version: '2026.9.2',
    area: 'Faturação',
    note: 'Uma fatura emitida antes de 1 de setembro mantém as linhas de imposto antigas, e uma nota de crédito sobre ela passa a carregar as mesmas.',
  },
  {
    version: '2026.9.1',
    area: 'Faturação',
    note: 'Uma subscrição que muda de plano a meio do ciclo é rateada ao dia e já não à hora. Sete clientes foram cobrados duas vezes pelo mesmo dia e foram reembolsados.',
  },
  {
    version: '2026.8.29',
    area: 'Acessos',
    note: 'A sessão de início de sessão único expira com a do fornecedor de identidade em vez de ao fim de oito horas fixas.',
  },
  {
    version: '2026.8.22',
    area: 'Exportações',
    note: 'Uma exportação com mais de cinquenta mil linhas é entregue por correio eletrónico em vez de descarregada, e o pedido passa a dizê-lo antes de ser feito.',
  },
  {
    version: '2026.8.15',
    area: 'Relatórios',
    note: 'O relatório mensal passa a incluir as regiões sem consumo, com zero, em vez de as omitir.',
  },
  {
    version: '2026.8.8',
    area: 'Cobranças',
    note: 'Um lembrete de cobrança não é enviado a um cliente cuja fatura está em disputa aberta.',
  },
];

/** A line of its own: `Text` renders a `span`, and a column of spans is one paragraph. */
export function Line({
  children,
  id,
  tone,
  weight,
  wrap,
}: {
  children: ReactNode;
  id?: string | undefined;
  tone?: 'muted' | undefined;
  weight?: 'semibold' | undefined;
  wrap?: 'nowrap' | undefined;
}) {
  return (
    <Text
      id={id}
      render={(props) => <p {...props} />}
      size="sm"
      tone={tone}
      weight={weight}
      wrap={wrap}
    >
      {children}
    </Text>
  );
}

/** The release notes, as the product's own changelog panel lists them. */
export function Notes({ releases = RELEASES }: { releases?: readonly Release[] }) {
  return (
    <Stack gap={4}>
      {releases.map((release) => (
        <Stack gap={1} key={release.version}>
          <Line weight="semibold">
            {release.version} — {release.area}
          </Line>
          <Line tone="muted">{release.note}</Line>
        </Stack>
      ))}
    </Stack>
  );
}

export const REGIONS = [
  'sa-east-1',
  'eu-west-3',
  'eu-central-1',
  'ap-southeast-1',
  'us-east-2',
  'us-west-2',
  'ap-southeast-2',
  'ca-central-1',
  'ap-northeast-1',
] as const;

/** The same regions down the page, for a column a third of the page wide. */
export function RegionList() {
  return (
    <Stack gap={3}>
      {REGIONS.map((region) => (
        <Line key={region}>{region}</Line>
      ))}
    </Stack>
  );
}

/** A row that runs past its box. */
export function Regions() {
  return (
    <Inline gap={5} wrap="nowrap">
      {REGIONS.map((region) => (
        <Line key={region} wrap="nowrap">
          {region}
        </Line>
      ))}
    </Inline>
  );
}

export const LOG = [
  '2026-09-11 14:02 · sa-east-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-sa-east-1.pdf',
  '2026-09-11 14:02 · eu-west-3 · https://billing.example.com/invoices/2026-09/consolidated-statement-eu-west-3.pdf',
  '2026-09-11 14:03 · ap-southeast-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-southeast-1.pdf',
  '2026-09-11 14:03 · us-east-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-us-east-2.pdf',
  '2026-09-11 14:04 · ap-southeast-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-southeast-2.pdf',
  '2026-09-11 14:04 · ca-central-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ca-central-1.pdf',
  '2026-09-11 14:05 · ap-northeast-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-ap-northeast-1.pdf',
  '2026-09-11 14:05 · us-west-2 · https://billing.example.com/invoices/2026-09/consolidated-statement-us-west-2.pdf',
  '2026-09-11 14:06 · eu-central-1 · https://billing.example.com/invoices/2026-09/consolidated-statement-eu-central-1.pdf',
  '2026-09-11 14:06 · sa-east-1 · https://billing.example.com/invoices/2026-08/consolidated-statement-sa-east-1.pdf',
] as const;

/** An export log: lines wider than the box, and more of them than it holds. */
export function Log() {
  return (
    <Stack gap={1}>
      {LOG.map((line) => (
        <Line key={line} tone="muted" wrap="nowrap">
          {line}
        </Line>
      ))}
    </Stack>
  );
}

export const PATHS = [
  'https://billing.example.com/invoices/2026-09/consolidated-statement-sa-east-1.pdf',
  'https://billing.example.com/invoices/2026-09/consolidated-statement-eu-west-3.pdf',
  'https://billing.example.com/invoices/2026-08/consolidated-statement-sa-east-1.pdf',
] as const;

/** Three unbroken tokens. */
export function Paths() {
  return (
    <Stack gap={1}>
      {PATHS.map((path) => (
        <Line key={path} wrap="nowrap">
          {path}
        </Line>
      ))}
    </Stack>
  );
}

export const TRANSLATED =
  'Die Abonnementänderung innerhalb eines Abrechnungszeitraums wird tagesgenau und nicht mehr stundengenau anteilig berechnet. Sieben Kunden wurden zweimal für denselben Tag belastet und haben eine Erstattung erhalten. Die Sitzung der Einmalanmeldung läuft zusammen mit der des Identitätsanbieters ab und nicht mehr nach festen acht Stunden.';
