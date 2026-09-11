import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';
import {
  Collapsible,
  CollapsibleHeader,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '../collapsible';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Link } from '../link';
import { Page, PageBody } from '../page';
import {
  HISTORY,
  LINES,
  OrderFooter,
  OrderHeader,
  OrderLines,
  OrderScreen,
  Viewport,
} from '../page/page-demo';
import { Stack } from '../stack';
import { HeadingLevel, Text } from '../typography';
import { Section } from './section';
import { SectionDefaultsProvider } from './section-defaults';
import {
  SectionActions,
  SectionBody,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionHeading,
  SectionTitle,
} from './section-parts';
import { REACT_SECTION_DOCS, REACT_SECTION_TOKENS } from './section.docs';
import type { SectionProps } from './section.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_SECTION_DOCS.section.scenes, {
    playground: Playground,
    anatomy: Anatomy,
    level: Level,
    size: Size,
    separation: Separation,
    sticky: Sticky,
    nested: Nested,
    content: Content,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Section',
        description:
          'One unit of content inside a page: a header — eyebrow, heading, description, actions — and a body one outline step deeper. A region when it has a heading, a sticky header under the page chrome when asked, and never a card.',
        framework: 'React',
        ...REACT_SECTION_DOCS.section,
        tokens: REACT_SECTION_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

function Items({ children, ...props }: Partial<SectionProps>) {
  return (
    <Section id="itens" {...props}>
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
        {children ?? <OrderLines rows={LINES.slice(0, 8)} sticky={false} />}
      </SectionBody>
    </Section>
  );
}

function Conditions(props: Partial<SectionProps>) {
  return (
    <Section id="condicoes" {...props}>
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
            <DescriptionListDescription>45 dias contra a fatura</DescriptionListDescription>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Frete</DescriptionListTerm>
            <DescriptionListDescription>CIF, por conta do fornecedor</DescriptionListDescription>
          </DescriptionListItem>
        </DescriptionList>
      </SectionBody>
    </Section>
  );
}

export const Playground: Story = {
  args: { divider: true, ground: 'none', level: 'auto', size: 'md', sticky: false },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Viewport>
      <Page>
        <OrderHeader navigation={false} tabs={false} />
        <PageBody>
          <Stack gap={9}>
            <Items {...args}>
              <OrderLines sticky={false} />
            </Items>
            <Conditions {...args} />
          </Stack>
        </PageBody>
      </Page>
    </Viewport>
  ),
};

export const Anatomy: Story = {
  parameters: scenario('anatomy'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Every part, written out"
        note="The eyebrow with the count, the heading at h2 because the page steps the outline, the description under it, two actions at the end of the row, and the body with the first rows of the table."
      >
        <Viewport size="tall">
          <Page>
            <PageBody>
              <Items divider />
            </PageBody>
          </Page>
        </Viewport>
      </Scene>
    </Grid>
  ),
};

function Fleet({ override = false }: { override?: boolean }) {
  return (
    <Section size="lg">
      <SectionHeader>
        <SectionTitle>
          <SectionHeading>Frota</SectionHeading>
          <SectionDescription>A rank the outline gave: h2 inside a page.</SectionDescription>
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <SectionHeading>Veículos pesados</SectionHeading>
              <SectionDescription>One deeper: h3, without being told.</SectionDescription>
            </SectionTitle>
          </SectionHeader>
          <SectionBody>
            <Section level={override ? '5' : 'auto'} size="sm">
              <SectionHeader>
                <SectionTitle>
                  <SectionHeading>Cavalos mecânicos</SectionHeading>
                  <SectionDescription>
                    {override
                      ? 'level="5": the consumer’s word over the outline.'
                      : 'One deeper again: h4.'}
                  </SectionDescription>
                </SectionTitle>
              </SectionHeader>
              <SectionBody>
                <Text size="sm">Scania R 450 · Volvo FH 540 · Mercedes Actros 2651</Text>
              </SectionBody>
            </Section>
          </SectionBody>
        </Section>
      </SectionBody>
    </Section>
  );
}

