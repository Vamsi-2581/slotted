# Dossiê ReUI — event-calendar

## 0. Cabeçalho

- Família: `event-calendar` (membro `eventCalendar`)
- Modo: `polish`, com passagem a `build` pela linha 11 do § 8 (edita `contract.json`)
- Data: 2026-09-29
- HEAD: `f698e7b7` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/<item>/` e `tools/harness/out/specimen/event-calendar/`
- Fontes ReUI: `tools/harness/out/specimen/reui-src/event-calendar-primitive.json` (13 ficheiros, 348 KB), `reui-src/event-calendar-docs.md` e `reui-src/c-event-calendar-{1..5}.json`
- Ferramenta: `specimen.mjs --family` aceitava só 240, 420 e 720; as cenas `month`, `week` e `editing` declaram `data-widths="1024"`. A largura passou a aceitar também as que uma cena da família declara (`stageWidths`, teste em `specimen.test.mjs`), a regra que `shoot.mjs` já seguia.

## 1. Seleção

Cobertura: `direta`. O ReUI publica o primitivo `event-calendar` (`https://reui.io/r/event-calendar.json`: vistas mês, semana, dia, N dias, agenda e recursos; arrasto, redimensionamento, criação por arrasto, recorrência RFC 5545, fuso), 5 exemplos `c-event-calendar-*` e 6 blocos Pro `event-calendar-*`.

Termos pesquisados em `llms-full.txt` (2188 linhas): `event calendar` 12, `event-calendar` 11, `calendar` 79, `schedul` 24, `agenda` 11, `booking` 17, `appointment` 7, `time slot` 4, `drag` 26, `week view` 1, `month view` 1.

| Item                 | Tipo         | Rota                                        | Parte ou interação Slotted que informa                                        | Capturas                                                                                          |
| -------------------- | ------------ | ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `c-event-calendar-1` | Free example | `/preview/base/example/c-event-calendar-1`  | `header`, `today`, `previous`, `next`, `views`; mês: `day`, `day-number`, `event` | `light-1280`, `light-1024`, `dark-1024`, `-motion-reduce`; estados da navegação, de `event` e de `month-cell` nos dois esquemas |
| `c-event-calendar-4` | Free example | `/preview/base/example/c-event-calendar-4`  | `more` no mês; conteúdo substituível do evento                                | `light-1280`, `dark-1024`, `-motion-reduce`; estados de `more` nos dois esquemas                  |
| `c-event-calendar-5` | Free example | `/preview/base/example/c-event-calendar-5`  | vista de dia, `selection` por arrasto, blocos em coluna                       | `light-1280`, `dark-1024`, `-motion-reduce`                                                       |
| `event-calendar-1`   | Pro block    | `/preview/base/event-calendar-1`            | mês em produto: filtro de calendários, avatares no evento, botão "+" do dia   | `light-1280`, `dark-1024`, `-motion-reduce`                                                       |
| `event-calendar-6`   | Pro block    | `/preview/base/event-calendar-6`            | semana em produto: `all-day-row`, `column`, blocos com emblema e progresso    | `light-1280`, `light-1024`, `dark-1024`, `-motion-reduce`; estados de `event` nos dois esquemas   |

Slotted: `slotted-{light,dark,high-contrast}-1024` e `-720`, `light-1024-motion-reduce`, `-forced`, `-dense`, `-rtl`; estados nos três esquemas de `[data-part=today|previous|next|filter]` (`081e91`), `day-events > event`, `day-number`, `more` (`f5a4f4`), `column > event`, `column > more` (`7bf1c2`) e `list-events event` a 720 (`32da18`).

## 2. Anatomia

