# `event-calendar` — desenho

Data: 2026-09-24. Inventário: `2026-09-24-event-calendar-capability-inventory.md`.

`event-calendar` desenha eventos datados em quatro vistas — mês, semana, dia e
lista — e deixa o leitor navegar no tempo, filtrar por calendário, abrir o
detalhe de um evento e escolher um intervalo vazio. Os eventos são do
consumidor; a família expande a recorrência, dispõe os eventos e pede mudanças
com razão.

Uso: a agenda de uma equipa, as reservas de uma sala, o plano de publicações, os
prazos de um projeto. Antiuso: escolher uma data para um formulário
(`date-picker`, `calendar`); pessoas ou salas lado a lado
(`resource-scheduler`, `[Specialized]`); uma sequência de factos passados
(`timeline`).

## 1. Responsabilidade

| Pergunta | Dono |
| --- | --- |
| Intervalo visível de uma vista, passo anterior/seguinte | `@slotted/core/event-calendar` |
| Expansão da recorrência, exceções, ocorrências substituídas | `@slotted/core/recurrence` (regra) e `@slotted/core/event-calendar` (evento) |
| Pistas de uma linha de dias, colunas de um dia | `@slotted/core/event-calendar` |
| Hoje, agora, mudança de desvio do fuso | `@slotted/core/date` (`todayIn`, `nowDateTimeIn`) e `@slotted/core/event-calendar` (`offsetChangeOn`, `zoneLabel`) |
| Instante → hora de parede | a aplicação, com `wallClockIn` de `@slotted/core/date` |
| Barra, grelhas, lista, teclado, anúncios | `event-calendar` |
| Troca de vista | `segmented-control` na parte `views` |
| Filtro de calendários | `menu` com itens de marcação na parte `filter` |
| "+N mais" e detalhe hospedado | `popover` |
| Arrastar e redimensionar: gesto, pré-visualização, pedido | `event-calendar` (`editable`, `onEventChange` / `eventChangeRequest`) e `@slotted/core/event-calendar` (`movePlacement`, `resizePlacement`, `withPlacement`) |
| Gravar a mudança, editar campos, criar | o consumidor (`events`, `dialog`, `drawer`) |
| Esqueleto de carregamento | a anatomia do evento (skill `loading-states`) |

## 2. Modelo de valor

### 2.1 O evento

```ts
interface CalendarEvent {
  id: string;
  title: string;
  start: PlainDate | PlainDateTime;   // PlainDate: dia inteiro
  end?: PlainDate | PlainDateTime;    // a mesma espécie de start
  calendar?: string;                  // chave de EventCalendarCalendar
  status?: 'confirmed' | 'tentative' | 'cancelled';
  location?: string;
  href?: string;
  recurrence?: RecurrenceRule | string; // objeto ou texto RRULE
  exceptions?: readonly PlainDate[];    // EXDATE
  recurrenceOf?: string;                // RECURRENCE-ID: substitui uma ocorrência…
  occurrence?: PlainDate;               // …desta data, da série recurrenceOf
}
```

A espécie de `start` decide o dia inteiro: não há booleano `allDay` que possa
contradizer o tipo. `end` de dia inteiro é **o último dia, inclusivo** (uma
conferência de 3 a 5 escreve `end: 5`); `end` com hora é **exclusivo** (10:00–11:00
acaba quando começa o seguinte). FullCalendar usa fim exclusivo nos dois e
documenta o erro que isso provoca; um dia inteiro escrito como o leitor o diz
não tem esse erro. Sem `end`, ou com `end` antes de `start`, a ocorrência é
pontual. Um `end` de outra espécie é ignorado.

Os componentes são genéricos no tipo do evento (`E extends CalendarEvent`): os
campos do consumidor passam intactos até `renderEvent` e `renderEventDetail`.

### 2.2 A ocorrência

```ts
interface EventOccurrence<E> {
  key: string;               // id, ou id@AAAA-MM-DD numa série
  event: E;
  allDay: boolean;
  start: PlainDateTime;      // dia inteiro: 00:00 do primeiro dia
  end: PlainDateTime;        // exclusivo; dia inteiro: 00:00 do dia seguinte ao último
  recurring: boolean;
}
```

