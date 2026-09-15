import { SlButton } from '@slotted/angular/button';
import { SlTab, SlTabList, SlTabPanel, SlTabs } from '@slotted/angular/tabs';
import type { CodeLine } from '@slotted/core/code';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlCodeBlock, SlCodeBlockAction, SlCodeBlockLine } from './code-block';
import { provideCodeBlockDefaults } from './code-block.constants';
import { ANGULAR_CODE_BLOCK_DOCS, ANGULAR_CODE_BLOCK_TOKENS } from './code-block.docs';

/* ── Samples ────────────────────────────────────────────────────────────── */

const GROUP_TS = [
  'export function ruleFor(',
  '  group: FilterGroup | null | undefined,',
  '  field: string,',
  '): FilterDescriptor | undefined {',
  '  // The first level as a map: what a column header reads.',
  '  return firstLevelRules(group).find((rule) => rule.field === field)?.filter;',
  '}',
  '',
  "const DEFAULT_PREFIX = 'f.';",
  'const LIMIT = 2;',
].join('\n');

const DIFF_CSS = [
  "[data-ui='code-block'] {",
  '  color: #0f172a;',
  '  background: #f8fafd;',
  '  color: var(--slotted-text);',
  '  background: var(--slotted-surface-sunken);',
  '  font-family: var(--slotted-font-family-mono);',
  '}',
].join('\n');

const DEPLOY_SH = [
  'pnpm --filter @slotted/core build && pnpm --filter @slotted/theme-default build && node tools/harness/build.mjs code-block && node tools/harness/shoot.mjs code-block --scheme dark',
  '    --width 420 --density dense --dir rtl --out /tmp/claude-1000/-home-dreco-dev-slotted/scratchpad/shots/code-block-wrapped-continuation-keeps-the-indent.png',
  'rm -rf tools/harness/out # refused: the harness output is shared',
  'git add -A # another lane writes here',
].join('\n');

const CONTRACT_JSON = [
  '{',
  '  "family": "code-block",',
  '  "stateModel": {',
  '    "pressed": { "controlled": "wrap", "request": "wrapChangeRequest" },',
  '    "revealed": { "controlled": "revealed", "request": "revealedChangeRequest" }',
  '  },',
  '  "scopes": ["comment", "keyword", "string"],',
  '  "labels": ["region", "copy"],',
  '  "imperative": ["copyCode()"]',
  '}',
].join('\n');

const ORDERS_CSV = [
  'id,customer,status,amount',
  'PED-48211,Ana Souza,paid,1250.90',
  'PED-48212,Bruno Lima,pending,89.90',
  'PED-48219,Mariana Costa,refunded,412.00',
].join('\n');

const LOG = Array.from(
  { length: 40 },
  (_, index) =>
    `${String(index + 1).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}  ${index % 9 === 0 ? 'WARN' : 'INFO'}  worker-${(index % 4) + 1}  ${index % 9 === 0 ? 'retrying upload after 503' : 'processed batch of 250 rows'}`,
).join('\n');

/**
 * A toy tokeniser for the page: keywords, strings, numbers, comments,
 * punctuation. A real application hands the block Prism or Shiki through the
 * two mappings in `@slotted/core/code`; the page has neither and needs
 * nothing that heavy to show what a token looks like.
 */
