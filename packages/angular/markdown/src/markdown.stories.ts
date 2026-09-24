import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import { SlContainer } from '@slotted/angular/container';
import { SlLink } from '@slotted/angular/link';
import { SlTag } from '@slotted/angular/tag';
import { completeMarkdown, fromMarkedTokens, prepareMarkdown } from '@slotted/core/markdown';
import type { MarkdownNode } from '@slotted/core/markdown';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { marked } from 'marked';

import { SlMarkdown, SlMarkdownChildren, SlMarkdownEmpty, SlMarkdownNode } from './markdown';
import type { MarkdownTaskChange } from './markdown';
import { provideMarkdownDefaults } from './markdown-defaults';
import { ANGULAR_MARKDOWN_DOCS, ANGULAR_MARKDOWN_TOKENS } from './markdown.docs';

/* ── Samples: the runbook of a platform team ───────────────────────────── */

const md = (source: string): MarkdownNode => fromMarkedTokens(marked.lexer(source));

const RUNBOOK = `# Publicar um serviço

Um deploy são três decisões: **onde** o código corre, *quando* ele muda e quem é avisado. Leia os [pré-requisitos](#pré-requisitos) antes, e a [referência da CLI](https://docs.acme.example/cli) quando uma flag não for clara. O antigo fluxo ~~blue-green~~ foi removido.

## Pré-requisitos

- Uma conta com a permissão \`deploy\` no projeto de destino.
- A CLI, instalada com \`npm i -g @acme/cli\`.
  - Versão 4 ou superior.
  - Autenticada uma vez com \`acme login\`.
- Uma definição de serviço no ramo principal.

## Passos

3. Construir a imagem.
4. Enviá-la ao registo.
5. Promover a versão.

> Um deploy que não pode ser revertido não é um deploy: é uma migração, e pede outra revisão.

---

Revisto pela equipa de plataforma em 24 de setembro de 2026.`;

const PLANS = `| Plano | Lugares | Preço mensal |
| :---- | :-----: | -----------: |
| Team | 10 | R$ 120,00 |
| Business | 50 | R$ 1.450,00 |
| Enterprise | ilimitado | sob consulta |`;

const REGIONS = `| Região | Instâncias | Último deploy | Responsável | Estado | Versão |
| --- | ---: | --- | --- | --- | --- |
| sa-east-1 | 3 | 2026-09-24 14:02 | plataforma | saudável | 4.18.2 |
| us-east-2 | 5 | 2026-09-23 09:41 | pagamentos | degradado | 4.18.1 |
| eu-west-1 | 2 | 2026-09-22 18:15 | faturação | saudável | 4.17.9 |`;

const CODE = `O pipeline inteiro é uma chamada:

\`\`\`ts title="deploy.ts" {2}
import { deploy } from '@acme/cli';
await deploy({ env: 'production', wait: true });
\`\`\`

Ela resolve quando todas as instâncias respondem saudáveis. Os logs ficam em:

\`\`\`sh showLineNumbers
acme logs --service checkout --since 15m
acme logs --service checkout --level warn
\`\`\``;

const TASKS = `- [x] Escrever a migração
- [ ] Rever com **a equipa de dados**, cuja aprovação a mudança precisa antes de sexta
- [ ] Publicar
  - [ ] Marcar a versão
  - [ ] Avisar o suporte
- Um item comum mantém o marcador.`;

const ALERTS = `> [!NOTE]
> Os deploys correm pela ordem em que foram enfileirados.

> [!TIP]
> Passe \`--wait\` para bloquear até todas as instâncias estarem saudáveis.

> [!IMPORTANT]
> Produção precisa de um segundo aprovador.

> [!WARNING]
> Um deploy durante uma migração espera que a migração termine.
>
> Não é cancelado.

> [!CAUTION]
> Reverter apaga as instâncias que o deploy criou.`;

const FOOTNOTES: MarkdownNode = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'A latência caiu um terço' },
        { type: 'footnoteReference', identifier: 'p95' },
        { type: 'text', value: ' depois de a cache passar para a borda' },
        { type: 'footnoteReference', identifier: 'edge' },
        { type: 'text', value: ', e o custo por pedido caiu com ela' },
        { type: 'footnoteReference', identifier: 'p95' },
        { type: 'text', value: '.' },
      ],
    },
    {
      type: 'footnoteDefinition',
      identifier: 'p95',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'Medido no percentil 95 na semana de 14 de setembro.' },
          ],
        },
      ],
    },
    {
      type: 'footnoteDefinition',
      identifier: 'edge',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Doze regiões.' }] }],
    },
    {
      type: 'footnoteDefinition',
      identifier: 'unused',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Nunca referida.' }] }],
    },
  ],
};