| `data-slot` ReUI                                  | Parte Slotted                                   | Estado                 |
| ------------------------------------------------- | ----------------------------------------------- | ---------------------- |
| `event-calendar`                                  | `root`                                          | igual                  |
| `event-calendar-nav`                              | `header` com `navigation`                       | igual                  |
| `event-calendar-nav-today`, `-nav-prev`, `-nav-next` | `today`, `previous`, `next`                  | igual                  |
| `event-calendar-title`                            | `title` (`h2`, região viva)                     | igual                  |
| `event-calendar-view-switcher` (menu)             | `views` (`segmented-control`)                   | igual                  |
| `event-calendar-toolbar`                          | `actions`                                       | igual                  |
| `event-calendar-content`                          | `body`                                          | igual                  |
| `event-calendar-month-view` (`grid`)              | `month` (`table` com papel `grid`)              | igual                  |
| `event-calendar-month-header`, `columnheader`     | `weekdays`, `weekday`                           | igual                  |
| `event-calendar-month-row`, `-month-cell`         | `week`, `day`                                   | igual                  |
| `event-calendar-month-day-number` (`span`)        | `day-number` (`button` que desce ao dia)        | igual                  |
| `event-calendar-event`, `-event-dot`              | `event`, `::before` do evento                   | igual                  |
| `event-calendar-month-bar-overlay`                | barras em `day-events` (`data-bar`)             | igual                  |
| `event-calendar-more`                             | `more`                                          | igual                  |
| `event-calendar-resize-handle`, `-resize-grip`    | `resize-handle`, `::before` da pega             | igual                  |
| `event-calendar-time-grid`                        | `time-grid`                                     | igual                  |
| `event-calendar-day-header`                       | `column-header`                                 | igual                  |
| `event-calendar-all-day-section`, `-all-day-cell` | `all-day-row`, `all-day-cell`                   | igual                  |
| `event-calendar-time-gutter`                      | `gutter` com `hour`                             | igual                  |
| `event-calendar-day-column`                       | `column`                                        | igual                  |
| `event-calendar-announcer`                        | `live-announcer` do núcleo                      | igual                  |
| `event-calendar-day-add`                          | —                                               | em falta no Slotted    |
| —                                                 | `week-number`, `zone`, `offset-change`, `off-hours`, `offset-line` | só no Slotted |
| —                                                 | `loader`, `error`, `empty`, `list`, `list-day`, `list-events` | só no Slotted; o ReUI tem agenda sem `data-slot` próprio |
| —                                                 | `filter`, `day-content`, `continuation`, `event-meta` | só no Slotted       |

## 3. Medidas

Largura de página: ReUI 1024 (`c-event-calendar-1`, `event-calendar-6`) e 1280; Slotted 1024 (grelhas) e 720 (dia e lista). Tamanho de célula e de coluna variam com a largura e são comparados a 1024; os restantes não variam.