Tudo o que dispõe, filtra e ordena lê a ocorrência; só a apresentação volta a
`allDay`. A chave de uma ocorrência de série inclui a data original, por isso
uma ocorrência substituída mantém a chave e o foco não salta quando a
aplicação a muda.

### 2.3 Fuso horário e DST

A família guarda a hora de parede do fuso em que desenha (decisão já tomada no
briefing: nenhum instante é guardado). `timeZone` responde três perguntas: que
dia é hoje, onde está a linha de agora, e que rótulo tem a calha. A conversão
de instantes é da aplicação:

```ts
const events = rows.map((row) => ({
  ...row,
  start: wallClockIn(row.startsAt, zone),
  end: wallClockIn(row.endsAt, zone),
}));
```

`wallClockIn(instante: Date | number, fuso?: string): PlainDateTime` entra em
`@slotted/core/date` ao lado de `nowDateTimeIn`, que passa a chamá-la.

Política declarada:

1. A grelha desenha sempre 24 horas de parede. No dia em que o relógio salta,
   a hora que não existe continua desenhada; nenhuma conversão produz um
   evento nela.
2. Na hora que se repete, dois eventos às 01:30 (antes e depois da mudança)
   ficam no mesmo lugar e são dispostos como sobrepostos: sobrepõem-se na hora
   de parede, que é o que a grelha mede.
3. A duração desenhada é a de parede. Um evento de 01:00 (primeira) a 01:00
   (segunda) tem comprimento zero e é pontual; o nome acessível diz as duas
   horas.
4. A recorrência repete a hora de parede: a reunião das 09:00 fica às 09:00
   depois da mudança, que é o que RFC 5545 faz com `TZID`.
5. O dia em que o desvio muda recebe `data-offset-change`; o cabeçalho da
   coluna mostra `offset-change` ("+1 h", com a frase inteira no nome
   acessível) e a coluna traça `offset-line` na hora da mudança.
   `offsetChangeOn(data, fuso)` encontra o minuto por bisseção sobre
   `Intl.DateTimeFormat` com `timeZoneName: 'longOffset'`.

## 3. Recorrência — `@slotted/core/recurrence`

```ts
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;                                   // 1
  count?: number;
  until?: PlainDate;                                    // inclusivo
  byWeekday?: readonly (number | { weekday: number; nth: number })[]; // 0 = domingo
  byMonthDay?: readonly number[];                       // negativos contam do fim
  byMonth?: readonly number[];                          // 1–12
  weekStart?: number;                                   // 1 (MO), como a norma
}
parseRRule(text: string): RecurrenceRule | null;       // total
formatRRule(rule: RecurrenceRule): string;
occurrenceDates(rule, first: PlainDate, from: PlainDate, to: PlainDate,
                exceptions?: readonly PlainDate[]): PlainDate[];
```

- `parseRRule` aceita `RRULE:` opcional e as chaves acima, mais `WKST`; uma
  chave desconhecida, uma frequência fora das quatro ou um valor malformado dá
  `null`, a regra de `parseFilter`: um evento gravado por outra versão degrada
  para um evento único.
- A data de início é sempre a primeira ocorrência e conta para `count`, como
  `DTSTART` na norma.
- Datas inválidas geradas (31 de fevereiro) são ignoradas, como na norma.
- `count` obriga a contar desde o início; a iteração para ao fim de
  `MAX_PERIODS` (50 000) períodos, o que cobre 137 anos diários.
- Recusadas por nome: `BYSETPOS`, `BYYEARDAY`, `BYWEEKNO`, `BYHOUR` e abaixo,
  `SECONDLY`/`MINUTELY`/`HOURLY`. Uma regra que as use dá `null`.

O módulo é separado de `event-calendar` porque `resource-scheduler` e `gantt`
leem a mesma regra, e porque não conhece eventos: recebe uma regra e datas e
devolve datas.

## 4. Anatomia

