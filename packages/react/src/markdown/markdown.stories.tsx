import { completeMarkdown, fromMarkedTokens, prepareMarkdown } from '@slotted/core/markdown';
import type { MarkdownNode } from '@slotted/core/markdown';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { marked } from 'marked';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Container } from '../container';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Link } from '../link';
import { Tag } from '../tag';
import { Markdown } from './markdown';
import { MarkdownDefaultsProvider } from './markdown-defaults';
import { REACT_MARKDOWN_DOCS, REACT_MARKDOWN_TOKENS } from './markdown.docs';
import type { MarkdownProps } from './markdown.types';

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

const TABLES = `| Plano | Lugares | Preço mensal |
| :---- | :-----: | -----------: |
| Team | 10 | R$ 120,00 |
| Business | 50 | R$ 1.450,00 |
| Enterprise | ilimitado | sob consulta |

| Região | Instâncias | Último deploy | Responsável | Estado | Versão |
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

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_MARKDOWN_DOCS.markdown.scenes, {
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

const meta = {
  title: 'Components/Markdown',
  component: Markdown,
  args: { tree: md(RUNBOOK) },
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Markdown',
        description:
          'Um documento desenhado a partir de uma árvore mdast, na tipografia de prose: títulos com id estável, tabelas, cercas em code-block, tarefas, alertas e notas do GitHub, links externos — e nenhuma string da fonte em innerHTML.',
        framework: 'React',
        ...REACT_MARKDOWN_DOCS.markdown,
        tokens: REACT_MARKDOWN_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function Single({ children, label, note }: { children: ReactNode; label: string; note: string }) {
  return (
    <Grid columns={1}>
      <Scene label={label} note={note}>
        {children}
      </Scene>
    </Grid>
  );
}

export const Playground: Story = {
  args: {
    flow: 'normal',
    headingAnchors: true,
    headingOffset: 0,
    size: 'lg',
    tree: md(RUNBOOK),
  },
  argTypes: {
    flow: { control: 'inline-radio', options: ['tight', 'normal', 'loose'] },
    headingAnchors: { control: 'boolean' },
    headingOffset: { control: { max: 5, min: 0, type: 'number' } },
    size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Markdown {...args} />
    </div>
  ),
};

export const Document: Story = {
  parameters: scenario('document'),
  render: () => (
    <Single
      label="Um runbook, com âncoras"
      note="O título com acento dá o id pré-requisitos, o mesmo que o link interno do primeiro parágrafo segue. A lista ordenada começa em 3 porque a fonte começa em 3."
    >
      <Markdown headingAnchors tree={md(RUNBOOK)} />
    </Single>
  ),
};

export const Tables: Story = {
  parameters: scenario('tables'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Alinhamento lógico"
        note="Plano ao início, lugares ao centro, preço ao fim. Troque a direção na barra: o preço vai para a esquerda, que é onde a leitura termina em RTL."
      >
        <Markdown tree={md(TABLES.split('\n\n')[0] ?? '')} />
      </Scene>
      <Scene
        label="Mais larga do que a coluna"
        note="Seis colunas numa medida de 360 px: a tabela rola dentro da sua própria caixa, e Tab chega a ela com o nome da região."
      >
        <Measure>
          <Markdown tree={md(TABLES.split('\n\n')[1] ?? '')} />
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Code: Story = {
  parameters: scenario('code'),
  render: () => (
    <Single
      label="title, {2} e showLineNumbers"
      note="A primeira cerca tem título e a segunda linha realçada; a segunda tem números. Cada uma tem o botão de copiar do code-block, e o espaço entre elas e o texto é o fluxo da região."
    >
      <Markdown tree={md(CODE)} />
    </Single>
  ),
};

function EditableTasks() {
  const [source, setSource] = useState(TASKS);
  const tree = useMemo(() => md(source), [source]);
  return (
    <Markdown
      onTaskChange={({ checked, index }) =>
        setSource((current) => toggleTask(current, index, checked))
      }
      tree={tree}
    />
  );
}

export const Tasks: Story = {
  parameters: scenario('tasks'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Só de leitura"
        note="Sem onTaskChange: as caixas continuam focáveis e dizem que são só de leitura; um clique não muda nada."
      >
        <Markdown tree={md(TASKS)} />
      </Scene>
      <Scene
        label="Editáveis pela fonte"
        note="Marque uma tarefa: o pedido reescreve o [ ] na fonte, o parser corre outra vez e a caixa muda com a árvore nova — a fonte é a única verdade."
      >
        <EditableTasks />
      </Scene>
    </Grid>
  ),
};

export const Alerts: Story = {
  parameters: scenario('alerts'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Os cinco alertas"
        note="Nota, dica, importante, aviso e cuidado, cada um no seu tom e com o seu glifo; o aviso tem dois parágrafos e o segundo segue o fluxo da região."
      >
        <MarkdownDefaultsProvider
          labels={{
            alerts: {
              caution: 'Cuidado',
              important: 'Importante',
              note: 'Nota',
              tip: 'Dica',
              warning: 'Aviso',
            },
          }}
        >
          <Markdown tree={md(ALERTS)} />
        </MarkdownDefaultsProvider>
      </Scene>
      <Scene
        label="alerts={false}"
        note="A mesma fonte com a leitura desligada: cada alerta volta a ser uma citação com o marcador [!NOTE] à vista."
      >
        <Markdown alerts={false} tree={md(ALERTS.split('\n\n')[0] ?? '')} />
      </Scene>
    </Grid>
  ),
};

export const Footnotes: Story = {
  parameters: scenario('footnotes'),
  render: () => (
    <Single
      label="Duas notas, três referências"
      note="A nota 1 é referida duas vezes e tem duas setas de retorno; a definição que ninguém refere não aparece. Siga uma referência e volte pela seta."
    >
      <Markdown
        labels={{
          backReference: (n, o) => `Voltar à referência ${n}${o > 1 ? `-${o}` : ''}`,
          footnotes: 'Notas',
        }}
        tree={FOOTNOTES}
      />
    </Single>
  ),
};

export const Links: Story = {
  parameters: scenario('links'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Por omissão"
        note="Os dois endereços https levam o glifo de saída e a dica de nova aba; o caminho, a âncora e o mailto são links simples."
      >
        <Markdown tree={md(LINKS)} />
      </Scene>
      <Scene
        label="O domínio da casa é interno"
        note="isExternal trata docs.acme.example como parte da aplicação: só a página de estado abre noutra aba."
      >
        <Markdown
          isExternal={(href) =>
            /^https?:\/\//.test(href) && !href.startsWith('https://docs.acme.example')
          }
          tree={md(LINKS)}
        />
      </Scene>
    </Grid>
  ),
};

export const Sanitisation: Story = {
  parameters: scenario('sanitisation'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Uma fonte hostil"
        note="O script e o negrito cru desaparecem; os três links executáveis ficam como texto; a imagem data: fica como o seu texto alternativo. Só o changelog é um link."
      >
        <Markdown tree={md(HOSTILE)} />
      </Scene>
      <Scene
        label="allow e unwrapDisallowed"
        note="Só parágrafos, texto, ênfase e links: as listas e os títulos do runbook entregam o texto ao pai em vez de desaparecerem."
      >
        <Markdown
          allow={['paragraph', 'text', 'emphasis', 'strong', 'link']}
          tree={md('## Nota rápida\n\n- Deploy às **14h**\n- Ver o [painel](/dashboards)')}
          unwrapDisallowed
        />
      </Scene>
    </Grid>
  ),
};

function RoutedMentions() {
  const [route, setRoute] = useState('/');
  return (
    <>
      <Markdown
        extensions={{
          mention: ({ element }) => <Tag size="sm">@{String(element.node.value)}</Tag>,
        }}
        renderers={{
          link: ({ children, element }) => (
            <Link
              href={element.href}
              onClick={(event) => {
                event.preventDefault();
                setRoute(element.href);
              }}
            >
              {children}
            </Link>
          ),
        }}
        tree={withMentions(md(MENTIONS))}
      />
      <p className="slotted-demo-scene__note">Rota atual: {route}</p>
    </>
  );
}

export const Renderers: Story = {
  parameters: scenario('renderers'),
  render: () => (
    <Single
      label="Um link de router e uma menção"
      note="Pressione o link: o renderizador navega sem recarregar. As menções são nós mention criados por um passo sobre a árvore e desenhados como tag."
    >
      <RoutedMentions />
    </Single>
  ),
};

function StreamedAnswer() {
  const [length, setLength] = useState(ANSWER.length);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = () => {
    clearInterval(timer.current);
    setLength(0);
    setRunning(true);
    timer.current = setInterval(() => {
      setLength((current) => {
        const next = Math.min(ANSWER.length, current + 7);
        if (next === ANSWER.length) {
          clearInterval(timer.current);
          setRunning(false);
        }
        return next;
      });
    }, 40);
  };

  const source = ANSWER.slice(0, length);
  return (
    <>
      <Markdown idPrefix="answer-" streaming={running} tree={md(completeMarkdown(source))} />
      <p>
        <Button onClick={start} size="sm" variant="outline">
          Transmitir a resposta de novo
        </Button>
      </p>
    </>
  );
}

export const Streaming: Story = {
  parameters: scenario('streaming'),
  render: () => (
    <Single
      label="Sete caracteres a cada 40 ms"
      note="Durante o fluxo, o negrito e o código em linha aparecem formatados antes de o marcador de fecho chegar, e a cerca é um bloco desde a primeira linha. O que já está no ecrã não pisca."
    >
      <StreamedAnswer />
    </Single>
  ),
};

function FailingSource() {
  const [status, setStatus] = useState<MarkdownProps['status']>('error');
  const [loading, setLoading] = useState(false);
  return (
    <Markdown
      loading={loading}
      onRetry={() => {
        setStatus('ready');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStatus('error');
        }, 1500);
      }}
      status={status}
      tree={null}
    />
  );
}

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="loading"
        note="Um parágrafo de três linhas com a última mais curta, na tipografia da região, depois do delay do skeleton. A raiz fica aria-busy."
      >
        <Markdown loading tree={null} />
      </Scene>
      <Scene
        label="Vazio"
        note="Só espaço em branco na fonte: a parte empty com o conteúdo do consumidor, que é o lugar da ação que cria o primeiro texto."
      >
        <Markdown
          empty={
            <>
              Este serviço ainda não tem runbook. <Link href="#novo">Escrever o primeiro</Link>.
            </>
          }
          tree={md('   ')}
        />
      </Scene>
      <Scene
        label="Erro, com repetir"
        note="Pressione Try again: o pedido volta a carregar e falha de novo ao fim de um segundo e meio, para se ver o ciclo inteiro."
      >
        <FailingSource />
      </Scene>
    </Grid>
  ),
};

function DocsPage() {
  const tree = useMemo(() => md(RUNBOOK), []);
  const { headings } = useMemo(() => prepareMarkdown(tree), [tree]);
  return (
    <MarkdownDefaultsProvider
      headingAnchors
      labels={{ anchor: (heading) => `Ligação para: ${heading}` }}
    >
      <nav aria-label="Nesta página">
        <ul>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Container size="measure">
        <Markdown tree={tree} />
      </Container>
    </MarkdownDefaultsProvider>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Single
      label="Índice, medida e rótulos em português"
      note="O índice vem de prepareMarkdown com os mesmos ids que os títulos desenham, por isso cada entrada chega ao seu título. O provider decide as âncoras e o nome delas uma vez."
    >
      <DocsPage />
    </Single>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Single
      label="Tudo o que Tab alcança"
      note="Um título com âncora um nível abaixo da página, um link externo, uma tabela, uma cerca e uma tarefa só de leitura, que continua focável: percorra com Tab e ouça cada parada."
    >
      <Markdown
        headingAnchors
        headingOffset={1}
        tree={md(
          `# Checklist de lançamento\n\nConfira o [estado](https://status.acme.example).\n\n| Passo | Dono |\n| --- | --- |\n| Migração | dados |\n\n\`\`\`sh\nacme deploy --env production\n\`\`\`\n\n- [ ] Confirmar com o suporte`,
        )}
      />
    </Single>
  ),
};
