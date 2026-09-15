# Revisão de implementação — passe 2

Documento de trabalho para `docs/autonomous-review-prompt.md` e
`scripts/review-loop.sh`. Cada item descreve: sintoma observado, localização
provável no código, comportamento esperado e critério de aceite. Um item só é
considerado concluído quando o critério de aceite é verificável no Storybook
(React e Angular) nos três esquemas (`light`, `dark`, `high-contrast`) e nas
quatro densidades (`compact`, `dense`, `default`, `comfortable`).

O passe 1 (108 itens, todos fechados) está em
`docs/archive/implementation-review-pass-1.md` e o seu log em
`docs/archive/implementation-review-pass-1-log.md`. Os IDs deste passe não
reutilizam os do passe 1: cada família começa em `<prefixo>-2.1`.

## Triagem

Uma linha por família entregue, com o veredito do revisor humano após a
inspeção visual do Storybook. A coluna fica vazia até o veredito existir; uma
família sem veredito não recebe itens.

- `estável` — nenhum item neste passe.
- `ajuste` — itens pontuais na seção da família, abaixo.
- `refazer` — sem itens aqui; vira `/component <família>` em modo rebuild,
  agendado em `docs/build-schedule.md`, rodada 16.

| Família                                     | Onda | Veredito |
| ------------------------------------------- | ---- | -------- |
| `typography`                                | 1    |          |
| `icon`                                      | 1    |          |
| `visually-hidden`                           | 1    |          |
| `divider`                                   | 1    |          |
| `stack`, `inline`, `grid`                   | 1    |          |
| `container`                                 | 1    |          |
| `card`                                      | 1    |          |
| `button` (com `icon-button`)                | 2    |          |
| `button-group`                              | 2    |          |
| `link`                                      | 2    |          |
| `badge`                                     | 2    |          |
| `tag`                                       | 2    |          |
| `avatar`, `avatar-group`                    | 2    |          |
| `kbd`                                       | 2    |          |
| `skeleton`                                  | 2    |          |
| `progress-indicator`                        | 2    |          |
| `status-indicator`                          | 2    |          |
| `alert`                                     | 2    |          |
| `inline-message`                            | 2    |          |
| `field`, `field-group`                      | 3    |          |
| `text-field`                                | 3    |          |
| `textarea`                                  | 3    |          |
| `checkbox`, `checkbox-group`, `radio-group` | 3    |          |
| `switch`                                    | 3    |          |
| `number-field`                              | 3    |          |
| `slider`                                    | 3    |          |
| `form`                                      | 3    |          |
| `currency-field`                            | 3    |          |
| `tabs`                                      | 4    |          |
| `breadcrumb`                                | 4    |          |
| `pagination`                                | 4    |          |
| `collapsible`, `accordion`                  | 4    |          |
| `stepper`                                   | 4    |          |
| `description-list`                          | 4    |          |
| `list`, `list-item`                         | 4    |          |
| `prose`                                     | 4    |          |
| `result-state`                              | 4    |          |
| `toolbar`                                   | 4    |          |
| `tooltip`                                   | 5    |          |
| `popover`                                   | 5    |          |
| `dialog` (com `alert-dialog`)               | 5    |          |
| `drawer`                                    | 5    |          |
| `menu`, `menubar`                           | 5    |          |
| `toast`                                     | 5    |          |
| `loading-overlay`                           | 5    |          |
| `listbox`                                   | 6    |          |
| `select`                                    | 6    |          |
| `combobox`                                  | 6    |          |
| `multi-select`                              | 6    |          |
| `tree`                                      | 6    |          |
| `table`                                     | 6    |          |
| `date-field`, `calendar`, `date-picker`     | 7    |          |
| `time-field`, `time-picker`                 | 7    |          |
| `datetime-field`, `datetime-picker`         | 7    |          |
| `upload`                                    | 7    |          |
| `page`, `page-header`, `section`            | 7    |          |
| `app-shell`                                 | 7    |          |
| `action-bar`                                | 7    |          |
| `splitter`                                  | 8    |          |
| `scroll-area`                               | 8    |          |
| `toggle-group`, `segmented-control`         | 8    |          |
| `timeline`                                  | 8    |          |
| `date-range-picker`                         | 8    |          |
| `tags-input`                                | 8    |          |
| `filter-bar`                                | 8    |          |
| `code-block`                                | 8    |          |

## Marcadores

- `(S)` — defeito grave. Bloqueia o uso do componente. Prioridade sobre qualquer item visual.
- `(MAOC)` — may affect other components. O ajuste deve ser aplicado na origem compartilhada (`packages/core`, `packages/styles`, tokens ou tema), nunca por override local no componente onde foi observado.
- `#Componente:N` — referência ao item N da seção do componente citado. O defeito referido também ocorre no componente atual e deve ser corrigido pela mesma causa raiz.
- `[ ]` — pendente. `[x]` — concluído e verificado. `[!]` — bloqueado pelo loop após tentativas interrompidas.