export const Level: Story = {
  parameters: scenario('level'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The outline decides"
        note="Inside a page body the first section is h2, the one inside it h3, the one inside that h4 — none of them told, because the body of each steps typography’s HeadingLevel."
      >
        <HeadingLevel>
          <Fleet />
        </HeadingLevel>
      </Scene>
      <Scene
        label="level='5' on the innermost"
        note="The consumer’s rank wins over the outline. It skips one, and typography warns in development that h5 under h3 is a hole in the outline — the level rendered is still the one stated."
      >
        <HeadingLevel>
          <Fleet override />
        </HeadingLevel>
      </Scene>
    </Grid>
  ),
};

export const Size: Story = {
  parameters: scenario('size'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="sm"
        note="A group inside a form or a pane: the heading on md, the description on sm, the eyebrow the same xs at every size."
      >
        <Conditions size="sm" />
      </Scene>
      <Scene
        label="md, the default"
        note="A section of a page: the heading on lg. Size says nothing about rank — every one of these is an h1 here, outside a page."
      >
        <Conditions size="md" />
      </Scene>
      <Scene
        label="lg"
        note="The one section a screen is about: the heading on xl, a step under a page header’s own title."
      >
        <Conditions size="lg" />
      </Scene>
    </Grid>
  ),
};