```
div[data-ui=event-calendar][data-part=root]      contentor slotted-event-calendar
  │ data-view=month|week|day|list  data-layout=grid|list  data-loading
  div[data-part=header]
    h2[data-part=title]                           id; aria-live=polite
    div[data-part=navigation] role=group
      button[data-part=previous]                  glifo chevron, espelhado em RTL
      button[data-part=today]
      button[data-part=next]
    div[data-part=views] > segmented-control     só com mais de uma vista
    button[data-part=filter] > menu              só com mais de um calendário
    div[data-part=actions]                        do consumidor
  div[data-part=body]
    ── mês ──
    table[data-part=month] role=grid aria-labelledby=title
      thead > tr[data-part=weekdays]
        th[data-part=week-number-header]          só com weekNumbers
        th[data-part=weekday] abbr=<nome inteiro>
      tbody > tr[data-part=week]
        th[data-part=week-number] scope=row
        td[data-part=day] role=gridcell           tabindex roving; data-today,
          │                                        data-outside-month, data-selected,
          │                                        data-offset-change
          div[data-part=day-header] > button[data-part=day-number]
          div[data-part=day-events]               pistas: grid-row = pista
            a|button[data-part=event]             data-all-day, data-continues-before,
            │                                      data-continues-after, data-status,
            │                                      data-color=1..8, data-open
            span[data-part=continuation]          texto oculto: "Conferência, continua"
          button[data-part=more]                  gatilho de popover
    ── semana e dia ──
    div[data-part=time-grid] role=grid aria-labelledby=title
      div[data-part=time-head] role=rowgroup
        div[data-part=columns] role=row
          div[data-part=zone] role=columnheader    "GMT−3"
          div[data-part=column-header] role=columnheader  data-today
            button[data-part=day-number]
            span[data-part=offset-change]
        div[data-part=all-day-row] role=row
          div[data-part=all-day-label] role=rowheader
          div[data-part=all-day-cell] role=gridcell  barras em pistas
      div[data-part=scroller] role=rowgroup      rola na vertical
        div[data-part=time-row] role=row
          div[data-part=gutter] role=rowheader    horas aria-hidden
            span[data-part=hour]
          div[data-part=column] role=gridcell    data-today
            div[data-part=now]                    aria-hidden
            div[data-part=offset-line]            aria-hidden
            div[data-part=selection]              aria-hidden
            a|button[data-part=event]             posição por propriedades de execução
            button[data-part=more]                o excedente de maxColumns
    ── lista ──
    div[data-part=list]
      section[data-part=list-day] aria-labelledby
        h3[data-part=list-day-heading]
        ul[data-part=list-events] role=list > li > a|button[data-part=event]
    div[data-part=empty]
    div[data-part=error]
```

Dentro de `event`: `event-time`, `event-title`, `event-location` (lista e
dia) e `event-meta` (texto oculto: calendário, estado, recorrência, horas
completas). O nome acessível do evento é o seu conteúdo: título, horas,
calendário, estado. Posição e cor não dizem nada que o texto não diga.

As propriedades de execução — valores que só o script calcula, nomeados pelo
que são, como `--slotted-positioner-*` — são `--slotted-event-lane`,
`--slotted-event-span`, `--slotted-event-start`, `--slotted-event-length`,
`--slotted-event-column`, `--slotted-event-columns` e, na raiz,
`--slotted-event-calendar-days` e `--slotted-event-calendar-lanes`. Não entram
em `packages/tokens/src/contract.json`.

Uma barra de vários dias é um elemento por linha de semana, no DOM da célula do
seu primeiro dia nessa linha, com a largura de `span` células. Os dias que a
barra atravessa recebem `continuation`, para que a leitura em modo de
navegação ouça o evento em cada dia. A barra é `position: relative`, porque as
células seguintes pintam o seu fundo depois dela na ordem da árvore.

## 5. Vistas, intervalos e navegação

| Vista | Intervalo | Passo | Título (Intl) |
| --- | --- | --- | --- |
| `month` | a grelha de `monthGrid` (semanas completas; seis com `fixedWeeks`) | 1 mês, dia limitado | "setembro de 2026" |
| `week` | a semana de `date` a partir de `firstDayOfWeek`, sem sábado e domingo sob `weekends="hidden"` | 7 dias | `formatRange` "21 – 27 de set. de 2026" |
| `day` | `date` | 1 dia; sob `weekends="hidden"` salta o fim de semana | "terça-feira, 22 de setembro de 2026" |
| `list` | `listRange` `week` \| `month` (omissão `week`) | o período de `listRange` | como `week` ou `month` |

