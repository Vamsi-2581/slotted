# `event-calendar` — autoavaliação

Data: 2026-09-24. Inventário: `2026-09-24-event-calendar-capability-inventory.md`.
Desenho: `2026-09-24-event-calendar-design.md`. Contrato: `specs/components/event-calendar/contract.json`.

Capturas lidas (scratchpad da sessão, `shots/` e `shots2/`; harness em
`tools/harness/out/event-calendar.html`): `month` e `week` a 1024 px em claro,
escuro, alto contraste, `dense` e RTL; `day` (mudança de horário em Nova Iorque) a
720 px em claro e a 420 px em escuro; `list` a 720, 420 (escuro) e 240 px;
`compact`, `empty`, `loading`, `error` e `editing`; `month-narrow` e `week-narrow`
a 375 px; foco na célula de hoje (escuro) e no evento aberto (claro). Nas
Storybooks (6006 e 6007) a 1280 px: histórias `error`, `week`, `editing`,
`detail` com o popover aberto, `month` com o painel "+N" aberto, e o arrasto de
"Focus time" a meio e depois da soltura, nos dois bindings.

Feedback incorporado. Gate visual: sem aresta lateral colorida nos eventos
(fundo e contorno completo na cor do calendário); 4 px de folga entre um evento e
qualquer linha-guia ou vizinho; barras que atravessam semanas param dentro da
célula com chevron de continuação; cabeçalho em três composições por largura;
mês e semana estreitos em marcas de cor com a célula como alvo; horário de
trabalho e conteúdo por dia como pontos de entrada de domínio. Revisão do
resultado interativo: alerta de erro e popovers corrigidos (seletores de
cabeçalho e corpo presos à raiz, porque `alert` e `popover` usam os mesmos nomes
de parte); indicador de carregamento montado só durante a espera; título do
detalhe com o dia e as horas; títulos de blocos e da lista quebram por palavras;
colunas de sobreposição limitadas pela largura medida; arrasto e
redimensionamento adotados.

## 1. Dimensões do rubric