const LINKS = `A [página de estado](https://status.acme.example) e a [documentação da API](https://docs.acme.example/api) abrem noutra aba. O [painel interno](/dashboards/deploys) e a [secção de passos](#passos) ficam nesta. Escreva a [equipa de plataforma](mailto:plataforma@acme.example).`;

const HOSTILE = `Uma mensagem recebida de fora:

<script>alert('x')</script>

[Reclamar o prémio](javascript:alert(document.cookie)) · [outro](JaVaScRiPt:alert(1)) · [dados](data:text/html;base64,PHNjcmlwdD4=)

![gráfico de vendas](data:image/svg+xml;base64,PHN2Zz4=) e <b>negrito cru</b>.

Um link legítimo: [changelog](https://docs.acme.example/changelog).`;

const MENTIONS = `@ana.souza aprovou o deploy e @bruno.lima vai acompanhar. Detalhes no [painel](/dashboards/deploys).`;

const ANSWER = `## Resumo do incidente

A região **sa-east-1** ficou degradada durante 14 minutos porque o \`health-check\` do serviço de checkout apontava para uma porta antiga.

1. O deploy 4.18.1 mudou a porta para \`8443\`.
2. O balanceador continuou a testar \`8080\`.
3. As instâncias foram retiradas uma a uma.

\`\`\`sh
acme lb update checkout --health-port 8443
\`\`\`

Veja a [linha do tempo completa](https://status.acme.example/incidents/2026-09-23).`;

const ACCESSIBLE = `# Checklist de lançamento

Confira o [estado](https://status.acme.example).

| Passo | Dono |
| --- | --- |
| Migração | dados |

\`\`\`sh
acme deploy --env production
\`\`\`

- [ ] Confirmar com o suporte`;

/** Walks the text of a tree and lifts every `@name` into a node of its own. */
function withMentions(tree: MarkdownNode): MarkdownNode {
  const walk = (node: MarkdownNode): MarkdownNode => {
    if (!node.children) return node;
    const children = node.children.flatMap((child): MarkdownNode[] => {
      if (child.type !== 'text' || !child.value?.includes('@')) return [walk(child)];
      return child.value
        .split(/(@[a-z.]+[a-z])/)
        .filter(Boolean)
        .map((piece) =>
          piece.startsWith('@')
            ? { type: 'mention', value: piece.slice(1) }
            : { type: 'text', value: piece },
        );
    });
    return { ...node, children };
  };
  return walk(tree);
}

/** Flips the n-th task marker in the source. */
function toggleTask(source: string, index: number, checked: boolean): string {
  let seen = -1;
  return source.replace(/^(\s*[-*+] )\[( |x)\]/gim, (match, bullet: string) => {
    seen += 1;
    return seen === index ? `${bullet}[${checked ? 'x' : ' '}]` : match;
  });
}

/* ── Demonstrations with state of their own ───────────────────────────── */