`date` é o dia em que o calendário está: o período que o contém é o intervalo
visível, e o foco da grelha repousa nele. Mudar de vista mantém `date`.
`onRangeChange({ start, end, view })` é emitido quando o intervalo muda, depois
do primeiro desenho incluído.

Abaixo de `COMPACT_BELOW` (600 px, largura da raiz, `createWidthGate`), `month`
e `week` desenham-se como lista do mesmo intervalo (`data-layout="list"`);
`view` não muda e o seletor continua a mostrar a vista escolhida. `compact`
`list` \| `keep` (omissão `list`) desliga a troca. `day` já cabe numa coluna e
não troca.

## 6. Disposição

### 6.1 Linha de dias (mês, faixa de dia inteiro)

Entram numa linha as ocorrências de dia inteiro e as com hora que atravessam a
meia-noite; no mês entram também as com hora de um só dia. Ordem: início mais
cedo; empate, mais dias primeiro; empate, dia inteiro antes de hora; empate,
título pelo `Intl.Collator` do locale; empate, chave. Cada ocorrência ocupa a
primeira pista livre em todos os seus dias da linha.

No mês, `maxEvents` (omissão 3) pistas são desenhadas; um dia com ocorrências em
pistas escondidas mostra `more` com a contagem delas, numa linha própria abaixo
das pistas. O painel de `more` lista todas as ocorrências do dia, pela ordem
acima.

Na vista de mês, uma ocorrência com hora de um só dia desenha-se como ponto,
hora e título, sem fundo; uma barra (dia inteiro ou vários dias) tem fundo.

### 6.2 Coluna de um dia (semana, dia)

Ocorrências com hora, cortadas a `dayHours`. Grupos: ocorrências ligadas por
sobreposição transitiva. Dentro de um grupo, cada ocorrência vai para a
primeira coluna cuja última ocorrência acabou; depois estende-se para a direita
sobre as colunas livres durante todo o seu intervalo (`span`). O limite de
colunas é o menor entre `maxColumns` (omissão 6) e as colunas de 64 px que cabem
na largura medida do dia (`ResizeObserver`). Um grupo acima do limite desenha as
primeiras colunas menos uma e um `more` na última, com a extensão temporal das
restantes e o mesmo painel do mês. Um dia em que só cabe uma coluna desenha os
eventos dessa coluna inteiros e as restantes como pastilha "+N" no fim do tempo
que ocupam (`overlay`), em vez de uma caixa "+N" sem nenhum nome. O título de um bloco com mais de uma linha quebra por palavras até três
linhas antes de truncar. Altura mínima: uma linha de texto (`--slotted-control-inner-size-sm`).
Uma ocorrência que começa antes de `dayHours` ou acaba depois fica cortada com
a aresta reta (`data-clipped-start`, `data-clipped-end`).

## 7. Teclado e foco

Fonte: WAI-ARIA APG, _Grid (Interactive Tabular Data and Layout Containers)
Pattern_, <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>, secções
"Keyboard Interaction For Layout Grids" e "Editing and Navigating Inside a
Cell". Não existe padrão APG para calendário de eventos; a grelha de layout
com widgets nas células é o mais próximo, e o modelo abaixo é essa grelha com
o dia como célula.

Um só ponto de tabulação na grelha: a célula de `date` (roving tabindex). Os
widgets das células (`day-number`, `event`, `more`) têm `tabindex="-1"`.

**Nível da célula**

| Tecla | Mês | Semana e dia |
| --- | --- | --- |
| ← → | ±1 dia; espelhadas em RTL; mudam de período ao sair | ±1 coluna; mudam de período ao sair |
| ↑ ↓ | ±1 semana; mudam de período ao sair | linha acima ou abaixo: cabeçalho, dia inteiro, horas |
| Home / End | primeiro e último dia da semana | primeira e última coluna |
| Ctrl+Home / Ctrl+End | primeiro e último dia do mês | — (a mesma coisa que Home/End) |
| PageUp / PageDown | ±1 mês, dia limitado | ±1 período |
| Shift+PageUp / Shift+PageDown | ±1 ano | — |
| Enter, F2 | foca o primeiro widget da célula | foca o primeiro widget da célula |
| Espaço | com `selectionMode="range"`, seleciona o dia | seleciona o dia (dia inteiro) ou a divisão em `scrollTime` (horas) |
| Shift+setas | estende a seleção desde a âncora | na linha das horas, ↑ ↓ estendem ou encolhem uma divisão |
| Escape | limpa a seleção | limpa a seleção |