const KEYWORDS = new Set([
  'export',
  'function',
  'return',
  'const',
  'let',
  'import',
  'from',
  'null',
  'undefined',
  'true',
  'false',
]);
function tokenise(code: string): CodeLine[] {
  return code.split('\n').map((line) => {
    const tokens: {
      text: string;
      scope?: 'comment' | 'keyword' | 'string' | 'number' | 'punctuation' | 'constant' | 'property';
    }[] = [];
    const comment = line.indexOf('//');
    const source = comment === -1 ? line : line.slice(0, comment);
    for (const piece of source
      .split(/("[^"]*"|'[^']*'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|[{}()[\];:,.=<>|?]+|\s+)/)
      .filter(Boolean)) {
      if (/^["']/.test(piece)) tokens.push({ scope: 'string', text: piece });
      else if (/^\d/.test(piece)) tokens.push({ scope: 'number', text: piece });
      else if (piece === 'null' || piece === 'undefined' || piece === 'true' || piece === 'false')
        tokens.push({ scope: 'constant', text: piece });
      else if (KEYWORDS.has(piece)) tokens.push({ scope: 'keyword', text: piece });
      else if (/^[{}()[\];:,.=<>|?]+$/.test(piece))
        tokens.push({ scope: 'punctuation', text: piece });
      else tokens.push({ text: piece });
    }
    if (comment !== -1) tokens.push({ scope: 'comment', text: line.slice(comment) });
    return tokens;
  });
}
const highlight = async (code: string) => tokenise(code);

interface CodeBlockStoryArgs {
  code: string;
  collapseAfter: number | undefined;
  copy: boolean;
  language: string;
  lineNumbers: boolean;
  loading: boolean;
  title: string;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_CODE_BLOCK_DOCS.codeBlock.scenes, {
    playground: Playground,
    highlight: Highlight,
    engines: Engines,
    lineNumbers: LineNumbers,
    marks: Marks,
    diff: Diff,
    focus: Focus,
    wrap: Wrap,
    title: Title,
    collapse: Collapse,
    maxLines: MaxLines,
    copy: Copy,
    loading: Loading,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const IMPORTS = [
  SlButton,
  SlCodeBlock,
  SlCodeBlockAction,
  SlCodeBlockLine,
  SlTab,
  SlTabList,
  SlTabPanel,
  SlTabs,
];

/** Every block on the page reads the same samples and the same toy engine. */
const SAMPLES = {
  contract: CONTRACT_JSON,
  css: DIFF_CSS,
  csv: ORDERS_CSV,
  deploy: DEPLOY_SH,
  group: GROUP_TS,
  highlight,
  log: LOG,
  long: 'x'.repeat(400),
  rtl: 'const مرحبا = "أهلا";\nconsole.log(مرحبا);',
  script: '<script>alert(1)</script>',
  tokens: tokenise(GROUP_TS),
};

const meta: Meta<CodeBlockStoryArgs> = {
  title: 'Components/CodeBlock',
  component: SlCodeBlock,
  decorators: [moduleMetadata({ imports: IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'CodeBlock',
        description:
          'Um bloco de código: título, números de linha, marcas, quebra, cópia, colapso — e os tokens de um motor que fica fora da família, pintados pela escala de escopos do tema.',
        framework: 'Angular',
        ...ANGULAR_CODE_BLOCK_DOCS.codeBlock,
        tokens: ANGULAR_CODE_BLOCK_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<CodeBlockStoryArgs>;

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

const one = (label: string, note: string, body: string, layout = 'block') =>
  `<div class="slotted-demo-grid" data-columns="1">${scene(label, note, body, layout)}</div>`;

export const Playground: Story = {
  args: {
    code: GROUP_TS,
    collapseAfter: undefined,
    copy: true,
    language: 'ts',
    lineNumbers: true,
    loading: false,
    title: 'group.ts',
  },
  argTypes: {
    collapseAfter: { control: 'number' },
    copy: { control: 'boolean' },
    lineNumbers: { control: 'boolean' },
    loading: { control: 'boolean' },
    title: { control: 'text' },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: { ...args, highlight },
    template: `
<div class="slotted-demo-stage" data-layout="block">
  <div
    slCodeBlock
    [code]="code"
    [collapseAfter]="collapseAfter"
    [copy]="copy"
    [highlight]="highlight"
    [language]="language"
    [lineNumbers]="lineNumbers"
    [loading]="loading"
    [marks]="{ highlight: '5-6' }"
    [title]="title"
  ></div>
</div>`,
  }),
};

export const Highlight: Story = {
  parameters: scenario('highlight'),
  render: () => ({
    props: {
      ...SAMPLES,
      engine: null as typeof highlight | null,
      deliver(this: { engine: typeof highlight | null }) {
        this.engine = highlight;
      },
    },
    template: one(
      'Texto puro, depois tokens',
      'Pressione o botão: os tokens entram nas mesmas linhas, à mesma altura. Troque o esquema na barra e as doze cores mudam com ele.',
      `<div class="slotted-demo-stack">
        <div slCodeBlock [code]="group" [highlight]="engine" language="ts" lineNumbers title="group.ts"></div>
        <p><button slButton size="sm" variant="outline" type="button" (click)="deliver()">Entregar o motor agora</button></p>
      </div>`,
    ),
  }),
};

export const Engines: Story = {
  parameters: scenario('engines'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Os dois adaptadores',
      'O bloco abaixo recebe tokens já feitos — o que fromPrismTokens ou fromShikiTokens devolvem — e não corre motor nenhum.',
      `<div slCodeBlock [code]="group" language="ts" [tokens]="tokens"></div>`,
    ),
  }),
};

export const LineNumbers: Story = {
  parameters: scenario('lineNumbers'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'lineNumbers · start="98"',
      'A goteira mede três caracteres para chegar a 107; selecione pelo bloco e cole: os números não vêm.',
      `<div slCodeBlock [code]="group" [highlight]="highlight" language="ts" lineNumbers start="98"></div>`,
    ),
  }),
};

export const Marks: Story = {
  parameters: scenario('marks'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'highlight, error, warning',
      'A primeira linha realçada com o acento, a terceira em danger, a quarta em warning — cada uma com a barra na ponta.',
      `<div slCodeBlock [code]="deploy" [highlight]="highlight" language="sh" [marks]="{ error: '3', highlight: '1', warning: [4] }" title="deploy.sh"></div>`,
    ),
  }),
};

export const Diff: Story = {
  parameters: scenario('diff'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Duas linhas removidas, três acrescentadas',
      'Os sinais na goteira são CSS; copie e as duas linhas removidas ficam de fora.',
      `<div slCodeBlock [code]="css" [highlight]="highlight" language="css" lineNumbers [marks]="{ add: '4-6', remove: '2-3' }"></div>`,
    ),
  }),
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => ({
    props: SAMPLES,
    template: one(
      `focus: "3-6"`,
      'As linhas fora do intervalo esmaecem; passe o ponteiro por cima e tudo volta.',
      `<div slCodeBlock [code]="contract" [highlight]="highlight" language="json" [marks]="{ focus: '3-6' }" title="contract.json"></div>`,
    ),
  }),
};