## Layout do repositório relevante

| Camada        | Caminho                                                                                | Conteúdo                                                                                     |
| ------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Contrato      | `specs/components/<componente>/contract.json`                                          | Props, partes, estados. Toda remoção ou adição de prop começa aqui.                          |
| Estilo        | `packages/styles/src/<componente>/<componente>.css` + `.tokens.json` + `.harness.html` | Fonte única de estilo para React e Angular.                                                  |
| Tema          | `packages/themes/default/src/theme.json`                                               | Valores por esquema (`light`, `dark`, `high-contrast`), incluindo glifos `--slotted-icon-*`. |
| Tokens        | `packages/tokens/src/contract.json`                                                    | Declaração dos tokens.                                                                       |
| Comportamento | `packages/core/src/<módulo>`                                                           | Módulos listados em `docs/build-order.md`, "Passe 1 — entregue".                             |
| React         | `packages/react/src/<componente>`                                                      | Componente, stories, testes.                                                                 |
| Angular       | `packages/angular/<componente>/src`                                                    | Componente, stories, testes.                                                                 |

Verificação obrigatória após cada correção: `pnpm check` e `turbo run verify --filter <pacote afetado>`.

---

## Regras transversais

Estas regras são decisões de design. Aplicam-se a todos os componentes, existentes e futuros. Um item de componente que cita uma regra transversal deve ser resolvido pela regra, não por exceção local.

### R1 — Sem barras laterais (rails) para estado

Proibido: pseudo-elemento, `border-inline-start`, `box-shadow` inset ou qualquer faixa de 2px a 4px na borda inicial ou superior de um item para representar `current`, `selected`, `active` ou `checked`. Este padrão é marcador de UI gerada por IA e está fora do sistema de design.

Substituição obrigatória, nesta ordem de preferência:

1. Superfície do item (`background-color`) em tom `accent-subtle` para `selected`; tom `secondary-subtle` para `current`/`hover`. `hover` e `selected` nunca compartilham a mesma superfície.
2. Indicador explícito (`[data-part='indicator']`, glifo de check de 16px) quando o componente já o possui.
3. Cor de texto em tom `accent-text` para `selected`.

Esquema `high-contrast`: a resposta é o indicador de check e `outline` de 1px em `Highlight`, não a barra.

Critério de aceite: busca por `::after`/`::before` com `inline-size` ≤ 4px em `packages/styles/src` retorna zero ocorrências associadas a estado.

### R2 — Componentes compostos não reutilizam `Button`/`IconButton` por padrão

Botões internos de componentes compostos (limpar valor em `Select`, `Combobox`, `TextField`; fechar em `Alert`, `Toast`, `Dialog`, `Drawer`, `Tag`; expandir em `Breadcrumb`; scroll/overflow em `Tabs`, `Toolbar`) não devem instanciar o componente `Button` ou `IconButton`. O componente `Button` carrega altura mínima, padding, borda, sombra e raio próprios que não se encaixam dentro de um controle de 32px.

Substituição obrigatória: uma parte interna (`[data-part='clear']`, `[data-part='close']`, `[data-part='expand']`) estilizada no CSS do próprio componente, com:

- Tamanho derivado de `--slotted-control-icon-size-<densidade>` mais padding de 2px a 4px. Nunca maior que a altura interna do controle hospedeiro.
- Sem borda e sem sombra em repouso. `hover` altera apenas `background-color` em um passo (`secondary-subtle-hover`). `active` altera para `secondary-subtle-active`.
- `:focus-visible` com o mesmo anel de foco global (R3).
- Alvo de toque mínimo de 24px via `::before` transparente, não via aumento do glifo.

Componentes afetados: `Select`, `Combobox`, `TextField`, `Textarea`, `NumberField`, `CurrencyField`, `Breadcrumb`, `Tabs`, `Alert`, `Toast`, `Dialog`, `Drawer`, `Tag`, `Toolbar`.

Critério de aceite: nenhum `data-ui='button'` ou `data-ui='icon-button'` renderizado dentro da árvore DOM dos componentes listados, exceto em slots de ação fornecidos pelo consumidor (`actions` de `Alert`, `footer` de `Dialog`).

### R3 — Anel de foco usa `--slotted-focus-ring-color` em todos os esquemas

Todo anel de foco usa `--slotted-focus-ring-color` ou `--slotted-focus-ring-color-invalid`; nenhum stylesheet redefine o token localmente nem usa `outline-color: currentColor`.

Critério de aceite: em `dark`, `getComputedStyle(el).outlineColor` de um botão focado resolve para `rgb(96, 165, 250)`. Busca por `outline` em `packages/styles/src` mostra todas as ocorrências usando `--slotted-focus-ring-color` ou `--slotted-focus-ring-color-invalid`.

