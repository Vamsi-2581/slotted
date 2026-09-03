import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlButton } from '@slotted/angular/button';
import { SlText } from '@slotted/angular/typography';
import { SlToolbar } from '@slotted/angular/toolbar';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlTabs } from './tabs';
import type {
  TabsActivation,
  TabsFit,
  TabsMount,
  TabsOrientation,
  TabsSize,
  TabsVariant,
} from './tabs-defaults';
import { SlTab, SlTabActions, SlTabList, SlTabPanel } from './tabs-parts';
import { ANGULAR_TABS_DOCS, ANGULAR_TABS_TOKENS } from './tabs.docs';

interface TabsStoryArgs {
  activation: TabsActivation;
  disabled: boolean;
  fit: TabsFit;
  loop: boolean;
  mount: TabsMount;
  orientation: TabsOrientation;
  size: TabsSize;
  variant: TabsVariant;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TABS_DOCS.tabs.scenes, {
    playground: Playground,
    activation: Activation,
    orientation: Orientation,
    variant: Variant,
    sizes: Sizes,
    fit: Fit,
    states: States,
    mount: Mount,
    dismissible: Dismissible,
    overflow: Overflow,
    links: Links,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta: Meta<TabsStoryArgs> = {
  title: 'Components/Tabs',
  decorators: [
    moduleMetadata({
      imports: [SlTabs, SlTabList, SlTab, SlTabPanel, SlTabActions, SlText, SlButton, SlToolbar],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Tabs',
        description:
          'One view out of several, and the panels under it. The APG’s whole keyboard table, a marker that moves without a layout read, tabs a reader can close, and a list that scrolls rather than truncating.',
        framework: 'Angular',
        ...ANGULAR_TABS_DOCS.tabs,
        tokens: ANGULAR_TABS_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<TabsStoryArgs>;

const ORDER = `<div slTabList aria-label="Pedido">
    <div slTab value="resumo">Resumo</div>
    <div slTab value="itens">Itens</div>
    <div slTab value="pagamento">Pagamento</div>
  </div>
  <div slTabPanel value="resumo"><p slText size="sm">Entrega prevista para 12 de setembro.</p></div>
  <div slTabPanel value="itens"><p slText size="sm">Três itens, dois em separação.</p></div>
  <div slTabPanel value="pagamento"><p slText size="sm">Cartão de crédito, aprovado.</p></div>`;

const scene = (label: string, note: string, body: string, layout = 'block') =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${scenes}</div>`;

export const Playground: Story = {
  args: {
    activation: 'automatic',
    disabled: false,
    fit: 'auto',
    loop: true,
    mount: 'active',
    orientation: 'horizontal',
    size: 'md',
    variant: 'line',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `<div class="slotted-demo-stage" data-layout="block">
      <div
        slTabs
        defaultValue="resumo"
        [activation]="activation"
        [orientation]="orientation"
        [size]="size"
        [variant]="variant"
        [fit]="fit"
        [mount]="mount"
        [loop]="loop"
        [disabled]="disabled"
      >${ORDER}</div>
    </div>`,
  }),
};

export const Activation: Story = {
  parameters: scenario('activation'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Automatic, the default',
        'Arrow along the list: every tab opens as focus reaches it, which is what the APG recommends while the panels are already loaded.',
        `<div slTabs defaultValue="resumo">${ORDER}</div>`,
      ) +
        scene(
          'Manual, for a panel that fetches',
          'Focus moves and the panel stays; Enter or Space opens the one focus is on, so arrowing past four tabs makes no four requests.',
          `<div slTabs defaultValue="resumo" activation="manual">${ORDER}</div>`,
        ),
    ),
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A row of views',
        'The track runs under the whole list and the marker sits on it, so the selected label and the edge of the panel are one line.',
        `<div slTabs defaultValue="resumo">${ORDER}</div>`,
      ) +
        scene(
          'A column of them',
          'The track and the marker turn a quarter, the labels read down their own start edge, and the panel takes the second column.',
          `<div slTabs defaultValue="resumo" orientation="vertical">${ORDER}</div>`,
        ),
    ),
  }),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => ({
    template: grid(
      3,
      scene(
        'Line',
        'A row of labels over a hairline. The marker covers the track exactly, so the two lines read as one that thickens where the selection is.',
        `<div slTabs defaultValue="resumo">${ORDER}</div>`,
      ) +
        scene(
          'Contained',
          'A sunken track that hugs its tabs, with a surface under the selected one. The marker stays, which is what the high-contrast scheme is left with.',
          `<div slTabs defaultValue="resumo" variant="contained">${ORDER}</div>`,
        ) +
        scene(
          'track="none", for a line that is already there',
          "The labels and the marker stay and the hairline goes, so a list sitting on a card header's edge or a table's own rule draws one line instead of two a pixel apart.",
          `<div slTabs defaultValue="resumo" track="none">${ORDER}</div>`,
        ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      3,
      scene(
        'sm',
        'The compact step, for a bar inside a card header or above a dense table.',
        `<div slTabs defaultValue="resumo" size="sm">${ORDER}</div>`,
      ) +
        scene(
          'md',
          'The default, and the step a page-level set of views sits at.',
          `<div slTabs defaultValue="resumo" size="md">${ORDER}</div>`,
        ) +
        scene(
          'lg',
          'The comfortable step. Height, type and padding move together, because all three read the control scales.',
          `<div slTabs defaultValue="resumo" size="lg">${ORDER}</div>`,
        ),
    ),
  }),
};

export const Fit: Story = {
  parameters: scenario('fit'),
  render: () => ({
    template: grid(
      2,
      scene(
        'auto — as wide as the label',
        'Each tab is the width of what it says, and a list that outgrows its container scrolls rather than squeezing every label.',
        `<div slTabs defaultValue="resumo">${ORDER}</div>`,
      ) +
        scene(
          'equal — a share of the line',
          "Angular Material's stretchTabs and Carbon's grid-aware alignment: equal columns, so the length of a translated string never decides the emphasis.",
          `<div slTabs defaultValue="a" fit="equal" variant="contained">
            <div slTabList aria-label="Relatórios">
              <div slTab value="a">Hoje</div>
              <div slTab value="b">Uma etiqueta longa que precisa ser cortada</div>
            </div>
            <div slTabPanel value="a"><p slText size="sm">Partes iguais da linha.</p></div>
            <div slTabPanel value="b"><p slText size="sm">A etiqueta é o que cede.</p></div>
          </div>`,
        ),
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    template: grid(
      2,
      scene(
        'One view out of reach',
        'A single unavailable tab carries the native attribute, so it dims, refuses its click and is skipped by the arrow keys — three behaviours from one word.',
        `<div slTabs defaultValue="a">
          <div slTabList aria-label="Documento">
            <div slTab value="a">Conteúdo</div>
            <div slTab value="b" disabled>Assinaturas</div>
            <div slTab value="c">Histórico</div>
          </div>
          <div slTabPanel value="a">
            <p slText size="sm">Assinaturas ficam disponíveis após o envio.</p>
          </div>
        </div>`,
      ) +
        scene(
          'The whole family, while a job runs',
          'One attribute reaches every tab and the track dims with them, so a family waiting on a server does not read as a live one with grey labels.',
          `<div slTabs defaultValue="resumo" disabled>${ORDER}</div>`,
        ),
    ),
  }),
};

export const Mount: Story = {
  parameters: scenario('mount'),
  render: () => ({
    template: grid(
      3,
      scene(
        'active — the default',
        'Only the selected panel exists. A panel holding a table, a chart or a form is not built until it is asked for.',
        `<div slTabs defaultValue="resumo" mount="active">${ORDER}</div>`,
      ) +
        scene(
          'lazy — built once, then kept',
          'A panel survives its first selection, so a form half filled in is still there when the reader comes back to it.',
          `<div slTabs defaultValue="resumo" mount="lazy">${ORDER}</div>`,
        ) +
        scene(
          'eager — every panel up front',
          'All three exist from the start and the hidden ones carry the hidden attribute, which find-in-page understands.',
          `<div slTabs defaultValue="resumo" mount="eager">${ORDER}</div>`,
        ),
    ),
  }),
};

export const Dismissible: Story = {
  parameters: scenario('dismissible'),
  render: () => ({
    props: {
      queries: ['clientes.sql', 'faturamento.sql', 'estoque.sql'],
      active: 'clientes.sql',
      close(this: { queries: string[]; active: string }, value: string) {
        this.queries = this.queries.filter((query) => query !== value);
      },
      select(this: { active: string }, value: string) {
        this.active = value;
      },
    },
    template: grid(
      1,
      scene(
        'Close one, and the neighbour takes over',
        'Press Delete on a tab, or its control with the pointer. The family asks to close and asks for the neighbour — the following tab, or the preceding one when the closed tab was last — and removes nothing itself.',
        `<div
          slTabs
          [value]="active"
          (valueChange)="select($event.value)"
          (tabDismiss)="close($event.value)"
        >
          <div slTabList aria-label="Consultas abertas">
            @for (query of queries; track query) {
              <div slTab [value]="query" dismissible [dismissLabel]="'Fechar ' + query">
                {{ query }}
              </div>
            }
          </div>
          <div slTabPanel [value]="active"><p slText size="sm">select * from {{ active }};</p></div>
        </div>`,
      ),
    ),
  }),
};

export const Overflow: Story = {
  parameters: scenario('overflow'),
  render: () => ({
    props: { versions: Array.from({ length: 12 }, (_, index) => `Versão ${index + 1}`) },
    template: grid(
      2,
      scene(
        'Twelve views in a narrow column',
        'The list scrolls rather than wrapping, the two paging controls appear only while there is somewhere to scroll, and each one disables at its own end.',
        `<div class="slotted-demo-measure">
          <div slTabs [defaultValue]="versions[0]" size="sm">
            <div slTabList aria-label="Versões">
              @for (version of versions; track version) {
                <div slTab [value]="version">{{ version }}</div>
              }
            </div>
            <div slTabPanel [value]="versions[0]">
              <p slText size="sm">Publicada em 12 de setembro.</p>
            </div>
          </div>
        </div>`,
      ) +
        scene(
          'The keyboard reaches what the eye cannot',
          'Arrow to the end of the list: the browser brings each tab into view as focus lands on it, which is why the paging controls stay out of the tab sequence.',
          `<div class="slotted-demo-measure">
          <div slTabs [defaultValue]="versions[0]" size="sm" activation="manual">
            <div slTabList aria-label="Versões, ativação manual">
              @for (version of versions; track version) {
                <div slTab [value]="version">{{ version }}</div>
              }
            </div>
            <div slTabPanel [value]="versions[0]">
              <p slText size="sm">Enter abre a versão em foco.</p>
            </div>
          </div>
        </div>`,
        ),
    ),
  }),
};

export const Links: Story = {
  parameters: scenario('links'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A destination, not a decoration',
        'Each tab is an anchor with a real href: a plain click selects the view, and ⌘-click or middle-click opens it in a new browser tab, because the family leaves a modified click to the browser.',
        `<div slTabs defaultValue="resumo">
          <div slTabList aria-label="Pedido, com destino">
            <div slTab value="resumo" href="#resumo">Resumo</div>
            <div slTab value="itens" href="#itens">Itens</div>
            <div slTab value="pagamento" href="#pagamento">Pagamento</div>
          </div>
          <div slTabPanel value="resumo">
            <p slText size="sm">O endereço da barra acompanha a vista.</p>
          </div>
          <div slTabPanel value="itens"><p slText size="sm">Três itens.</p></div>
          <div slTabPanel value="pagamento"><p slText size="sm">Cartão de crédito.</p></div>
        </div>`,
      ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Content the family did not choose',
        'An unbroken digest scrolls with the list instead of setting its width, and a right-to-left label reads its own way inside a page that reads the other.',
        `<div class="slotted-demo-measure">
          <div slTabs defaultValue="a" size="sm">
            <div slTabList aria-label="Conteúdo extremo">
              <div slTab value="a">sha256:9f86d081884c7d659a2feaa0c55ad015</div>
              <div slTab value="b">بيانات التسليم</div>
              <div slTab value="c">Relatório consolidado</div>
            </div>
            <div slTabPanel value="a">
              <p slText size="sm">
                sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
              </p>
            </div>
          </div>
        </div>`,
      ) +
        scene(
          'A label with a count',
          "The tab is a row with its own gap, so anything composed into it sits on the label's optical line rather than on the box's.",
          `<div slTabs defaultValue="abertos">
          <div slTabList aria-label="Chamados">
            <div slTab value="abertos">Abertos · 12</div>
            <div slTab value="fechados">Fechados · 340</div>
          </div>
          <div slTabPanel value="abertos">
            <p slText size="sm">Doze chamados aguardando triagem.</p>
          </div>
          <div slTabPanel value="fechados">
            <p slText size="sm">Trezentos e quarenta encerrados.</p>
          </div>
        </div>`,
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A family that states its own axes',
        'The provider carries the seven decisions an application takes once, in the bootstrap file; a family that states one itself still wins, which is what this compact contained set is.',
        `<div slTabs defaultValue="resumo" size="sm" variant="contained">${ORDER}</div>`,
      ) +
        scene(
          'A toolbar beside the list',
          'The actions slot is a cell of the same grid row, and what belongs in it is a toolbar: one tab stop for however many actions, which keeps the distance from the list to the panel at two stops.',
          `<div slTabs defaultValue="resumo">
          <div slTabList aria-label="Pedido, com ações">
            <div slTab value="resumo">Resumo</div>
            <div slTab value="itens">Itens</div>
          </div>
          <div slTabActions>
            <div slToolbar aria-label="Ações do pedido" size="sm">
              <button slButton size="sm" variant="ghost">Exportar</button>
              <button slButton size="sm" variant="ghost">Imprimir</button>
            </div>
          </div>
          <div slTabPanel value="resumo">
            <p slText size="sm">Entrega prevista para 12 de setembro.</p>
          </div>
          <div slTabPanel value="itens"><p slText size="sm">Três itens.</p></div>
        </div>`,
        ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { reason: '—' },
    template: grid(
      2,
      scene(
        'One tab stop for the whole list',
        'Tab lands on the selected tab and the next Tab leaves to the panel; the arrows move and wrap, and Home and End reach the ends. No key listener exists for activation.',
        `<div slTabs defaultValue="itens">${ORDER}</div>`,
        'stack',
      ) +
        scene(
          'Which device asked',
          'A click synthesised by the keyboard reports no detail and a real one reports the click count, which is how the reason is recovered without a key listener anywhere.',
          `<div slTabs defaultValue="a" (valueChange)="reason = $event.reason">
            <div slTabList aria-label="Qual dispositivo pediu">
              <div slTab value="a">Com o ponteiro</div>
              <div slTab value="b">Depois com as setas</div>
              <div slTab value="c">E de volta</div>
            </div>
            <div slTabPanel value="a"><p slText size="sm">Clique, depois use as setas.</p></div>
            <div slTabPanel value="b"><p slText size="sm">A razão muda com o dispositivo.</p></div>
            <div slTabPanel value="c"><p slText size="sm">E volta a mudar.</p></div>
          </div>
          <p slText size="sm" tone="muted">reason: {{ reason }}</p>`,
          'stack',
        ),
    ),
  }),
};