export const Wrap: Story = {
  parameters: scenario('wrap'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Uma linha de comando comprida',
      'Em cima rola; em baixo começa quebrado, com a continuação indentada ao próprio indent. O controle só existe enquanto uma linha transborda.',
      `<div class="slotted-demo-stack">
        <div slCodeBlock [code]="deploy" [highlight]="highlight" language="sh" title="deploy.sh"></div>
        <div slCodeBlock [code]="deploy" defaultWrap [highlight]="highlight" language="sh" title="deploy.sh"></div>
      </div>`,
    ),
  }),
};

export const Title: Story = {
  parameters: scenario('title'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Um .ts e um .csv',
      'O glifo segue a espécie do ficheiro: uma folha de texto, uma folha de tabela. A linguagem fica no fim do cabeçalho.',
      `<div class="slotted-demo-stack">
        <div slCodeBlock [code]="group" [highlight]="highlight" language="ts" title="group.ts"></div>
        <div slCodeBlock [code]="csv" language="csv" title="orders-2026-09.csv"></div>
      </div>`,
    ),
  }),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'collapseAfter="6"',
      'Quatro linhas atrás do controle; a sexta desvanece-se nele. Revele, ponha o foco no corpo e pressione Escape.',
      `<div slCodeBlock [code]="contract" collapseAfter="6" [highlight]="highlight" language="json" lineNumbers title="contract.json"></div>`,
    ),
  }),
};

export const MaxLines: Story = {
  parameters: scenario('maxLines'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'maxLines="12" sobre 40 linhas',
      'O corpo rola e é uma região com nome: Tab chega-lhe, as setas rolam.',
      `<div slCodeBlock [code]="log" language="text" lineNumbers maxLines="12" title="deploy.log"></div>`,
    ),
  }),
};

export const Copy: Story = {
  parameters: scenario('copy'),
  render: () => ({
    props: {
      ...SAMPLES,
      last: null as string | null,
      copied(this: { last: string | null }, request: { value: string }) {
        this.last = request.value;
      },
    },
    template: one(
      'O que a cópia escreve',
      'Pressione o controle: o check fica dois segundos, e a caixa abaixo mostra o texto que foi para a área de transferência — sem as linhas removidas.',
      `<div class="slotted-demo-stack">
        <div slCodeBlock [code]="css" language="css" [marks]="{ remove: '2-3' }" (copyRequest)="copied($event)"></div>
        @if (last !== null) {
          <div slCodeBlock [code]="last" language="css" title="Texto copiado"></div>
        }
      </div>`,
    ),
  }),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'loading, e code vazio',
      'Skeletons à altura de seis linhas sem controle de cópia; abaixo, uma string vazia é uma linha numerada.',
      `<div class="slotted-demo-stack">
        <div slCodeBlock code="" loading title="deploy.log"></div>
        <div slCodeBlock code="" language="text" lineNumbers></div>
      </div>`,
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: SAMPLES,
    template: one(
      '400 caracteres, RTL, HTML hostil',
      'Numa coluna estreita a linha longa rola; sob wrap parte-se no token. O bloco árabe lê-se LTR. O script é texto.',
      `<div class="slotted-demo-stack">
        <div class="slotted-demo-measure"><div slCodeBlock [code]="long" defaultWrap language="text"></div></div>
        <div dir="rtl"><div slCodeBlock [code]="rtl" [highlight]="highlight" language="js" title="مرحبا.js"></div></div>
        <div slCodeBlock [code]="script" language="html"></div>
      </div>`,
    ),
  }),
};

export const Composition: Story = {
  decorators: [
    moduleMetadata({
      imports: IMPORTS,
      providers: [provideCodeBlockDefaults({ highlight, lineNumbers: true })],
    }),
  ],
  parameters: scenario('composition'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Tabs, uma ação, o injector',
      'Dois ficheiros em abas; um botão Run ao lado do copy; o motor entregue uma vez por provideCodeBlockDefaults a ambos.',
      `<div slTabs defaultValue="ts">
        <div slTabList aria-label="Ficheiros">
          <div slTab value="ts">group.ts</div>
          <div slTab value="css">code-block.css</div>
        </div>
        <div slTabPanel value="ts">
          <div slCodeBlock [code]="group" language="ts" title="group.ts">
            <button slCodeBlockAction slButton size="sm" tone="secondary" variant="ghost" type="button">Run</button>
          </div>
        </div>
        <div slTabPanel value="css">
          <div slCodeBlock [code]="css" language="css" title="code-block.css"></div>
        </div>
      </div>`,
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: SAMPLES,
    template: one(
      'Tab até ao corpo',
      'Copy, wrap, e o corpo — porque a linha transborda — nesta ordem; no corpo, as setas rolam.',
      `<div slCodeBlock [code]="deploy" [highlight]="highlight" language="sh" lineNumbers title="deploy.sh"></div>`,
    ),
  }),
};