| Parte                   | Propriedade                  | ReUI                                                                     | Slotted hoje                                                                                  | Alvo                                                                                          | Veredicto |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------- |
| `today`, `previous`     | altura, raio, padding        | 28, raio 8, padding 10; fantasma, sem borda visível                       | 34 (`--slotted-control-height-md`), raio 4, padding 13, contorno 1px e sombra de controlo     | sem mudança                                                                                   | `recusar`: o desenho § cabeçalho usa o controlo secundário contornado de `button` |
| `today`                 | tipo                          | 12.8px, 500, linha 18.29                                                 | 13px, 500                                                                                     | sem mudança                                                                                   | `superar`: 12.8 é fração de píxel, 13 é o degrau `--slotted-control-font-size-md` |
| `title`                 | tipo                          | 14px, 600, linha 20                                                      | 16px (`--slotted-font-size-lg`), 600, linha 24                                                | sem mudança                                                                                   | `recusar`: o título é o `h2` que nomeia a grelha |
| `weekday` (mês)         | altura                        | 28 (6 + 16 + 6)                                                          | 29.797 (6 + 16.8 + 6 + régua 1)                                                               | 30: linha `round(nearest, 1em × --slotted-line-height-xs, 1px)` = 17                          | `adaptar`: régua em píxel inteiro; ReUI arredonda a linha a 16 pelo Tailwind |
| `day` (mês)             | altura                        | 93.33 (célula sem régua própria, linha de 94.33)                          | 135                                                                                           | sem mudança                                                                                   | `superar`: a linha ReUI assenta em y 188.33 |
| `day-number`            | rect, tipo                    | 20 × 20, 12px, 400; hoje 300 sobre `oklch(0.205 0 0)`; canto inferior da célula | 22 × 23.28 (`--slotted-control-inner-size-sm`), 12px, 400; hoje 600 sobre `--slotted-tone-accent-solid` | sem mudança                                                              | `superar`: peso 300 em branco sobre preto a 12px é o traço mais fino da página; o Slotted pesa 600 |
| `event` linha (mês)     | rect, padding, gap           | 26 de altura, padding 4/6, gap 6, linha 18, chão do slot a 15% de alfa   | 22 de altura, padding 0/4, gap 4, linha 16.8, sem chão                                        | sem mudança em comfortable; `dense` na linha 6 do § 8                                         | `recusar`: o desenho distingue a linha temporizada da barra de dia inteiro (comentário "a wall of colour") |
| `event` ponto           | diâmetro                      | 6                                                                        | 8 (`--slotted-space-4`)                                                                       | sem mudança                                                                                   | `recusar`: 8 é o degrau; 6 fica sem degrau (§ Valores) |
| `event` barra e bloco   | raio                          | 6                                                                        | 4 (`--slotted-radius-sm`)                                                                     | sem mudança                                                                                   | `recusar`: raio:altura 1:5.5 no Slotted (4 em 22), 1:4.3 no ReUI (6 em 26) |
| `event` barra e bloco   | chão e aresta                 | slot a 15% de alfa, anel interior do slot a 15%; a régua da grelha atravessa o bloco (`c-event-calendar-5`) | `color-mix` opaco a 14% com aresta a 34%                                          | sem mudança                                                                                   | `superar`: chão opaco; nenhuma régua atravessa o texto |
| `event` bloco           | padding, linha                | 4/6, linha 18                                                             | 2/6, linha 16.8                                                                               | linha 17 (regra da linha 1 do § 8)                                                            | `adaptar`: `list-day` e `column-header` acumulam frações de 16.8 e 18.85 |
| `hour`                  | altura                        | 64                                                                        | 60 (2 × `--slotted-control-height-sm`)                                                        | sem mudança                                                                                   | `recusar`: literal `hourSize` do contrato |
| `column` e blocos       | ar                            | 0: o bloco de 60 min mede 64 e toca a régua seguinte                       | `--_air` 4 à volta do bloco                                                                   | sem mudança                                                                                   | `superar`: dois blocos seguidos não se fundem |
| `column-header`         | altura                        | 28, uma linha ("Mon 12")                                                  | 77.594 (6 + 16.8 + 2 + 28 + 2 + 16.8 + 6)                                                     | 78                                                                                            | `adaptar`: `time-head` 109.594 põe toda a grelha horária em y x.39 |
| `list-day`              | altura                        | —                                                                         | 107.234, 215.234, 64.641                                                                      | inteiros                                                                                      | `adaptar`: linhas 16.8 e 18.85 |
| `more` (mês)            | rect                          | 131.58 × 5.33 a 1024: cortado pela célula                                 | 62.39 × 22                                                                                    | sem mudança                                                                                   | `superar`: o alvo ReUI mede 5px |
| `resize-handle`         | faixa e grip                  | faixa 8, grip 2 × 10 a `oklab(0.145 0 0 / 0.4)`                            | faixa 8 (`--slotted-space-4`), grip 2 × 8 na tinta do evento                                   | sem mudança                                                                                   | `adotar`: as duas faixas coincidem |
| lanes em `dense`        | altura e passo                | —                                                                         | evento 16, ar 4, passo 20; linha de texto 16.8 com 14 de conteúdo                              | `max(--slotted-control-inner-size-sm, --slotted-target-min − --_air)`: 20, passo 24          | `adaptar`: passo abaixo do alvo de 24 e texto a tocar a aresta |

## 4. Coreografia de estados

Deltas dos specimens de estados (`states[].deltas`). L é OKLab.

