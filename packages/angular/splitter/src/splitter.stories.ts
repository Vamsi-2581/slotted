import { SlButton } from '@slotted/angular/button';
import { SlText } from '@slotted/angular/typography';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlSplitter } from './splitter';
import { provideSplitterDefaults } from './splitter-defaults';
import { ANGULAR_SPLITTER_DOCS, ANGULAR_SPLITTER_TOKENS } from './splitter.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_SPLITTER_DOCS.scenes, {
    playground: Playground,
    orientation: Orientation,
    value: Value,
    limits: Limits,
    collapse: Collapse,
    snapPoints: SnapPoints,
    reset: Reset,
    disabled: Disabled,
    keyboard: Keyboard,
    twoBars: TwoBars,
    persistence: Persistence,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<Record<string, never>> = {
  title: 'Components/Splitter',
  component: SlSplitter,
  decorators: [moduleMetadata({ imports: [SlSplitter, SlButton, SlText] })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Splitter',
        description:
          'A focusable bar between two regions, and nothing else. It holds the position, the limits, the stops and the whole Window Splitter keyboard; it holds no layout, so the fraction is published as a custom property and one CSS rule turns it into a measure. Its limits take a fraction or a CSS length, which is the one thing none of the surveyed implementations can state.',
        framework: 'Angular',
        ...ANGULAR_SPLITTER_DOCS,
        tokens: ANGULAR_SPLITTER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<Record<string, never>>;

/**
 * The ground a separator is demonstrated on: two regions and a movable
 * boundary, from `.slotted-demo-workspace` in the workbench. A bar with nothing
 * either side of it shows nothing, and regions painted here would be the inline
 * style `specs/reference-pages.test.mjs` refuses.
 */
const workspace = (body: string, orientation: 'vertical' | 'horizontal' = 'vertical') =>
  `<div class="slotted-demo-viewport" data-size="tall">
    <div class="slotted-demo-workspace" data-orientation="${orientation}">${body}</div>
  </div>`;

const accounts = (extra = '') =>
  `<aside class="slotted-demo-workspace__region">
    <p slText size="sm" weight="semibold">Contas a receber</p>
    <p slText size="sm" tone="muted">Vencidas · 14</p>
    <p slText size="sm" tone="muted">A vencer em 7 dias · 32</p>
    <p slText size="sm" tone="muted">Em conciliação · 3</p>
    ${extra}
  </aside>`;

const invoice = (extra = '') =>
  `<main class="slotted-demo-workspace__body">
    <p slText size="lg" weight="semibold">NF-e 20 483 · Metalúrgica Boa Vista Ltda</p>
    <p slText size="sm" tone="muted">Emitida em 02/09/2026 · vence em 02/10/2026 · R$ 18 420,00</p>
    ${extra}
  </main>`;

const scene = (label: string, note: string, body: string) =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const grid = (columns: 1 | 2, body: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${body}</div>`;

export const Playground: Story = {
  parameters: scenario('playground'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Um espaço de trabalho com fronteira móvel',
        'Arraste a barra, ou chegue a ela com Tab e use as setas. O número anunciado e a medida aplicada são o mesmo número, e a região ao lado fica com o que sobra.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura da lista de contas" [value]="0.34"></div>
          ${invoice()}`,
        ),
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
        'vertical — duas regiões lado a lado',
        'A linha é vertical e responde às setas esquerda e direita. As setas verticais ficam com a página: um documento que rola continua a rolar com o foco na barra.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" [value]="0.38"></div>
          ${invoice()}`,
        ),
      ) +
        scene(
          'horizontal — duas regiões empilhadas',
          'A linha é horizontal e responde às setas para cima e para baixo. A pega roda com ela: três pontos de altura passam a três de largura.',
          workspace(
            `${accounts()}
            <div slSplitter aria-label="Altura dos lançamentos" orientation="horizontal" [value]="0.42"></div>
            ${invoice()}`,
            'horizontal',
          ),
        ),
    ),
  }),
};

export const Value: Story = {
  parameters: scenario('value'),
  render: () => ({
    props: { width: 0.3 },
    template: grid(
      2,
      scene(
        'Não controlada — a medida vive no CSS',
        'Nada guarda o número. A barra escreve --slotted-splitter-value na região, e uma regra de uma linha transforma-o em medida; o componente não tem estado nenhum para esta barra.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" [value]="0.34"></div>
          ${invoice()}`,
        ),
      ) +
        scene(
          'Duas vias — a medida vive no componente',
          'O mesmo desenho com [(value)]: a percentagem impressa à esquerda e a posição da barra não podem discordar, porque são o mesmo sinal.',
          workspace(
            `${accounts('<p slText size="sm" tone="muted">{{ width * 100 | number: \'1.0-0\' }}% do contentor</p>')}
            <div slSplitter aria-label="Largura das contas" [(value)]="width"></div>
            ${invoice('<button slButton size="sm" variant="outline" (click)="width = 0.5">Pôr a meio por código</button>')}`,
          ),
        ),
    ),
  }),
};