@Component({
  selector: 'sl-markdown-demo-tasks',
  imports: [SlMarkdown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div slMarkdown editableTasks [tree]="tree()" (taskChange)="toggle($event)"></div>`,
})
class EditableTasksDemo {
  protected readonly source = signal(TASKS);
  protected readonly tree = computed(() => md(this.source()));
  protected toggle(change: MarkdownTaskChange): void {
    this.source.update((current) => toggleTask(current, change.index, change.checked));
  }
}

@Component({
  selector: 'sl-markdown-demo-renderers',
  imports: [SlMarkdown, SlMarkdownChildren, SlMarkdownNode, SlLink, SlTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slMarkdown [tree]="tree">
      <ng-template slMarkdownNode="mention" let-element>
        <span slTag size="sm">&#64;{{ element.node?.value }}</span>
      </ng-template>
      <ng-template slMarkdownNode="link" let-element>
        <a slLink [href]="element.href" (click)="go($event, element.href)"
          ><ng-container [slMarkdownChildren]="element"
        /></a>
      </ng-template>
    </div>
    <p class="slotted-demo-scene__note">Rota atual: {{ route() }}</p>
  `,
})
class RenderersDemo {
  protected readonly tree = withMentions(md(MENTIONS));
  protected readonly route = signal('/');
  protected go(event: Event, href: string | undefined): void {
    event.preventDefault();
    this.route.set(href ?? '/');
  }
}

@Component({
  selector: 'sl-markdown-demo-streaming',
  imports: [SlMarkdown, SlButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div slMarkdown idPrefix="answer-" [streaming]="running()" [tree]="tree()"></div>
    <p>
      <button slButton type="button" size="sm" variant="outline" (click)="start()">
        Transmitir a resposta de novo
      </button>
    </p>
  `,
})
class StreamingDemo {
  private readonly length = signal(ANSWER.length);
  protected readonly running = signal(false);
  protected readonly tree = computed(() => md(completeMarkdown(ANSWER.slice(0, this.length()))));
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected start(): void {
    clearInterval(this.timer);
    this.length.set(0);
    this.running.set(true);
    this.timer = setInterval(() => {
      const next = Math.min(ANSWER.length, this.length() + 7);
      this.length.set(next);
      if (next === ANSWER.length) {
        clearInterval(this.timer);
        this.running.set(false);
      }
    }, 40);
  }
}

@Component({
  selector: 'sl-markdown-demo-failing',
  imports: [SlMarkdown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    slMarkdown
    retryable
    [loading]="loading()"
    [status]="failed() ? 'error' : 'ready'"
    [tree]="null"
    (retry)="reload()"
  ></div>`,
})
class FailingSourceDemo {
  protected readonly loading = signal(false);
  protected readonly failed = signal(true);
  protected reload(): void {
    this.failed.set(false);
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.failed.set(true);
    }, 1500);
  }
}

@Component({
  selector: 'sl-markdown-demo-docs',
  imports: [SlMarkdown, SlContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideMarkdownDefaults({
      headingAnchors: true,
      labels: { anchor: (heading) => `Ligação para: ${heading}` },
    }),
  ],
  template: `
    <nav aria-label="Nesta página">
      <ul>
        @for (heading of outline.headings; track heading.id) {
          <li>
            <a [href]="'#' + heading.id">{{ heading.text }}</a>
          </li>
        }
      </ul>
    </nav>
    <div slContainer size="measure"><div slMarkdown [tree]="tree"></div></div>
  `,
})
class DocsPageDemo {
  protected readonly tree = md(RUNBOOK);
  protected readonly outline = prepareMarkdown(this.tree);
}

@Component({
  selector: 'sl-markdown-demo-alerts',
  imports: [SlMarkdown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideMarkdownDefaults({
      labels: {
        alerts: {
          caution: 'Cuidado',
          important: 'Importante',
          note: 'Nota',
          tip: 'Dica',
          warning: 'Aviso',
        },
      },
    }),
  ],
  template: `<div slMarkdown [tree]="tree"></div>`,
})
class TranslatedAlertsDemo {
  protected readonly tree = md(ALERTS);
}

/* ── The page ─────────────────────────────────────────────────────────── */

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_MARKDOWN_DOCS.markdown.scenes, {
    playground: Playground,
    document: Document,
    tables: Tables,
    code: Code,
    tasks: Tasks,
    alerts: Alerts,
    footnotes: Footnotes,
    links: Links,
    sanitisation: Sanitisation,
    renderers: Renderers,
    streaming: Streaming,
    states: States,
    composition: Composition,
    accessibility: Accessibility,
  });

const IMPORTS = [
  SlMarkdown,
  SlMarkdownEmpty,
  SlLink,
  EditableTasksDemo,
  RenderersDemo,
  StreamingDemo,
  FailingSourceDemo,
  DocsPageDemo,
  TranslatedAlertsDemo,
];

const SAMPLES = {
  accessible: md(ACCESSIBLE),
  alertsOff: md(ALERTS.split('\n\n')[0] ?? ''),
  code: md(CODE),
  footnoteLabels: {
    backReference: (n: number, o: number) => `Voltar à referência ${n}${o > 1 ? `-${o}` : ''}`,
    footnotes: 'Notas',
  },
  footnotes: FOOTNOTES,
  hostile: md(HOSTILE),
  internalDomain: (href: string) =>
    /^https?:\/\//.test(href) && !href.startsWith('https://docs.acme.example'),
  links: md(LINKS),
  narrowAllow: ['paragraph', 'text', 'emphasis', 'strong', 'link'],
  note: md('## Nota rápida\n\n- Deploy às **14h**\n- Ver o [painel](/dashboards)'),
  plans: md(PLANS),
  regions: md(REGIONS),
  runbook: md(RUNBOOK),
  tasks: md(TASKS),
  whitespace: md('   '),
};

