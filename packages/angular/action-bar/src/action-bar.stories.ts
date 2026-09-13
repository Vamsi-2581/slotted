import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlButton } from '@slotted/angular/button';
import { SlInlineMessage } from '@slotted/angular/inline-message';
import { SlMenuItem } from '@slotted/angular/menu';
import { SlStatusIndicator } from '@slotted/angular/status-indicator';
import { SlText } from '@slotted/angular/typography';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import {
  SlActionBar,
  SlActionBarAction,
  SlActionBarActions,
  SlActionBarSeparator,
  SlActionBarStatus,
} from './action-bar';
import type { ActionBarAlign, ActionBarSize, ActionBarVariant } from './action-bar-defaults';
import { SlActionBarOverflow } from './action-bar-overflow';
import { ANGULAR_ACTION_BAR_DOCS, ANGULAR_ACTION_BAR_TOKENS } from './action-bar.docs';

interface ActionBarStoryArgs {
  align: ActionBarAlign;
  present: boolean;
  size: ActionBarSize;
  sticky: boolean;
  variant: ActionBarVariant;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_ACTION_BAR_DOCS.actionBar.scenes, {
    playground: Playground,
    priority: Priority,
    overflowMenu: OverflowMenu,
    stability: Stability,
    danger: Danger,
    status: Status,
    bulk: Bulk,
    sticky: Sticky,
    align: Align,
    sizes: Sizes,
    variant: Variant,
    stacked: Stacked,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<ActionBarStoryArgs> = {
  title: 'Components/ActionBar',
  decorators: [
    moduleMetadata({
      imports: [
        SlActionBar,
        SlActionBarAction,
        SlActionBarActions,
        SlActionBarOverflow,
        SlActionBarSeparator,
        SlActionBarStatus,
        SlButton,
        SlInlineMessage,
        SlMenuItem,
        SlStatusIndicator,
        SlText,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'ActionBar',
        description:
          'The actions that finish a task on a page or in a panel. What gives way is decided by rank rather than by position, the action that confirms never moves, and a sticky bar stops above the page’s own chrome instead of covering it.',
        framework: 'Angular',
        ...ANGULAR_ACTION_BAR_DOCS.actionBar,
        tokens: ANGULAR_ACTION_BAR_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<ActionBarStoryArgs>;

const scene = (label: string, note: string, body: string) =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${scenes}</div>`;

const narrow = (body: string) => `<div class="slotted-demo-measure">${body}</div>`;

/** The bar a purchase order waiting for approval actually has. */
const ORDER = (attributes = '') => `<footer slActionBar aria-label="Ações do pedido" ${attributes}>
  <div slActionBarStatus>Rascunho guardado às 14:07</div>
  <div slActionBarActions>
    <div slActionBarAction>
      <button slButton variant="ghost" tone="secondary" type="button">Cancelar</button>
    </div>
    <div slActionBarAction>
      <button slButton type="button">Submeter para aprovação</button>
    </div>
  </div>
</footer>`;

const RANKED = `<div slActionBarActions>
  <div slActionBarAction="hide">
    <button slButton variant="ghost" tone="secondary" type="button">Pré-visualizar</button>
  </div>
  <div slActionBarAction [slActionBarActionCounterpart]="duplicate">
    <button slButton variant="ghost" tone="secondary" type="button">Duplicar</button>
  </div>
  <div slActionBarAction="high" [slActionBarActionCounterpart]="send">
    <button slButton variant="outline" tone="secondary" type="button">Devolver</button>
  </div>
  <div slActionBarAction>
    <button slButton type="button">Aprovar</button>
  </div>
  <sl-action-bar-overflow />
</div>`;

const COUNTERPARTS = `<ng-template #duplicate><button slMenuItem type="button">Duplicar</button></ng-template>
<ng-template #send><button slMenuItem type="button">Devolver</button></ng-template>
<ng-template #history><button slMenuItem type="button">Ver histórico</button></ng-template>
<ng-template #exportPdf><button slMenuItem type="button">Exportar PDF</button></ng-template>
<ng-template #exported><button slMenuItem type="button">Exportar</button></ng-template>
<ng-template #reassign><button slMenuItem type="button">Reatribuir</button></ng-template>`;

export const Playground: Story = {
  args: {
    align: 'end',
    present: true,
    size: 'md',
    sticky: false,
    variant: 'raised',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `<div class="slotted-demo-stage" data-layout="block">
      <footer
        slActionBar
        aria-label="Ações do pedido"
        [variant]="variant"
        [size]="size"
        [align]="align"
        [sticky]="sticky"
        [present]="present"
      >
        <div slActionBarStatus>Rascunho guardado às 14:07</div>
        <div slActionBarActions>
          <div slActionBarAction>
            <button slButton variant="ghost" tone="secondary" type="button">Cancelar</button>
          </div>
          <div slActionBarAction>
            <button slButton type="button">Submeter para aprovação</button>
          </div>
        </div>
      </footer>
    </div>`,
  }),
};

export const Priority: Story = {
  parameters: scenario('priority'),
  render: () => ({
    template:
      grid(
        1,
        scene(
          'Room for all four',
          'Nothing has given way, so the control that holds the surface is not drawn at all — a mark announcing an empty menu is a mark that lies.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
            <div slActionBarStatus>Rascunho guardado às 14:07</div>
            ${RANKED}
          </footer>`,
        ) +
          scene(
            'The same four ranks in a narrower box',
            'hide went without a trace, low became a menu row, high followed it, and Aprovar is where it was. Giving way from the end would have taken Aprovar first, which is why a bar of actions ranks rather than counts positions.',
            narrow(
              `<footer slActionBar aria-label="Ações do pedido" variant="raised">${RANKED}</footer>`,
            ),
          ),
      ) + COUNTERPARTS,
  }),
};

export const OverflowMenu: Story = {
  parameters: scenario('overflowMenu'),
  render: () => ({
    props: { count: (hidden: number) => `Mais ${hidden} ações` },
    template:
      grid(
        1,
        scene(
          'An action that is only ever in the menu',
          'always is never drawn in the bar, so the control that holds the surface is drawn even though everything fits. Open it: the history entry is there beside whatever else gave way.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
            <div slActionBarStatus>Aprovado por Marta Ribeiro em 11/09</div>
            <div slActionBarActions>
              <div slActionBarAction="always" [slActionBarActionCounterpart]="history">
                <button slButton variant="ghost" tone="secondary" type="button">Ver histórico</button>
              </div>
              <div slActionBarAction="always" [slActionBarActionCounterpart]="exportPdf">
                <button slButton variant="ghost" tone="secondary" type="button">Exportar PDF</button>
              </div>
              <div slActionBarAction>
                <button slButton type="button">Emitir fatura</button>
              </div>
              <sl-action-bar-overflow />
            </div>
          </footer>`,
        ) +
          scene(
            'A sentence instead of a count',
            'The default name counts in English; an application in another language replaces the whole sentence rather than translating three dots.',
            `<footer slActionBar aria-label="Ações do pedido" variant="raised">
            <div slActionBarActions>
              <div slActionBarAction="always" [slActionBarActionCounterpart]="history">
                <button slButton variant="ghost" tone="secondary" type="button">Ver histórico</button>
              </div>
              <div slActionBarAction>
                <button slButton type="button">Emitir fatura</button>
              </div>
              <sl-action-bar-overflow [label]="count" />
            </div>
          </footer>`,
          ),
      ) + COUNTERPARTS,
  }),
};

export const Stability: Story = {
  parameters: scenario('stability'),
  render: () => ({
    template: grid(
      1,
      scene(
        'No message',
        'Read the right edge of all four bars below: Aprovar is on the same pixel in every one of them.',
        `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Devolver</button>
            </div>
            <div slActionBarAction><button slButton type="button">Aprovar</button></div>
          </div>
        </footer>`,
      ) +
        scene(
          'A message arrives',
          'The status takes the room that was empty. Nothing in the run moved, because the run is anchored to the bar’s edge rather than placed beside its neighbour.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>3 alterações por guardar</div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Devolver</button>
            </div>
            <div slActionBarAction><button slButton type="button">Aprovar</button></div>
          </div>
        </footer>`,
        ) +
        scene(
          'A message that fills the bar',
          'The status wraps to a second line rather than pushing the run off the end. A long sentence changes the bar’s height and never its right edge.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>
            Este pedido excede o limite de aprovação do centro de custo 4120 e segue para o diretor
            financeiro depois de si
          </div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Devolver</button>
            </div>
            <div slActionBarAction><button slButton type="button">Aprovar</button></div>
          </div>
        </footer>`,
        ) +
        scene(
          'A permission filter removes one, and the other is busy',
          'Devolver is gone and Aprovar is mid-flight — it keeps its label and its width under loading, which is Button’s own rule. The action that confirms is still on the same pixel.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>3 alterações por guardar</div>
          <div slActionBarActions>
            <div slActionBarAction><button slButton loading type="button">Aprovar</button></div>
          </div>
        </footer>`,
        ),
    ),
  }),
};

export const Danger: Story = {
  parameters: scenario('danger'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A destructive action beside two frequent ones',
        'The rule is half a gap on each side, which is wider than the distance between two controls — so the hand reaching for Guardar reads a boundary before it reaches Anular fatura.',
        `<footer slActionBar aria-label="Ações da fatura" variant="raised">
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="danger" type="button">Anular fatura</button>
            </div>
            <div slActionBarSeparator></div>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Cancelar</button>
            </div>
            <div slActionBarAction><button slButton type="button">Guardar</button></div>
          </div>
        </footer>`,
      ) +
        scene(
          'The action that confirms is the destructive one',
          'Nothing in the surveyed field says where this one goes. It is pinned and at the end like any confirming action, the rule separates it from the way out, and the status says what cannot be undone before the press rather than after it.',
          `<footer slActionBar aria-label="Eliminar fornecedor" variant="raised">
          <div slActionBarStatus>
            O fornecedor tem 14 faturas em aberto. A eliminação não pode ser desfeita.
          </div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Manter</button>
            </div>
            <div slActionBarSeparator></div>
            <div slActionBarAction>
              <button slButton tone="danger" type="button">Eliminar fornecedor</button>
            </div>
          </div>
        </footer>`,
        ),
    ),
  }),
};

export const Status: Story = {
  parameters: scenario('status'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A timestamp',
        'Plain text in the muted ink the bar gives the slot. It is the least a save bar says and the most common thing in it.',
        `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>Rascunho guardado às 14:07</div>
          <div slActionBarActions>
            <div slActionBarAction><button slButton type="button">Submeter</button></div>
          </div>
        </footer>`,
      ) +
        scene(
          'A status indicator',
          'slStatusIndicator already says warning by shape as well as by colour, so the bar adds nothing and repeats nothing.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>
            <span slStatusIndicator status="warning">3 campos por preencher</span>
          </div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Guardar rascunho</button>
            </div>
            <div slActionBarAction><button slButton type="button">Submeter</button></div>
          </div>
        </footer>`,
        ) +
        scene(
          'An inline message',
          'A whole message in the slot is what a validation summary looks like at the end of a form. The run still ends where it ended in the two bars above.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>
            <div slInlineMessage tone="danger">
              O centro de custo 4120 não aceita pedidos acima de 25 000 €
            </div>
          </div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Alterar centro de custo</button>
            </div>
            <div slActionBarAction><button slButton disabled type="button">Submeter</button></div>
          </div>
        </footer>`,
        ),
    ),
  }),
};

export const Bulk: Story = {
  parameters: scenario('bulk'),
  render: () => ({
    props: { selected: 12 },
    template:
      grid(
        1,
        scene(
          'The bar a selection brings',
          'Press the button to clear the selection and put it back: the bar slides out of the flow rather than vanishing, and it is painted out once it has gone — a bar that stayed visible to the tab order would be a bar a reader lands in by accident.',
          `<button
            slButton
            size="sm"
            variant="outline"
            tone="secondary"
            type="button"
            (click)="selected = selected === 0 ? 12 : 0"
          >
            {{ selected === 0 ? 'Selecionar 12 faturas' : 'Limpar seleção' }}
          </button>
          <footer
            slActionBar
            aria-label="Ações sobre a seleção"
            variant="raised"
            [present]="selected > 0"
          >
            <div slActionBarStatus>
              <span slText weight="semibold">{{ selected }} faturas selecionadas</span>
              <button slButton size="sm" variant="ghost" tone="accent" type="button">
                Selecionar as 248 do filtro
              </button>
            </div>
            <div slActionBarActions>
              <div slActionBarAction [slActionBarActionCounterpart]="exported">
                <button slButton variant="ghost" tone="secondary" type="button">Exportar</button>
              </div>
              <div slActionBarAction="high" [slActionBarActionCounterpart]="reassign">
                <button slButton variant="outline" tone="secondary" type="button">Reatribuir</button>
              </div>
              <div slActionBarSeparator></div>
              <div slActionBarAction>
                <button slButton tone="danger" type="button">Anular</button>
              </div>
              <sl-action-bar-overflow />
            </div>
          </footer>`,
        ),
      ) + COUNTERPARTS,
  }),
};

export const Sticky: Story = {
  parameters: scenario('sticky'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Stuck to the end of what scrolls',
        'Scroll the panel to the bottom: the last line of the order stops above the bar rather than under it, because the bar takes its own height in the flow. A fixed bar would cover it and need a padding no token explains.',
        `<div class="slotted-demo-viewport" data-size="tall" data-scroll data-layout="page">
          <p slText>Pedido PO-2026-0004821 · Fornecedor Brandão &amp; Filhos</p>
          <p slText>Linha 1 — Cadeira operativa, 24 unidades — 4 320,00 €</p>
          <p slText>Linha 2 — Secretária regulável, 12 unidades — 7 188,00 €</p>
          <p slText>Linha 3 — Monitor 27", 24 unidades — 6 960,00 €</p>
          <p slText>Linha 4 — Braço de monitor, 24 unidades — 1 848,00 €</p>
          <p slText>Linha 5 — Tapete acústico, 30 unidades — 2 610,00 €</p>
          <p slText>Linha 6 — Candeeiro de secretária, 24 unidades — 1 176,00 €</p>
          <p slText>Linha 7 — Apoio de pés, 24 unidades — 984,00 €</p>
          <p slText>Linha 8 — Suporte de portátil, 24 unidades — 1 104,00 €</p>
          <p slText>Total — 26 190,00 €, acima do limite do centro de custo</p>
          ${ORDER('variant="raised" sticky')}
        </div>`,
      ),
    ),
  }),
};

export const Align: Story = {
  parameters: scenario('align'),
  render: () => ({
    template: grid(
      1,
      scene(
        'end — the default, and the anchor',
        'The run is pushed against the bar’s end edge, which is what keeps the action that confirms from moving when anything before it changes.',
        ORDER('variant="raised"'),
      ) +
        scene(
          'start',
          'The run sits next to the status instead. It is what a drawer footer often wants, and what Fluent’s command bar does by default.',
          ORDER('variant="raised" align="start"'),
        ) +
        scene(
          'center',
          'The run is centred in what is left after the status — the placement Salesforce’s docked form footer uses.',
          ORDER('variant="raised" align="center"'),
        ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      1,
      scene(
        'sm',
        'The step moves the bar’s inset, gap, minimum height and rule — and reaches the buttons, so neither of the two below states a size of its own.',
        ORDER('variant="raised" size="sm"'),
      ) +
        scene(
          'md',
          'The default step, and the one a form at comfortable density takes.',
          ORDER('variant="raised" size="md"'),
        ) +
        scene(
          'lg — and a button that states its own step',
          'Submeter is lg like the bar; Cancelar is sm because it said so. An explicit value on the control wins over the bar, which is the rule Button already implements.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised" size="lg">
          <div slActionBarStatus>Rascunho guardado às 14:07</div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton size="sm" variant="ghost" tone="secondary" type="button">Cancelar</button>
            </div>
            <div slActionBarAction>
              <button slButton type="button">Submeter para aprovação</button>
            </div>
          </div>
        </footer>`,
        ),
    ),
  }),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => ({
    template: grid(
      1,
      scene(
        'plain — inside something that already paints',
        'No ground and no rule. This is the bar inside a page footer, where that family has already drawn both, and a second ground there reads as a box nobody asked for.',
        `<div class="slotted-demo-surface" data-surface="sunken">${ORDER()}</div>`,
      ) +
        scene(
          'raised — with nothing under it',
          'The surface and one hairline at the top, which is the whole of the separation a bar at the end of a region needs. It is the bar in a drawer, a dialog or a card.',
          ORDER('variant="raised"'),
        ),
    ),
  }),
};

export const Stacked: Story = {
  parameters: scenario('stacked'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Below 24rem of container',
        'The run is a full-width column with the action that confirms on top, and the collapse has stopped running — a column has room for everything, so there is no menu. Tab still reads the order the author wrote: only the paint is reversed.',
        narrow(`<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>3 alterações por guardar</div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Descartar alterações</button>
            </div>
            <div slActionBarAction>
              <button slButton type="button">Guardar alterações</button>
            </div>
          </div>
        </footer>`),
      ) +
        scene(
          'A destructive action in the column',
          'The rule turns with the actions, so the boundary that kept Eliminar off Manter in a row keeps it off in a column.',
          narrow(`<footer slActionBar aria-label="Eliminar fornecedor" variant="raised">
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Manter</button>
            </div>
            <div slActionBarSeparator></div>
            <div slActionBarAction>
              <button slButton tone="danger" type="button">Eliminar fornecedor</button>
            </div>
          </div>
        </footer>`),
        ),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      1,
      scene(
        'A translated label twice the length',
        'Änderungen verwerfen and Zur Genehmigung einreichen are wider than the bar together, so the run wraps to a second line. Neither label is cut: a truncated action is an action nobody can read.',
        `<footer slActionBar aria-label="Bestellaktionen" variant="raised">
          <div slActionBarStatus>Entwurf um 14:07 gespeichert</div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Änderungen verwerfen</button>
            </div>
            <div slActionBarAction>
              <button slButton loading type="button">Zur Genehmigung einreichen</button>
            </div>
          </div>
        </footer>`,
      ) +
        scene(
          'A reference with no spaces in it, and an action mid-flight',
          'The status breaks the unbroken token rather than letting it out of the box, and Submeter keeps its width while it is busy — so the right edge does not move when the request starts.',
          `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <div slActionBarStatus>PO-2026-0004821-REV-C-AGUARDA-CENTRO-DE-CUSTO-4120</div>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton variant="ghost" tone="secondary" type="button">Cancelar</button>
            </div>
            <div slActionBarAction><button slButton loading type="button">Submeter</button></div>
          </div>
        </footer>`,
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      1,
      scene(
        'The bar is a directive on the page’s own element',
        'Every part but the overflow is an attribute: the bar here is a footer, the status a p, and the run a div — the family adds behaviour to the element the page already wanted rather than inserting one of its own.',
        `<footer slActionBar aria-label="Ações do pedido" variant="raised">
          <p slActionBarStatus>Rascunho guardado às 14:07</p>
          <div slActionBarActions>
            <div slActionBarAction>
              <button slButton type="button">Submeter para aprovação</button>
            </div>
          </div>
        </footer>`,
      ) +
        scene(
          'The four decisions an application takes once',
          'provideActionBarDefaults carries them in an injector, and a bar that states any of them itself still wins. Both bars here are raised without saying so; the second states its own alignment.',
          ORDER('variant="raised"') + ORDER('variant="raised" align="center"'),
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template:
      grid(
        1,
        scene(
          'Tab reaches every action',
          'Press Tab from the control above: each action is its own stop, in the order the form is read. No arrow key is bound, which is the deliberate departure from the APG’s Toolbar pattern — a strip of ten icon buttons is the Toolbar family instead.',
          `<button slButton size="sm" variant="outline" tone="secondary" type="button">
            Comece aqui e carregue em Tab
          </button>
          <footer slActionBar aria-label="Ações do pedido" variant="raised">
            <div slActionBarActions>
              <div slActionBarAction>
                <button slButton variant="ghost" tone="secondary" type="button">Devolver</button>
              </div>
              <div slActionBarAction="always" [slActionBarActionCounterpart]="duplicate">
                <button slButton variant="ghost" tone="secondary" type="button">Duplicar</button>
              </div>
              <div slActionBarAction><button slButton type="button">Aprovar</button></div>
              <sl-action-bar-overflow />
            </div>
          </footer>`,
        ) +
          scene(
            'A bar out of action',
            'A fieldset around it disables every control natively and takes them out of the tab order with them. The family writes no disabled state of its own, because a container cannot disable controls it does not own.',
            `<fieldset disabled>
            <footer slActionBar aria-label="Ações do pedido" variant="raised">
              <div slActionBarStatus>A submeter…</div>
              <div slActionBarActions>
                <div slActionBarAction>
                  <button slButton variant="ghost" tone="secondary" type="button">Cancelar</button>
                </div>
                <div slActionBarAction>
                  <button slButton type="button">Submeter para aprovação</button>
                </div>
              </div>
            </footer>
          </fieldset>`,
          ),
      ) + COUNTERPARTS,
  }),
};