**Nível do widget** (depois de Enter ou F2): ↑ ↓ percorrem os widgets da célula
sem dar a volta; Enter e Espaço ativam (botão nativo); Escape e F2 devolvem o
foco à célula; Tab sai da grelha. Um widget que desaparece com o foco (o
filtro esconde o evento) devolve o foco à célula.

Na lista não há grelha: os eventos estão na ordem de tabulação, e cada dia é
uma secção com heading para a navegação por headings.

Anúncios: o título tem a sua região viva (muda com o período); uma seleção por
teclado anuncia o intervalo por `live-announcer` ("Selecionado: 09:00 – 10:30").

Atalhos globais de uma letra (d, w, m, j, k do Google) recusados: a família
vive dentro de uma página que tem os seus, e uma letra solta dentro de uma
grelha colide com a pesquisa rápida dos leitores de ecrã.

## 8. Estado

| Capacidade | Modelo | Razões |
| --- | --- | --- |
| `current.date` | `date` / `defaultDate` / `onDateChange` | `pointer`, `keyboard`, `programmatic` |
| `current.view` | `view` / `defaultView` / `onViewChange` | `pointer`, `keyboard`, `programmatic` |
| `visibility` | `visibleCalendars` / `defaultVisibleCalendars` / `onVisibleCalendarsChange` | `pointer`, `keyboard`, `programmatic` |
| `selection` | `selection` / `defaultSelection` / `onSelectionChange` | `pointer`, `keyboard`, `escape`, `programmatic` |
| `open` | `openEvent` / `defaultOpenEvent` / `onOpenEventChange` | `pointer`, `keyboard`, `escape`, `outsidePress`, `programmatic` |

- `visibleCalendars` ausente e não controlado começa com todos os calendários.
  Um evento sem `calendar` nunca é escondido pelo filtro.
- `selection` é `{ start: PlainDate, end: PlainDate }` (dias, fim inclusivo)
  ou `{ start: PlainDateTime, end: PlainDateTime }` (horas, fim exclusivo, uma
  coluna), ou `null`.
- `openEvent` é a chave da ocorrência. Ativar o evento aberto pede `null`. Com
  `renderEventDetail`, a família desenha o `popover`; sem ele, o evento aberto
  recebe `data-open` e `aria-expanded`, e o consumidor abre o que quiser.
- `onRangeChange` é facto, não modelo.
- `onEventChange` / `eventChangeRequest` é pedido sem modelo: a família não
  guarda eventos. Ver §8.1.

### 8.1 Edição

`editable` (`boolean` ou predicado por ocorrência, omissão `false`) marca os
eventos da grelha com `data-editable`; a lista e o painel de "+N" não editam.

- Ponteiro: uma pressão que percorre 4 px pega no evento. O dia de partida e o
  de chegada são os dias sob o ponteiro, pelas caixas das células da mesma
  linha (`dayUnder`); a célula que contém o elemento não serve, porque uma
  barra vive na célula do seu primeiro dia e, agarrada pelo meio, andava os
  dias entre o início e o ponto agarrado a mais. A pré-visualização é
  a própria disposição: `withPlacement` substitui a ocorrência nas ocorrências
  desenhadas, e o bloco movido ocupa colunas e empurra vizinhos como ficará
  depois. Minutos pelo deslocamento vertical em divisões de `slotDuration`;
  dias pela diferença entre os dois dias sob o ponteiro. A soltura
  pede uma vez com razão `pointer`; Escape repõe sem pedir. O clique que termina
  um arrasto não abre o evento.
- `resize-handle`: aresta inferior de um bloco, aresta final de uma barra, só
  onde o evento acaba nesse desenho. Move apenas o fim; a duração mínima é uma
  divisão ou um dia (`resizePlacement`).