| Parte                    | Estado  | Delta ReUI                                                                 | Delta Slotted hoje                                                                                   | Alvo |
| ------------------------ | ------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| `today`, `previous`, `next` | hover | fundo transparente → `oklch(0.97 0 0)` (ΔL −0.030; escuro +0.032)          | fundo L 1.000 → 0.968 (escuro +0.065, alto contraste −0.075)                                         | sem mudança |
| `today`, `previous`, `next` | active | igual ao hover mais `translate: 0 1px`                                     | L 0.929 (escuro 0.274, alto contraste 0.845), 120ms                                                  | `transition-duration: --slotted-duration-instant`, a regra de `button` contornado |
| `views`                  | active  | igual ao hover (menu)                                                       | `segmented-control`                                                                                  | `outra família` |
| `event` linha (mês)      | hover   | chão 15% → 25% de alfa                                                      | L 1.000 → 0.968                                                                                      | sem mudança |
| `event` linha (mês)      | active  | igual ao hover                                                              | igual ao hover                                                                                       | `--slotted-tone-secondary-subtle-active` (L 0.929), instantâneo |
| `event` barra e bloco    | hover   | chão 15% → 25%                                                              | chão 14% → 21%, aresta 34% → 50% (ΔL −0.021 a −0.027 claro, +0.025 a +0.032 escuro)                 | sem mudança |
| `event` barra e bloco    | active  | igual ao hover                                                              | chão 27% (ΔL −0.071 a −0.091), 120ms                                                                 | instantâneo |
| `event` aberto (sólido)  | hover   | —                                                                           | slot a 80% → 70% sobre preto (L 0.437 → 0.382)                                                       | sem mudança |
| `event` aberto (sólido)  | active  | —                                                                           | igual ao hover                                                                                       | 60% (linha 4 do § 8), instantâneo |
| `event` (lista)          | hover   | —                                                                           | L 1.000 → 0.968                                                                                      | sem mudança |
| `event` (lista)          | active  | —                                                                           | igual ao hover                                                                                       | `--slotted-tone-secondary-subtle-active`, instantâneo |
| `day-number`             | hover   | sem estado (`span`)                                                         | L 1.000 → 0.968                                                                                      | sem mudança |
| `day-number`             | active  | —                                                                           | igual ao hover                                                                                       | `--slotted-tone-secondary-subtle-active`, instantâneo |
| `more` (mês)             | hover   | cor `oklch(0.556 0 0)` → `oklch(0.145 0 0)`                                  | fundo → L 0.968, cor muted → texto; sem transição                                                    | transição de `background-color`, `border-color`, `color` |
| `more` (mês)             | active  | igual ao hover                                                              | igual ao hover                                                                                       | `--slotted-tone-secondary-subtle-active`, instantâneo |
| `more` (coluna)          | hover   | —                                                                           | chão muted 9% → `--slotted-tone-secondary-subtle-hover`: ΔL +0.011 claro, +0.018 escuro, −0.010 alto contraste | muted 15% (linha 3 do § 8) |
| `more` (coluna)          | active  | —                                                                           | igual ao hover                                                                                       | muted 21% |
| `day` (mês)              | hover   | vazio (a célula dispara `onSlotClick`)                                      | sem hover: a célula é alvo da seleção por arrasto; o gatilho de clique é `day-number`                | sem mudança |
| `event`, `day-number`, controlos | focus-visible | anel 2px `oklab(0.708 0 0 / 0.5)`: ≤ 2.59:1 sobre branco, ≤ 3.79:1 sobre `oklch(0.205 0 0)` | contorno 2px `--slotted-focus-ring-color`: 5.17:1 claro, 7.29:1 escuro, 21:1 alto contraste; evento a 1px de afastamento, célula para dentro | sem mudança |
| `resize-handle` grip     | aparece | `opacity` 150ms `cubic-bezier(0.4, 0, 0.2, 1)`                              | `opacity` 0 → 1 em 120ms, `--slotted-control-transition-easing` nos dois sentidos                    | linha 5 do § 8 |
| `today` (contraste forçado) | repouso | —                                                                         | o número desaparece: resta um quadrado dentro do círculo (`slotted-light-1024-forced.png`, semana e mês) | linha 7 do § 8 |
| `event` linha (contraste forçado) | repouso | —                                                                  | a borda transparente pinta-se em `CanvasText`: a linha temporizada ganha caixa e passa a ler-se como barra | linha 7 do § 8 |

