import markdownTokens from '@slotted/styles/markdown/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_MARKDOWN_TOKENS = markdownTokens.map((name) => ({
  name,
  purpose: name.startsWith('--slotted-markdown-')
    ? 'Decisão da família: o intervalo da caixa da tarefa ou o glifo de retorno'
    : name.startsWith('--slotted-prose-')
      ? 'Lido de prose: o recuo da lista e o fluxo entre blocos'
      : 'Decisão do tema lida pela família',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  SlMarkdown,\n  SlMarkdownChildren,\n  SlMarkdownEmpty,\n  SlMarkdownNode,\n  provideMarkdownDefaults,\n} from '@slotted/angular/markdown';\nimport { completeMarkdown, fromMarkedTokens, prepareMarkdown } from '@slotted/core/markdown';",
  selector: '[slMarkdown], ng-template[slMarkdownNode], [slMarkdownChildren], [slMarkdownEmpty]',
  exportAs: 'slMarkdown',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'A família: data-ui="markdown", data-status, data-flow, data-loading, data-empty, data-streaming e aria-busy. Os estados vazio, erro e carregamento desenham-se aqui, fora da tipografia da região.',
  },
  {
    part: 'embed',
    element: 'div',
    required: false,
    purpose:
      'Segura um code-block ou um alert e dá-lhe o fluxo da região, lido dos tokens públicos de prose; prose só espaça os elementos que conhece.',
  },
  {
    part: 'alert-body',
    element: 'div',
    required: false,
    purpose:
      'Os blocos de um alerta do GitHub dentro da descrição do alert; o primeiro começa rente ao título.',
  },
  {
    part: 'task-list',
    element: 'ul | ol',
    required: false,
    purpose: 'Uma lista em que pelo menos um item é tarefa. Os itens comuns mantêm o marcador.',
  },
  {
    part: 'task',
    element: 'li',
    required: false,
    purpose:
      'Uma grelha de duas colunas: o checkbox onde estava o marcador, depois o corpo. O texto começa na mesma aresta que o de um item comum.',
  },
  {
    part: 'task-body',
    element: 'div',
    required: false,
    purpose: 'O conteúdo da tarefa, incluindo uma lista aninhada.',
  },
  {
    part: 'backref',
    element: 'a',
    required: false,
    purpose:
      'O retorno de uma nota de rodapé à sua referência: uma seta para cima num alvo de 24 px, uma por referência.',
  },
  {
    part: 'empty',
    element: 'p',
    required: false,
    purpose: 'O documento não tem conteúdo: labels.empty, ou o nó do consumidor em empty.',
  },
  {
    part: 'error',
    element: 'div',
    required: false,
    purpose:
      'A fonte não chegou: inline-message em danger com labels.error e, com retryable, um botão de repetir.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Um runbook escrito em Markdown, passado pelo lexer do marked e por fromMarkedTokens. Os controlos por baixo do palco movem o tamanho, o fluxo, as âncoras e o deslocamento dos títulos.',
    snippet: defineSnippet({
      id: 'markdown-angular-playground',
      language: 'angular',
      label: 'Uma fonte, um adaptador, a família',
      source: '<div slMarkdown headingAnchors [tree]="tree"></div>',
    }),
  },
  {
    id: 'document',
    title: 'Um documento inteiro',
    note: 'Títulos com id estável, ênfase, código em linha, listas aninhadas, uma citação e uma régua: tudo em prose, cuja tipografia é a da região. Passe o ponteiro por um título para ver a âncora; com Tab ela aparece também.',
    snippet: defineSnippet({
      id: 'markdown-angular-document',
      language: 'angular',
      label: 'Âncoras nos títulos',
      source: '<div slMarkdown headingAnchors [tree]="tree"></div>',
    }),
  },
  {
    id: 'tables',
    title: 'Tabelas do GFM',
    note: 'O alinhamento :-- e --: chega como start e end, por isso uma tabela vista em RTL mantém os preços contra a aresta onde a leitura termina. Uma tabela mais larga do que a coluna rola dentro da parte scroll de prose, que só ganha tabindex e nome enquanto transborda.',
    snippet: defineSnippet({
      id: 'markdown-tables',
      language: 'markdown',
      label: 'Colunas alinhadas no Markdown',
      source:
        '| Plano | Lugares |   Preço |\n| :---- | :-----: | ------: |\n| Team  |   10    | $120.00 |',
    }),
  },
  {
    id: 'code',
    title: 'Cercas com code-block',
    note: 'Cada cerca é um CodeBlock: a linguagem da info string, e o que vem depois dela — title="…", {2} e showLineNumbers — chega como título, linha realçada e números. O realce de sintaxe é o do CodeBlockDefaultsProvider.',
    snippet: defineSnippet({
      id: 'markdown-code',
      language: 'markdown',
      label: 'Metadados na info string',
      source:
        "```ts title=\"deploy.ts\" {2} showLineNumbers\nimport { deploy } from '@acme/cli';\nawait deploy({ env: 'production' });\n```",
    }),
  },
  {
    id: 'tasks',
    title: 'Listas de tarefas',
    note: 'Sem editableTasks as caixas são checkbox em readOnly: focáveis, anunciadas como só de leitura. Com ele, marcar uma tarefa pede a mudança com o índice e o offset na fonte; a caixa só se move quando a árvore nova chega.',
    snippet: defineSnippet({
      id: 'markdown-angular-tasks',
      language: 'angular',
      label: 'Reescrever a fonte a partir do pedido',
      source:
        '<div\n  slMarkdown\n  editableTasks\n  [tree]="tree"\n  (taskChange)="source.set(toggleTask(source(), $event.index, $event.checked))"\n></div>',
    }),
  },
  {
    id: 'alerts',
    title: 'Alertas do GitHub',
    note: '> [!NOTE], [!TIP], [!IMPORTANT], [!WARNING] e [!CAUTION] tornam-se alert em reach="section" e live="off" — conteúdo, não anúncio — nos tons accent, success, secondary, warning e danger. alerts={false} devolve a citação.',
    snippet: defineSnippet({
      id: 'markdown-alerts',
      language: 'markdown',
      label: 'A sintaxe do GitHub',
      source: '> [!WARNING]\n> A deployment during a migration waits for the migration to finish.',
    }),
  },
  {
    id: 'footnotes',
    title: 'Notas de rodapé',
    note: 'Numeradas pela primeira referência, com uma seta de retorno por referência dentro do último parágrafo da nota. A secção tem um título escondido que dá nome ao conjunto; uma definição que ninguém referencia não é desenhada, como no GitHub.',
    snippet: defineSnippet({
      id: 'markdown-angular-footnotes',
      language: 'angular',
      label: 'O rótulo da secção, traduzido',
      source: '<div slMarkdown [labels]="{ footnotes: \'Notas\' }" [tree]="tree"></div>',
    }),
  },
  {
    id: 'links',
    title: 'Links internos e externos',
    note: 'Um endereço absoluto http(s) sai da aplicação: é um Link com o glifo e a dica de nova aba. Um caminho relativo é um a simples. external="same-tab" mantém a aba; isExternal decide quais hosts são da casa.',
    snippet: defineSnippet({
      id: 'markdown-angular-links',
      language: 'angular',
      label: 'O próprio domínio conta como interno',
      source: '<div slMarkdown [isExternal]="isOwnDomainInternal" [tree]="tree"></div>',
    }),
  },
  {
    id: 'sanitisation',
    title: 'Sanitização por construção',
    note: 'A família nunca escreve innerHTML. HTML cru não é desenhado; javascript:, data: e as grafias disfarçadas perdem o link e ficam como texto; uma imagem recusada fica como o seu texto alternativo. transformUrl troca a política; allow restringe os tipos.',
    snippet: defineSnippet({
      id: 'markdown-angular-sanitisation',
      language: 'angular',
      label: 'Só texto, ênfase e links',
      source:
        "<div\n  slMarkdown\n  unwrapDisallowed\n  [allow]=\"['paragraph', 'text', 'emphasis', 'strong', 'link']\"\n  [tree]=\"tree\"\n></div>",
    }),
  },
  {
    id: 'renderers',
    title: 'Renderizadores e extensões',
    note: 'ng-template[slMarkdownNode] com o nome de um tipo conhecido substitui o seu elemento — aqui o link vira o routerLink da aplicação — e slMarkdownChildren desenha os filhos no lugar. Com o nome de um tipo desconhecido, desenha esse tipo: aqui uma menção a uma pessoa, que um passo sobre a árvore criou. Um tipo sem renderizador não aparece.',
    snippet: defineSnippet({
      id: 'markdown-angular-renderers',
      language: 'angular',
      label: 'Um link de router e uma menção',
      source:
        '<div slMarkdown [tree]="withMentions(tree)">\n  <ng-template slMarkdownNode="mention" let-element\n    ><span slTag>&#64;{{ element.node?.value }}</span></ng-template\n  >\n  <ng-template slMarkdownNode="link" let-element\n    ><a [routerLink]="element.href"><ng-container [slMarkdownChildren]="element" /></a\n  ></ng-template>\n</div>',
    }),
  },
  {
    id: 'streaming',
    title: 'Uma resposta que ainda está a chegar',
    note: 'completeMarkdown fecha o que o fluxo deixou aberto — a cerca, o **, a crase, o link cortado — antes do parser. Os blocos já desenhados mantêm a chave e não voltam a montar; streaming põe aria-busy na região até ao fim.',
    snippet: defineSnippet({
      id: 'markdown-angular-streaming',
      language: 'angular',
      label: 'Fechar antes de analisar',
      source:
        '<div\n  slMarkdown\n  [idPrefix]="\'msg-\' + message.id + \'-\'"\n  [streaming]="streaming()"\n  [tree]="tree()"\n></div>',
    }),
  },
  {
    id: 'states',
    title: 'Carregando, vazio e erro',
    note: 'loading desenha um parágrafo de três linhas depois do delay do skeleton, na tipografia da região; vazio escreve labels.empty ou o conteúdo projetado em slMarkdownEmpty; status="error" troca o documento por uma mensagem e, com retryable, um botão que emite retry.',
    snippet: defineSnippet({
      id: 'markdown-angular-states',
      language: 'angular',
      label: 'Os três estados fora da região',
      source:
        '<div\n  slMarkdown\n  retryable\n  [loading]="loading()"\n  [status]="failed() ? \'error\' : \'ready\'"\n  [tree]="tree()"\n  (retry)="reload()"\n>\n  <span slMarkdownEmpty>Este servi\u00e7o ainda n\u00e3o tem runbook.</span>\n</div>',
    }),
  },
  {
    id: 'composition',
    title: 'Numa página de documentação',
    note: 'slContainer dá a medida, prepareMarkdown dá o índice com os mesmos ids que a página desenha — e exportAs dá o mesmo document() a partir do template —, e provideMarkdownDefaults diz uma vez, em português, o que a família escreve.',
    snippet: defineSnippet({
      id: 'markdown-angular-composition',
      language: 'angular',
      label: 'O índice a partir do mesmo documento',
      source:
        '<nav aria-label="Nesta p\u00e1gina">\n  @for (heading of outline.headings; track heading.id) {\n    <a [href]="\'#\' + heading.id">{{ heading.text }}</a>\n  }\n</nav>\n<div slContainer size="measure"><div slMarkdown headingAnchors [tree]="tree"></div></div>',
    }),
  },
  {
    id: 'accessibility',
    title: 'Teclado e leitor de ecrã',
    note: 'Tab percorre as âncoras dos títulos, os links, uma tabela que rola, os controlos de um bloco de código, as tarefas editáveis e os retornos das notas. A família não acrescenta tecla nenhuma: cada parada é de uma família composta.',
    snippet: defineSnippet({
      id: 'markdown-angular-accessibility',
      language: 'angular',
      label: 'Títulos um nível abaixo do da página',
      source: '<div slMarkdown headingAnchors [headingOffset]="1" [tree]="tree"></div>',
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'taskChange',
    payload: '{ index, checked, offset, request }',
    when: 'Quando o leitor marca ou desmarca uma tarefa com editableTasks ligado, com a razão pointer ou keyboard em request. A caixa não se move: a árvore nova do consumidor é que a move.',
  },
  {
    name: 'retry',
    payload: "'pointer' | 'keyboard'",
    when: 'Quando o leitor pressiona o botão de repetir da parte error, desenhado com retryable.',
  },
];

export const ANGULAR_MARKDOWN_DOCS = {
  markdown: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      ['tree', 'MarkdownNode | null', '—', '[slMarkdown]', 'O documento em mdast; nunca HTML'],
      ['size', "'md' | 'lg' | 'xl'", 'lg', '[slMarkdown]', 'O degrau de tipo da região, de prose'],
      [
        'flow',
        "'tight' | 'normal' | 'loose'",
        'normal',
        '[slMarkdown]',
        'O espaço entre blocos, de prose',
      ],
      [
        'status',
        "'ready' | 'error'",
        'ready',
        '[slMarkdown]',
        'error troca o documento pela parte error',
      ],
      [
        'loading',
        'boolean',
        'false',
        '[slMarkdown]',
        'Um parágrafo de espera, depois do delay do skeleton',
      ],
      ['streaming', 'boolean', 'false', '[slMarkdown]', 'aria-busy enquanto a fonte chega'],
      [
        'external',
        "'new-tab' | 'same-tab'",
        'new-tab',
        '[slMarkdown]',
        'Onde abre um link que sai da aplicação',
      ],
      ['headingAnchors', 'boolean', 'false', '[slMarkdown]', 'Um permalink em cada título'],
      ['headingOffset', 'number', '0', '[slMarkdown]', 'Somado ao nível de cada título, até seis'],
      [
        'idPrefix',
        'string',
        '',
        '[slMarkdown]',
        'Antes de cada id gerado; obrigatório com duas regiões na página',
      ],
      ['alerts', 'boolean', 'true', '[slMarkdown]', 'Lê > [!NOTE] e os irmãos como alert'],
      [
        'allow',
        'string[]',
        'CommonMark + GFM sem html',
        '[slMarkdown]',
        'Os tipos mdast desenhados',
      ],
      [
        'unwrapDisallowed',
        'boolean',
        'false',
        '[slMarkdown]',
        'Um tipo recusado entrega os filhos ao pai',
      ],
      [
        'transformUrl',
        '(url, kind, node) => string | null',
        'safeUrl',
        '[slMarkdown]',
        'A política de URL; null recusa',
      ],
      [
        'isExternal',
        '(href) => boolean',
        'isExternalUrl',
        '[slMarkdown]',
        'Se um link sai da aplicação',
      ],
      ['labels', 'Partial<MarkdownLabels>', '—', '[slMarkdown]', 'As palavras da família'],
      [
        'editableTasks',
        'boolean',
        'false',
        '[slMarkdown]',
        'Liga os checkboxes das tarefas; um output não diz se alguém o ouve',
      ],
      [
        'retryable',
        'boolean',
        'false',
        '[slMarkdown]',
        'Desenha o botão de repetir na parte error',
      ],
    ]),
    composition: apiRows([
      [
        'ng-template[slMarkdownNode]',
        'kind | type',
        '—',
        'conteúdo',
        'Substitui o elemento de um tipo conhecido, ou desenha um tipo desconhecido; recebe o elemento preparado',
      ],
      [
        '[slMarkdownChildren]',
        'MarkdownElement',
        '—',
        'ng-container',
        'Desenha os filhos de um elemento dentro de um template, sem elemento próprio',
      ],
      ['[slMarkdownEmpty]', 'conteúdo projetado', '—', 'conteúdo', 'O conteúdo da parte empty'],
      [
        'exportAs',
        'slMarkdown',
        '—',
        '[slMarkdown]',
        'document(): os headings e as notas, com os ids da página',
      ],
      [
        'provideMarkdownDefaults',
        'labels | external | headingAnchors | alerts | allow | transformUrl | isExternal',
        '—',
        'Aplicação',
        'Decidido uma vez para todos os documentos por baixo; um input ganha',
      ],
      [
        'prepareMarkdown',
        '(tree, options) => MarkdownDocument',
        '—',
        '@slotted/core/markdown',
        'headings para um índice, com os ids da página',
      ],
      [
        'completeMarkdown',
        '(source) => string',
        '—',
        '@slotted/core/markdown',
        'Fecha uma fonte cortada antes do parser',
      ],
      [
        'fromMarkedTokens',
        '(tokens) => MarkdownNode',
        '—',
        '@slotted/core/markdown',
        'O lexer do marked como mdast',
      ],
      [
        'id, aria-*, data-*',
        'atributos nativos',
        '—',
        '[slMarkdown]',
        'Ficam no elemento do consumidor',
      ],
    ]),
    accessibility: [
      'Nenhuma string da fonte chega a innerHTML: a família recebe uma árvore, recusa HTML cru e esquemas executáveis por omissão, e cada elemento é criado pelo framework.',
      'Os títulos são títulos de verdade, deslocáveis com headingOffset para caberem no esboço da página; a âncora fica na ordem de tabulação e na árvore de acessibilidade, com o nome "Link to section: <título>".',
      'Uma tarefa é um checkbox nomeado pelo texto do item; sem editableTasks é aria-readonly, não disabled, por isso continua focável e legível.',
      'Cada referência de nota tem aria-describedby para o título escondido da secção, e cada retorno diz para qual referência volta; um alerta do GitHub é live="off", porque é conteúdo e não um evento.',
      'streaming e loading põem aria-busy na raiz, e o skeleton faz um único anúncio educado; nada move o foco quando o conteúdo chega.',
    ],
    snippets: [
      defineSnippet({
        id: 'markdown-angular-anatomy',
        language: 'angular',
        label: 'Anatomia, como chega ao DOM',
        source:
          '<div slMarkdown data-flow="normal" data-status="ready">\n  <div slProse>\n    <h2 id="deploying">Deploying</h2>\n    <div data-part="embed"><div slCodeBlock></div></div>\n    <ul data-part="task-list">\n      <li data-part="task">\n        <div slCheckbox></div>\n        <div data-part="task-body">Write the migration</div>\n      </li>\n    </ul>\n  </div>\n</div>',
      }),
      defineSnippet({
        id: 'markdown-theming',
        language: 'css',
        label: 'Retunar a família para uma aplicação',
        source:
          "[data-ui='markdown'] {\n  --slotted-markdown-task-gap: var(--slotted-space-4);\n  --slotted-markdown-backref-size: 1em;\n}",
      }),
    ],
  },
} as const;