export const Limits: Story = {
  parameters: scenario('limits'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Chão em pixels',
        'Arraste até ao fim, à esquerda: a região pára nos duzentos pixels, e continua a parar lá quando a janela estreita. Nenhuma das sete implementações levantadas consegue exprimir isto — Zag di-lo por palavras suas.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" min="200px" [value]="0.34"></div>
          ${invoice()}`,
        ),
      ) +
        scene(
          'Tecto em fracção',
          'Arraste até ao fim, à direita: pára a sessenta por cento do contentor, e o limite acompanha a janela sem ninguém o recalcular. Os dois limites aceitam qualquer das unidades.',
          workspace(
            `${accounts()}
            <div slSplitter aria-label="Largura das contas" min="200px" [max]="0.6" [value]="0.34"></div>
            ${invoice()}`,
          ),
        ),
    ),
  }),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Colapsa até desaparecer',
        'Chegue à barra com Tab e prima Enter: a região fecha. Prima outra vez e volta à fracção que tinha, não a uma fracção qualquer — a posição anterior é guardada pela própria família.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" collapsible [value]="0.34"></div>
          ${invoice()}`,
        ),
      ) +
        scene(
          'Colapsa até um friso',
          'O mesmo Enter, com collapsedValue: a região encolhe a seis por cento em vez de fechar. É onde uma navegação que vira só ícones pára.',
          workspace(
            `${accounts()}
            <div slSplitter aria-label="Largura das contas" collapsible [collapsedValue]="0.06" [value]="0.34"></div>
            ${invoice()}`,
          ),
        ),
    ),
  }),
};