### R4 — Ícones vêm de um conjunto publicado, não de paths escritos à mão

Fato verificado: `packages/themes/default/src/theme.json` define `--slotted-icon-circle-info`, `--slotted-icon-circle`, `--slotted-icon-circle-check`, `--slotted-icon-triangle-alert`, `--slotted-icon-circle-alert` e outros como `data:image/svg+xml` inline com `stroke-width='1.8'`. Estes glifos são usados por `Alert`, `Toast`, `ResultState`, `Field`, `InlineMessage` via `mask-image`. As dependências `lucide-react@1.24.0` e `@ng-icons/lucide@35.0.1` já existem no repositório.

Decisão: todo glifo em `theme.json` deve ser gerado a partir do SVG oficial do Lucide correspondente (`info`, `circle`, `circle-check`, `triangle-alert`, `circle-alert`, `x`, `chevron-down`, `check`, `search`, etc.), com `stroke-width` 2 e `viewBox 0 0 24 24`. Um script em `scripts/` deve gerar os data URIs a partir do pacote `lucide` para impedir divergência manual. Ícones usados nas stories devem vir de `lucide-react`/`@ng-icons/lucide`, nunca de SVG inline nas stories.

Critério de aceite: `scripts/generate-icon-glyphs.mjs` (ou equivalente) existe, é chamado no build de tokens e o teste `scripts/verify-token-foundation.test.mjs` compara cada glifo com a fonte Lucide.

### R5 — Ícone de status não fica solto na superfície

Aplica-se a `Alert`, `Toast`, `ResultState`, `AlertDialog`, `InlineMessage`, `Field` (mensagens) e qualquer componente que posicione um glifo de tom à esquerda de um texto.

Problema: o glifo de 16px em cor de tom, colocado na primeira coluna de um grid, sem relação geométrica com o título, lê como elemento colado e não como parte da composição.

Direção obrigatória:

- O glifo alinha pela linha de base da primeira linha do título (`align-self: start` mais `margin-block-start` calculado por `(line-height − glyph-size) / 2`), nunca centralizado verticalmente no bloco inteiro.
- O glifo tem o mesmo tamanho da fonte do título (`1em` do título), não um tamanho fixo por densidade desconectado do texto.
- Espaço entre glifo e texto é `--slotted-space-2` (8px), não maior.
- Sem círculo tintado ao redor do glifo. Sem fundo por trás do glifo.
- Em `Alert` e `Toast` com variante `solid`, o glifo é monocromático na cor do texto.

Limite de alcance — onde um glifo de tom não entra. R5 diz como um glifo se compõe com um título; estas três faixas dizem onde ele não deve existir.

1. Um glifo de tom cabe onde há um título e a mensagem é um evento isolado na página: `Alert`, `Toast`, `AlertDialog`.
2. Um glifo de tom não cabe numa região pequena e repetível. A mensagem de um `Field` aparece sob cada campo de um formulário; dez campos com erro dão dez ícones de `1em` empilhados na vertical, e o que era para chamar atenção vira textura. O tom ali é dito pela cor e pelo peso do texto, que F1 assentou, e por mais nada. Isto revoga a metade de F1 que fez `messageMark: "glyph"` o padrão de `field` e de `field-group`.
3. Um glifo de tom não cabe sozinho numa superfície vazia como assinatura de um estado. Um triângulo ou uma exclamação de 16 a 48px pousado acima de um título, sem relação geométrica com nada, é o padrão que R5 existe para proibir. A avaliação que esta regra mandava fazer em `ResultState` está feita: o glifo sai. Um estado vazio é título mais descrição mais ação; se precisar de imagem, é uma ilustração desenhada para o espaço, não um ícone de tom ampliado.

Critério de aceite: captura nos três esquemas mostra o glifo opticamente alinhado à primeira linha do título e com o mesmo peso visual do texto, onde a primeira faixa o admite.

### R6 — Destaque de texto (match de filtro) é um componente compartilhado

Entregue no passe 1 como folha partilhada em `packages/styles/src/highlight`, consumida por `combobox`, `select`, `listbox` e `menu`. Um consumidor novo usa a folha; a promoção a família com binding é `/component highlight`, onda 10 de `docs/build-order.md`.

### R7 — Movimento