| Dimensão | Estado | A mudança que mais a melhoraria | Feita |
| --- | --- | --- | --- |
| Ícones | Quatro ícones, todos elementos `Glyph` (`<svg>` real) dentro da caixa `icon`: `chevron-right` em anterior/seguinte (o anterior rodado; ambos espelhados em RTL) e nas pontas de uma barra que continua noutra semana, `funnel` e `chevron-down` no filtro. O ponto do evento, o ponto da linha de agora e o traço da pega são formas. Nenhuma máscara: `glyph-element.test.mjs` recusa-as em toda a biblioteca. | Um glifo de repetição (`repeat`) visível num evento recorrente. | Não: o nome acessível já diz "repeats"; acrescentar `repeat` ao manifesto é decisão da fundação. |
| Movimento | Transições de fundo e borda em eventos e controlos (`--slotted-control-transition-*`); a barra de carregamento é a de `progress-indicator`, que para sob movimento reduzido. O evento arrastado ganha sombra e segue a grelha em divisões, sem interpolação. | Deslizar o período ao paginar. | Não: o conteúdo muda por inteiro e a direção do deslize em RTL e por teclado seria informação duplicada do título, que já é anunciado. |
| Responsividade | Contentor `slotted-event-calendar` na raiz; limiares 960 (cabeçalho em duas linhas), 600 (mês/semana em marcas de cor, lista empilhada) e 480 (cabeçalho em três linhas). A troca para lista abaixo de 600 é por `createWidthGate`; nessa largura o "+N" e o detalhe são folhas `drawer` inferiores dentro da raiz (capturas `ng-compact-detail.png`, `ng-compact-day.png`, `r-compact-detail.png` do scratchpad da sessão). Colunas de sobreposição pela largura medida do dia (64 px por coluna). Auditoria das páginas a 1280 e 620 px sem achados. | Largura mínima dos rótulos do seletor de vistas a 240 px (hoje truncam com reticências). | Não: 240 px é abaixo de qualquer telefone; o nome acessível de cada segmento mantém-se. |
| Refinamento | Folga de 4 px em volta de cada evento; seleção contínua por arestas nas pontas; títulos de blocos em até três linhas; hora curta ao lado do título em blocos curtos; lista e painel "+N" quebram títulos longos. Detalhe identificado: o popover do detalhe não dizia quando o evento acontece. | — | Sim: a descrição do popover escreve o dia e as horas. |
| Tokens | Nenhum token novo no contrato de tokens; ganchos de família com recurso à fundação (`--slotted-event-calendar-hour-size`, `-rule-color`, `-today-*`, `-now-color`, `-selection-*`, `-off-background`, `-event-radius`); os ganchos de ícone saíram com as máscaras. Literais registados no contrato (`literals`): 14/22/28% de mistura, 38% da aresta, 40rem do rolador. | Um papel `surface` na escala de dados, para não misturar a cor em CSS. | Não: é decisão da fundação partilhada com `chart`. |
| Padrões | Grid da APG (layout grid, célula com vários widgets) transcrito no contrato (`pattern`, `keyboard`), cada tecla com fonte e destino do foco. Arrasto com equivalente de teclado (Alt+setas, Alt+Shift+setas), como pede WCAG 2.5.7. `Shift+F10` e a tecla de menu abrem o menu de contexto no evento ou célula focados. Desvios declarados: sem atalhos de uma letra; a lista não é grelha. | Teste em leitor de ecrã real da leitura de `gridcell` com `aria-labelledby`. | Não verificável nesta máquina; declarado no gate. |
| Acessibilidade | Nome de cada evento pelo conteúdo e texto oculto (intervalo completo, calendário, estado, recorrência, continuação); título como região viva; seleção, carregamento e cada pedido de edição anunciados uma vez; foco fica no evento movido; alvo de toque da célula no mês estreito; `aria-expanded` no evento aberto. Testes nos dois bindings. | `aria-describedby` do evento para a nota de DST do dia. | Não: a nota já é `role=note` no cabeçalho da coluna, lido ao entrar no dia. |
| API nativa | React: props nativas na raiz; `onKeyDown`/`onPointerDown`/`onClickCapture` do consumidor ficam na raiz e correm depois dos da família; `render`; `ref` com `EventCalendarHandle`. Angular: sinais, `model()` nos cinco modelos com `…Request` cancelável, `eventChangeRequest` cancelável, `exportAs`, `HostAttributeToken('aria-label')`, `ng-template` para evento, detalhe e conteúdo do dia; `data-part="filter"` reposto depois de `slMenuTriggerFor` o apagar. | `render` por parte (evento) em React. | Não: o elemento do evento carrega o nome, o foco, `aria-expanded` e o gesto de edição; substituí-lo quebraria o modelo de foco. `renderEvent` substitui o conteúdo. |
| Capacidade | Todas as linhas `adopt`/`adapt` do inventário no contrato, incluindo arrasto e redimensionamento; recursos adiados para `resource-scheduler` por nome (§16 do guia). Acrescentados depois do gate: horário de trabalho, conteúdo por dia, edição, passo de minutos livre (5–120, `slotMinutes`), folhas no telefone e menu de contexto por alvo (evento, seleção, passo, dia). | Arrastar entre a faixa de dia inteiro e as horas. | Não: converte o tipo do valor do evento (`PlainDate` ↔ `PlainDateTime`) e a duração a atribuir é decisão da aplicação; declarado em §12 do desenho. |
| Integração no ecossistema | Tabelas de `frameworks.md` respondidas em §11 do desenho. Assimetria: título e cabeçalhos de dia em Angular são `role=heading` com `aria-level` (um template não escolhe a tag em tempo de execução); React escreve `h2`–`h6`. Não é controlo de formulário: sem `ControlValueAccessor`. | Um `provideEventCalendarDefaults` por injector de rota demonstrado. | Não: o mecanismo é o de todas as famílias. |
| Documentação | Duas páginas com importação, anatomia (55 partes), 25 cenas com snippet, props/inputs, eventos/outputs, composição, acessibilidade (6 frases), tokens e código. `referencePageErrors`, `apiMetadataErrors`, cobertura de cenários e formatação dos snippets sem erros nos dois bindings; `tools/harness/audit.mjs` sem achados a 1280, 620 e `dense`. | Uma cena de edição com série recorrente e confirmação "só esta / toda a série". | Não: a pergunta é da aplicação; a cena mostra `recurring` e a gravação como substituição. |