export const SnapPoints: Story = {
  parameters: scenario('snapPoints'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Três paragens, e a mão que as encontra',
        'Arraste para lá de uma paragem e largue: a barra assenta na mais próxima. Encaixa ao largar e nunca durante o arrasto, porque uma barra que encaixasse a cada frame lutava com a mão em vez de a ajudar. As setas andam de paragem em paragem.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" [snapPoints]="[0.2, 0.34, 0.5]" [value]="0.34"></div>
          ${invoice()}`,
        ),
      ),
    ),
  }),
};

export const Reset: Story = {
  parameters: scenario('reset'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Duplo clique volta ao princípio',
        'Mova a barra para onde quiser e faça duplo clique nela: regressa ao valor com que começou. O padrão não atribui nada ao duplo clique, e toda a implementação levantada que traz um reset o põe aí.',
        workspace(
          `${accounts()}
          <div slSplitter #bar="slSplitter" aria-label="Largura das contas" [value]="0.34"></div>
          ${invoice('<button slButton size="sm" variant="outline" (click)="bar.reset()">reset()</button>')}`,
        ),
      ),
    ),
  }),
};

export const Disabled: Story = {
  parameters: scenario('disabled'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Congelada, e ainda legível',
        'A barra mantém o ponto de tabulação e os três valores ARIA; as linhas descem ao passo apagado e o hover e a pressão ficam retidos. Quem não pode mover um separador ainda pode ser informado de onde ele está.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" disabled [value]="0.34"></div>
          ${invoice()}`,
        ),
      ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: { width: 0.4 },
    template: grid(
      1,
      scene(
        'Todas as teclas que o padrão lista',
        'Chegue à barra com Tab: as setas movem dezasseis pixels e sessenta e quatro com Shift, Home e End vão aos limites, Enter colapsa e restaura. O valor anunciado, impresso à direita, muda com cada uma.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" collapsible [min]="0.15" [max]="0.75" [(value)]="width"></div>
          ${invoice('<p slText size="sm" tone="muted">aria-valuenow={{ width * 100 | number: \'1.0-0\' }} · aria-valuemin=15 · aria-valuemax=75</p>')}`,
        ),
      ),
    ),
  }),
};

export const TwoBars: Story = {
  parameters: scenario('twoBars'),
  render: () => ({
    template: grid(
      1,
      scene(
        'Duas barras em série',
        'A forma que o portal de ajuda da SAP usa. A família não segura painéis, portanto quem possui o layout possui também a política de acoplamento: cada barra trava sozinha e nenhuma empurra a vizinha.',
        `<div class="slotted-demo-viewport" data-size="tall">
          <div class="slotted-demo-workspace">
            <aside class="slotted-demo-workspace__region" #toc>
              <p slText size="sm" weight="semibold">Sumário</p>
              <p slText size="sm" tone="muted">Conciliação bancária</p>
              <p slText size="sm" tone="muted">Baixa automática</p>
            </aside>
            <div slSplitter aria-label="Largura do sumário" [for]="toc" min="180px" [max]="0.4" [value]="0.24"></div>
            <main class="slotted-demo-workspace__body" #doc>
              <p slText size="lg" weight="semibold">Procedimento de conciliação</p>
              <p slText size="sm" tone="muted">Cada barra trava contra os seus próprios limites e nenhuma negoceia com a outra.</p>
            </main>
            <div slSplitter aria-label="Largura das notas" [for]="doc" [min]="0.4" [max]="0.85" [value]="0.78"></div>
            <aside class="slotted-demo-workspace__region">
              <p slText size="sm" weight="semibold">Notas</p>
              <p slText size="sm" tone="muted">Revisto por Auditoria em 08/09.</p>
            </aside>
          </div>
        </div>`,
      ),
    ),
  }),
};

export const Persistence: Story = {
  parameters: scenario('persistence'),
  render: () => ({
    props: { saved: 0.34, width: 0.34 },
    template: grid(
      1,
      scene(
        'Um layout que sobrevive a um recarregamento',
        'Arraste a barra: o número em movimento muda a cada frame e o guardado muda uma vez, ao largar. A família nunca toca em armazenamento — qual armazenamento, e se um layout atravessa um login, são decisões da aplicação.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" [(value)]="width" (resizeEnd)="saved = $event"></div>
          ${invoice(
            `<p slText size="sm" tone="muted">Guardado: {{ saved * 100 | number: '1.0-0' }}% · em movimento: {{ width * 100 | number: '1.0-0' }}%</p>
            <button slButton size="sm" variant="outline" (click)="width = saved">Recarregar a partir do guardado</button>`,
          )}`,
        ),
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
        'A instância que o template alcança',
        'A barra é uma directiva, portanto é escrita no elemento que o layout quisesse ali — aqui um section. Os botões conduzem a instância por exportAs, que é o que um breakpoint precisa para colapsar sem duplicar o clamp.',
        workspace(
          `${accounts()}
          <section slSplitter #bar="slSplitter" aria-label="Largura das contas" collapsible [value]="0.34"></section>
          ${invoice(
            `<button slButton size="sm" variant="outline" (click)="bar.collapse()">collapse()</button>
            <button slButton size="sm" variant="outline" (click)="bar.expand()">expand()</button>
            <button slButton size="sm" variant="ghost" (click)="bar.reset()">reset()</button>`,
          )}`,
        ),
      ) +
        scene(
          'Um atributo que o autor escreveu sobrevive',
          'Esta barra traz o seu próprio aria-label e o seu próprio tabindex, lidos com HostAttributeToken antes de as host bindings correrem. Uma binding que resolvesse a null apagaria o que o autor escreveu.',
          workspace(
            `${accounts()}
            <div slSplitter aria-label="Divisória do espaço de trabalho" tabindex="0" [value]="0.34"></div>
            ${invoice()}`,
          ),
        ),
    ),
  }),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  decorators: [moduleMetadata({ providers: [provideSplitterDefaults({ min: '200px' })] })],
  render: () => ({
    template: grid(
      2,
      scene(
        'Herda o chão do provedor',
        'Esta barra não declara min nenhum e pára na mesma nos duzentos pixels, porque provideSplitterDefaults o declarou uma vez para a aplicação inteira.',
        workspace(
          `${accounts()}
          <div slSplitter aria-label="Largura das contas" [value]="0.34"></div>
          ${invoice()}`,
        ),
      ) +
        scene(
          'Declara o seu e ganha',
          'Sob o mesmo provedor, uma barra que declara [min]="0.05" desce muito mais: um valor explícito do consumidor ganha sempre ao que foi herdado.',
          workspace(
            `${accounts()}
            <div slSplitter aria-label="Largura das contas" [min]="0.05" [value]="0.34"></div>
            ${invoice()}`,
          ),
        ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template: grid(
      1,
      scene(
        'O que um leitor de ecrã ouve',
        'A barra nomeia a região por aria-controls e toma o nome do título dessa região, que é a regra do próprio padrão: um separador chama-se pela região que dimensiona. A região recebe um id da família quando não traz nenhum.',
        `<div class="slotted-demo-viewport" data-size="tall">
          <div class="slotted-demo-workspace">
            <aside class="slotted-demo-workspace__region" #region>
              <p slText size="sm" weight="semibold" id="contas-heading">Contas a receber</p>
              <p slText size="sm" tone="muted">O separador toma o nome deste título.</p>
            </aside>
            <div slSplitter [for]="region" aria-labelledby="contas-heading" [value]="0.34"></div>
            ${invoice('<p slText size="sm" tone="muted">role=separator · tabindex=0 · aria-orientation=vertical · aria-controls aponta à região</p>')}
          </div>
        </div>`,
      ),
    ),
  }),
};