## 5. Movimento

ReUI: `transition-property: all` em 150ms `cubic-bezier(0.4, 0, 0.2, 1)` nos botões da navegação; `background-color, box-shadow` 150ms no evento; `opacity` 150ms na pega. Com `--motion reduce` as durações ficam em 0.15s (`c-event-calendar-1-light-1024-motion-reduce.json`). Os painéis do "+N" e do detalhe não foram abertos nesta passagem.

Slotted hoje: `background-color, border-color` em `--slotted-control-transition-duration` (120ms) e `--slotted-control-transition-easing` (`cubic-bezier(0.2, 0, 0, 1)`) nos controlos e nos eventos; `more` sem transição; pega em `opacity` 120ms na mesma curva nos dois sentidos. Com `--motion reduce` todas as durações medem 0.001s. O detalhe e o "+N" são `popover` e `drawer` (`outra família`). O evento em arrasto segue o ponteiro sem transição, e o salto de posição do teclado (Alt+setas) também, como exige a linha Motion.

Alvo: pressão instantânea (`--slotted-duration-instant`) em todas as regras `:active`; `more` com transição de cor; a pega entra em `--slotted-duration-short` com `--slotted-easing-enter` e sai em `--slotted-duration-short` com `--slotted-easing-exit`.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Validação ao vivo do destino do arrasto | primitivo, docs § Callbacks | `canDropEvent(update) => boolean` avaliado durante o gesto; `data-drop-invalid` e cursor `not-allowed`; `onEventUpdate` devolve `false` para reverter | hoje só o pedido `eventChangeRequest` cancelável ao largar | proposta: `canDrop(request)` com o mesmo objeto do pedido, `data-drop-invalid` no evento em arrasto e o anúncio do motivo; um só formato de pedido para validar e para confirmar, onde o ReUI tem dois (`canDropEvent` e `onEventUpdate`) | decisão do portão (linha 12 do § 8) | |
| Vista de N dias | primitivo (`days`, `dayCount`, `dayCountPresets`) | vista `days` com `dayCount` controlado e presets no menu de vistas | ausente; `weekends="hidden"` cobre a semana útil | proposta: `view: 'days'` com `dayCount` no par `current`, ou recusa | decisão do portão (linha 13 do § 8) | |
| Criação por arrasto num intervalo livre | primitivo (`selectSlot`, `onSelectSlot`, `canSelectSlot`) | interação `selectSlot` e callback | `selectionMode="range"` com o modelo `selection` e teclado (Espaço, Shift+setas) | a seleção é um modelo controlado com teclado; o ReUI só tem ponteiro | `adotar` (coincidem, já presente) | |
| Botão "+" no dia | `event-calendar-1` (`day-add`, 42 botões de 20 × 20) | `showDayAddButton` dispara `onSlotClick` | ausente | a seleção, o menu de contexto e `actions` já pedem a criação; 42 botões que só aparecem no hover são 42 paragens sem teclado | `recusar`: o pedido de criação já existe em três formas, e o botão acrescenta um alvo de 20px por dia sem equivalente de teclado | |
| Dica ao pairar no evento | primitivo (`eventTooltip`, `renderEventTooltip`) | tooltip opcional com o rótulo | o detalhe (`popover`) e o nome acessível completo | a dica compete com o arrasto e com o clique que abre o detalhe no mesmo alvo | `recusar`: o título inteiro está no nome acessível e no detalhe; uma dica por hover sobre 40 eventos cobre o evento vizinho | |
| Agenda com dias recolhíveis | primitivo (`renderAgendaDaySummary`, `agendaSummaryMaxDots`) | dia recolhido numa linha de pontos | lista sem recolher | — | `recusar`: a lista é a vista de leitura do intervalo; recolher esconde eventos atrás de pontos que não dizem o título | |
| Aviso de gesto bloqueado | primitivo (`onDragBlocked`) | callback quando um evento só de leitura é arrastado | um evento não editável não tem `cursor: grab` nem `touch-action: none` | nada a bloquear: o gesto não começa | `recusar` | |
| Ir para uma data | primitivo (`EventCalendarDatePicker`, fora da navegação por omissão) | popover com `calendar` | parte `actions` recebe um `date-picker` do consumidor | a composição fica no consumidor, que escolhe o controlo | `adotar` (coincidem pela composição) | |
| Recursos lado a lado | primitivo (`resource`), `c-event-calendar-2`, `event-calendar-5` | vista `resource` com colunas por recurso | recusado no contrato (`declined.resources`) | — | `adiar para resource-scheduler` | `resource-scheduler` |
| Atalhos de uma letra para as vistas | primitivo (`enableShortcuts`) | letras com `kbd` no menu | recusado no contrato (`declined.singleLetterShortcuts`) | — | `recusar` | |
| Carregamento | primitivo (`loading`) | escurece o conteúdo e desliga o ponteiro | barra `progress-indicator` indeterminada, `aria-busy`, eventos a 0.6, anúncio | a grelha continua operável e o estado é anunciado | `superar` | |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| -------- | ---- | ------------ | ---- | ----- |
| Pixel grid | `month-cell` 93.33, linha 94.33 | `weekday` 29.797, `column-header` 77.594, `time-head` 109.594, `list-day` 107.234 e 64.641; `dense` `weekday` 29.797, `column-header` 71.594 | todas inteiras | `c-event-calendar-1-light-1024.json`; `slotted-light-1024.json`, `-dense`, `slotted-light-720.json` |
| Hover | `month-cell` delta vazio; `more` só cor | `more` da coluna ΔL +0.011, +0.018, −0.010 | ≥ 0.02 nos três esquemas | § 4 |
| Press | `event`, `view-switcher`, `more`: active = hover | `day-number`, linha do mês, evento da lista, `more`, evento aberto: active = hover | active ≠ hover em todas | § 4 |
| Focus | 2px a 50% de alfa, ≤ 2.59:1 claro | 2px, 5.17 / 7.29 / 21:1 | sem mudança (`superar`) | § 4 |
| Transition | `transition-property: all` na navegação | `more`: `background-color` e `color` no hover sem transição | listadas | `slotted-light-1024.json`, `more` |
| Motion | pega em `opacity` 150ms curva padrão | pega em `opacity` 120ms curva padrão nos dois sentidos | entrada `--slotted-easing-enter`, saída `--slotted-easing-exit`, saída ≤ entrada | § 5 |
| Reduced motion | 0.15s sob `reduce` | 0.001s | sem mudança (`superar`) | `*-motion-reduce.json` |
| Disabled | sem parte desativada nos itens | sem parte desativada nas cenas; guardas `:not([data-disabled])` nas regras de estado | sem mudança | `states.test.mjs` |
| Schemes | sem alto contraste nem cores forçadas | forçado: número de hoje invisível; linha temporizada ganha caixa | hoje em `Highlight`/`HighlightText`; linha sem caixa | `slotted-light-1024-forced.png` |
| Density and RTL | — | RTL espelha setas, barras e colunas (`-rtl.png`); `dense` passo 20 com texto de 16.8 em 14 de conteúdo | passo 24 em `dense` | `slotted-light-1024-dense.json` |
| Target size | `more` 5.33px de altura; `day-add` 20 × 20 | comfortable: linha 22 + ar 4, passo 26 ≥ 24; `dense`: passo 20 | passo ≥ 24 em todas as densidades (exceção de espaçamento de WCAG 2.5.8) | § 3 |
| Intent | classes Tailwind, sem motivo escrito | `literals.tintHover` do contrato diz 22% e 28%; a folha e o desenho § estados dizem 21% e 27% | contrato alinhado com a folha e o desenho | `contract.json`, `event-calendar.css` linha 47, `2026-09-24-event-calendar-design.md` linha 476 |

