import timelineTokens from '@slotted/styles/timeline/tokens.json';
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

export const REACT_TIMELINE_TOKENS = timelineTokens.map((name) => ({
  name,
  purpose: 'Decisão do tema sobre a linha do tempo',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  Timeline,\n  TimelineDefaultsProvider,\n  TimelineGroup,\n  TimelineItem,\n  TimelineTime,\n  useTimeline,\n} from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'É dono dos eixos, das mensagens, do fuso e do contentor de query que reflui a linha. Carrega data-ui="timeline" e cada eixo como atributo. Não é um landmark.',
  },
  {
    part: 'fresh',
    element: 'button',
    required: false,
    purpose:
      'A pílula que segura os eventos novos até o leitor os pedir. Existe enquanto freshCount é maior do que zero, antes da lista e fora do feed, e é anunciada uma vez por mudança de contagem.',
  },
  {
    part: 'list',
    element: 'ol, ou div com role="feed"',
    required: true,
    purpose:
      'A lista ordenada, ou o feed do APG quando mode="feed". Carrega o nome, aria-busy enquanto carrega, e as quatro teclas do feed — só a lista vê todos os artigos.',
  },
  {
    part: 'group',
    element: 'li, ou div no feed',
    required: false,
    purpose:
      'Um período: o heading e a sua própria lista. A linha quebra nele. Carrega data-open, o único estado mutável da família.',
  },
  {
    part: 'group-label',
    element: 'h2 a h6, por level',
    required: false,
    purpose: 'O nome do período, como heading do nível declarado na raiz ou no grupo.',
  },
  {
    part: 'group-trigger',
    element: 'button',
    required: false,
    purpose:
      'Dentro do heading de um grupo collapsible: aria-expanded, aria-controls para a lista, e o nome do período seguido de "Show events" ou "Hide events".',
  },
  {
    part: 'group-indicator',
    element: 'span',
    required: false,
    purpose:
      'O chevron do gatilho, uma máscara de --slotted-icon-chevron-down que roda entre baixo e cima.',
  },
  {
    part: 'group-list',
    element: 'ol, ou div no feed',
    required: false,
    purpose:
      'A lista de um grupo. Recebe hidden quando o grupo fecha, e os eventos ficam no DOM: um feed que os perdesse perdia a posição do leitor.',
  },
  {
    part: 'item',
    element: 'li, ou article no feed',
    required: true,
    purpose:
      'Um evento, e o elemento onde cada estado é escrito: data-current, data-complete, data-loading, data-connector, data-side, data-tone, data-variant. No feed é um article focável com posição, tamanho do conjunto, rótulo e descrição.',
  },
  {
    part: 'opposite',
    element: 'div',
    required: false,
    purpose:
      'O outro lado da linha. Em placement="end" é uma coluna de largura fixa antes da linha, onde a hora vive na leitura clássica; em alternate ocupa o lado que o corpo não ocupa.',
  },
  {
    part: 'rail',
    element: 'div',
    required: true,
    purpose:
      'A coluna do marcador e da linha, esticada à altura do evento. É o que mantém a linha no centro do marcador, seja ele um ponto ou um avatar.',
  },
  {
    part: 'marker',
    element: 'span',
    required: true,
    purpose:
      'O marcador sobre a linha, centrado na primeira linha do título. Vazio desenha um ponto do tamanho do spinner; com glifo ou avatar desenha um emblema; loading desenha o spinner no lugar do ponto; complete vaza um check no disco.',
  },
  {
    part: 'connector',
    element: 'span',
    required: false,
    purpose:
      'A linha do marcador ao evento seguinte, aria-hidden. O último evento de cada lista não a desenha. Tracejada do lado futuro do evento atual, com autoComplete.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'O corpo: título e hora na primeira linha, ator por baixo, descrição, o que o consumidor escrever e as ações.',
  },
  {
    part: 'title',
    element: 'div',
    required: false,
    purpose:
      'O nome do evento, e o primeiro id de aria-labelledby no feed. O estado current é lido a seguir a ele, numa visually-hidden.',
  },
  {
    part: 'actor',
    element: 'div',
    required: false,
    purpose: 'Quem o fez: um avatar e um nome. Entra no rótulo do artigo a seguir ao título.',
  },
  {
    part: 'time',
    element: 'time',
    required: false,
    purpose:
      'Quando aconteceu. Escreve sempre datetime com o valor de máquina; o texto é formatado pelo locale e pelo timeZone, ou substituído por timeLabel, e uma leitura relativa guarda a absoluta em title.',
  },
  {
    part: 'description',
    element: 'div',
    required: false,
    purpose: 'A segunda linha, e o aria-describedby do artigo no feed.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'A fila de controlos sob a descrição. Um evento com ações não é acionável por inteiro: cada ação é um alvo próprio.',
  },
  {
    part: 'more',
    element: 'button, ou div enquanto carrega',
    required: false,
    purpose:
      'O fim do que foi carregado, quando growing não é none. Um botão que pede mais, ou, em scroll, uma sentinela que pede quando entra no rolador; enquanto loading mostra o anel e a mensagem.',
  },
  {
    part: 'empty',
    element: 'div',
    required: false,
    purpose: 'O que fica no lugar da lista quando não há eventos e nada está a carregar.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Todos os eixos numa fatura, movidos pelos controlos por baixo do palco. Troque mode para feed e a mesma lista passa a artigos focáveis.',
    snippet: defineSnippet({
      id: 'timeline-react-playground',
      language: 'tsx',
      label: 'A vida de uma fatura',
      source:
        '<Timeline label="Atividade da fatura" locale="pt-BR" timeZone="America/Sao_Paulo">\n  <TimelineItem\n    actor="Ana Ribeiro"\n    description="Rascunho INV-4821 para Solaris Fretes."\n    time="2026-09-08T09:12:00Z"\n    title="Fatura criada"\n  />\n  <TimelineItem current time="2026-09-14T10:32:00Z" title="Paga" tone="success" />\n</Timeline>;',
    }),
  },
  {
    id: 'feed',
    title: 'Um feed que é um feed',
    note: 'Com mode="feed" a lista é role="feed" e cada evento um article com aria-posinset, aria-setsize e o rótulo lido do título, do ator e da hora. Tab para em cada artigo; PageDown e PageUp saltam entre eles.',
    snippet: defineSnippet({
      id: 'timeline-react-feed',
      language: 'tsx',
      label: 'O padrão Feed do APG, item a item',
      source:
        '<Timeline count={120} growing="button" label="Atividade" mode="feed" onLoadMore={load}>\n  {events.map((event) => (\n    <TimelineItem key={event.id} {...event} />\n  ))}\n</Timeline>;',
    }),
  },
  {
    id: 'placement',
    title: 'De que lado da linha',
    note: 'end é a omissão; start espelha a fila; alternate põe a linha ao meio e os eventos revezam-se. A parte opposite ocupa sempre o lado que o corpo não ocupa, e abaixo de trinta rems alternate volta a um lado só.',
    snippet: defineSnippet({
      id: 'timeline-react-placement',
      language: 'tsx',
      label: 'A hora do outro lado da linha',
      source:
        '<Timeline placement="alternate">\n  <TimelineItem\n    opposite={<TimelineTime value="2026-06-02T00:00:00Z" />}\n    title="2.12 — Faturas recorrentes"\n  />\n</Timeline>;',
    }),
  },
  {
    id: 'orientation',
    title: 'Uma fila de eventos',
    note: 'horizontal põe a linha de lado, com colunas iguais que rolam no eixo em linha quando há mais eventos do que largura. Abaixo de trinta rems da sua própria largura volta a ser uma coluna; reflow={false} desliga isso.',
    snippet: defineSnippet({
      id: 'timeline-react-orientation',
      language: 'tsx',
      label: 'A mesma linha, deitada',
      source: '<Timeline autoComplete orientation="horizontal">\n  {stages}\n</Timeline>;',
    }),
  },
  {
    id: 'order',
    title: 'A ordem é declarada, nunca invertida',
    note: 'order diz o que a lista é e não reordena o array: o consumidor ordena. É a ordem que decide onde autoComplete corta — em oldest-first o passado está antes do atual, em newest-first depois.',
    snippet: defineSnippet({
      id: 'timeline-react-order',
      language: 'tsx',
      label: 'Os mais recentes primeiro, e o passado por baixo',
      source:
        '<Timeline autoComplete order="newest-first">\n  <TimelineItem title="Entregue" />\n  <TimelineItem current title="Em trânsito" />\n  <TimelineItem title="Embalado" />\n</Timeline>;',
    }),
  },
  {
    id: 'statuses',
    title: 'O que um evento pode ser',
    note: 'Cada estado é uma forma além de uma cor: pendente é a forma do variant, atual é um disco cheio com um anel, concluído é um disco cheio com um check vazado, a carregar é o spinner do tamanho do ponto. autoComplete deriva concluído para o lado passado do atual e traceja o futuro.',
    snippet: defineSnippet({
      id: 'timeline-react-statuses',
      language: 'tsx',
      label: 'Um rastreio de encomenda',
      source:
        '<Timeline autoComplete tone="accent">\n  <TimelineItem title="Pedido confirmado" />\n  <TimelineItem current title="Em trânsito" />\n  <TimelineItem title="Saiu para entrega" />\n  <TimelineItem loading title="Entregue" />\n</Timeline>;',
    }),
  },
  {
    id: 'appearance',
    title: 'Aparência e tamanho',
    note: 'variant na raiz ou por evento: outline separa o marcador da linha em qualquer esquema, solid enche, subtle é um fundo com aresta fina, plain é o ponto sem anel para uma fila de eventos pequenos. tone pinta o marcador com um dos cinco tons; size escolhe o passo.',
    snippet: defineSnippet({
      id: 'timeline-react-appearance',
      language: 'tsx',
      label: 'Um evento que discorda da raiz',
      source:
        '<Timeline size="sm" variant="plain">\n  <TimelineItem title="Commit 4f2a" />\n  <TimelineItem title="Falha nos testes" tone="danger" variant="solid" />\n</Timeline>;',
    }),
  },
  {
    id: 'groups',
    title: 'Agrupar por período',
    note: 'O consumidor agrupa, porque o período é do domínio. Um grupo é um heading do nível declarado sobre a sua própria lista; collapsible faz do heading um botão com aria-expanded, e a lista fechada fica no DOM com hidden.',
    snippet: defineSnippet({
      id: 'timeline-react-groups',
      language: 'tsx',
      label: 'Hoje, aberto; a semana passada, fechada',
      source:
        '<Timeline level={3}>\n  <TimelineGroup collapsible label="Hoje">\n    <TimelineItem title="Paga" />\n  </TimelineGroup>\n  <TimelineGroup collapsible defaultOpen={false} label="Semana passada">\n    <TimelineItem title="Enviada" />\n  </TimelineGroup>\n</Timeline>;',
    }),
  },
  {
    id: 'growing',
    title: 'Carregar mais',
    note: 'growing="button" põe um botão no fim do carregado e pede com pointer ou keyboard; growing="scroll" pede com scroll quando o fim entra no rolador. Enquanto loading, o fim mostra o anel e a raiz fica aria-busy.',
    snippet: defineSnippet({
      id: 'timeline-react-growing',
      language: 'tsx',
      label: 'O consumidor acrescenta ao array',
      source:
        '<Timeline growing="button" loading={pending} onLoadMore={(reason) => fetchMore()}>\n  {events}\n</Timeline>;',
    }),
  },
  {
    id: 'fresh',
    title: 'Eventos novos enquanto o leitor lê',
    note: 'Um feed que insere no topo empurra o que está a ser lido. Com freshCount, a família segura os novos atrás de uma pílula, anuncia a contagem em polite, e onReveal é o momento em que o consumidor os junta ao array.',
    snippet: defineSnippet({
      id: 'timeline-react-fresh',
      language: 'tsx',
      label: 'Três eventos à espera',
      source:
        '<Timeline freshCount={held.length} mode="feed" onReveal={() => setEvents([...held, ...events])}>\n  {events}\n</Timeline>;',
    }),
  },
  {
    id: 'timestamps',
    title: 'Hora de máquina, fuso explícito',
    note: 'time aceita um instante ISO com designador de fuso, escrito no timeZone declarado, ou um valor de parede sem fuso, escrito como está. datetime leva sempre o valor de máquina; timeFormat="relative" escreve "há 2 horas" e guarda o absoluto em title.',
    snippet: defineSnippet({
      id: 'timeline-react-timestamps',
      language: 'tsx',
      label: 'O mesmo instante em dois fusos, e um relativo',
      source:
        '<TimelineDefaultsProvider locale="pt-BR" now={Date.now()} timeZone="America/Sao_Paulo">\n  <Timeline timeFormat="relative">\n    <TimelineItem time="2026-09-14T10:32:00Z" title="Paga" />\n  </Timeline>\n</TimelineDefaultsProvider>;',
    }),
  },
  {
    id: 'content',
    title: 'Conteúdo que a família não escolheu',
    note: 'Um título de nove palavras, uma referência sem quebra, um título em árabe, um avatar no marcador, um evento sem título. O marcador nunca sai da primeira linha e a linha nunca sai do centro.',
    snippet: defineSnippet({
      id: 'timeline-react-content',
      language: 'tsx',
      label: 'Um avatar no marcador',
      source:
        '<TimelineItem\n  marker={<Avatar name="Ana Ribeiro" />}\n  title="Aprovou a cotação revista do programa de remessas"\n/>;',
    }),
  },
  {
    id: 'composition',
    title: 'Composição',
    note: 'O título é o que o consumidor lhe der — um Link — e as ações são botões da família button. Conteúdo expansível é um Collapsible dentro do corpo. useTimeline() dá focusItem para o feed, e TimelineDefaultsProvider decide uma vez para a aplicação.',
    snippet: defineSnippet({
      id: 'timeline-react-composition',
      language: 'tsx',
      label: 'Um link no título e uma disclosure no corpo',
      source:
        '<TimelineItem\n  actions={<Button size="sm">Repetir</Button>}\n  title={<Link href="/faturas/4821">Pagamento falhou</Link>}\n>\n  <Collapsible variant="plain">\n    <Collapsible.Trigger>Ver resposta do emissor</Collapsible.Trigger>\n    <Collapsible.Panel>Código 05: não honrar.</Collapsible.Panel>\n  </Collapsible>\n</TimelineItem>;',
    }),
  },
  {
    id: 'empty',
    title: 'Sem eventos',
    note: 'Sem itens e sem loading, a parte empty toma o lugar da lista com a mensagem da família ou com o que o consumidor projetar — um result-state, por exemplo.',
    snippet: defineSnippet({
      id: 'timeline-react-empty',
      language: 'tsx',
      label: 'O que fica no lugar da lista',
      source: '<Timeline empty={<ResultState status="empty" title="Ainda sem eventos" />} />;',
    }),
  },
  {
    id: 'keyboard',
    title: 'Teclado',
    note: 'Em list o teclado é o da plataforma: Tab atravessa os links e botões do corpo. Em feed, Tab para em cada artigo, PageDown e PageUp saltam entre artigos, Control+End e Control+Home saem do feed para o focável seguinte ou anterior.',
    snippet: defineSnippet({
      id: 'timeline-react-keyboard',
      language: 'tsx',
      label: 'O que um artigo anuncia',
      source:
        '// "Paga, Solaris Fretes, há 2 horas, artigo 1 de 3" — título, ator e hora,\n// e a posição, porque cada artigo leva aria-labelledby e aria-posinset.\n<Timeline label="Atividade" mode="feed">\n  {events}\n</Timeline>;',
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: ChangeRequest<boolean>)',
    when: 'Em TimelineGroup, antes de o grupo abrir ou fechar. O pedido leva o valor anterior, a razão — pointer, keyboard ou programmatic — e o evento de origem; cancelá-lo não move nada.',
  },
  {
    name: 'onLoadMore',
    payload: '(reason: "pointer" | "keyboard" | "scroll", event?)',
    when: 'Quando o leitor pressiona o botão de carregar mais, ou quando a sentinela entra no rolador em growing="scroll". Não há valor a segurar: o consumidor acrescenta ao array.',
  },
  {
    name: 'onReveal',
    payload: '(reason: "pointer" | "keyboard", event?)',
    when: 'Quando o leitor pressiona a pílula de eventos novos. O consumidor junta os eventos que segurava ao array e põe freshCount a zero.',
  },
];

export const REACT_TIMELINE_DOCS = {
  timeline: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'mode',
        "'list' | 'feed'",
        'list',
        'Timeline',
        'Uma lista ordenada, ou o padrão Feed do APG',
      ],
      [
        'orientation',
        "'vertical' | 'horizontal'",
        'vertical',
        'Timeline',
        'Uma coluna, ou uma fila que rola e reflui',
      ],
      [
        'placement',
        "'end' | 'start' | 'alternate'",
        'end',
        'Timeline',
        'De que lado da linha o corpo vive',
      ],
      [
        'order',
        "'oldest-first' | 'newest-first'",
        'oldest-first',
        'Timeline',
        'O que a lista é; decide onde autoComplete corta. Nunca reordena o array',
      ],
      [
        'variant',
        "'solid' | 'outline' | 'subtle' | 'plain'",
        'subtle',
        'Timeline',
        'A aparência do marcador, herdada pelos eventos',
      ],
      [
        'tone',
        "'secondary' | 'accent' | 'success' | 'warning' | 'danger'",
        'secondary',
        'Timeline',
        'O tom do marcador, herdado pelos eventos',
      ],
      ['size', "'sm' | 'md' | 'lg'", 'md', 'Timeline', 'O passo do marcador e do tipo'],
      [
        'growing',
        "'none' | 'button' | 'scroll'",
        'none',
        'Timeline',
        'Como o fim do carregado pede mais',
      ],
      [
        'timeFormat',
        "'absolute' | 'relative'",
        'absolute',
        'Timeline',
        'Como a hora é escrita; relative guarda o absoluto em title',
      ],
      ['locale', 'string', '—', 'Timeline', 'BCP 47 para as horas; sem ele, o do runtime'],
      [
        'timeZone',
        'string',
        '—',
        'Timeline',
        'O fuso em que um instante é escrito; sem ele, o do runtime',
      ],
      [
        'now',
        'number',
        '—',
        'Timeline',
        'O instante de que uma leitura relativa conta, em milissegundos de época; sem ele, o relógio na renderização',
      ],
      ['level', '2 | 3 | 4 | 5 | 6', '3', 'Timeline', 'O nível dos headings dos grupos'],
      [
        'reflow',
        'boolean',
        'true',
        'Timeline',
        'Se horizontal e alternate refluem abaixo de trinta rems',
      ],
      [
        'autoComplete',
        'boolean',
        'false',
        'Timeline',
        'Marca concluídos os eventos do lado passado do atual, e traceja o futuro',
      ],
      [
        'loading',
        'boolean',
        'false',
        'Timeline',
        'Mais eventos a caminho: aria-busy no feed, anel no fim',
      ],
      ['freshCount', 'number', '0', 'Timeline', 'Quantos eventos novos a pílula segura'],
      [
        'count',
        'number',
        '—',
        'Timeline',
        'O total, para aria-setsize; sem ele, -1 enquanto pode crescer',
      ],
      ['label', 'string', '—', 'Timeline', 'O nome acessível da lista'],
      ['labelledBy', 'string', '—', 'Timeline', 'O id do elemento que nomeia a lista'],
      ['empty', 'ReactNode', '—', 'Timeline', 'O que fica no lugar da lista vazia'],
      [
        'messages',
        'Partial<TimelineMessages>',
        '—',
        'Timeline',
        'As sete mensagens da família, fundidas com as omissões',
      ],
      ['label', 'ReactNode', '—', 'TimelineGroup', 'O nome do período, como heading'],
      [
        'collapsible',
        'boolean',
        'false',
        'TimelineGroup',
        'Se o heading é um botão que dobra o grupo',
      ],
      ['open', 'boolean', '—', 'TimelineGroup', 'Presente é controlado, para a vida do grupo'],
      [
        'defaultOpen',
        'boolean',
        'true',
        'TimelineGroup',
        'Onde um grupo não controlado começa, lido uma vez',
      ],
      [
        'level',
        '2 | 3 | 4 | 5 | 6',
        '—',
        'TimelineGroup',
        'O nível deste heading, sobre o da raiz',
      ],
      ['title', 'ReactNode', '—', 'TimelineItem', 'O nome do evento'],
      ['description', 'ReactNode', '—', 'TimelineItem', 'A segunda linha'],
      ['actor', 'ReactNode', '—', 'TimelineItem', 'Quem o fez'],
      [
        'time',
        'PlainDateTime | string',
        '—',
        'TimelineItem',
        'Quando: instante ISO ou valor de parede',
      ],
      ['timeLabel', 'ReactNode', '—', 'TimelineItem', 'O texto no lugar da hora formatada'],
      ['marker', 'ReactNode', '—', 'TimelineItem', 'O que o marcador segura no lugar do ponto'],
      ['opposite', 'ReactNode', '—', 'TimelineItem', 'O outro lado da linha'],
      ['actions', 'ReactNode', '—', 'TimelineItem', 'A fila de controlos'],
      [
        'current',
        'boolean',
        'false',
        'TimelineItem',
        'O evento em que o leitor está: aria-current',
      ],
      ['complete', 'boolean', '—', 'TimelineItem', 'Concluído; vence a derivação'],
      ['loading', 'boolean', 'false', 'TimelineItem', 'Ainda a chegar: o marcador roda o anel'],
      [
        'connector',
        "'solid' | 'dashed' | 'none'",
        '—',
        'TimelineItem',
        'A linha depois deste evento',
      ],
      ['side', "'start' | 'end'", '—', 'TimelineItem', 'O lado em alternate; paridade sem ele'],
      ['tone', 'TimelineTone', '—', 'TimelineItem', 'O tom deste evento, sobre o da raiz'],
      [
        'variant',
        'TimelineVariant',
        '—',
        'TimelineItem',
        'A aparência deste evento, sobre a da raiz',
      ],
      [
        'value',
        'PlainDateTime | string',
        '—',
        'TimelineTime',
        'O valor de máquina, escrito em datetime',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'Timeline, TimelineGroup, TimelineItem',
        'Substitui o elemento renderizado. Todo atributo de dados é entregue, e um article do feed leva o seu role.',
      ],
      ['ref', 'Ref<HTMLElement>', '—', 'todas as partes', 'Alcança o elemento'],
      [
        'useTimeline()',
        '() => TimelineContextValue',
        '—',
        'dentro de uma Timeline',
        'Os eixos resolvidos, as mensagens, e focusItem(index) — mover o foco a um artigo do feed, a ação que uma prop não exprime',
      ],
      [
        'TimelineTime',
        '{ value, format, locale, timeZone, now }',
        '—',
        'em qualquer sítio',
        'A parte time sozinha, para uma coluna opposite ou uma célula de tabela; lê a raiz quando há uma',
      ],
      [
        'TimelineDefaultsProvider',
        'mode | orientation | placement | order | variant | tone | size | growing | timeFormat | locale | timeZone | now | level | messages',
        '—',
        'Aplicação',
        'Decide os catorze uma vez para tudo por baixo; uma prop na linha do tempo ganha',
      ],
    ]),
    accessibility: [
      'Em list a lista é uma ol e cada evento um li: a sequência e o tamanho do conjunto vêm da plataforma sem uma linha de ARIA, e o teclado é o dos links e botões que o consumidor escrever. Não há papel inventado numa lista que não cresce.',
      'Em feed a lista é role="feed" e cada evento um article com tabindex="0", aria-posinset, aria-setsize — o total declarado, o carregado quando não cresce, -1 quando pode crescer — aria-labelledby com título, ator e hora por esta ordem, e aria-describedby com a descrição. É o padrão Feed do APG item a item, e um li não admite o papel article: por isso o elemento muda com o modo.',
      'O evento atual leva aria-current="true" e uma visually-hidden ", current" a seguir ao título, porque nem todo leitor de ecrã diz aria-current dentro de um artigo. Concluído e a carregar são formas — um disco com check, o anel do spinner — e não só cores.',
      'Um grupo collapsible é o padrão Disclosure: o heading contém um button com aria-expanded e aria-controls, e a lista fechada recebe hidden sem sair do DOM. O nome do botão é o período seguido de "Show events" ou "Hide events".',
      'A hora é sempre um elemento time com datetime, o valor que o leitor de ecrã e o motor de busca leem; o texto é do locale e do fuso declarados, e uma leitura relativa deixa a absoluta em title.',
      'Os eventos novos são anunciados em polite uma vez por mudança de contagem, e ficam atrás de um botão até o leitor os pedir, para nada se mover debaixo do que está a ser lido.',
    ],
    snippets: [
      defineSnippet({
        id: 'timeline-react-anatomy',
        language: 'tsx',
        label: 'Anatomia, como chega ao DOM',
        source:
          '<div\n  data-growing="none"\n  data-mode="list"\n  data-order="oldest-first"\n  data-orientation="vertical"\n  data-part="root"\n  data-placement="end"\n  data-size="md"\n  data-tone="secondary"\n  data-ui="timeline"\n  data-variant="outline"\n>\n  <ol aria-label="Atividade da fatura" data-part="list">\n    <li data-part="item" data-tone="success" data-variant="outline">\n      <div data-part="rail">\n        <span data-part="marker" />\n        <span aria-hidden="true" data-part="connector" />\n      </div>\n      <div data-part="content">\n        <div data-part="title">Paga</div>\n        <time data-part="time" dateTime="2026-09-14T10:32:00Z">\n          14 de set. de 2026, 07:32\n        </time>\n        <div data-part="description">R$ 18.240,00 por transferência.</div>\n      </div>\n    </li>\n  </ol>\n</div>;',
      }),
      defineSnippet({
        id: 'timeline-theming',
        language: 'css',
        label: 'Retunar a família para uma aplicação',
        source:
          "[data-ui='timeline'] {\n  --slotted-timeline-core-ratio: 0.6;\n  --slotted-timeline-connector-thickness: 2px;\n  --slotted-timeline-opposite-size: 10rem;\n}",
      }),
    ],
  },
} as const;