## 2. Critérios do §18

1. **Propósito**: agenda de equipa, reservas, planos de publicação, prazos. Antiuso: escolher uma data (`calendar`, `date-picker`), recursos lado a lado (`resource-scheduler`), factos passados (`timeline`).
2. **Anatomia**: 55 partes (contrato `members.eventCalendar.parts`), cada uma descrita nas duas páginas.
3. **Controlado/não controlado**: `date`, `view`, `visibleCalendars`, `selection`, `openEvent`, cada um com valor inicial, pedido com razão e cancelamento; `null` é valor em `selection` e `openEvent`, por isso o modo é decidido pela presença da prop (React) ou pelo `model()` (Angular). `onRangeChange`/`rangeChange` é facto. `onEventChange`/`eventChangeRequest` é pedido sem modelo: os eventos pertencem à aplicação.
4. **Estados**: `selected` (dias e faixa de horas), `open` (evento, filtro, "+N"), `loading` (raiz e corpo), `dragging` (evento em arrasto); hover/active/focus-visible guardados contra `data-disabled` (teste de estados).
5. **Teclado e foco**: tabela no contrato; testes em `event-calendar.test.tsx` e `event-calendar.spec.ts` (setas, Page, Enter/Escape, linhas da semana, Espaço e Shift, Escape limpa, Alt+setas e Alt+Shift+setas).
6. **Recipes**: densidade pela altura da hora e pela escala de controlo; sem eixo `size`, porque a grelha ocupa o contentor.
7. **Responsivo, RTL, locale, movimento**: capturas a 1280–240 px e RTL; `pt-BR`, `he` nas páginas; formatos por `Intl`; Alt+seta horizontal espelhada em RTL.
8. **Carregamento, vazio, erro, conteúdo extremo**: barra única com `delay`/`minDuration`, montada só durante a espera; vazio só na lista, com o nó do consumidor; erro acima da grelha; títulos longos, cinco eventos à mesma hora, evento sem fim, evento à meia-noite, hora repetida.
9. **SSR e desempenho**: `now`, largura e hoje resolvidos depois da primeira pintura; a data inicial não controlada lê `todayIn` na primeira renderização — uma aplicação renderizada em servidor passa `defaultDate`. Expansão limitada à janela visível e a 50 000 períodos; linhas da grelha como fundo, não como nós; o arrasto redesenha pela disposição, sem clonar nós.
10. **Exemplos**: 24 cenas nas duas páginas, domínio único (Northwind Studio).
11. **Testes partilhados**: contrato 17, núcleo 37 (event-calendar, incluindo colocação) mais recorrência e `wallClockIn`, React 31, Angular 17.
12. **Quebra de contrato**: família nova; `nowDateTimeIn` passa a ler data e hora de um só `formatToParts` (sem mudança de assinatura).

## 3. Casos declarados que esta máquina não verifica

Leitor de ecrã real (leitura de `gridcell` com `aria-labelledby`, `role=note` da
mudança de horário, anúncio do pedido de edição), toque real (arrasto de seleção
e de evento por toque, alvo da célula no mês estreito) e ecrã de 400% de zoom.

## 4. Defeito de outra família

`progress-indicator`: `[data-ui='progress-indicator'][data-part='root'][data-shape='linear'] { display: grid }`
vence a regra `[hidden]`, e uma barra linear com `hidden` continua pintada. Esta
família monta o indicador só durante a espera; a correção pertence a
`packages/styles/src/progress-indicator/`.