- Teclado: no evento focado, Alt+setas movem uma divisão (vertical, horas),
  uma semana (vertical, mês) ou um dia (horizontal, espelhado em RTL);
  Alt+Shift+setas movem o fim. Razão `keyboard`; o foco fica no evento onde
  aterra.
- O pedido leva `key`, `event`, `occurrence` (a data em que a ocorrência
  estava), `recurring`, `kind` (`move` / `resize`) e `start`/`end` no tipo do
  evento (`PlainDate` com fim inclusivo, ou `PlainDateTime` com fim exclusivo,
  por `placeOccurrence`). Uma ocorrência de série é gravada pela aplicação como
  substituição (`recurrenceOf` + `occurrence`) ou como mudança da série; a
  demonstração faz a primeira.
- O pedido é anunciado uma vez: título e novo intervalo.

## 9. Composição

React:

```tsx
<EventCalendar
  events={events}
  calendars={calendars}
  defaultView="week"
  timeZone="America/Sao_Paulo"
  renderEventDetail={(occurrence) => <EventSummary occurrence={occurrence} />}
  actions={<Button onClick={create}>New event</Button>}
/>
```

`EventCalendarDefaultsProvider` e `useEventCalendarDefaults` guardam `locale`,
`timeZone`, `firstDayOfWeek`, `hourCycle`, `weekends`, `slotDuration`,
`dayHours`, `scrollTime`, `maxEvents`, `maxColumns`, `weekNumbers`,
`fixedWeeks`, `listRange`, `compact` e `labels`. `renderEvent` substitui o
conteúdo de `event` e mantém o elemento. `ref` dá `focus()`, `focusDate(date)`,
`focusEvent(key)` e `scrollToTime(time)`.

Angular:

```html
<div slEventCalendar [events]="events" [calendars]="calendars"
     [(view)]="view" [(date)]="date" timeZone="America/Sao_Paulo"
     (dateRequest)="log($event)">
  <ng-template slEventCalendarEvent let-occurrence>…</ng-template>
  <ng-template slEventCalendarDetail let-occurrence>…</ng-template>
  <button slButton slEventCalendarActions>New event</button>
</div>
```

`model()` para `view`, `date`, `visibleCalendars`, `selection` e `openEvent`;
cada um tem um `output()` `<nome>Request` com o `ChangeRequest`, que o consumidor
pode cancelar antes do commit. `provideEventCalendarDefaults()` e
`EVENT_CALENDAR_DEFAULTS`. `exportAs: 'slEventCalendar'` expõe `focus`,
`focusDate`, `focusEvent` e `scrollToTime`. Não é controlo de formulário: não
implementa `ControlValueAccessor`, porque nada do que guarda é um valor
submetido.

### 9.1 Folhas abaixo da classe compacta

Abaixo de `COMPACT_BELOW` o painel "+N" e o detalhe são `drawer` com
`side="bottom"`, não `popover`: largura inteira, título, fecho, gesto de voltar
da plataforma. O contentor é a raiz, por isso uma região que contém camadas
fixas (moldura de telefone, painel) guarda-as; numa página cobrem a janela. O
foco volta ao "+N", ao número do dia ou ao evento que abriu a folha. No mês com
`compact="keep"` o número do dia abre a folha do dia (`aria-haspopup=dialog`)
em vez de navegar para o dia. Custo: `drawer` passa a `composes`; a corrida do
`history.back()` assíncrono em `dismissable-layer` (reabrir durante a travessia
perdia a entrada) foi corrigida no núcleo.

### 9.2 Menu de contexto