## 8. Delta

| #   | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | -------- | ------- | ---------------------------- | ------------------- |
| 1   | `packages/styles/src/event-calendar/event-calendar.css` | `--_line-xs: round(nearest, calc(1em * var(--slotted-line-height-xs, 1.4)), 1px)` e `--_line-sm` na raiz; cada `line-height: var(--slotted-line-height-xs\|sm)` passa a `var(--_line-xs\|sm)`; o `translate` de `hour` passa a `calc(var(--_line-xs) / -2)` | § 3 `weekday`, `column-header`, `list-day`; § 7 Pixel grid | `slotted-light-1024.json`: `weekday` 30, `column-header` 78; `-dense`; `slotted-light-720.json`: `list-day` inteiros |
| 2   | idem | regras `:active` de `today`, `filter`, `previous`, `next`, barras e blocos com `transition-duration: var(--slotted-duration-instant)` | § 4 controlos e blocos active; § 5 | `slotted-light-1024-…-081e91`, `-7bf1c2` |
| 3   | idem | `more` com transição de `background-color`, `border-color` e `color`; `:active` em `--slotted-tone-secondary-subtle-active`; `more` da coluna com muted 9% / 15% / 21% (repouso, hover, pressão) e comentário com o motivo | § 4 `more`; § 7 Hover, Press, Transition | `-7bf1c2` e `-f5a4f4` nos três esquemas: ΔL ≥ 0.02, active ≠ hover |
| 4   | idem | pressão em `day-number`, na linha temporizada do mês e no evento da lista: `--slotted-tone-secondary-subtle-active`, instantânea; evento aberto: slot a 60% sobre preto na pressão | § 4; § 7 Press | `-f5a4f4`, `-7bf1c2`, `-32da18` |
| 5   | idem | grip da pega: repouso `opacity` em `--slotted-duration-short` `--slotted-easing-exit`; visível em `--slotted-duration-short` `--slotted-easing-enter` | § 5; § 7 Motion | `slotted-light-1024.json`, `resize-handle::before` |
| 6   | idem | `--_event-size: max(var(--slotted-control-inner-size-sm, 22px), calc(var(--slotted-target-min, 24px) - var(--_air)))`: comfortable 22, `dense` 20 | § 3 lanes em `dense`; § 7 Density, Target size | `slotted-light-1024-dense.json`: evento 20, passo 24 |
| 7   | idem | `@media (forced-colors: active)`: número de hoje com `forced-color-adjust: none`, `Highlight` e `HighlightText`; linha temporizada do mês e evento da lista com `border-color: Canvas` | § 4 contraste forçado; § 7 Schemes | `slotted-light-1024-forced.png`, recorte da semana e do mês |
| 8   | `packages/styles/src/event-calendar/event-calendar.tokens.json` | acrescenta `--slotted-duration-instant`, `--slotted-duration-short`, `--slotted-easing-enter`, `--slotted-easing-exit`, `--slotted-target-min` | linhas 2, 5, 6 | `tokens.test.mjs` |
| 9   | `packages/styles/src/event-calendar/event-calendar.styles.test.mjs` (novo) | asserções: `round(nearest` nas linhas; `:active` de `day-number`, `more` e evento da lista; `--slotted-easing-enter` e `-exit` na pega; `forced-color-adjust` em hoje | linhas 1, 3, 4, 5, 7 | `pnpm check:affected` |
| 10  | `tools/harness/specimen.mjs`, `specimen.test.mjs` | `--width` aceita as larguras de `data-widths` da família (feito na captura) | § 0 | `specimen.test.mjs` 9/9 |
| 11  | `specs/components/event-calendar/contract.json` | `contrato`: `literals.tintHover` passa a "21% and 27% … edge 34% and 50%", o valor da folha e do desenho | § 7 Intent | `contract.test.mjs` |
| 12  | núcleo, React, Angular, contrato, docs | `contrato`, decisão do portão. Opção A: `canDrop(request)` avaliado a cada passo do arrasto; `data-drop-invalid` no evento em arrasto (aresta tracejada em `--slotted-tone-danger-border`, cursor `not-allowed`); largar num destino inválido repõe o evento e não pede nada; teclado Alt+setas salta os destinos inválidos. Opção B: `recusar` nesta passagem, com a linha do § 6 como registo | § 6 validação ao vivo | Opção A: cena `editing` com um destino inválido; testes React e Angular |
| 13  | núcleo, React, Angular, contrato, docs | `contrato`, decisão do portão. Opção A: vista `days` com `dayCount` (2–6) no par `current`, na régua da semana. Opção B: `recusar`: `week` com `weekends="hidden"` e `day` cobrem os usos medidos nos itens ReUI; nenhum bloco Pro usa `days` | § 6 N dias | Opção A: cena `days` |