- Entrada de overlays ancorados (`Select`, `Combobox`, `Menu`, `Popover`, `Tooltip`): `opacity 0→1` mais `translateY(−4px)→0` quando o overlay abre para baixo; `translateY(4px)→0` quando abre para cima. Nunca deslocamento horizontal. Duração `--slotted-duration-short` na saída e `--slotted-duration-medium` na entrada, easing `--slotted-easing-enter`/`--slotted-easing-exit`.
- Nenhuma transição anima escala numa caixa que contém texto ou que hospeda layout. Escalar uma caixa de texto reamostra o texto e todo o movimento: as letras tremem e a composição parece deslocar-se. Escala continua sem texto dentro — um anel de pulso, um ponto, um polegar —, e é essa a distinção que CK6 já aplicou ao revogar o `scale` da marca do checkbox e manter o do ponto do radio. Onde a escala era o único sinal de um estado, o substituto é `opacity`, `translate` ou mudança de superfície; nenhum estado fica sem sinal.
- Entrada de `Dialog`: backdrop `opacity 0→1`; painel `opacity 0→1`, sem transform nenhum. Um painel centrado não tem de onde vir, e uma caixa de texto movida por fração de pixel é reamostrada em cada frame — o mesmo defeito que a escala causava, medido em DG4: onze dos doze frames do percurso caíam em posição fracionária. Os overlays ancorados mantêm o passo de 4px: são caixas pequenas cujo movimento diz de que lado a camada abriu.
- Entrada de `Drawer`: backdrop `opacity 0→1`; painel `translateX(100%)→0` (ou eixo correspondente ao lado).
- Animar somente `transform` e `opacity`. Nunca `width`, `height`, `padding`, `margin`, `inset`.
- `prefers-reduced-motion: reduce` desliga `transform` e mantém `opacity`.

Critério de aceite: cada overlay renderiza pelo menos um frame no estado inicial (`opacity: 0`) antes de transicionar. Verificar via `getAnimations()` no teste de story ou via captura em `presence.test.ts`.

---

## Itens registrados antes da triagem

Reaberturas sem barreira prometidas por escrito no passe 1
(`docs/build-order.md`, "Reaberturas prometidas por escrito"). Entram
independentemente do veredito da família.

## MultiSelect

- [ ] **MS-2.1 (MAOC) — Duas cópias locais da sequência de `@slotted/core/tags`.** `multi-select` implementa localmente a divisão, a admissão e o veredito de restrição de valores que `tags-input` publicou em `@slotted/core/tags` (`splitValues`, `admitValues`, `constraintVerdict`). Localização: `packages/react/src/multi-select`, `packages/angular/multi-select/src`. Esperado: os dois bindings importam a sequência de `@slotted/core/tags`; nenhuma cópia local permanece. Critério de aceite: busca por `splitValues|admitValues|constraintVerdict` fora de `packages/core/src/tags` e dos consumidores que importam de `@slotted/core/tags` retorna zero definições; os testes de `multi-select` passam sem alteração de comportamento.
- [ ] **MS-2.2 — `commitOnBlur` com dois valores.** `tags-input` publica `pendingOnBlur: commit | keep | discard`; `multi-select` mantém `commitOnBlur` booleano. Esperado: `multi-select` adota o eixo de três valores com o mesmo nome e os mesmos valores de `tags-input`; `commitOnBlur` deixa o contrato no mesmo commit. Critério de aceite: `specs/components/multi-select/contract.json` declara `pendingOnBlur` com os três valores; teste de contrato e stories dos dois bindings atualizados.

## Prose, Table, Tabs

- [ ] **SA-2.1 (MAOC) — Três medidas de rolagem próprias onde existe `scroll-area`.** `prose`, `table` e `tabs` leem `@slotted/core/overflow` diretamente para desenhar a região rolável, escritas antes de `scroll-area` existir (`docs/archive/build-order-pass-1.md`, onda 8, `scroll-area splitter`). Esperado: cada uma hospeda a região rolável em `scroll-area` e remove a medida própria; a barra é a da plataforma, tematizada como `scroll-area` já faz. Critério de aceite: nenhum dos três stylesheets declara `scrollbar-color` ou máscara de transbordo própria; a região com nome e ponto de tabulação só existe enquanto o conteúdo transborda, como em `scroll-area`; capturas das seis combinações do harness sem regressão de layout.

## ScrollArea

- [ ] **SA-2.2 — Véu por linha do tempo de rolagem.** O véu de transbordo é recalculado por medição em JavaScript; a razão para adiar `animation-timeline: scroll()` está em `docs/superpowers/specs/2026-09-13-scroll-area-design.md` §5. Esperado: onde `animation-timeline: scroll()` é suportado, o véu é dirigido pela linha do tempo sem medição; onde não é, o caminho atual permanece. Critério de aceite: teste de estilo que verifica a declaração sob `@supports (animation-timeline: scroll())`; a medição por JavaScript não corre quando a declaração é suportada.

## Ordem de execução recomendada

1. Itens `(S)` de qualquer família.
2. Itens `(MAOC)`: `MS-2.1`, `SA-2.1`, depois os que a triagem acrescentar.
3. Demais itens por família, na ordem da tabela de triagem.

---

## FIM
