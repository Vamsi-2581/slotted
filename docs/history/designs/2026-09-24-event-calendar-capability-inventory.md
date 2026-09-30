# Inventário de capacidades — `event-calendar`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. A família é nova:
`specs/components/event-calendar/` não existe.

Escopo escrito (`docs/process/build-order.md`, onda 12): vistas mês, semana, dia
e lista; fuso horário; eventos; dia inteiro; recorrência; navegação temporal;
filtros; abertura de detalhe. Não deriva de `date-picker`; reutiliza
`@slotted/core/date` e a grelha de `calendar` só na vista de mês. Eventos
sobrepostos e DST têm política declarada. Tela estreita prioriza a vista de
lista. `docs/component-features.md` §16 acrescenta: seleção de data ou
intervalo opcional; cada evento acessível sem depender de posição ou cor.
`docs/product/prd.md` não nomeia a família.

A invocação cita a onda 11; a família consta da onda 12 de
`docs/process/build-order.md`, e o escopo lido é o da onda 12.

Fontes lidas em 24 de setembro de 2026.

---

## 1. Pesquisadas

| Implementação | Nome da família | Onde foi lida |
| --- | --- | --- |
| FullCalendar v7 | `Calendar` com as vistas `dayGrid`, `timeGrid`, `list`, `multiMonth` | <https://fullcalendar.io/docs/timeZone>; `/docs/event-parsing`; `/docs/rrule-plugin`; `/docs/accessibility`; `/docs/dayMaxEvents`; `/docs/slotEventOverlap`; `/docs/businessHours`; `/docs/nowIndicator`; `/docs/list-view` |
| react-big-calendar 1.x | `Calendar`, vistas `month`, `week`, `work_week`, `day`, `agenda` | <https://raw.githubusercontent.com/jquense/react-big-calendar/master/src/Calendar.js>; <https://github.com/jquense/react-big-calendar/blob/master/README.md> |
| MUI X Scheduler (beta) | `EventCalendar`, vistas `week`, `day`, `month`, `agenda` | <https://mui.com/x/react-scheduler/>; <https://mui.com/x/react-scheduler/event-calendar/views/> |
| Schedule-X v3 | `createCalendar`, vistas `day`, `week`, `month-grid`, `month-agenda`, `list` | <https://schedule-x.dev/docs/calendar/configuration>; `/docs/calendar/views`; `/docs/calendar/calendars` |
| angular-calendar (Angular 20.2+) | `mwl-calendar-month-view`, `-week-view`, `-day-view` | <https://mattlewis92.github.io/angular-calendar/docs/> |
| Google Calendar (produto) | agenda pessoal, atalhos de teclado | <https://support.google.com/calendar/answer/37034> |
| ReUI (2026-09-29) | `event-calendar`, vistas `month`, `week`, `day`, `days`, `agenda`, `resource` | `docs/history/designs/2026-09-29-event-calendar-reui-dossier.md` § 6 |
| WAI-ARIA APG | Grid (layout grid com widgets nas células); Feed (considerado para a lista) | <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>; <https://www.w3.org/WAI/ARIA/apg/patterns/feed/> |

As fontes discordam em quatro pontos que decidem a família:

- **Fuso horário.** FullCalendar recebe instantes com ou sem desvio e desenha
  num fuso nomeado; os objetos `Date` que devolve só representam o fuso local
  ou UTC. Schedule-X recebe `Temporal.ZonedDateTime`. MUI X reserva a
  recorrência sensível a DST para o pacote pago. react-big-calendar e
  angular-calendar desenham no fuso do navegador por um adaptador de datas.
- **Sobreposição.** FullCalendar sobrepõe por omissão, com metade de cada
  evento visível (`slotEventOverlap: true`); react-big-calendar oferece
  `overlap` e `no-overlap` (`dayLayoutAlgorithm`).
- **Teclado.** FullCalendar torna tabuláveis só os eventos com `url`
  (`eventInteractive`); react-big-calendar torna todos tabuláveis; nenhuma
  fonte declara um modelo de foco de grelha para os dias.
