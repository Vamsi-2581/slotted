import { signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideBell,
  lucideCircleCheck,
  lucideCopy,
  lucideExternalLink,
  lucideFileSpreadsheet,
  lucideFileText,
  lucideTrash2,
  lucideUpload,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { SlButton } from '@slotted/angular/button';
import { SlMenu, SlMenuItem, SlMenuItemDescription, SlMenuTrigger } from '@slotted/angular/menu';
import { SlText } from '@slotted/angular/typography';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import type { ActionSheetChangeRequest } from './action-sheet-defaults';
import { provideActionSheetDefaults } from './action-sheet-defaults';
import { SL_ACTION_SHEET } from './action-sheet-parts';
import { ANGULAR_ACTION_SHEET_DOCS, ANGULAR_ACTION_SHEET_TOKENS } from './action-sheet.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_ACTION_SHEET_DOCS.scenes, {
    playground: Playground,
    destructive: Destructive,
    groups: Groups,
    content: Content,
    loading: Loading,
    modal: Modal,
    policy: Policy,
    focus: Focus,
    result: Result,
    responsive: Responsive,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta: Meta = {
  title: 'Components/ActionSheet',
  decorators: [
    moduleMetadata({
      imports: [
        ...SL_ACTION_SHEET,
        NgIcon,
        SlButton,
        SlMenu,
        SlMenuItem,
        SlMenuItemDescription,
        SlMenuTrigger,
        SlText,
      ],
      providers: [
        provideIcons({
          lucideArchive,
          lucideBell,
          lucideCircleCheck,
          lucideCopy,
          lucideExternalLink,
          lucideFileSpreadsheet,
          lucideFileText,
          lucideTrash2,
          lucideUpload,
          lucideUserPlus,
        }),
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'ActionSheet',
        description:
          'A short list of actions that rises from the bottom edge, and the explicit way out beneath it. A dialog holding a menu: the keyboard of a menu, the modality of a dialog, the item vocabulary of menu, and a close request that says which action was chosen.',
        framework: 'Angular',
        ...ANGULAR_ACTION_SHEET_DOCS,
        tokens: ANGULAR_ACTION_SHEET_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * A box a sheet opens inside, so a demonstration is a sheet in a scene rather
 * than a layer over the reference page. `contain: paint` on the primitive makes
 * it the containing block for the fixed layer; in an application that is the
 * viewport.
 */
const layer = (body: string) =>
  `<div class="slotted-demo-viewport" data-size="tall" #box>${body}</div>`;

const scene = (label: string, note: string, body: string) =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const grid = (body: string) => `<div class="slotted-demo-grid" data-columns="2">${body}</div>`;

/**
 * A sheet that stands open to be looked at: not modal, no focus taken, not
 * dismissable. A modal layer writes `inert` up to the document root, and a page
 * holding several would be a page nobody can use. Not modal also means no scrim.
 */
const STILL =
  '[open]="true" [modal]="false" escape="none" outsidePress="none" [initialFocus]="false"';

const page = (extra = '') =>
  `<div class="slotted-demo-page">
    <p slText size="lg" weight="semibold">Relatório trimestral · 3.º trimestre de 2026</p>
    <p slText size="sm" tone="muted">Receita de R$ 4,82 mi, margem bruta de 38,4 %, partilhado com a equipa financeira.</p>
    ${extra}
  </div>`;

const icon = (name: string) =>
  `<span slActionSheetItemIcon><ng-icon name="${name}" size="1em"></ng-icon></span>`;

const shareHeader = `<header slActionSheetHeader>
  <h2 slActionSheetTitle>Partilhar relatório</h2>
  <p slActionSheetMessage>Quem recebe a ligação vê a versão de hoje.</p>
</header>`;

const shareList = `<div slActionSheetList>
  <button slActionSheetItem value="copy">${icon('lucideCopy')}Copiar ligação</button>
  <button slActionSheetItem value="invite">${icon('lucideUserPlus')}Convidar pessoas<span slActionSheetItemDescription>Podem comentar, não editar</span></button>
  <button slActionSheetItem value="pdf">${icon('lucideFileText')}Descarregar PDF</button>
  <button slActionSheetItem value="open">${icon('lucideExternalLink')}Abrir no navegador</button>
</div>`;

const invoiceList = `<div slActionSheetList>
  <div slActionSheetGroup>
    <div slActionSheetGroupLabel>Enviar</div>
    <button slActionSheetItem value="remind">${icon('lucideBell')}Lembrar o cliente</button>
    <button slActionSheetItem value="accounting" disabled>${icon('lucideUpload')}Enviar para a contabilidade<span slActionSheetItemDescription>Disponível depois de aprovada</span></button>
  </div>
  <hr slActionSheetSeparator />
  <div slActionSheetGroup>
    <div slActionSheetGroupLabel>Estado</div>
    <button slActionSheetItem value="paid" tone="success">${icon('lucideCircleCheck')}Marcar como paga</button>
    <button slActionSheetItem value="archive" tone="secondary">${icon('lucideArchive')}Arquivar</button>
    <button slActionSheetItem value="void" tone="danger">${icon('lucideTrash2')}Anular fatura<span slActionSheetItemDescription>O número não é reutilizado</span></button>
  </div>
</div>`;

const cancel = (words = 'Cancelar') =>
  `<div slActionSheetFooter><button slActionSheetCancel>${words}</button></div>`;

export const Playground: Story = {
  parameters: scenario('playground'),
  render: () => ({
    template:
      layer(`${page('<button slButton size="sm" [slActionSheetTrigger]="s">Partilhar</button>')}
      <sl-action-sheet #s="slActionSheet" [container]="box">
        ${shareHeader}${shareList}${cancel()}
      </sl-action-sheet>`),
  }),
};

export const Destructive: Story = {
  parameters: scenario('destructive'),
  render: () => ({
    template: layer(`<div class="slotted-demo-page">
        <p slText size="lg" weight="semibold">Nova mensagem</p>
        <p slText size="sm" tone="muted">Para: financeiro@exemplo.pt · Assunto: fecho do trimestre</p>
      </div>
      <sl-action-sheet [container]="box" ${STILL}>
        <header slActionSheetHeader><h2 slActionSheetTitle>Descartar a mensagem?</h2></header>
        <div slActionSheetList>
          <button slActionSheetItem value="delete" tone="danger">Eliminar rascunho</button>
          <button slActionSheetItem value="save">Guardar rascunho</button>
        </div>
        ${cancel()}
      </sl-action-sheet>`),
  }),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => ({
    template: layer(`${page()}
      <sl-action-sheet [container]="box" ${STILL}>
        <header slActionSheetHeader><h2 slActionSheetTitle>Fatura 4471 · Distribuidora Atlântica</h2></header>
        ${invoiceList}${cancel()}
      </sl-action-sheet>`),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: layer(`${page()}
      <sl-action-sheet [container]="box" ${STILL}>
        <header slActionSheetHeader>
          <h2 slActionSheetTitle>Ações disponíveis para a encomenda 88213 do cliente Distribuidora Atlântica</h2>
          <p slActionSheetMessage>As alterações ficam registadas no histórico e são enviadas ao armazém na próxima sincronização.</p>
        </header>
        <div slActionSheetList>
          <button slActionSheetItem value="resend">Reenviar a confirmação da encomenda ao endereço de faturação</button>
          <button slActionSheetItem value="address">Alterar a morada de entrega<span slActionSheetItemDescription>Até à saída do armazém, prevista para amanhã às 9h</span></button>
          <button slActionSheetItem value="copy-ref">Copiar ENC-2026-0000088213-ATLANTICA-PT-LISBOA-NORTE</button>
          <button slActionSheetItem value="split">Dividir em duas remessas</button>
          <button slActionSheetItem value="note">Adicionar nota interna</button>
          <button slActionSheetItem value="print">Imprimir guia de transporte</button>
          <button slActionSheetItem value="cancel-order" tone="danger">Cancelar encomenda</button>
        </div>
        ${cancel('Fechar')}
      </sl-action-sheet>`),
  }),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => {
    const exporting = signal<string | null>(null);
    const done = signal<string[]>([]);
    const run = (value: string) => {
      exporting.set(value);
      setTimeout(() => {
        exporting.set(null);
        done.update((list) => [...list, value]);
      }, 1600);
    };
    return {
      props: { exporting, done, run },
      template:
        layer(`${page('<p slText size="sm" tone="muted">{{ done().length === 0 ? "Nenhum ficheiro preparado." : "Preparados: " + done().join(", ") + "." }}</p>')}
        <sl-action-sheet [container]="box" ${STILL} [closeOnSelect]="false">
          <header slActionSheetHeader><h2 slActionSheetTitle>Exportar</h2></header>
          <div slActionSheetList>
            <button slActionSheetItem value="pdf" [loading]="exporting() === 'pdf'" (select)="run('pdf')">${icon('lucideFileText')}Descarregar PDF<span slActionSheetItemDescription>{{ exporting() === 'pdf' ? 'A preparar 14 páginas' : '14 páginas' }}</span></button>
            <button slActionSheetItem value="xlsx" [loading]="exporting() === 'xlsx'" (select)="run('xlsx')">${icon('lucideFileSpreadsheet')}Descarregar folha de cálculo</button>
          </div>
          ${cancel()}
        </sl-action-sheet>`),
    };
  },
};

export const Modal: Story = {
  parameters: scenario('modal'),
  render: () => ({
    template: grid(
      scene(
        'modal (default)',
        'Scrim, inert page, locked scroll.',
        layer(`${page('<button slButton size="sm" [slActionSheetTrigger]="m">Partilhar</button>')}
          <sl-action-sheet #m="slActionSheet" [container]="box">${shareHeader}${shareList}${cancel()}</sl-action-sheet>`),
      ) +
        scene(
          '[modal]="false"',
          'No scrim; the page stays operable.',
          layer(`<div class="slotted-demo-page">
              <p slText size="lg" weight="semibold">Mapa de entregas</p>
              <button slButton size="sm" tone="secondary" variant="outline">Rota seguinte</button>
            </div>
            <sl-action-sheet [container]="box" ${STILL} aria-label="Rota 12">
              <div slActionSheetList aria-label="Rota 12">
                <button slActionSheetItem value="navigate">Iniciar navegação</button>
                <button slActionSheetItem value="call">Ligar ao motorista</button>
              </div>
            </sl-action-sheet>`),
        ),
    ),
  }),
};

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => {
    const log = signal<string[]>([]);
    const record = (request: ActionSheetChangeRequest) =>
      log.update((lines) => [
        ...lines.slice(-2),
        `${request.value ? 'abrir' : 'fechar'} · ${request.reason}`,
      ]);
    return {
      props: { log, record },
      template:
        layer(`${page(`<button slButton size="sm" [slActionSheetTrigger]="p">Partilhar</button>
          <p slText size="sm" tone="muted">{{ log().length === 0 ? 'Nenhum pedido ainda.' : log().join(' → ') }}</p>`)}
        <sl-action-sheet #p="slActionSheet" [container]="box" escape="none" outsidePress="none" back="none" (openChangeRequest)="record($event)">
          ${shareHeader}${shareList}${cancel()}
        </sl-action-sheet>`),
    };
  },
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => ({
    template: layer(`<div class="slotted-demo-page">
        <p slText size="lg" weight="semibold">Nova mensagem</p>
        <button slButton size="sm" [slActionSheetTrigger]="f">Descartar…</button>
        <button slButton size="sm" tone="secondary" variant="outline" #composer>Voltar ao texto</button>
      </div>
      <sl-action-sheet #f="slActionSheet" [container]="box" [finalFocus]="composer">
        <header slActionSheetHeader><h2 slActionSheetTitle>Descartar a mensagem?</h2></header>
        <div slActionSheetList>
          <button slActionSheetItem value="delete" tone="danger">Eliminar rascunho</button>
          <button slActionSheetItem value="save">Guardar rascunho</button>
        </div>
        ${cancel()}
      </sl-action-sheet>`),
  }),
};

export const Result: Story = {
  parameters: scenario('result'),
  render: () => {
    const said = signal('Nenhuma ação escolhida.');
    const read = (request: ActionSheetChangeRequest) => {
      if (request.value) return;
      said.set(
        request.reason === 'select'
          ? `reason: select · result: ${request.result ?? '—'}`
          : `reason: ${request.reason} · sem resultado`,
      );
    };
    return {
      props: { said, read },
      template:
        layer(`${page(`<button slButton size="sm" [slActionSheetTrigger]="r">Fatura 4471</button>
          <p slText size="sm" tone="muted">{{ said() }}</p>`)}
        <sl-action-sheet #r="slActionSheet" [container]="box" (openChangeRequest)="read($event)">
          <header slActionSheetHeader><h2 slActionSheetTitle>Fatura 4471</h2></header>
          ${invoiceList}${cancel()}
        </sl-action-sheet>`),
    };
  },
};

export const Responsive: Story = {
  parameters: scenario('responsive'),
  render: () => ({
    props: {
      actions: [
        { value: 'duplicate', label: 'Duplicar' },
        { value: 'move', label: 'Mover para…', description: 'Pasta Financeiro' },
        { value: 'lock', label: 'Bloquear edição', disabled: true },
        { value: 'delete', label: 'Eliminar', tone: 'danger' },
      ],
    },
    template: grid(
      scene(
        'pointer: fine → menu',
        'The same array as menu items.',
        `<div class="slotted-demo-page">
          <button slButton size="sm" variant="outline" [slMenuTriggerFor]="menu">Mais</button>
          <sl-menu #menu aria-label="Ações">
            @for (action of actions; track action.value) {
              <button slMenuItem [tone]="action.tone" [disabled]="action.disabled ?? false">
                {{ action.label }}
                @if (action.description) { <span slMenuItemDescription>{{ action.description }}</span> }
              </button>
            }
          </sl-menu>
        </div>`,
      ) +
        scene(
          'pointer: coarse → action sheet',
          'The same array as sheet actions.',
          layer(`${page()}
            <sl-action-sheet [container]="box" ${STILL} aria-label="Ações">
              <div slActionSheetList aria-label="Ações">
                @for (action of actions; track action.value) {
                  <button slActionSheetItem [value]="action.value" [tone]="action.tone" [disabled]="action.disabled ?? false">
                    {{ action.label }}
                    @if (action.description) { <span slActionSheetItemDescription>{{ action.description }}</span> }
                  </button>
                }
              </div>
              <div slActionSheetFooter><button slActionSheetCancel></button></div>
            </sl-action-sheet>`),
        ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  decorators: [
    moduleMetadata({ providers: [provideActionSheetDefaults({ cancelLabel: 'Fechar' })] }),
  ],
  render: () => ({
    template: layer(`${page()}
      <sl-action-sheet [container]="box" ${STILL}>
        ${shareHeader}${shareList}
        <div slActionSheetFooter><button slActionSheetCancel></button></div>
      </sl-action-sheet>`),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template:
      layer(`${page('<button slButton size="sm" [slActionSheetTrigger]="k">Fatura 4471</button>')}
      <sl-action-sheet #k="slActionSheet" [container]="box">
        <header slActionSheetHeader><h2 slActionSheetTitle>Fatura 4471</h2></header>
        ${invoiceList}${cancel()}
      </sl-action-sheet>`),
  }),
};