export const Separation: Story = {
  parameters: scenario('separation'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three sections, three separations"
        note="On the sunken canvas: the first separated by the stack’s gap alone, the second by a divider under its header, the third by a surface with an edge and a radius — and no shadow, no hover, because a section is not a card."
      >
        <Viewport>
          <Page>
            <OrderHeader navigation={false} tabs={false} />
            <PageBody>
              <Stack gap={9}>
                <Conditions />
                <Items divider />
                <Section ground="surface" id="historico">
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
            </PageBody>
          </Page>
        </Viewport>
      </Scene>
    </Grid>
  ),
};

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Headers that stay under the page chrome"
        note="Scroll: the page header snaps, then the first section’s header stops under it, and the second pushes the first away. Pin the page header and every section header stops lower — the page publishes where its chrome ends."
      >
        <OrderScreen sticky />
      </Scene>
      <Scene
        label="Without a page"
        note="In a plain scrolling box the property is absent, so the header sticks to the top of the box. The ground it paints falls back to the surface."
      >
        <Viewport size="tall">
          <div className="slotted-demo-page">
            <Items divider sticky>
              <OrderLines rows={LINES.slice(0, 24)} sticky={false} />
            </Items>
          </div>
        </Viewport>
      </Scene>
    </Grid>
  ),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three depths, three ranks"
        note="Frota holds Veículos pesados, which holds Cavalos mecânicos. Each body steps the outline for the next, and every rule the family owns reaches its parts as a child, so the lg heading of the outer styles nothing of the inner."
      >
        <Viewport size="tall">
          <Page ground="surface">
            <PageBody>
              <Fleet />
            </PageBody>
          </Page>
        </Viewport>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A nine-word heading and a long eyebrow"
        note="The heading wraps to two lines and the eyebrow wraps in small capitals; the description keeps its measure of seventy characters and the actions wrap under the title."
      >
        <Section divider>
          <SectionHeader>
            <SectionTitle>
              <SectionEyebrow>
                Anexo IV — Especificações técnicas obrigatórias do contrato
              </SectionEyebrow>
              <SectionHeading>
                Requisitos de homologação, garantia, recapagem e descarte ambientalmente adequado
                dos pneus fornecidos
              </SectionHeading>
              <SectionDescription>
                Der Lieferant gewährleistet die Rückverfolgbarkeit jeder Reifencharge über die
                gesamte Vertragslaufzeit und übernimmt die fachgerechte Entsorgung gemäß den
                geltenden Umweltvorschriften.
              </SectionDescription>
            </SectionTitle>
            <SectionActions>
              <Button size="sm" variant="outline">
                Descarregar anexo
              </Button>
            </SectionActions>
          </SectionHeader>
          <SectionBody>
            <Text size="sm">…</Text>
          </SectionBody>
        </Section>
      </Scene>
      <Scene
        label="The same section in a 360-pixel column, and one with nothing but a body"
        note="The row wraps and the actions take a line of their own. Below it, a section with no header is a plain section: no region, no name, no vacancy where the header would be."
      >
        <Measure>
          <Stack gap={8}>
            <Conditions divider />
            <Section>
              <SectionBody>
                <Text size="sm">Só o corpo. Nenhuma região, nenhum nome.</Text>
              </SectionBody>
            </Section>
          </Stack>
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A table, a collapsible and a description list under one sticky header"
        note="The body steps the outline, so the collapsible’s header is an h3 under the section’s h2. Scroll: the section header stays over all three, and the table’s own column header stops under it."
      >
        <Viewport>
          <Page footer={<OrderFooter />}>
            <OrderHeader navigation={false} tabs={false} />
            <PageBody>
              <Section divider sticky>
                <SectionHeader>
                  <SectionTitle>
                    <SectionEyebrow>{LINES.length} itens</SectionEyebrow>
                    <SectionHeading>Itens e condições</SectionHeading>
                  </SectionTitle>
                </SectionHeader>
                <SectionBody>
                  <Stack gap={6}>
                    <OrderLines rows={LINES.slice(0, 14)} />
                    <Collapsible level="3" variant="framed">
                      <CollapsibleHeader>
                        <CollapsibleTrigger description="4 condições">
                          Condições comerciais
                        </CollapsibleTrigger>
                      </CollapsibleHeader>
                      <CollapsiblePanel>
                        <DescriptionList columns={2}>
                          <DescriptionListItem>
                            <DescriptionListTerm>Prazo de pagamento</DescriptionListTerm>
                            <DescriptionListDescription>
                              45 dias contra a fatura
                            </DescriptionListDescription>
                          </DescriptionListItem>
                          <DescriptionListItem>
                            <DescriptionListTerm>Garantia</DescriptionListTerm>
                            <DescriptionListDescription>
                              24 meses ou 120.000 km
                            </DescriptionListDescription>
                          </DescriptionListItem>
                        </DescriptionList>
                      </CollapsiblePanel>
                    </Collapsible>
                  </Stack>
                </SectionBody>
              </Section>
            </PageBody>
          </Page>
        </Viewport>
      </Scene>
    </Grid>
  ),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Four decisions an application takes once"
        note="The provider carries size, divider, ground and sticky for every section under it. The second section says ground='none' itself and wins."
      >
        <SectionDefaultsProvider divider ground="surface" size="sm">
          <Stack gap={6}>
            <Conditions />
            <Conditions ground="none" />
          </Stack>
        </SectionDefaultsProvider>
      </Scene>
      <Scene
        label="A linked heading, and a hash link to the section"
        note="render turns the heading into a link while the family keeps the rank through role='heading' and aria-level, and the id. The link below reaches the section by hash and lands under the page chrome."
      >
        <Stack gap={6}>
          <Section id="historico-ligado">
            <SectionHeader>
              <SectionTitle>
                <SectionHeading
                  render={(props) => (
                    <Link {...props} href="#historico-ligado">
                      Histórico de aprovações
                    </Link>
                  )}
                >
                  Histórico de aprovações
                </SectionHeading>
              </SectionTitle>
            </SectionHeader>
            <SectionBody>
              <Text size="sm">{HISTORY[0]?.[2]}</Text>
            </SectionBody>
          </Section>
          <Link href="#historico-ligado">Ir ao histórico</Link>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Regions in the landmark list, ranks in the heading list"
        note="Open the landmark list: main, then a region per section named by its heading. Open the heading list: h1 for the order, h2 for each section. Follow the link at the top: the section lands under the chrome, not behind it."
      >
        <Viewport>
          <Page footer={<OrderFooter />}>
            <OrderHeader navigation={false} tabs={false} />
            <PageBody>
              <Stack gap={9}>
                <Text size="sm">
                  <Link href="#historico">Ir ao histórico de aprovações</Link>
                </Text>
                <Items divider>
                  <OrderLines sticky={false} />
                </Items>
                <Conditions divider />
                <Section divider id="historico">
                  <SectionHeader>
                    <SectionTitle>
                      <SectionHeading>Histórico de aprovações</SectionHeading>
                    </SectionTitle>
                  </SectionHeader>
                  <SectionBody>
                    <Stack gap={4}>
                      {HISTORY.map(([when, who, what]) => (
                        <Text key={when} size="sm">
                          {when} · {who} — {what}
                        </Text>
                      ))}
                    </Stack>
                  </SectionBody>
                </Section>
              </Stack>
            </PageBody>
          </Page>
        </Viewport>
      </Scene>
    </Grid>
  ),
};