- **Detalhe.** MUI X e o Google abrem um painel ancorado ao evento; FullCalendar,
  react-big-calendar e angular-calendar emitem o clique e deixam o resto ao
  consumidor.

## 2. Table stakes

| Capacidade | Quem entrega | Veredicto | Razão |
| --- | --- | --- | --- |
| Vistas mês, semana, dia e lista | FullCalendar, react-big-calendar (`agenda`), MUI X (`agenda`), Schedule-X (`list`) | adopt | `view` `month` \| `week` \| `day` \| `list`. |
| Semana útil / fins de semana ocultos | react-big-calendar (`work_week`), FullCalendar (`weekends: false`), MUI X (`showWeekends`) | adopt | Eixo `weekends` `shown` \| `hidden`, lido por mês e semana. Um eixo, não uma quinta vista: a semana útil é a semana sem dois dias. |
| Data e vista controladas e não controladas | react-big-calendar (`date`/`onNavigate`, `view`/`onView`), MUI X (`view`/`onViewChange`, `visibleDate`), angular-calendar (`[(viewDate)]`) | adopt | Modelos `date` e `view`, com razão. `date` é o dia em que o calendário está; o intervalo visível é o período que o contém. |
| Barra com anterior, hoje, seguinte, título e troca de vista | todas | adopt | Partes `header`, `title`, `previous`, `today`, `next`, `views`; `actions` recebe controlos do consumidor. O título é o heading da grelha, com região viva. |
| Aviso do intervalo visível para carregar dados | FullCalendar (`datesSet`), react-big-calendar (`onRangeChange`), Schedule-X (`onRangeUpdate`) | adopt | `onRangeChange({ start, end, view })`: facto, não modelo; emitido quando o intervalo muda. |
| Eventos de dia inteiro e a faixa de dia inteiro | todas | adopt | Um evento cujo `start` é `PlainDate`. Na semana e no dia, a faixa `all-day` sobre a grelha horária. |
| Barras de vários dias | todas | adopt | Empacotamento por pistas em cada linha de semana; a barra corta-se no fim da linha e continua na seguinte com a aresta reta. |
| Política de sobreposição na grelha horária | FullCalendar (`slotEventOverlap`), react-big-calendar (`dayLayoutAlgorithm`) | adapt | Uma política: colunas por grupo de sobreposição, com expansão para as colunas livres à direita (`no-overlap`). A sobreposição em escada esconde metade do título e a hora de cada evento; nenhum texto fica tapado nesta família. Um grupo com mais colunas que `maxColumns` dobra o excesso num "+N" que abre a lista do dia (§4). |
| "+N mais" no mês com painel | FullCalendar (`dayMaxEvents`, popover), react-big-calendar (`popup`), MUI X | adopt | `maxEvents` por dia (omissão 3); `more` é o gatilho de um `popover` com todos os eventos do dia. |
| Descer ao dia a partir do número do dia | FullCalendar (`navLinks`), react-big-calendar (`drilldownView`) | adopt | `day-number` é um `button` que pede `view: 'day'` e `date`; a razão é a do gesto. |
| Indicador de agora | FullCalendar (`nowIndicator`), react-big-calendar, MUI X | adopt | Linha `now` na coluna de hoje, no fuso `timeZone`, reposicionada a cada minuto. |
| Horas visíveis e rolagem inicial | FullCalendar (`slotMinTime`, `slotMaxTime`, `scrollTime`), MUI X (`startTime`, `endTime`, `initialScrollTime`), react-big-calendar (`min`, `max`, `scrollToTime`) | adopt | `dayHours` `[início, fim]` em horas inteiras; `scrollTime` (omissão 07:00); `scrollToTime()` imperativo. Um evento fora das horas visíveis é cortado com a aresta reta e o nome acessível diz a hora completa. |
| Duração da divisão da grelha | FullCalendar (`slotDuration`), react-big-calendar (`step`, `timeslots`) | adopt | `slotDuration` 15, 30 ou 60 minutos: linhas da grelha e passo da seleção. |
| Fuso horário | FullCalendar (`timeZone`), Schedule-X (`ZonedDateTime`, plugin de fuso), MUI X (premium) | adapt | A biblioteca guarda a hora de parede (`docs/build-briefing.md`, _Decisions already taken_). `timeZone` decide hoje, agora e o rótulo do fuso na calha; a aplicação converte instantes com `wallClockIn(instante, fuso)`, nova em `@slotted/core/date`. |
| Recorrência | FullCalendar (plugin RRule, `exdate`), MUI X (premium, datas de exceção), Schedule-X (recorrência RRULE) | adopt | `@slotted/core/recurrence`: subconjunto de RFC 5545 (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` com ordinal, `BYMONTHDAY`, `BYMONTH`, `WKST`), `parseRRule` total, exceções e ocorrências substituídas (`recurrenceOf` + `occurrence`, o `RECURRENCE-ID` da norma). |
| Calendários (categorias) com cor e filtro | Schedule-X (`calendars`, `calendarId`), MUI X (recursos com filtro), Google (lista de calendários) | adopt | `calendars: [{ key, label, color? }]`; cor por slot da escala de dados; modelo `visibleCalendars`; parte `filter` é um `menu` de itens de marcação. Um predicado `filter` compõe busca e `filter-bar`. |
| Abrir o detalhe de um evento | todas (clique); MUI X e Google (painel ancorado) | adapt | Modelo `openEvent` (chave da ocorrência). Com `renderEventDetail`, a família abre um `popover` ancorado ao evento; sem ele, o consumidor abre a sua gaveta, diálogo ou `master-detail` pelo mesmo pedido. Um evento com `href` é um `a`. |
| Selecionar um intervalo vazio para criar | FullCalendar (`selectable`, `select`), react-big-calendar (`selectable`, `onSelectSlot`), MUI X (criação), Schedule-X (drag to create) | adopt | `selectionMode` `none` \| `range`; modelo `selection` (`{ start, end }`); ponteiro arrasta por divisões ou dias; teclado usa Espaço e Shift+setas. O consumidor reage ao pedido e limpa a seleção. |
| Arrastar e redimensionar eventos | FullCalendar (`editable`), react-big-calendar (addon DnD), MUI X, Schedule-X (premium) | adopt | Adotado depois do gate visual, a pedido do revisor. `editable` (booleano ou predicado); pedido `onEventChange` / `eventChangeRequest` sem modelo; pré-visualização pela disposição; Alt+setas e Alt+Shift+setas como caminho de teclado. `resource-scheduler` herda os helpers de `@slotted/core/event-calendar` para a sua grelha de recursos. |
| Validação ao vivo do destino | ReUI (`canDropEvent`, `data-drop-invalid`) | adopt | Adotado no portão do dossiê ReUI de 2026-09-29. `canDrop(change)` lê o mesmo objeto de `onEventChange` / `eventChangeRequest`; destino recusado marca `data-drop-invalid`, largar ali não pede nada; Alt+setas passa ao destino seguinte permitido (`nextAllowedPlacement`) e anuncia `dropInvalid` quando não há nenhum. |
| Vista de N dias | ReUI (`days`, `dayCount`) | decline | Recusado no mesmo portão: `week` com `weekends="hidden"` e `day` cobrem os usos medidos, e nenhum bloco Pro ReUI usa `days`. |
| Recursos (pessoas, salas) | MUI X, Schedule-X (premium), FullCalendar (premium) | defer to `resource-scheduler` | O mesmo parágrafo §16: "modelo de recursos … pertencem ao pacote, não ao Event Calendar comum". |
| Conteúdo do evento substituível | FullCalendar (`eventContent`), react-big-calendar (`components.event`), angular-calendar (templates) | adopt | React `renderEvent(occurrence, context)`; Angular `ng-template[slEventCalendarEvent]`. A família mantém o elemento, o nome acessível e a geometria. |
| Localização e mensagens | todas (`messages`, `locale`, `hints`) | adopt | `locale`, `firstDayOfWeek`, `hourCycle`, `labels` por instância e por provider. Formatos por `Intl.DateTimeFormat`. |
| Números de semana | FullCalendar (`weekNumbers`), `calendar` desta biblioteca | adopt | Eixo `weekNumbers` na vista de mês; semana ISO. |
| Mensagem de lista vazia | FullCalendar (`noEventsContent`), react-big-calendar (`noEventsInRange`) | adopt | Parte `empty`, texto de `labels.empty` por vista. |
| Cor por evento | FullCalendar (`color`), react-big-calendar (`eventPropGetter`) | adapt | Cor por calendário, nunca arbitrária (`docs/component-features.md` §2.4 recusa cor arbitrária no contrato); `color` do calendário escolhe um dos oito slots de `--slotted-data-*`. |

## 3. Diferenciais

| Capacidade | Porquê aqui |
| --- | --- |
| Hora de parede com política de DST declarada | A grelha desenha sempre as horas de parede; a hora que o relógio salta e a hora que se repete são declaradas, e a recorrência repete a hora de parede (o que RFC 5545 faz com `TZID`) sem aritmética de desvio. Nenhuma fonte livre declara o comportamento na hora repetida. |
| Marca do dia em que o relógio muda | O cabeçalho do dia diz "Relógio +1 h às 02:00" quando o desvio de `timeZone` muda nesse dia, por `offsetChangeOn(data, fuso)`. Nenhuma fonte pesquisada o mostra. |
| Estado do evento sem cor | `status` `confirmed` \| `tentative` \| `cancelled`: tentativo com aresta tracejada e fundo vazado, cancelado riscado; o nome acessível diz o estado. O Google tem os dois; as bibliotecas não. |
| Lista em tela estreita sem mudar a vista | Abaixo de `COMPACT_BELOW` (600 px, `@slotted/core/measure`), mês e semana desenham-se como lista do mesmo intervalo; `view` não muda, e ao alargar volta a grelha escolhida. `data-layout` diz o que está desenhado. |
| Modelo de teclado declarado | Grelha da APG com células que contêm widgets: setas movem o dia, Enter entra no dia, Escape volta. Nenhuma fonte declara onde o foco está dentro de um mês. |
| Três esquemas, três densidades, RTL | A altura da hora deriva da escala de controlo e segue a densidade; colunas, setas e barras espelham por propriedades lógicas. |

## 4. Lacunas

| Caso | Resposta |
| --- | --- |
| Carregar um novo intervalo | A grelha é anatomia e fica; `loading` marca `aria-busy` na raiz e desenha eventos-esqueleto na anatomia do evento (skill `loading-states`). |
| Falha ao carregar | `error` substitui a área de eventos com a mensagem e a ação do consumidor; a grelha, a barra e a navegação ficam utilizáveis. |
| Vinte eventos sobrepostos | Colunas até `maxColumns` (omissão 3); o excesso vira "+N" na última coluna, que abre o mesmo painel do "+N mais" do mês. |
| Regra de recorrência hostil (`FREQ=SECONDLY`, sem fim) | `parseRRule` recusa a frequência desconhecida com `null`; a expansão só gera dentro da janela visível e para ao fim de 50 000 períodos. |
| Título longo, sem espaços, em RTL | Truncado com reticências; o texto inteiro fica no DOM e no nome acessível (decisão já tomada: truncar nunca remove conteúdo). |
| Evento sem `end`, ou `end` antes de `start` | Ocorrência pontual, desenhada na altura mínima, com só a hora de início. |
| Evento que acaba à meia-noite | `end` é exclusivo nos eventos com hora: 22:00–00:00 ocupa só o primeiro dia. |
| Evento com hora que atravessa a meia-noite | Um segmento por dia na grelha horária; uma barra no mês, rotulada com a hora de início. |
| Mês de seis semanas num contentor baixo | O mês cresce com as pistas; `fixedWeeks` estabiliza a altura entre meses. |