As linhas 11 a 13 editam `contract.json` e passam a execução a `build`. Nenhuma linha é `outra família`; o `views` pressionado pertence a `segmented-control` e fica fora.

### Portão e aplicação

Portão de 2026-09-30: linhas 1–9 e 11 como escritas; linha 12 com a opção A (`build`); linha 13 com a opção B (`recusar`: `week` com `weekends="hidden"` e `day` cobrem os usos medidos, e nenhum bloco Pro ReUI usa `days`).

Recaptura (`slotted-*-1024`, `-720`, `-dense`, `-forced`; estados `081e91`, `f5a4f4`, `7bf1c2`, `32da18`):

| #   | Valor medido depois |
| --- | ------------------- |
| 1   | `weekday` 30, `column-header` 78, `list-day` 107, 123, 215; nenhuma parte emoldurada em fração de píxel a 1024, a 720 e em `dense` (`weekday` 30, `column-header` 72) |
| 2   | regras `:active` de `today`, `filter`, `previous`, `next`, barras e blocos com `--slotted-duration-instant`; o specimen não lista `transition-duration` nos deltas |
| 3   | `more` da coluna: hover ΔL −0.029 claro, +0.031 escuro, −0.043 alto contraste; active −0.057, +0.063, −0.087; `more` do mês com `transition-property: background-color, border-color, color` |
| 4   | active de `day-number`, da linha do mês e do evento da lista: L 0.929 contra hover 0.968; evento aberto: active L 0.328 contra hover 0.382 |
| 5   | grip: `opacity` 0.12s `cubic-bezier(0.3, 0, 0.8, 0.15)` (`easing-exit`) em repouso; `easing-enter` no hover, no foco e no arrasto |
| 6   | `dense`: evento 20, `day-number` 20, passo entre linhas 24 |
| 7   | cores forçadas: o 24 de hoje em `Highlight`/`HighlightText` na semana e no mês; a linha temporizada do mês sem caixa (`scratchpad/after-forced-weekhead.png`, `after-forced-month.png`) |
| 8   | `tokens.test.mjs` verde com os cinco tokens do polish e `--slotted-tone-danger-border` da linha 12; estilos 1561/1561 |
| 9   | `event-calendar.styles.test.mjs` 6/6 |
| 11  | `literals.tintHover` com 21% e 27%, aresta 34% e 50%; `contract.test.mjs` 19/19 |
| 12  | cena `editing`: bloco em arrasto recusado com aresta `rgb(220, 38, 38)` tracejada e chão de repouso L 0.936, ao lado do arrasto válido no slot sólido; núcleo `nextAllowedPlacement` 4 testes; React 38/38 e Angular 24/24 com três testes novos cada (desenho do destino recusado sem pedido ao largar, Alt+seta que salta dois dias recusados, anúncio `dropInvalid` sem destino) |

O evento em arrasto tem `pointer-events: none`, e o cursor visível é o da coluna sob o ponteiro: as sete colunas da cena `editing` leem `cursor: not-allowed`, e as sete da cena `week` leem `auto`.