O corpo é o alvo único de `context-menu` (`data-ui="context-menu"`,
`data-part="body"`), como uma lista de ficheiros é um alvo para as suas linhas;
os itens são da aplicação (`renderContextMenu(target)` / `ng-template
slEventCalendarContextMenu let-target`). O alvo é o evento, ou um trecho:
`contextSlot` do núcleo devolve a seleção quando o ponteiro ou o foco está nela,
um passo das horas no ponteiro, ou o dia. O calendário resolve o alvo antes da
família: um clique sem alvo, ou num alvo sem itens (React devolve nada; Angular
`slEventCalendarContextMenuFor` recusa), não é impedido e o menu do browser
abre. Do teclado (`Shift+F10`, tecla de menu) o menu pende do evento, da seleção
desenhada ou do cabeçalho do dia. O evento-alvo é o slot sólido (`data-context`),
o trecho é desenhado como seleção em curso; a marca interior da família é zero
no corpo. Custo: o alvo é resolvido por geometria no DOM nos dois bindings
(`closest` + `minuteAt`), não por uma API da família; em Angular, os itens vêm de
um template declarado fora do menu e recebem `SlMenu` por um injector explícito.

## 10. Decisões visuais

- **Altura da hora**: duas vezes `--slotted-control-height-sm` (60, 52 e 48 px
  nas três densidades). Uma divisão de 30 minutos tem a altura de um controlo
  pequeno, e a densidade encolhe a grelha como encolhe os controlos.
- **Pista** (mês, dia inteiro): `--slotted-control-inner-size-sm` mais
  `--slotted-space-1` de ar; o texto é `--slotted-control-font-size-sm`.
- **Cor do calendário**: slot `n` de `--slotted-data-n`, atribuído pela ordem de
  `calendars` quando `color` falta, sem ciclo (nove calendários: o nono não tem
  cor, desenha-se a neutro e diz o calendário no texto). Barra e bloco: o
  slot dá o chão, a borda completa e a tinta. Chão `color-mix(<slot> 14%,
  <superfície>)`, borda a 34%, texto `color-mix(<slot> 58%, --slotted-text)`;
  hora e local a 72% dessa tinta. Sem aresta lateral colorida (decisão do
  gate visual). O fundo é misturado pela razão que
  `--slotted-highlight-tint-opacity` documenta: um slot de dados não tem papel
  `surface`.
- **Esquema escuro**: cada mistura é `light-dark(<claro>, <escuro>)`, escolhida
  pelo `color-scheme` que o tema declara por região. No escuro: repouso 24%,
  hover 32%, pressão 38%, borda 44% e 60%; passado 12%. Um slot misturado a 14%
  num chão quase preto não se distinguia do chão.
- **Estados do evento**, numa só linha de mistura: repouso 14%, hover 21%
  (borda 50%), pressão 27%. Aberto e em arrasto saem da linha para o slot
  sólido escurecido 20% (`color-mix(<slot> 80%, #000)`) com texto branco, o
  que mantém 4.5:1 em todos os slots; o aberto com o ponteiro por cima
  escurece a 70%. O hover e a pressão excluem o aberto e o arrasto, porque de
  outro modo devolviam o chão claro sob a tinta branca. O arrasto acrescenta
  `--slotted-shadow-md`.
- **Passado** (`data-past`, fim ≤ agora): chão 7%, borda 20%, tinta 30%; no
  mês, o ponto a 55% e o texto atenuado. Os eventos que ainda contam ficam à
  frente.
- **Transbordo de um bloco**: o título quebra por palavras até três linhas; o
  que passa da altura desvanece num fade de `min(1rem, 45%)` no próprio chão
  do bloco (`--_ground`), que segue todos os estados. A pega de
  redimensionamento fica acima do fade.
- **Lista**: o dia em duas linhas, `list-weekday` pequeno e atenuado sobre
  `list-date` (`listDayParts` do núcleo); o título lê-se pelo `aria-label` com
  a forma de uma linha. Coluna da hora de 10rem, para "11:00 AM – 12:00 PM"
  caber numa linha.
- **Rolagem inicial**: pára meia linha de rótulo acima de `scrollTime`, para o
  rótulo centrado na regra não ficar cortado.
- **Ícones**: anterior/seguinte (`chevron-right`, o anterior rodado; ambos
  espelhados em RTL), funil e `chevron-down` no filtro, `chevron-right` nas
  pontas de uma barra que continua noutra semana — todos elementos `Glyph`
  (`2026-09-25-glyph-element.md`). O ponto do evento no mês, o ponto da linha
  de agora e o traço da pega são formas, não ícones.
