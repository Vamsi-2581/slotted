import filterBarTokens from '@slotted/styles/filter-bar/tokens.json';
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

export const ANGULAR_FILTER_BAR_TOKENS = filterBarTokens.map((name) => ({
  name,
  purpose: 'Decisão do tema sobre a barra de filtros',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  SlFilterBar,\n  SlFilterBarEnd,\n  SlFilterBarOperand,\n  provideFilterBarDefaults,\n} from '@slotted/angular/filter-bar';\nimport { createFilterGroupPredicate, createSearchPredicate } from '@slotted/core/filter';",
  selector: '[slFilterBar], [slFilterBarEnd], ng-template[slFilterBarOperand]',
  exportAs: 'slFilterBar',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'O landmark role="search" com o nome da família. Carrega data-ui="filter-bar", data-apply, data-size, data-dirty, data-open, data-sticky, data-readonly, data-disabled, data-loading. É o contentor de query; nada nele muda de grelha.',
  },
  {
    part: 'frame',
    element: 'div',
    required: true,
    purpose:
      'A grelha, um elemento dentro da raiz, porque uma container query não restyla o elemento que mede. Acima de 36rem duas linhas: a busca, os controles do consumidor e a contagem; depois a barra, que quebra. Abaixo, a busca, a barra como uma linha que desliza, e a contagem.',
  },
  {
    part: 'search',
    element: 'div',
    required: true,
    purpose:
      'O campo de busca global — um text-field embrulhado — a primeira parada de tabulação. Escape limpa a query; a tecla shortcut chega aqui.',
  },
  {
    part: 'bar',
    element: 'div',
    required: true,
    purpose:
      'O role="toolbar" que segura tudo o que não é a busca: uma parada de tabulação, e as setas percorrem o summary, os pills, cada segmento de cada chip, more, add, clear e as ações, de linha em linha. data-revealed quando os chips dobrados estão à vista.',
  },
  {
    part: 'pill',
    element: 'button',
    required: false,
    purpose:
      'Um campo fixado sem condição: aresta tracejada, glifo plus, o nome. Premido, dá lugar ao chip do campo, incompleto, com o popover do valor aberto; num telefone abre o construtor com o cartão da regra.',
  },
  {
    part: 'add',
    element: 'button',
    required: true,
    purpose:
      'O gatilho do menu com os campos ainda sem regra, agrupados por section e com o glifo de cada um. Com um chip na barra desenha só o glifo, num círculo, data-compact; o rótulo fica como nome e title.',
  },
  {
    part: 'clear',
    element: 'button',
    required: false,
    purpose:
      'Desenhado enquanto algo está aplicado. Devolve um campo obrigatório ao seu defaultValue e apaga o resto, com a razão clear.',
  },
  {
    part: 'preset',
    element: 'div',
    required: false,
    purpose:
      'Um select embrulhado com as vistas guardadas. Escolher uma substitui a árvore com a razão select.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'Sob apply="manual": reset e apply. Num grupo do construtor: add-rule, add-group, remove-group.',
  },
  {
    part: 'apply',
    element: 'button',
    required: false,
    purpose:
      'Aplica o rascunho com a razão submit. Recusa enquanto um campo obrigatório não tem valor.',
  },
  { part: 'reset', element: 'button', required: false, purpose: 'Descarta o rascunho.' },
  {
    part: 'summary',
    element: 'button',
    required: true,
    purpose:
      'Primeiro na barra, desenhado só abaixo de 36rem: "Filters (n)", que abre o construtor. Fora da largura estreita está escondido e fora do anel de foco.',
  },
  {
    part: 'end',
    element: 'div',
    required: true,
    purpose:
      'Os controles do consumidor — uma ordenação, um seletor de colunas — projetados como children.',
  },
  {
    part: 'chip',
    element: 'div',
    required: false,
    purpose:
      'Uma condição escrita em segmentos, role="group" com o nome "<campo>: <frase>". data-pinned num campo fixado, data-incomplete enquanto falta o operando, data-folded além de chipLimit, data-invalid num campo desconhecido ou obrigatório sem valor. Delete em qualquer segmento remove a condição.',
  },
  {
    part: 'chip-field',
    element: 'span',
    required: false,
    purpose: 'O glifo do campo e o seu nome. Só se lê: o campo de uma condição é fixo.',
  },
  {
    part: 'chip-operator',
    element: 'button',
    required: false,
    purpose:
      'O operador, mais leve que as pontas. Abre um menu com os operadores da espécie; um operador que pede um operando em falta passa ao valor.',
  },
  {
    part: 'chip-value',
    element: 'button',
    required: false,
    purpose:
      'O valor: dois itens e o resto em número, a lista inteira no nome e no title. Abre um popover só com o operando; num telefone leva também as palavras do operador e abre o construtor.',
  },
  {
    part: 'chip-remove',
    element: 'button',
    required: false,
    purpose: 'Remove a condição com a razão remove. Ausente num campo obrigatório e sob readOnly.',
  },
  {
    part: 'more',
    element: 'button',
    required: false,
    purpose: '"+n more" enquanto há chips dobrados; "Show less" quando revelados.',
  },
  {
    part: 'count',
    element: 'p',
    required: false,
    purpose:
      'A contagem, em aria-live="polite": count de total nas figuras da língua em vigor. Com loading, um spinner e aria-busy.',
  },
  {
    part: 'builder',
    element: 'div',
    required: true,
    purpose:
      'O editor da árvore inteira, dentro de um drawer. Leva data-ui próprio porque o drawer o portaliza.',
  },
  {
    part: 'group',
    element: 'fieldset',
    required: true,
    purpose:
      'Um grupo da árvore: o cabeçalho, as linhas e os controles. A partir de data-depth 1 é uma caixa sobre a superfície afundada, com o seu próprio remover no cabeçalho.',
  },
  {
    part: 'join',
    element: 'div',
    required: true,
    purpose:
      'O cabeçalho do grupo: "Match", o segmented-control All/Any, "of the following" e, num grupo aninhado, Remove group na ponta.',
  },
  {
    part: 'rules',
    element: 'div',
    required: true,
    purpose:
      'As linhas do grupo numa grelha de duas colunas: a palavra que junta e a regra ou o grupo, para todos os campos alinharem.',
  },
  {
    part: 'conjunction',
    element: 'span',
    required: true,
    purpose:
      'A palavra antes de cada linha: "Where" na primeira, "and" ou "or" nas seguintes, a junção do grupo.',
  },
  {
    part: 'rule',
    element: 'div',
    required: false,
    purpose:
      'Uma regra: campo, operador, operando, remover. data-kind e data-operands para a grelha; data-invalid num campo desconhecido; data-expanded no cartão aberto da forma estreita.',
  },
  {
    part: 'rule-summary',
    element: 'button',
    required: false,
    purpose:
      'A frase da regra, cabeçalho do cartão quando o construtor tem menos de 30rem. Premida, abre ou fecha o cartão, um de cada vez; aria-expanded e aria-controls nos três controles.',
  },
  { part: 'field', element: 'div', required: false, purpose: 'O select do campo, embrulhado.' },
  {
    part: 'operator',
    element: 'div',
    required: false,
    purpose: 'O select do operador, com os nomes do mapa que table já traduz.',
  },
  {
    part: 'operand',
    element: 'div',
    required: false,
    purpose:
      'O controle por espécie — text-field, number-field, date-picker, time-picker, datetime-picker, select de verdadeiro/falso, multi-select — ou o que renderOperand devolver. Duas colunas para between.',
  },
  {
    part: 'remove',
    element: 'button',
    required: false,
    purpose: 'Remove a regra do grupo. Ausente numa regra de campo obrigatório.',
  },
  {
    part: 'add-rule',
    element: 'button',
    required: true,
    purpose: 'Acrescenta uma regra ao grupo, no primeiro campo.',
  },
  {
    part: 'add-group',
    element: 'button',
    required: true,
    purpose: 'Acrescenta um grupo com a junção oposta e uma regra dentro.',
  },
  {
    part: 'remove-group',
    element: 'button',
    required: false,
    purpose:
      'O glifo do caixote, nomeado Remove group: remove um grupo aninhado com tudo o que tem dentro. A raiz não se remove.',
  },
  {
    part: 'save-preset',
    element: 'button',
    required: false,
    purpose:
      'Pede à aplicação que guarde a árvore como vista, quando onPresetSave existe. O nome é a aplicação que pergunta.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Os eixos da barra sobre uma lista de pedidos, movidos pelos controlos por baixo do palco. Troque apply para manual e a barra passa a editar um rascunho.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-playground',
      language: 'angular',
      label: 'A barra sobre uma lista de pedidos',
      source:
        '<div\n  slFilterBar\n  [count]="kept().length"\n  [fields]="fields"\n  [total]="orders.length"\n  [(value)]="filter"\n></div>',
    }),
  },
  {
    id: 'listing',
    title: 'A barra sobre a tabela, e a mesma regra nos dois sítios',
    note: 'A árvore é aplicada pelo consumidor com createFilterGroupPredicate e createSearchPredicate; a tabela abaixo encolhe e a contagem diz quanto. O filtro de coluna de Status no cabeçalho edita o mesmo objeto que o chip de Status da barra.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-listing',
      language: 'ts',
      label: 'Aplicar a árvore e a query às linhas',
      source:
        "const kept = computed(() => {\n  const keep = createFilterGroupPredicate(filter(), (row, field) => row[field]);\n  const find = createSearchPredicate(query(), (row, field) => row[field], ['customer', 'id']);\n  return orders.filter((row) => keep(row) && find(row));\n});",
    }),
  },
  {
    id: 'pinned',
    title: 'Campos fixados: um lugar tracejado que vira chip',
    note: 'pinned deixa o campo sempre à vista. Sem condição é um pill tracejado com + e o nome — um lugar à espera de ser preenchido; premido, dá lugar ao chip do campo, no mesmo sítio, incompleto e com o popover do valor aberto. Remover a condição devolve o pill.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-pinned',
      language: 'ts',
      label: 'Dois campos sempre à vista',
      source:
        "const FIELDS: FilterBarField[] = [\n  {\n    key: 'status',\n    kind: 'set',\n    label: 'Status',\n    options: STATUSES,\n    pinned: true,\n  },\n  { key: 'customer', kind: 'text', label: 'Customer', pinned: true },\n  { key: 'amount', kind: 'number', label: 'Amount' },\n];",
    }),
  },
  {
    id: 'chips',
    title: 'Cada condição escrita em segmentos',
    note: 'Um chip é a frase da condição em segmentos: o campo com o seu glifo, o operador mais leve, o valor, e o X. O operador abre um menu, o valor um popover só com o operando — mudar a comparação não reabre os valores. Uma lista longa escreve dois valores e o resto em número (Paid, Refunded +2), inteira no nome e no title; uma lista de um lê-se como igualdade. Add filter cria o chip de imediato, tracejado até ter valor, e fora do valor emitido até lá. Além de chipLimit os chips dobram atrás de +n more.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-chips',
      language: 'angular',
      label: 'Seis chips à vista e o resto dobrado',
      source: '<div slFilterBar chipLimit="6" [fields]="fields" [value]="filter"></div>',
    }),
  },
  {
    id: 'builder',
    title: 'O construtor num drawer',
    note: 'Add filter, um chip de grupo ou Filters (n) abrem a árvore inteira num drawer; num telefone o drawer sobe de baixo como uma folha. Com mais de 30rem cada regra é uma linha de campo, operador, operando e X; com menos, um cartão com a frase que se expande no lugar, um de cada vez. Apply pede a árvore com a razão submit, Cancel e Escape descartam.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-builder',
      language: 'angular',
      label: 'Abrir o construtor a partir de fora',
      source:
        '<div\n  slFilterBar\n  #bar="slFilterBar"\n  [fields]="fields"\n  (openChangeRequest)="log($event.reason)"\n></div>\n<button slButton type="button" (click)="bar.openBuilder()">Abrir o construtor</button>',
    }),
  },
  {
    id: 'groups',
    title: 'Grupos E/OU aninhados',
    note: 'Um grupo dentro de um grupo é uma caixa sobre a superfície afundada, com a junção oposta e o caixote que o remove; num construtor estreito passa a um trilho na aresta inicial, que custa dez pixels por nível em vez de oitenta. Na barra aparece como um chip só, com a frase entre parênteses, que abre o construtor.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-groups',
      language: 'ts',
      label: 'A árvore que a barra segura',
      source:
        "const filter: FilterGroup = {\n  join: 'and',\n  rules: [\n    { field: 'status', filter: setFilter(['paid']) },\n    {\n      join: 'or',\n      rules: [\n        {\n          field: 'amount',\n          filter: {\n            kind: 'number',\n            join: 'and',\n            conditions: [{ operator: 'greaterThan', value: 1000 }],\n          },\n        },\n        {\n          field: 'priority',\n          filter: { kind: 'boolean', join: 'and', conditions: [{ operator: 'is', value: true }] },\n        },\n      ],\n    },\n  ],\n};",
    }),
  },
  {
    id: 'manual',
    title: 'Aplicar em lote',
    note: 'Com apply="manual" cada edição vai a um rascunho: a raiz fica data-dirty, Reset descarta, Apply pede a árvore e a query com a razão submit. Enter num operando aplica. É o Go do Fiori e o batch do Carbon.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-manual',
      language: 'angular',
      label: 'Um pedido por Apply, não por tecla',
      source:
        '<div\n  slFilterBar\n  apply="manual"\n  [fields]="fields"\n  (queryChangeRequest)="$event.reason === \'submit\' && fetch($event.value)"\n  (valueChangeRequest)="$event.reason === \'submit\' && fetch($event.value)"\n></div>',
    }),
  },
  {
    id: 'required',
    title: 'Um campo obrigatório com default',
    note: 'required fixa o campo e dá-lhe um defaultValue: Clear devolve-o ao default em vez de o apagar, o chip não tem X, e um Apply com o campo sem valor é recusado — o chip fica tracejado e data-invalid, a mensagem é anunciada.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-required',
      language: 'ts',
      label: 'Uma listagem sempre limitada a uma empresa',
      source:
        "const company: FilterBarField = {\n  key: 'company',\n  kind: 'set',\n  label: 'Company',\n  options: COMPANIES,\n  required: true,\n  defaultValue: setFilter(['acme']),\n};",
    }),
  },
  {
    id: 'presets',
    title: 'Vistas guardadas',
    note: 'presets aparece como um select no fim da barra: escolher uma substitui a árvore com a razão select; editar depois mantém a vista escolhida e marca a raiz data-dirty. Guardar é da aplicação — onPresetSave entrega a árvore, o nome é ela que pergunta.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-presets',
      language: 'angular',
      label: 'Escolher e guardar uma vista',
      source:
        '<div\n  slFilterBar\n  [fields]="fields"\n  [(preset)]="view"\n  [presets]="[{ key: \'overdue\', label: \'Overdue this month\', value: overdue }]"\n  savePresetEnabled\n  (savePreset)="askForName($event)"\n></div>',
    }),
  },
  {
    id: 'query',
    title: 'A busca global',
    note: 'A query é o único campo que não pertence a nenhuma coluna. Debounced por queryDelay sob live; Escape limpa com a razão clear; shortcut é a tecla do documento que chega ao campo, desenhada dentro dele com kbd — e escondida onde a entrada primária é um ecrã táctil, onde não há tecla para carregar.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-query',
      language: 'angular',
      label: 'A busca com a barra a 120ms e um atalho',
      source:
        '<div slFilterBar [fields]="fields" [(query)]="query" queryDelay="120" shortcut="/"></div>',
    }),
  },
  {
    id: 'url',
    title: 'O estado numa URL',
    note: 'toFilterBarParams escreve f=and(…) e q=; fromFilterBarParams lê-os de volta, e um f.<coluna> escrito por uma tabela sem barra vira um grupo de primeiro nível. parseFilterGroup é total: um marcador de uma versão antiga degrada para nenhum filtro.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-url',
      language: 'ts',
      label: 'Ida e volta pela query string',
      source:
        "const params = toFilterBarParams({ filter, query });\nhistory.replaceState(null, '', `?${params}`);\nconst restored = fromFilterBarParams(location.search);",
    }),
  },
  {
    id: 'count',
    title: 'A contagem como região viva',
    note: 'count e total são os números do consumidor, escritos nas figuras da língua em vigor. A parte é aria-live="polite", por isso uma mudança no filtro é ouvida como o seu efeito; com loading a contagem dá lugar a um spinner e aria-busy.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-count',
      language: 'angular',
      label: 'Quantos ficaram, de quantos',
      source:
        '<div slFilterBar count="128" [fields]="fields" [loading]="fetching()" total="3412"></div>',
    }),
  },
  {
    id: 'narrow',
    title: 'Num telefone: uma linha que desliza e uma folha',
    note: 'Abaixo de 36rem a busca fica em cima e a barra passa a uma linha que desliza: Filters (n) primeiro, todos os chips — também os dobrados —, depois os pills vazios; o chip cortado na borda diz que a linha continua. Cada chip tem três alvos: o campo, o valor com as palavras do operador, o X. Tocar num valor, num pill ou em Filters abre o construtor como folha, com o cartão da regra aberto. Redimensione o palco.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-narrow',
      language: 'angular',
      label: 'A mesma barra em três larguras',
      source:
        '<div class="listing listing--narrow">\n  <div slFilterBar [fields]="fields" [value]="filter"></div>\n</div>',
    }),
  },
  {
    id: 'sticky',
    title: 'Colada sob o cabeçalho da página',
    note: 'sticky lê --slotted-page-sticky-top, cola a barra aí, e soma a própria altura à propriedade no elemento pai para o que vem a seguir — uma tabela com cabeçalho colado para debaixo da barra, não debaixo do título.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-sticky',
      language: 'angular',
      label: 'A barra e a tabela coladas em cadeia',
      source:
        '<div slFilterBar [fields]="fields" sticky [value]="filter"></div>\n<table slTable stickyHeader>\n  …\n</table>',
    }),
  },
  {
    id: 'states',
    title: 'Desabilitada, a carregar, só leitura',
    note: 'disabled desliga todos os controles e mantém a largura; loading mantém os controles, desliga Apply e põe o spinner no lugar da contagem; readOnly deixa cada condição alcançável e legível — os segmentos guardam a paragem com aria-disabled — e não desenha X, add, clear nem pills vazios.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-states',
      language: 'angular',
      label: 'Os três estados da barra inteira',
      source:
        '<div slFilterBar disabled [fields]="fields"></div>\n<div slFilterBar [fields]="fields" loading></div>',
    }),
  },
  {
    id: 'content',
    title: 'Conteúdo que a família não escolheu',
    note: 'Um valor de onze itens escreve dois e o resto em número, inteiro no title e no nome acessível; um valor longo trunca a 12rem; um rótulo árabe ao lado de uma data ISO não reordena a data, porque campo, operador e valor são corridas isoladas; um campo desconhecido é um chip inválido, removível.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-content',
      language: 'angular',
      label: 'Um chip longo, um rótulo RTL, um campo que já não existe',
      source:
        '<div\n  slFilterBar\n  dir="rtl"\n  [fields]="[{ key: \'city\', kind: \'set\', label: \'المدينة\', options: cities }]"\n  [value]="filter"\n></div>',
    }),
  },
  {
    id: 'keyboard',
    title: 'Teclado',
    note: 'Tab: a busca, depois a barra — duas paragens. As setas percorrem cada controle da barra, segmento a segmento, de linha em linha e espelhadas em RTL; Home e End nas pontas. Enter no operador abre o menu, no valor o popover; Delete em qualquer segmento remove a condição com a razão remove e o foco vai ao mesmo segmento do chip seguinte; Escape limpa a busca ou fecha a superfície.',
    snippet: defineSnippet({
      id: 'filter-bar-angular-keyboard',
      language: 'angular',
      label: 'O que se ouve ao remover um chip',
      source:
        '<!-- "Amount filter removed" — e o foco segue para o chip seguinte, ou para Add filter quando não sobra nenhum. -->\n<div slFilterBar [fields]="fields" (valueChangeRequest)="log($event.reason === \'remove\')"></div>',
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(valueChangeRequest)',
    payload: 'ChangeRequest<FilterGroup | null>',
    when: 'Antes de a árvore mover; [(value)] é a outra metade, o valor. A razão é pointer, keyboard, clear, remove, select, submit ou programmatic; cancelar não move nada. A árvore chega normalizada: sem regras incompletas, null quando nada resta.',
  },
  {
    name: '(queryChangeRequest)',
    payload: 'ChangeRequest<string>',
    when: 'Depois de queryDelay sob live, ou com submit sob manual; clear quando Escape ou o X do campo a limpam. [(query)] é o valor.',
  },
  {
    name: '(presetChangeRequest)',
    payload: 'ChangeRequest<string | null>',
    when: 'Quando uma vista é escolhida no select, com select; clear quando o select é esvaziado. [(preset)] é o valor.',
  },
  {
    name: '(savePreset)',
    payload: 'FilterGroup | null',
    when: 'Quando o leitor pressiona "Save as view…" no construtor, desenhado por savePresetEnabled. A família não guarda: pergunta.',
  },
  {
    name: '(openChangeRequest)',
    payload: 'ChangeRequest<boolean>',
    when: 'Antes de o construtor abrir ou fechar: pointer, keyboard, escape, outsidePress, dismiss, submit, programmatic. [(open)] é o valor.',
  },
  {
    name: '(revealedChangeRequest)',
    payload: 'ChangeRequest<boolean>',
    when: 'Antes de os chips dobrados aparecerem ou voltarem a dobrar. [(revealed)] é o valor.',
  },
];

export const ANGULAR_FILTER_BAR_DOCS = {
  filterBar: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'fields',
        'FilterBarField[]',
        '—',
        'FilterBar',
        'Os campos filtráveis: key, label, kind, icon (nome de glifo ou TemplateRef), operators, pinned, required, defaultValue, section, options, searchable',
      ],
      [
        'value',
        'model<FilterGroup | null | undefined>',
        '—',
        'FilterBar',
        '[(value)]: a árvore que o consumidor possui. Presente é controlado, para a vida da barra',
      ],
      [
        'defaultValue',
        'FilterGroup | null',
        '—',
        'FilterBar',
        'Onde uma barra não controlada começa, lida uma vez',
      ],
      ['query', 'model<string | undefined>', '—', 'FilterBar', '[(query)]: a busca global'],
      [
        'defaultQuery',
        'string',
        '',
        'FilterBar',
        'A busca com que uma barra não controlada começa',
      ],
      ['presets', 'FilterBarPreset[]', '—', 'FilterBar', 'As vistas guardadas: key, label, value'],
      [
        'preset',
        'model<string | null | undefined>',
        '—',
        'FilterBar',
        '[(preset)]: a vista corrente',
      ],
      ['defaultPreset', 'string | null', 'null', 'FilterBar', 'A vista com que começa'],
      [
        'open',
        'model<boolean | undefined>',
        '—',
        'FilterBar',
        '[(open)]: se o construtor está aberto',
      ],
      ['defaultOpen', 'boolean', 'false', 'FilterBar', 'Se começa aberto'],
      [
        'revealed',
        'model<boolean | undefined>',
        '—',
        'FilterBar',
        '[(revealed)]: se os chips dobrados estão à vista',
      ],
      ['defaultRevealed', 'boolean', 'false', 'FilterBar', 'Se começam à vista'],
      [
        'apply',
        "'live' | 'manual'",
        'live',
        'FilterBar',
        'Pede a cada edição, ou edita um rascunho até Apply',
      ],
      [
        'sticky',
        'boolean',
        'false',
        'FilterBar',
        'Cola sob o cabeçalho da página e soma a sua altura ao que segue',
      ],
      [
        'container',
        'Element | null',
        '—',
        'FilterBar',
        'Um pai só para o drawer do construtor, em vez da raiz de portal partilhada',
      ],
      ['size', "'sm' | 'md' | 'lg'", 'md', 'FilterBar', 'O passo dos controles'],
      [
        'queryDelay',
        'number',
        '320',
        'FilterBar',
        'Milissegundos que a busca e um operando de texto esperam sob live',
      ],
      ['chipLimit', 'number', '6', 'FilterBar', 'Chips à vista antes de dobrar'],
      [
        'shortcut',
        'string | null',
        'null',
        'FilterBar',
        'A tecla do documento que foca a busca, fora de um campo editável',
      ],
      ['disabled', 'boolean', 'false', 'FilterBar', 'Desliga todos os controles'],
      [
        'readOnly',
        'boolean',
        'false',
        'FilterBar',
        'Cada condição alcançável e legível, nenhuma alterável: sem X, add, clear nem pills vazios',
      ],
      [
        'loading',
        'boolean',
        'false',
        'FilterBar',
        'Mantém a largura, desliga Apply, spinner no lugar da contagem',
      ],
      ['count', 'number', '—', 'FilterBar', 'Quantas linhas o filtro manteve'],
      ['total', 'number', '—', 'FilterBar', 'Quantas há'],
      [
        'messages',
        'Partial<FilterBarMessages>',
        '—',
        'FilterBar',
        'Palavras sobre as da língua em vigor, chave a chave: o nome do landmark (bar), os controles, os nomes dos chips, a contagem e os anúncios',
      ],
      [
        'savePresetEnabled',
        'boolean',
        'false',
        'FilterBar',
        'Desenha "Save as view…" no construtor e emite savePreset',
      ],
      [
        'ng-template[slFilterBarOperand]',
        'projeção',
        '—',
        'FilterBar',
        'Substitui o controle do operando do campo nomeado, ou de todos com "*"',
      ],
      ['[slFilterBarEnd]', 'projeção', '—', 'FilterBar', 'Os controles do consumidor no slot end'],
    ]),
    composition: apiRows([
      [
        'ng-template[slFilterBarOperand]',
        'let-field, let-operator="operator", let-value="value", let-set="set", let-apply="apply"',
        '—',
        'FilterBar',
        'A costura que a rodada 12 usa em table: date-range-picker num between, tags-input num conjunto grande',
      ],
      [
        '[slFilterBarEnd]',
        'ng-content',
        '—',
        'FilterBar',
        'O slot end: uma ordenação, um seletor de colunas, fora do anel da toolbar',
      ],
      [
        'exportAs',
        'slFilterBar',
        '—',
        'FilterBar',
        'Alcança a instância a partir da template: #bar="slFilterBar" e bar.focusSearch() ou bar.openBuilder()',
      ],
      [
        'provideFilterBarDefaults()',
        'apply | chipLimit | queryDelay | shortcut | size',
        '—',
        'Injector',
        'Decide uma vez para tudo por baixo; um input na barra ganha',
      ],
      [
        'id, aria-label, dir, data-*, (keydown)',
        'atributos nativos',
        '—',
        'FilterBar',
        'Ficam no elemento host; aria-label dá nome ao landmark, o listener do consumidor corre a par do da família',
      ],
    ]),
    accessibility: [
      'A raiz é role="search", não role="toolbar": o padrão Toolbar do APG pede que uma toolbar evite controles que precisam das setas, e o campo de busca é um. A busca é a primeira parada de tabulação e a toolbar a segunda — duas paradas sejam quantos forem os campos; a nota do APG para toolbars de várias linhas deixa as setas passar de linha em linha.',
      'Um chip é role="group" com o nome "<campo>: <frase>", a mesma frase que describeFilter dá ao anúncio de table, e ", incomplete" enquanto falta o valor. O operador tem aria-haspopup="menu", o valor aria-haspopup="dialog" e o nome com a lista inteira, o X "Remove <campo>". Delete e Backspace em qualquer segmento removem com a razão remove e o foco vai ao segmento do mesmo papel no chip seguinte, ao anterior, ou ao Add filter.',
      'Um pill tem aria-haspopup="dialog"; sob readOnly a toolbar leva aria-description="Read only" e os segmentos guardam a paragem com aria-disabled, e um valor bloqueado nomeia a lista inteira que o popover já não mostra.',
      'A contagem é a própria região viva, em polite, por isso o efeito de um filtro é ouvido; aplicar, limpar, remover um chip e escolher uma vista são anunciados pelo live-announcer partilhado.',
      'O construtor é um drawer: modal, Escape fecha e descarta, o foco volta ao gatilho. Cada grupo é um fieldset com legend, cada regra três controles nomeados — Field, Operator, Value ou From e To.',
      'Abaixo de 36rem o operador, more, add e clear saem do anel de foco com visibility hidden, não só do desenho: uma parada onde nada se vê é uma parada que não existe. Os cartões fechados do construtor tiram os três controles do anel da mesma forma; a frase do cartão tem aria-expanded e aria-controls.',
    ],
    snippets: [
      defineSnippet({
        id: 'filter-bar-angular-anatomy',
        language: 'angular',
        label: 'Anatomia, como chega ao DOM',
        source:
          '<div\n  aria-label="Filter"\n  data-apply="live"\n  data-part="root"\n  data-size="md"\n  data-ui="filter-bar"\n  role="search"\n>\n  <div data-part="frame">\n    <div data-part="search">…</div>\n    <div aria-label="Filters" data-part="bar" role="toolbar">\n      <button data-part="summary">Filters (2)</button>\n      <div aria-label="Status: any of Paid, Refunded" data-part="chip" role="group">\n        <span data-part="chip-field">Status</span>\n        <button aria-haspopup="menu" data-part="chip-operator">any of</button>\n        <button aria-haspopup="dialog" data-part="chip-value">Paid, Refunded</button>\n        <button aria-label="Remove Status" data-part="chip-remove"></button>\n      </div>\n      <button aria-haspopup="dialog" data-part="pill">Owner</button>\n      <button aria-label="Add filter" data-compact="" data-part="add"></button>\n    </div>\n    <p aria-live="polite" data-part="count">128 of 3,412</p>\n  </div>\n</div>',
      }),
      defineSnippet({
        id: 'filter-bar-theming',
        language: 'css',
        label: 'Retunar a família para uma aplicação',
        source:
          "[data-ui='filter-bar'] {\n  --slotted-filter-bar-pill-radius: var(--slotted-radius-md);\n  --slotted-filter-bar-value-max: 16rem;\n  --slotted-filter-bar-search-max: 36rem;\n}",
      }),
    ],
  },
} as const;
