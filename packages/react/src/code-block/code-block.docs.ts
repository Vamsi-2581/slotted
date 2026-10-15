import codeBlockTokens from '@slotted/styles/code-block/tokens.json';
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

export const REACT_CODE_BLOCK_TOKENS = codeBlockTokens.map((name) => ({
  name,
  purpose: name.startsWith('--slotted-code-')
    ? 'A cor de uma espécie de palavra, da escala de código do tema'
    : 'Decisão do tema sobre o bloco de código',
}));

const imports: ReferenceImport = {
  source:
    "import { CodeBlock, CodeBlockDefaultsProvider } from '@slotted/react';\nimport { fromPrismTokens, fromShikiTokens } from '@slotted/core/code';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'A moldura: o fundo afundado, a aresta e o raio que prose já desenha numa cerca. Carrega data-ui="code-block", data-language, data-wrap, data-revealed, data-line-numbers, data-loading, data-marks e os quatro valores de runtime.',
  },
  {
    part: 'header',
    element: 'div',
    required: false,
    purpose:
      'O nome do ficheiro, a linguagem no fim e os controles. Existe quando há título, linguagem, cópia ou ações do consumidor. Mantém a direção da página.',
  },
  {
    part: 'icon',
    element: 'span',
    required: false,
    purpose:
      'O glifo da espécie do ficheiro ao lado do título, escolhido por fileKind a partir do nome.',
  },
  {
    part: 'title',
    element: 'span',
    required: false,
    purpose:
      'O nome do ficheiro, em mono, truncado com reticências. É o nome da região de rolagem.',
  },
  {
    part: 'language',
    element: 'span',
    required: false,
    purpose: 'A linguagem em maiúsculas pequenas, no fim do cabeçalho.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'Os controles: os do consumidor, o wrap e o copy. Sem cabeçalho flutua sobre a primeira linha, no fundo do bloco.',
  },
  {
    part: 'wrap',
    element: 'button',
    required: false,
    purpose:
      'aria-pressed: quebra as linhas na caixa. Desenhado só enquanto uma linha transborda, ou enquanto já está quebrado.',
  },
  {
    part: 'copy',
    element: 'button',
    required: false,
    purpose:
      'O controle de description-list: escreve o código, não o DOM, sem as linhas removidas; data-complete por dois segundos com o check no lugar das folhas.',
  },
  {
    part: 'body',
    element: 'div',
    required: true,
    purpose:
      'Um scroll-area vestido como data-ui: a região com nome e parada de tabulação só enquanto o código transborda, a barra da plataforma, o véu na ponta.',
  },
  {
    part: 'pre',
    element: 'pre',
    required: true,
    purpose: 'white-space: pre, direction: ltr seja qual for a página, pre-wrap sob data-wrap.',
  },
  {
    part: 'code',
    element: 'code',
    required: true,
    purpose: 'class="language-<x>", a convenção da especificação HTML; uma grelha de linhas.',
  },
  {
    part: 'line',
    element: 'span',
    required: true,
    purpose:
      'Uma linha da grelha: número, marcador, texto. data-line, data-mark e data-dim; --slotted-code-block-indent sob wrap.',
  },
  {
    part: 'number',
    element: 'span',
    required: true,
    purpose:
      'O número, aria-hidden e não selecionável; escondido sem lineNumbers, mas no DOM, para nada se mover ao ligar.',
  },
  {
    part: 'marker',
    element: 'span',
    required: true,
    purpose:
      'A coluna do sinal: + e − nas linhas de diff, escritos por CSS e fora de qualquer seleção.',
  },
  {
    part: 'text',
    element: 'span',
    required: true,
    purpose: 'A corrida de tokens da linha, a terceira coluna. É o que renderLine substitui.',
  },
  {
    part: 'token',
    element: 'span',
    required: false,
    purpose: 'Um token com escopo, data-token entre os doze; um token sem escopo é texto puro.',
  },
  {
    part: 'reveal',
    element: 'button',
    required: false,
    purpose:
      '"Show n more lines" quando collapseAfter esconde linhas; "Show less" quando reveladas. Escape no bloco revelado dobra-o.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Um ficheiro TypeScript com título, números de linha e um intervalo realçado, movido pelos controlos por baixo do palco.',
    snippet: defineSnippet({
      id: 'code-block-react-playground',
      language: 'tsx',
      label: 'Um bloco com título e números',
      source:
        '<CodeBlock code={source} language="ts" lineNumbers marks={{ highlight: \'5-6\' }} title="group.ts" />;',
    }),
  },
  {
    id: 'highlight',
    title: 'Texto primeiro, tokens quando chegam',
    note: 'O bloco desenha o texto puro no primeiro paint e troca os tokens linha a linha quando o motor responde: a altura não muda, porque cada linha é uma fila da grelha. As cores são a escala --slotted-code-* do tema, e mudam com o esquema.',
    snippet: defineSnippet({
      id: 'code-block-react-highlight',
      language: 'tsx',
      label: 'Um motor entregue ao bloco',
      source:
        '<CodeBlock\n  code={source}\n  highlight={async (code, language) => tokenise(code, language)}\n  language="ts"\n/>;',
    }),
  },
  {
    id: 'engines',
    title: 'Prism e Shiki entram pelos mapeamentos',
    note: 'A família não carrega gramática nenhuma. fromPrismTokens dobra os nomes padrão do Prism sobre os doze escopos; fromShikiTokens lê o último escopo TextMate de cada token. Um HTML de motor nunca entra: o que chega é texto em spans.',
    snippet: defineSnippet({
      id: 'code-block-react-engines',
      language: 'tsx',
      label: 'Os dois adaptadores, sem importar nenhum motor',
      source:
        "const prism = (code, lang) => fromPrismTokens(Prism.tokenize(code, Prism.languages[lang]));\nconst shiki = async (code, lang) =>\n  fromShikiTokens(\n    await codeToTokens(code, { includeExplanation: 'scopeName', lang, theme: 'none' }),\n  );",
    }),
  },
  {
    id: 'lineNumbers',
    title: 'Números de linha',
    note: 'lineNumbers desenha um contador numa goteira larga o bastante para o último número, medida em ch; start diz por onde começa. A goteira é aria-hidden e user-select: none, por isso uma seleção pelo bloco copia código e nada mais.',
    snippet: defineSnippet({
      id: 'code-block-react-line-numbers',
      language: 'tsx',
      label: 'A partir da linha 98',
      source: '<CodeBlock code={source} language="ts" lineNumbers start={98} />;',
    }),
  },
  {
    id: 'marks',
    title: 'Linhas marcadas',
    note: 'marks toma intervalos "1,4-6" ou listas de números: highlight tinge com o acento e uma barra na ponta; error e warning com danger e warning. A tinta é do texto do tom a 7,5%, para nenhum escopo cair abaixo de 4,5:1.',
    snippet: defineSnippet({
      id: 'code-block-react-marks',
      language: 'tsx',
      label: 'Realce, erro e aviso',
      source:
        "<CodeBlock code={source} language=\"sh\" marks={{ error: '3', highlight: '1', warning: [4] }} />;",
    }),
  },
  {
    id: 'diff',
    title: 'Um diff',
    note: 'add e remove tingem com success e danger e escrevem + e − na goteira, por CSS. O controle de cópia deixa as linhas removidas de fora, porque o código depois da mudança é o que se cola; copyRemoved mantém-nas.',
    snippet: defineSnippet({
      id: 'code-block-react-diff',
      language: 'tsx',
      label: 'Duas linhas fora, três dentro',
      source:
        "<CodeBlock code={source} language=\"css\" lineNumbers marks={{ add: '4-6', remove: '2-3' }} />;",
    }),
  },
  {
    id: 'focus',
    title: 'Foco numa parte do bloco',
    note: 'focus esmaece e desfoca as linhas fora do intervalo; o bloco levanta o véu com o ponteiro em cima ou o foco dentro, por isso quem quer o resto tem-no. Sob reduced-motion o desfoque sai e o esmaecer fica, porque é a informação.',
    snippet: defineSnippet({
      id: 'code-block-react-focus',
      language: 'tsx',
      label: 'O leitor olha para três linhas',
      source: '<CodeBlock code={source} language="json" marks={{ focus: \'3-6\' }} />;',
    }),
  },
  {
    id: 'wrap',
    title: 'Quebrar linhas longas',
    note: 'O controle de wrap só aparece enquanto uma linha transborda — a regra do Docusaurus — e é um botão pressionado. A continuação de uma linha quebrada indenta-se ao próprio indent do código, medido uma vez por linha em ch.',
    snippet: defineSnippet({
      id: 'code-block-react-wrap',
      language: 'tsx',
      label: 'Começar quebrado, e ser avisado',
      source:
        '<CodeBlock\n  code={command}\n  defaultWrap\n  language="sh"\n  onWrapChange={(wrap, request) => log(request.reason)}\n/>;',
    }),
  },
  {
    id: 'title',
    title: 'Um ficheiro com nome',
    note: 'title põe o cabeçalho com o nome em mono, o glifo da espécie do ficheiro — uma folha de texto para um .ts, uma folha de tabela para um .csv — e a linguagem no fim. O título é também o nome da região de rolagem.',
    snippet: defineSnippet({
      id: 'code-block-react-title',
      language: 'tsx',
      label: 'O nome que a região herda',
      source: '<CodeBlock code={rows} language="csv" title="orders-2026-09.csv" />;',
    }),
  },
  {
    id: 'collapse',
    title: 'Dobrado atrás de "Show more"',
    note: 'collapseAfter esconde o que passa de n linhas atrás de um controle; a última linha visível desvanece-se nele. revealed é o modelo de estado; Escape dentro do bloco revelado dobra-o e mantém o foco. As linhas escondidas ficam no DOM e numa seleção.',
    snippet: defineSnippet({
      id: 'code-block-react-collapse',
      language: 'tsx',
      label: 'Seis linhas, depois um botão',
      source:
        '<CodeBlock\n  code={source}\n  collapseAfter={6}\n  language="json"\n  onRevealedChange={(revealed) => track(revealed)}\n/>;',
    }),
  },
  {
    id: 'maxLines',
    title: 'Rolar além de um máximo',
    note: 'maxLines limita a altura do corpo e o scroll-area rola o resto, com a região nomeada e alcançável por Tab. Compõe com collapseAfter: um bloco dobrado a oito e, revelado, rolando além de quarenta.',
    snippet: defineSnippet({
      id: 'code-block-react-max-lines',
      language: 'tsx',
      label: 'Um log de 40 linhas em 12',
      source: '<CodeBlock code={log} language="text" lineNumbers maxLines={12} />;',
    }),
  },
  {
    id: 'copy',
    title: 'Copiar',
    note: 'O controle escreve o código que o consumidor deu, nunca o texto do DOM: nem números, nem sinais, nem quebras. Terminado, o check fica dois segundos no lugar das folhas e "Copied" é anunciado; copy={false} tira o controle; o handle copia sem ele.',
    snippet: defineSnippet({
      id: 'code-block-react-copy',
      language: 'tsx',
      label: 'O que chega à área de transferência',
      source:
        "<CodeBlock code={source} onCopy={(request) => request.copied && toast('Copiado')} />;",
    }),
  },
  {
    id: 'loading',
    title: 'Código a caminho, e nenhum código',
    note: 'loading desenha a moldura à altura de seis linhas com skeletons dentro e aria-busy, sem controle de cópia — não um spinner, que é para uma região que já tem conteúdo. Uma string vazia é uma linha vazia com o seu número.',
    snippet: defineSnippet({
      id: 'code-block-react-loading',
      language: 'tsx',
      label: 'Antes de o ficheiro chegar',
      source: '<CodeBlock code="" loading title="deploy.log" />;',
    }),
  },
  {
    id: 'content',
    title: 'Conteúdo que a família não escolheu',
    note: 'Uma linha de 400 caracteres rola e, sob wrap, parte-se num token indivisível em vez de escapar da caixa; código árabe numa página RTL lê-se da esquerda para a direita; um <script> na amostra são seis caracteres.',
    snippet: defineSnippet({
      id: 'code-block-react-content',
      language: 'tsx',
      label: 'HTML hostil, desenhado como texto',
      source: '<CodeBlock code={\'<script>alert(1)</script>\'} language="html" />;',
    }),
  },
  {
    id: 'composition',
    title: 'Composição',
    note: 'Vários ficheiros são tabs com um CodeBlock por painel; uma ação do consumidor entra em actions ao lado do copy; renderToken desenha um token à maneira da aplicação; CodeBlockDefaultsProvider entrega o motor uma vez a todos os blocos da página.',
    snippet: defineSnippet({
      id: 'code-block-react-composition',
      language: 'tsx',
      label: 'O motor uma vez, para todos',
      source:
        '<CodeBlockDefaultsProvider highlight={shiki} lineNumbers>\n  <CodeBlock code={a} language="ts" title="a.ts" />\n  <CodeBlock code={b} language="css" title="a.css" />\n</CodeBlockDefaultsProvider>;',
    }),
  },
  {
    id: 'keyboard',
    title: 'Teclado',
    note: 'Tab: copy, wrap, reveal, e o corpo quando transborda. No corpo as setas, Page, Home, End e Space são os da plataforma; Enter e Space nos controles; Escape num bloco revelado dobra-o e mantém o foco.',
    snippet: defineSnippet({
      id: 'code-block-react-keyboard',
      language: 'tsx',
      label: 'O que se ouve ao chegar ao corpo',
      source:
        '// "group.ts, region" — o título, porque o corpo só é uma região com nome\n// enquanto o código transborda.\n<CodeBlock code={wide} language="ts" title="group.ts" />;',
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onWrapChange',
    payload: '(wrap: boolean, request)',
    when: 'Antes de as linhas quebrarem ou desquebrarem: pointer, keyboard ou programmatic; cancelar não move nada.',
  },
  {
    name: 'onRevealedChange',
    payload: '(revealed: boolean, request)',
    when: 'Antes de o bloco revelar ou dobrar as linhas escondidas: pointer, keyboard, escape ou programmatic.',
  },
  {
    name: 'onCopy',
    payload: '({ value, copied, reason, source })',
    when: 'Depois de o controle, ou o handle, escrever na área de transferência. copied é false quando a plataforma recusou.',
  },
  {
    name: 'onHighlightError',
    payload: '(error: unknown)',
    when: 'Quando o motor rejeita. O texto puro fica.',
  },
];

export const REACT_CODE_BLOCK_DOCS = {
  codeBlock: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      ['code', 'string', '—', 'CodeBlock', 'A fonte, como texto. Nunca HTML'],
      ['language', 'string', 'text', 'CodeBlock', 'data-language e class="language-<x>"'],
      [
        'highlight',
        'CodeHighlighter | null',
        '—',
        'CodeBlock',
        'O motor; null recusa o do provider',
      ],
      ['tokens', 'CodeLine[]', '—', 'CodeBlock', 'Linhas já tokenizadas pelo consumidor'],
      [
        'title',
        'ReactNode',
        '—',
        'CodeBlock',
        'O nome do ficheiro no cabeçalho, e o nome da região',
      ],
      [
        'fileName',
        'string',
        '—',
        'CodeBlock',
        'O nome para o glifo, quando title não é uma string',
      ],
      ['lineNumbers', 'boolean', 'false', 'CodeBlock', 'O contador na goteira'],
      ['start', 'number', '1', 'CodeBlock', 'O número da primeira linha'],
      [
        'marks',
        'CodeMarks',
        '—',
        'CodeBlock',
        'highlight, add, remove, focus, error, warning — intervalos "1,4-6" ou listas',
      ],
      ['wrap', 'boolean', '—', 'CodeBlock', 'Presente é controlado'],
      ['defaultWrap', 'boolean', 'false', 'CodeBlock', 'Onde começa, lido uma vez'],
      ['collapseAfter', 'number', '—', 'CodeBlock', 'Linhas visíveis antes do controle de revelar'],
      ['revealed', 'boolean', '—', 'CodeBlock', 'Presente é controlado'],
      ['defaultRevealed', 'boolean', 'false', 'CodeBlock', 'Onde começa, lido uma vez'],
      ['maxLines', 'number', '—', 'CodeBlock', 'Linhas antes de o corpo rolar'],
      ['copy', 'boolean', 'true', 'CodeBlock', 'O controle de cópia'],
      ['copyRemoved', 'boolean', 'false', 'CodeBlock', 'Mantém as linhas removidas na cópia'],
      [
        'loading',
        'boolean',
        'false',
        'CodeBlock',
        'Skeletons na altura de seis linhas, aria-busy, sem cópia',
      ],
      ['tabSize', 'number', '2', 'CodeBlock', 'Largura de um tab, para o indent da continuação'],
      [
        'messages',
        'PartialMessages<CodeBlockMessages>',
        '—',
        'CodeBlock',
        'As palavras da família sobre o idioma em vigor, chave a chave',
      ],
      [
        'renderLine',
        '(props) => ReactNode',
        '—',
        'CodeBlock',
        'Substitui a corrida de tokens de uma linha',
      ],
      ['renderToken', '(token, index, line) => ReactNode', '—', 'CodeBlock', 'Substitui um token'],
      ['actions', 'ReactNode', '—', 'CodeBlock', 'Controles do consumidor ao lado de copy e wrap'],
      ['preProps', "ComponentProps<'pre'>", '—', 'CodeBlock', 'Chegam ao pre'],
    ]),
    composition: apiRows([
      ['ref', 'Ref<CodeBlockHandle>', '—', 'CodeBlock', 'copy(), scrollToLine(n), root'],
      [
        'renderLine, renderToken',
        'funções',
        '—',
        'CodeBlock',
        'A linha ou o token à maneira da aplicação; a goteira fica da família',
      ],
      [
        'actions',
        'ReactNode',
        '—',
        'CodeBlock',
        'Um "Run" ou um "Open in editor" ao lado dos controles',
      ],
      [
        'CodeBlockDefaultsProvider',
        'highlight | lineNumbers | copy',
        '—',
        'Aplicação',
        'O motor carregado uma vez, para todos os blocos por baixo; uma prop no bloco ganha',
      ],
      ['Tabs', 'composição', '—', 'em volta', 'Vários ficheiros: um CodeBlock por Tabs.Panel'],
      [
        'onKeyDown, id, aria-*, data-*',
        'props nativas',
        '—',
        'CodeBlock',
        'Chegam à raiz; o handler do consumidor corre antes',
      ],
    ]),
    accessibility: [
      'O bloco não tem papel: é texto, lido como texto. O role="textbox" com aria-readonly do Carbon num bloco que ninguém edita é recusado por escrito no contrato.',
      'O corpo é um scroll-area: role="region", tabindex="0" e um nome — o título, depois aria-label, depois "Code" — só enquanto o código transborda, que é o que SC 2.1.1 e scrollable-region-focusable pedem. As teclas de rolar são as da plataforma; a família não escreve nenhuma.',
      'A goteira dos números e dos sinais é aria-hidden e user-select: none: um leitor de ecrã ouve o código e não uma contagem, e uma seleção pelo bloco copia código e nada mais.',
      'O controle de cópia anuncia "Copied" ou "Copy failed" pelo live-announcer partilhado e troca o glifo além da cor; o de wrap é aria-pressed; o de revelar leva aria-expanded e aria-controls para o corpo.',
      'Um HTML de motor nunca entra: os tokens são texto em spans, e um <script> numa amostra são os seis caracteres que é.',
    ],
    snippets: [
      defineSnippet({
        id: 'code-block-react-anatomy',
        language: 'tsx',
        label: 'Anatomia, como chega ao DOM',
        source:
          '<div data-language="ts" data-line-numbers="" data-part="root" data-ui="code-block">\n  <div data-part="header">\n    <span data-part="title">group.ts</span>\n    <span data-part="language">ts</span>\n    <div data-part="actions">\n      <button aria-label="Copy code" data-part="copy" />\n    </div>\n  </div>\n  <div data-part="body" data-ui="scroll-area">\n    <div data-part="viewport">\n      <div data-part="content">\n        <pre data-part="pre">\n          <code className="language-ts" data-part="code">\n            <span data-line="1" data-part="line">\n              <span aria-hidden="true" data-part="number">\n                1\n              </span>\n              <span aria-hidden="true" data-part="marker" />\n              <span data-part="text">\n                <span data-part="token" data-token="keyword">\n                  export\n                </span>\n              </span>\n            </span>\n          </code>\n        </pre>\n      </div>\n    </div>\n  </div>\n</div>;',
      }),
      defineSnippet({
        id: 'code-block-theming',
        language: 'css',
        label: 'Retunar a família para uma aplicação',
        source:
          "[data-ui='code-block'] {\n  --slotted-code-block-font-size: var(--slotted-font-size-md);\n  --slotted-code-block-radius: var(--slotted-radius-lg);\n  --slotted-code-block-tab-size: 4;\n}",
      }),
    ],
  },
} as const;