interface MarkdownStoryArgs {
  flow?: 'tight' | 'normal' | 'loose';
  headingAnchors?: boolean;
  headingOffset?: number;
  size?: 'md' | 'lg' | 'xl';
}

const meta: Meta<MarkdownStoryArgs> = {
  title: 'Components/Markdown',
  component: SlMarkdown,
  decorators: [moduleMetadata({ imports: IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Markdown',
        description:
          'Um documento desenhado a partir de uma árvore mdast, na tipografia de prose: títulos com id estável, tabelas, cercas em code-block, tarefas, alertas e notas do GitHub, links externos — e nenhuma string da fonte em innerHTML.',
        framework: 'Angular',
        ...ANGULAR_MARKDOWN_DOCS.markdown,
        tokens: ANGULAR_MARKDOWN_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<MarkdownStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it.
 */
const scene = (label: string, note: string, body: string, layout = 'block') => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="${layout}">${body}</div>
  </section>`;

const grid = (...scenes: string[]) =>
  `<div class="slotted-demo-grid" data-columns="1">${scenes.join('')}</div>`;

export const Playground: Story = {
  args: { flow: 'normal', headingAnchors: true, headingOffset: 0, size: 'lg' },
  argTypes: {
    flow: { control: 'inline-radio', options: ['tight', 'normal', 'loose'] },
    headingAnchors: { control: 'boolean' },
    headingOffset: { control: { max: 5, min: 0, type: 'number' } },
    size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, ...SAMPLES },
    template: `
<div class="slotted-demo-stage" data-layout="block">
  <div
    slMarkdown
    [flow]="flow"
    [headingAnchors]="headingAnchors"
    [headingOffset]="headingOffset"
    [size]="size"
    [tree]="runbook"
  ></div>
</div>`,
  }),
};

export const Document: Story = {
  parameters: scenario('document'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Um runbook, com âncoras',
        'O título com acento dá o id pré-requisitos, o mesmo que o link interno do primeiro parágrafo segue. A lista ordenada começa em 3 porque a fonte começa em 3.',
        `<div slMarkdown headingAnchors [tree]="runbook"></div>`,
      ),
    ),
  }),
};

export const Tables: Story = {
  parameters: scenario('tables'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Alinhamento lógico',
        'Plano ao início, lugares ao centro, preço ao fim. Troque a direção na barra: o preço vai para a esquerda, que é onde a leitura termina em RTL.',
        `<div slMarkdown [tree]="plans"></div>`,
      ),
      scene(
        'Mais larga do que a coluna',
        'Seis colunas numa medida de 360 px: a tabela rola dentro da sua própria caixa, e Tab chega a ela com o nome da região.',
        `<div class="slotted-demo-measure"><div slMarkdown [tree]="regions"></div></div>`,
      ),
    ),
  }),
};

export const Code: Story = {
  parameters: scenario('code'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'title, {2} e showLineNumbers',
        'A primeira cerca tem título e a segunda linha realçada; a segunda tem números. Cada uma tem o botão de copiar do code-block, e o espaço entre elas e o texto é o fluxo da região.',
        `<div slMarkdown [tree]="code"></div>`,
      ),
    ),
  }),
};

export const Tasks: Story = {
  parameters: scenario('tasks'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Só de leitura',
        'Sem editableTasks: as caixas continuam focáveis e dizem que são só de leitura; um clique não muda nada.',
        `<div slMarkdown [tree]="tasks"></div>`,
      ),
      scene(
        'Editáveis pela fonte',
        'Marque uma tarefa: o pedido reescreve o [ ] na fonte, o parser corre outra vez e a caixa muda com a árvore nova — a fonte é a única verdade.',
        `<sl-markdown-demo-tasks />`,
      ),
    ),
  }),
};

export const Alerts: Story = {
  parameters: scenario('alerts'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Os cinco alertas',
        'Nota, dica, importante, aviso e cuidado, cada um no seu tom e com o seu glifo; o aviso tem dois parágrafos e o segundo segue o fluxo da região.',
        `<sl-markdown-demo-alerts />`,
      ),
      scene(
        '[alerts]="false"',
        'A mesma fonte com a leitura desligada: o alerta volta a ser uma citação com o marcador [!NOTE] à vista.',
        `<div slMarkdown [alerts]="false" [tree]="alertsOff"></div>`,
      ),
    ),
  }),
};

export const Footnotes: Story = {
  parameters: scenario('footnotes'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Duas notas, três referências',
        'A nota 1 é referida duas vezes e tem duas setas de retorno; a definição que ninguém refere não aparece. Siga uma referência e volte pela seta.',
        `<div slMarkdown [labels]="footnoteLabels" [tree]="footnotes"></div>`,
      ),
    ),
  }),
};

export const Links: Story = {
  parameters: scenario('links'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Por omissão',
        'Os dois endereços https levam o glifo de saída e a dica de nova aba; o caminho, a âncora e o mailto são links simples.',
        `<div slMarkdown [tree]="links"></div>`,
      ),
      scene(
        'O domínio da casa é interno',
        'isExternal trata docs.acme.example como parte da aplicação: só a página de estado abre noutra aba.',
        `<div slMarkdown [isExternal]="internalDomain" [tree]="links"></div>`,
      ),
    ),
  }),
};

export const Sanitisation: Story = {
  parameters: scenario('sanitisation'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Uma fonte hostil',
        'O script e o negrito cru desaparecem; os três links executáveis ficam como texto; a imagem data: fica como o seu texto alternativo. Só o changelog é um link.',
        `<div slMarkdown [tree]="hostile"></div>`,
      ),
      scene(
        'allow e unwrapDisallowed',
        'Só parágrafos, texto, ênfase e links: a lista e o título entregam o texto ao pai em vez de desaparecerem.',
        `<div slMarkdown unwrapDisallowed [allow]="narrowAllow" [tree]="note"></div>`,
      ),
    ),
  }),
};

export const Renderers: Story = {
  parameters: scenario('renderers'),
  render: () => ({
    template: grid(
      scene(
        'Um link de router e uma menção',
        'Pressione o link: o template navega sem recarregar. As menções são nós mention criados por um passo sobre a árvore e desenhados como slTag.',
        `<sl-markdown-demo-renderers />`,
      ),
    ),
  }),
};

export const Streaming: Story = {
  parameters: scenario('streaming'),
  render: () => ({
    template: grid(
      scene(
        'Sete caracteres a cada 40 ms',
        'Durante o fluxo, o negrito e o código em linha aparecem formatados antes de o marcador de fecho chegar, e a cerca é um bloco desde a primeira linha. O que já está no ecrã não pisca.',
        `<sl-markdown-demo-streaming />`,
      ),
    ),
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'loading',
        'Um parágrafo de três linhas com a última mais curta, na tipografia da região, depois do delay do skeleton. A raiz fica aria-busy.',
        `<div slMarkdown loading [tree]="null"></div>`,
      ),
      scene(
        'Vazio',
        'Só espaço em branco na fonte: a parte empty com o conteúdo projetado, que é o lugar da ação que cria o primeiro texto.',
        `<div slMarkdown [tree]="whitespace"><span slMarkdownEmpty>Este serviço ainda não tem runbook. <a slLink href="#novo">Escrever o primeiro</a>.</span></div>`,
      ),
      scene(
        'Erro, com repetir',
        'Pressione Try again: o pedido volta a carregar e falha de novo ao fim de um segundo e meio, para se ver o ciclo inteiro.',
        `<sl-markdown-demo-failing />`,
      ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      scene(
        'Índice, medida e rótulos em português',
        'O índice vem de prepareMarkdown com os mesmos ids que os títulos desenham, por isso cada entrada chega ao seu título. O provider decide as âncoras e o nome delas uma vez.',
        `<sl-markdown-demo-docs />`,
      ),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    props: SAMPLES,
    template: grid(
      scene(
        'Tudo o que Tab alcança',
        'Um título com âncora um nível abaixo da página, um link externo, uma tabela, uma cerca e uma tarefa só de leitura, que continua focável: percorra com Tab e ouça cada parada.',
        `<div slMarkdown headingAnchors [headingOffset]="1" [tree]="accessible"></div>`,
      ),
    ),
  }),
};