- **Hoje**: `day-number` com fundo `--slotted-tone-accent-solid` e texto
  `on-solid`; cabeçalho da coluna em `accent-text`.
- **Agora**: linha de `--slotted-border-width-thick` em
  `--slotted-tone-accent-solid`, com um ponto na calha. Não é `danger`: agora
  não é uma falha.
- **Seleção**: o par da biblioteca para o que foi escolhido —
  `--slotted-tone-accent-surface` com aresta `--slotted-tone-accent-border`.
- **Estado**: `tentative` com chão 0% (7% e 12% em hover e pressão) e borda
  tracejada no slot inteiro; `cancelled` com o título riscado e o texto
  `--slotted-text-muted`.
- **Dias fora do mês**: fundo `--slotted-surface-sunken`, número em
  `--slotted-text-muted`.
- **Cores forçadas**: o tema mapeia a escala de dados para `CanvasText`; o
  evento tem uma borda transparente, que o sistema pinta, para continuar
  delimitado.

## 11. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado/não controlado com pedido | sim: `date`, `view`, `visibleCalendars`, `selection`, `openEvent`, cada um com `default*` e `on*Change(value, request)` |
| Defaults uma vez | sim: `EventCalendarDefaultsProvider`, `useEventCalendarDefaults` |
| Substituir o elemento das partes | `render` na raiz; `renderEvent` para o conteúdo do evento; o elemento do evento é fixo (`a` com `href`, `button` sem), porque é ele que tem o nome, o foco e o `aria-expanded` |
| Handler do consumidor corre | sim: `onKeyDown`, `onPointerDown` e os restantes da raiz são compostos, nunca substituídos |
| Elemento nativo e ação imperativa | `ref` dá `EventCalendarHandle` (`focus`, `focusDate`, `focusEvent`, `scrollToTime`, `element`) |
| SSR sem divergência | `useId`; a largura é medida depois da montagem, e o primeiro desenho é a grelha |
| Estados no DOM | `data-view`, `data-layout`, `data-loading`, `data-today`, `data-selected`, `data-open`, `data-status`, `data-color` e os da §4 |
| Props das partes são as nativas | a raiz estende `ComponentPropsWithRef<'div'>` sem `defaultValue`/`onChange` |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor de duas vias | `model()` nos cinco modelos; `output()` `*Request` com o `ChangeRequest` |
| Reactive Forms | não: nada do que a família guarda é submetido; a seleção é um pedido para criar, não um valor de campo |
| Defaults uma vez | `EVENT_CALENDAR_DEFAULTS` e `provideEventCalendarDefaults()` |
| Instância no template | `exportAs: 'slEventCalendar'` |
| Conteúdo projetado e preguiçoso | `ng-template[slEventCalendarEvent]`, `ng-template[slEventCalendarDetail]`, `[slEventCalendarActions]`, `[slEventCalendarEmpty]`, `[slEventCalendarError]` |
| Zoneless e OnPush | sinais em todo o estado; o relógio de agora é um `signal` atualizado por `setTimeout` |
| Listeners desmontados | `DestroyRef` para o relógio, o `createWidthGate` e o arrasto |
| Atributo estático do consumidor | `HostAttributeToken` para `aria-label` na raiz |
| Ponto de entrada | `@slotted/angular/event-calendar`, uma classe diretiva mais as diretivas de template |

## 12. Custos

- O arrasto não atravessa períodos: largar fora da grelha visível mantém o dia
  de origem. Mover para outra semana é Alt+seta repetido ou o diálogo da
  aplicação.
- Arrastar entre a faixa de dia inteiro e as horas não converte o evento: essa
  conversão muda o tipo do valor e fica no diálogo da aplicação.
- Um fuso por calendário. Uma segunda calha de fuso (o Google tem) pediria
  instantes, que a biblioteca não guarda.
- `maxColumns` esconde eventos atrás de "+N" numa semana cheia; o painel mostra-os
  todos.
- O mês e a semana abaixo de 600 px são uma lista: quem quer a grelha num
  telefone escreve `compact="keep"` e aceita colunas de 50 px.
- A barra de vários dias é um elemento por semana e não por dia: o leitor de
  ecrã ouve-a no primeiro dia como evento e nos seguintes como continuação.
