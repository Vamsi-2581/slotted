# Revisão de implementação — ajustes de UI, usabilidade e correção de defeitos

Documento de trabalho para um agente executor. Cada item descreve: sintoma observado, localização provável no código, comportamento esperado e critério de aceite. Um item só é considerado concluído quando o critério de aceite é verificável no Storybook (React e Angular) nos três esquemas (`light`, `dark`, `high-contrast`) e nas quatro densidades (`compact`, `dense`, `default`, `comfortable`).

## Marcadores

- `(S)` — defeito grave. Bloqueia o uso do componente. Prioridade sobre qualquer item visual.
- `(MAOC)` — may affect other components. O ajuste deve ser aplicado na origem compartilhada (`packages/core`, `packages/styles`, tokens ou tema), nunca por override local no componente onde foi observado.
- `#Componente:N` — referência ao item N da seção do componente citado. O defeito referido também ocorre no componente atual e deve ser corrigido pela mesma causa raiz.
- `[ ]` — pendente. `[x]` — concluído e verificado.

## Layout do repositório relevante

| Camada        | Caminho                                                                                | Conteúdo                                                                                     |
| ------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Contrato      | `specs/components/<componente>/contract.json`                                          | Props, partes, estados. Toda remoção ou adição de prop começa aqui.                          |
| Estilo        | `packages/styles/src/<componente>/<componente>.css` + `.tokens.json` + `.harness.html` | Fonte única de estilo para React e Angular.                                                  |
| Tema          | `packages/themes/default/src/theme.json`                                               | Valores por esquema (`light`, `dark`, `high-contrast`), incluindo glifos `--slotted-icon-*`. |
| Tokens        | `packages/tokens/src/contract.json`                                                    | Declaração dos tokens.                                                                       |
| Comportamento | `packages/core/src/<módulo>`                                                           | `positioner`, `presence`, `dismissable-layer`, `portal`, `collection`, `number`, `focus`.    |
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

Ocorrências conhecidas a remover:

- `packages/styles/src/list-item/list-item.css` — `[data-ui='list-item'][data-current]::after` e as variáveis `--_current-bar`, `--_bar-width`, `--slotted-list-item-current-color`, `--slotted-list-item-current-width`.
- `packages/styles/src/listbox/listbox.css` — barra na borda inicial dentro de `[data-part='option'][data-selected]`.
- Qualquer outra ocorrência encontrada por busca em `packages/styles/src` por `inset-inline-start: 0` combinado com `inline-size` de 2px a 4px, `border-inline-start` com cor de tom, ou comentário contendo "bar" / "rail".

Esquema `high-contrast`: o comentário em `listbox.css` justifica a barra pela ausência de diferença de superfície neste esquema. A solução para `high-contrast` é o indicador de check e `outline` de 1px em `Highlight`, não a barra.

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

Sintoma: em `dark`, botões e outros controles exibem anel de foco branco em vez da cor de destaque.

Fatos verificados: `packages/themes/default/src/theme.json` define `--slotted-focus-ring-color` como `#2563eb` em `light`, `#60a5fa` em `dark` e `#000000` em `high-contrast`. `button.css:343` declara `outline: var(--slotted-focus-ring-width, 2px) solid var(--slotted-focus-ring-color, Highlight)`.

Causas prováveis a investigar, nesta ordem:

1. O token não é emitido na camada de cascata do esquema `dark` no Storybook (verificar saída de build de `@slotted/theme-default` e a ordem de camadas em `docs/decisions/0001-cascade-layer-contract.md`).
2. Algum componente redefine `--slotted-focus-ring-color` localmente ou usa `outline-color: currentColor`.
3. O Storybook está em `high-contrast` e não em `dark` (o anel `#000000` sobre fundo escuro aparece como contorno claro por `outline` do user agent).

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
- Em `ResultState`, avaliar remover o glifo e usar apenas título mais descrição. Se mantido, tamanho igual ao tamanho da fonte do título, não um ícone de 32px a 48px isolado.

Critério de aceite: captura nos três esquemas mostra o glifo opticamente alinhado à primeira linha do título e com o mesmo peso visual do texto.

### R6 — Destaque de texto (match de filtro) é um componente compartilhado

Ver `#Combobox:6`. O componente resultante deve ser usado por `Combobox`, `Select` com filtro, `Listbox` com filtro, `Menu` com busca e qualquer futuro campo de busca.

### R7 — Movimento

- Entrada de overlays ancorados (`Select`, `Combobox`, `Menu`, `Popover`, `Tooltip`): `opacity 0→1` mais `translateY(−4px)→0` quando o overlay abre para baixo; `translateY(4px)→0` quando abre para cima. Nunca deslocamento horizontal. Duração `--slotted-duration-short` na saída e `--slotted-duration-medium` na entrada, easing `--slotted-easing-enter`/`--slotted-easing-exit`.
- Entrada de `Dialog`: backdrop `opacity 0→1`; painel `opacity 0→1` mais `scale(0.98)→1`.
- Entrada de `Drawer`: backdrop `opacity 0→1`; painel `translateX(100%)→0` (ou eixo correspondente ao lado).
- Animar somente `transform` e `opacity`. Nunca `width`, `height`, `padding`, `margin`, `inset`.
- `prefers-reduced-motion: reduce` desliga `transform` e mantém `opacity`.

Critério de aceite: cada overlay renderiza pelo menos um frame no estado inicial (`opacity: 0`) antes de transicionar. Verificar via `getAnimations()` no teste de story ou via captura em `presence.test.ts`.

---

## Geral

- [x] **G1 — Botões internos de componentes compostos.** Ver R2. Fato verificado (auditoria em `docs/implementation-review-log.md`, nota para G1): nenhuma das 14 famílias importa ou renderiza `Button`/`IconButton` em React ou Angular; o critério de DOM de R2 já era atendido. O item é a regra de estilo das partes internas existentes (`clear`, `reveal`, `dismiss`, `close`, `remove`, `ellipsis`, `scroll`, `overflow`, `increment`/`decrement`): caixa derivada de `--slotted-control-icon-size-<densidade>` mais um passo de ar (`--slotted-space-2`) por lado, nunca de uma altura de controle; sem borda, sombra ou fundo em repouso; `hover` e `active` alteram apenas `background-color`, em um passo; `:focus-visible` com o anel de R3; alvo de 24px pela própria caixa ou por pseudo-elemento transparente. Guarda: `packages/styles/src/inner-control.test.mjs` (16 partes em 14 famílias, mais o piso de glifo de SL3). BC1, T1, TF1, SL3 e CB3 fecham junto.
- [x] **G2 — Rails laterais para estado.** Ver R1. Remover todas as ocorrências.
- [x] **G3 — Anel de foco branco em `dark`.** Ver R3.
- [x] **G4 — Glifos escritos à mão.** Ver R4.
- [ ] **G6 — `pnpm typecheck` falha na primeira execução após `turbo run verify`.** Observado em DG3, G2 e LB2: logo após `turbo run verify` (build do React), `tsc --build tsconfig.base.json` reporta erros circulares em toda `*.stories.tsx` (`referenceScenes` implicitly any, `Story` circularly references itself) e a segunda execução passa sem alteração. Causa provável: estado incremental (`.tsbuildinfo`) escrito pelo build do React com `dist` como saída e lido pelo typecheck da raiz. Esperado: `pnpm check` determinístico após qualquer build; separar os `tsbuildinfo` dos dois modos ou excluir `dist` das referências do typecheck.
- [ ] **G5 — `tools/harness/audit.mjs` conta `script` e `style` como parte colapsada.** Observado durante G4, sem alteração de layout: nas cenas `states` de `Checkbox` e `Collapsible` e `track`/`variant` de `Tabs`, o audit reporta `collapsed 0px inside a 446px stage` para elementos `script` e `style` do fragmento. Esperado: o audit ignora elementos não renderizados (`script`, `style`, `template`) ao medir o palco.
- [ ] **G7 — `tools/harness/audit.mjs` mede o eixo do glifo contra a caixa das palavras, não contra a primeira linha.** Observado durante AL1, sem alteração de layout: em `alert` e `toast` o irmão com texto do `[data-part='icon']` é o `content` (título mais descrição), e `Range.getClientRects()` sobre esse elemento devolve a caixa inteira do título (39px quando quebra em duas linhas), não a sua primeira linha; o audit reporta `off-axis 9.75px` para um glifo que a sonda `tools/harness/out/review-loop/al1/probe.mjs` (Range sobre o primeiro nó de texto) mede a 0.25px do centro da primeira linha. Em `result-state` a reach `section`/`page` põe o glifo acima do título por desenho e o audit reporta o mesmo achado. Esperado: `firstLineOf` desce até o primeiro nó de texto do irmão e mede a primeira linha dele; um glifo em linha própria acima do texto (`grid-row` distinta) não é medido.
- [ ] **G8 — `overflow-clip-margin` não aceita `calc()` com `var()` no Chrome.** Observado durante CK3, sem alteração de layout: em Chrome 150, `overflow-clip-margin: calc((var(--_halo-size) - var(--_size)) / 2)` resolve para `0px` e `CSS.supports('overflow-clip-margin: calc(8px)')` devolve `false`, enquanto `overflow-clip-margin: var(--_halo-size)` resolve; além disso, com `overflow: clip`, o transbordo de um pseudo-elemento posicionado dentro da margem de recorte continua a contar como overflow rolável do ancestral. Esperado: nenhuma folha depende de `overflow-clip-margin` para conter um pseudo-elemento que pende para fora (checkbox e radio-group ancoram o alvo para não pender); registrar a limitação em `docs/token-foundation.md` ou na folha que a reencontrar.

---

## Button e ButtonGroup

- [ ] **B1 — Feedback de clique (`:active`).** Estado atual: apenas escurecimento de fundo. Esperado: `transform: translateY(1px)` combinado com remoção da sombra (`--slotted-control-shadow` → `none`) na variante `solid`; nas variantes `outline` e `ghost`, apenas a mudança de superfície para `*-active`. Duração da transição de `:active` igual a 0 na entrada (resposta imediata ao press) e `--slotted-duration-short` na saída. Referências para comparação: Primer (`transform: translateY(1px)` no press), Radix Themes (`filter: brightness` sem deslocamento). Escolher a primeira.
- [ ] **B2 — Hover por escurecimento.** Estado atual: `hover` escurece a superfície da variante `solid`. Esperado: `solid` clareia em 4% a 6% de luminosidade (`color-mix(in oklch, var(--tone-solid), white 6%)`) em `light` e clareia em 8% em `dark`; `outline` e `ghost` recebem superfície `secondary-subtle-hover`. A mudança é apenas de `background-color`, 120ms, `ease-out`. Os tokens `--slotted-tone-*-solid-hover` em `theme.json` devem ser recalculados por esta regra, não ajustados por componente.
- [ ] **B3 — Variante `unavailable` idêntica a `solid secondary`.** Esperado: `unavailable` usa superfície `secondary-subtle` (não `solid`), texto em `--slotted-text-muted`, borda `1px` em `--slotted-border-subtle`, `cursor: not-allowed`, sem sombra e sem resposta a `hover`. A diferença para `disabled` é o texto permanecer legível (contraste ≥ 4.5:1) e o controle permanecer focável.
- [ ] **B4 — Spinner do `IconButton` em `loading`.** Estado atual: traço fino e desproporcional. Esperado: spinner com `stroke-width` de 2px a 2.5px, diâmetro igual a `--slotted-control-icon-size-<densidade>`, arco de 270° com `stroke-linecap: round`, rotação de 1s linear. O mesmo spinner é usado por `Button` em `loading`. Definir uma vez em `packages/styles/src/button/button.css` ou extrair para `packages/styles/src/spinner` se `Select`/`Combobox` (`#Select:6`) passarem a usá-lo.
- [ ] **B5 — Remover a prop `separation`/`gap` de `ButtonGroup`.** Localização: `specs/components/button-group/contract.json:52`, `packages/react/src/button-group/button-group.tsx:47`, `packages/angular/button-group/src/button-group-defaults.ts`, testes correspondentes (`button-group.test.tsx:80`, `button-group.spec.ts:113`) e `packages/styles/src/button-group/button-group.css` (`[data-gap]`). O grupo passa a ter um único modo: botões colados com bordas internas colapsadas e raio apenas nas extremidades. Atualizar `contract.test.mjs`, docs e stories.
- [ ] **B6 — Toggle button sem diferença perceptível entre estados.** Esperado: estado `pressed` (`aria-pressed="true"`) usa superfície `accent-subtle`, texto `accent-text` e borda `accent-border`; estado não pressionado é a variante `outline` ou `ghost` normal. Contraste entre as duas superfícies ≥ 1.5:1. `hover` sobre o estado pressionado usa `accent-subtle-hover`, nunca a mesma superfície do `hover` não pressionado.

---

## Alert

- [x] **AL1 — Ícone solto na superfície.** Ver R5. Aplicar em `packages/styles/src/alert/alert.css` (`[data-part='icon']`, grid `auto minmax(0, 1fr) auto`). Afeta `Toast` (`#Toast:1`), `ResultState`, `AlertDialog`, `InlineMessage`, `Field` (`#Field:1`).
- [x] **AL2 — Conteúdo transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G3, sem alteração de layout: na cena `content`, `[data-part='content']` mede 156px dentro de 149px disponíveis nos três esquemas. Esperado: o conteúdo quebra dentro da largura do palco (`min-inline-size: 0` na coluna do grid e `overflow-wrap: anywhere` em título e descrição); nada transborda o palco.

---

## AvatarGroup

- [ ] **AG1 — Avatar em `hover` sem destaque.** Estado atual: apenas deslocamento vertical. Esperado: o avatar sob o ponteiro recebe `z-index` acima dos vizinhos, `outline` de 2px na cor `--slotted-surface` (anel de separação) mais `box-shadow` de elevação nível 1, e `transform: translateY(−2px) scale(1.06)`. Transição de 150ms `ease-out` em `transform` e `box-shadow`. Os vizinhos não se movem. Em `prefers-reduced-motion`, manter apenas `z-index` e `outline`.

---

## Badge

- [ ] **BD1 — Offset configurável quando ancorado.** Esperado: tokens `--slotted-badge-anchor-offset-x` e `--slotted-badge-anchor-offset-y` (padrão `0`) aplicados via `translate` no modo ancorado. Expor como prop `offset` (`{ x, y }` em px) no contrato (`specs/components/badge/contract.json`) para React e Angular. Story demonstrando badge sobre `Avatar` circular com offset `{ x: -2, y: 2 }` e sobre `IconButton` quadrado com offset `0`.

---

## Breadcrumb

- [x] **BC1 — Controle de expansão (ellipsis) desalinhado.** Causa: uso de `IconButton` (R2). Esperado: parte interna `[data-part='expand']` com a mesma altura de linha dos itens do breadcrumb, glifo `ellipsis` do Lucide em `--slotted-control-icon-size-<densidade>`, sem borda, `hover` com superfície `secondary-subtle-hover` e raio `--slotted-radius-xs`. Alinhamento vertical pela linha de base dos itens, não `align-items: center` sobre um botão mais alto.
- [ ] **BC2 — Glifo `ellipsis` do Lucide no controle de expansão.** BC1 pede o glifo `ellipsis` do Lucide; `theme.json` não tem `--slotted-icon-ellipsis` e o token não pôde ser adicionado na sessão de G1 (theme e tokens reservados a outra sessão). O controle segue desenhando U+2026 como texto no tamanho do trail (decisão registrada em `breadcrumb.css`), o que é o que o alinha à linha de base. Esperado: adicionar `ellipsis` a `packages/themes/default/src/glyphs.json` (R4), trocar o texto pela máscara em `--_icon-size` em `breadcrumb.css` e em `toolbar.css` (`[data-part='overflow']`, mesma decisão), e atualizar `breadcrumb.styles.test.mjs` e `toolbar.styles.test.mjs`. Decidir antes se a regra 3 de `docs/token-foundation.md` (U+2026 não é ícone) é mantida.

---

## Card

- [ ] **C1 — Variantes com `Checkbox`/`Radio` mal posicionadas.** Dependente de `#Checkbox:1` e `#Checkbox:5`. Após a refatoração dos controles, o card selecionável deve alinhar o controle à primeira linha do título (mesma regra de R5) e usar `gap` de `--slotted-space-3`. O card inteiro é o alvo de clique; o controle é apenas o indicador. Estado `selected` do card usa borda `accent-border` de 1px mais superfície `accent-subtle`, sem rail (R1).

---

## Checkbox, CheckboxGroup, Radio, RadioGroup

Localização: `packages/styles/src/checkbox/checkbox.css`, `packages/styles/src/radio-group/radio-group.css`, `packages/styles/src/checkbox-group/`.

- [x] **CK1 — Redesenho do checkbox.** Problemas: glifo de check não cabe em densidades menores (`--_mark-inset: 0.875` produz um check que toca a borda em 14px), espaçamento interno mal calculado, `hover` e `focus` sem tratamento. Esperado:
  - Caixa: 16px em `md`, 14px em `sm`, 18px em `lg`. Raio `--slotted-radius-xs` (2px a 3px). Borda 1.5px em `--slotted-border-strong`.
  - Glifo: path de check do Lucide com `stroke-width` 3 em `viewBox 0 0 24 24`, ocupando 70% da caixa (`inset` de 15%), `stroke-linecap: round`.
  - `checked`: fundo `accent-solid`, glifo em `accent-solid-text`, sem borda visível.
  - `hover` (não checado): borda `accent-border` mais halo circular de 32px em `accent-subtle` a 40% de opacidade atrás da caixa, via `::before` com `border-radius: 50%`. Referência: MUI Checkbox (https://mui.com/material-ui/react-checkbox/). Halo desaparece em `checked` e aparece em `hover` sobre `checked` na mesma cor.
  - `:focus-visible`: anel R3 na caixa, não no halo.
  - `indeterminate`: traço horizontal de `stroke-width` 3 ocupando 50% da largura.
  - Transição: `background-color` e `border-color` em 120ms; o glifo entra com `transform: scale(0.6)→1` em 150ms.
- [ ] **CK2 — Espaço entre label e descrição na variante card.** Esperado: `--_description-gap` igual a `--slotted-space-1` (4px) na variante card. Verificar em `checkbox.css:74` o cálculo `max(0px, var(--slotted-space-3) - var(--_label-slack))`, que em `card` produz espaço acumulado com o padding do card.
- [x] **CK3 — Controles curtos demais em densidade baixa.** Em `compact` e `dense`, a caixa não deve ficar abaixo de 14px. A altura da linha do label define a altura do item; a caixa mantém 14px a 16px e o alvo de toque de 24px vem do halo, não da redução da caixa.
- [ ] **CK4 — Centralização do glifo variando por densidade.** Causa provável: arredondamento de `calc()` com valores em `rem` produzindo subpixel. Esperado: glifo posicionado por `inset` percentual dentro de uma caixa de tamanho inteiro em px; testar `getBoundingClientRect()` do glifo contra o da caixa em todas as densidades (diferença de centro ≤ 0.5px).
- [x] **CK5 — Redesenho do radio.** Esperado: círculo de 16px em `md` (14px `sm`, 18px `lg`), borda 1.5px em `--slotted-border-strong`; `checked`: borda 5px a 6px em `accent-solid` (o ponto interno é o fundo da superfície visto pelo furo, sem elemento extra) ou ponto interno de 8px em `accent-solid` sobre fundo da superfície. Mesmo halo de `hover`, mesmo anel de foco, mesma transição de CK1. Alinhamento label/descrição idêntico ao checkbox.

Critério de aceite para a seção: story de comparação lado a lado `Checkbox` e `Radio` em quatro densidades e três esquemas, com estados `default`, `hover`, `focus-visible`, `checked`, `indeterminate`, `disabled`, `invalid`.

---

## Select

Localização: `packages/styles/src/select/select.css`, `packages/react/src/select`, `packages/angular/select/src`, `packages/core/src/positioner/positioner.ts`.

- [x] **SL1 (S) — Overlay desloca para a direita continuamente ao passar o mouse pelas opções.** Reproduz quando o `Select` está em contêiner sem padding. Causa raiz está em `packages/core/src/positioner` (`createPositioner`), compartilhado por `Combobox`, `Menu`, `Popover`, `Tooltip`. Hipóteses a testar, nesta ordem:
  1. O positioner lê `getBoundingClientRect()` do overlay já transformado (`translate`) e soma o deslocamento anterior ao novo cálculo (acumulação). Correção: medir com `transform: none` ou usar `offsetWidth`/`offsetHeight` mais posição do âncora.
  2. `hover` altera a largura de uma opção (por exemplo, `font-weight` ou scrollbar), disparando `ResizeObserver` do overlay, que reposiciona com base na largura já deslocada.
  3. O `Popover` de largura igual ao controle (`#Popover:1`) mede a largura do controle incluindo borda em um caso e excluindo em outro.
     Ação obrigatória: escrever teste em `positioner.test.ts` que simula 10 reposicionamentos consecutivos com o mesmo âncora e verifica que o resultado é idêntico em cada iteração (`x`, `y` estáveis). O teste falha antes da correção e passa depois. Verificar depois nos quatro componentes consumidores.
- [ ] **SL2 — Direção da animação de abertura.** Estado atual: entrada horizontal (esquerda para direita). Esperado: ver R7 (vertical, na direção da abertura). Corrigir em `select.css` e no ponto de origem compartilhado se a animação vier de `popover.css` ou de `presence`. (MAOC)
- [x] **SL3 — Ícones à direita (clear, chevron) pequenos em `compact` e `dense`.** Esperado: o glifo usa `--slotted-control-icon-size-<densidade>` com piso de 14px. Em `compact` o controle pode ter 24px de altura e o glifo 14px; nunca abaixo disso. Relacionado a R2 (o botão de clear é parte interna). (MAOC — `Combobox`, `TextField`, `NumberField`, `CurrencyField`)
- [ ] **SL4 — Prévia de múltipla seleção "Apple +1".** Esperado: renderizar os valores selecionados como `Tag` compactas (altura igual a `--slotted-control-icon-size-<densidade>` + 4px) dentro do controle, com overflow calculado por `ResizeObserver`: as tags que não cabem colapsam em uma única tag `+N`. Cada tag tem botão interno de remoção (R2). Fallback textual "N selecionados" apenas quando o controle está abaixo de 120px de largura. (MAOC — `Combobox` múltiplo)
- [ ] **SL5 — Variante `plain` com sombra.** Localização: `select.css:359` (`[data-variant='plain']`). Esperado: `plain` sem `box-shadow`, sem borda, sem fundo em repouso; `hover` com superfície `secondary-subtle-hover`; `focus-visible` com anel R3. Verificar se `TextField`, `Combobox` e `NumberField` têm a mesma variante e aplicar a mesma regra. (MAOC)
- [ ] **SL6 — Estado `loading`.** Decisão: não usar `Loader`/`LoaderScene` com superfície dentro do overlay. Esperado: spinner inline de B4 no lugar do chevron enquanto carrega; dentro do overlay, três linhas de `Skeleton` com a altura de uma opção. (MAOC — `Combobox`)
- [ ] **SL7 — Indicador desalinhado em opção de duas linhas.** Observado por `tools/harness/audit.mjs` durante SL1, sem alteração de CSS: na cena `long-content`, `[data-part='indicator']` fica 39.25px acima da linha que anota (centralizado no bloco de duas linhas mais descrição). Esperado: indicador alinhado à primeira linha do label, pela mesma regra de R5. (MAOC — `Combobox`)

---

## Combobox

Localização: `packages/styles/src/combobox/combobox.css`, `packages/react/src/combobox`, `packages/angular/combobox/src`.

- [x] **CB1 — `#Select:1`.** Mesma causa raiz no positioner.
- [ ] **CB2 — `#Select:2`.**
- [x] **CB3 — `#Select:3`.**
- [ ] **CB4 — `#Select:4`.**
- [ ] **CB5 — `#Select:6`.**
- [ ] **CB6 — Destaque do match do filtro.** Localização: `combobox.css:665` (`[data-part='match']`): `font-weight: 600`, `padding-inline: 0.1em`, `border-radius: 2px`, fundo `accent-surface`. O peso e o padding alteram a métrica da palavra e o trecho destacado parece deslocado. Esperado, extraído para um componente compartilhado (`packages/styles/src/highlight/highlight.css`, parte `[data-ui='highlight']` ou `[data-part='match']` global), consumido por `Combobox`, `Select` com filtro, `Listbox` com filtro e `Menu` com busca (R6):
  - `font-weight: inherit`. `padding: 0`. `border-radius: 0`. `letter-spacing: inherit`.
  - `color: var(--slotted-tone-accent-text)`.
  - `background-color: var(--slotted-tone-accent-surface)` com `box-decoration-break: clone`.
  - Sublinhado de 1px em `accent-border` via `text-decoration: underline` com `text-underline-offset: 2px` e `text-decoration-thickness: 1px`, ou `box-shadow: inset 0 -1px 0 var(--slotted-tone-accent-border)`.
  - Em `data-disabled`: fundo transparente, cor `inherit`, sublinhado mantido.
  - `forced-colors`: `Mark`/`MarkText`, já implementado; preservar.
    Critério de aceite: a largura da string com e sem `<mark>` difere em 0px (testar via `getBoundingClientRect().width` do label com e sem `matchRanges`). (MAOC)
- [ ] **CB7 — Valor livre não validado.** Esperado: prop `allowCustomValue` (padrão `false`). Com `false`, ao perder o foco (`blur`) com texto que não corresponde a nenhum item, o campo volta ao último valor válido (ou vazio) e emite `onInputReset`. Com `true`, o texto é aceito como valor. Documentar no contrato e nas stories dos dois frameworks.
- [ ] **CB8 — Criação de novo valor.** Esperado: prop `onCreate` (ou `creatable`) que, quando presente e a query não corresponde a nenhum item, renderiza uma opção final `Criar "<query>"` no listbox. Selecioná-la chama `onCreate(query)` e o consumidor decide se adiciona o item à coleção. Modo múltiplo integra com as tags de `#Select:4`. Story obrigatória: input de tags com criação.
- [ ] **CB9 — `#Select:7`.**

---

## CurrencyField

Localização: `packages/core/src/number/number.ts`, `packages/react/src/currency-field/currency-field.tsx`, `packages/angular/currency-field/src`.

- [ ] **CF1 — Digitação com cursor à esquerda produz `20,00` em vez de `0,02`.** Decisão: o campo opera em modo calculadora. Os dígitos entram sempre pela direita, deslocando o valor para a esquerda (`0,00` → digita `2` → `0,02` → digita `5` → `0,25`). A posição do cursor é ignorada para inserção; o cursor fica sempre no fim. `Backspace` remove o último dígito à direita. Colar substitui o valor inteiro após parse. Escrever testes em `number.test.ts` e `currency-field.test.tsx` cobrindo: cursor no início, cursor no meio, seleção parcial, colar `1.234,56` e `1234.56`.
- [ ] **CF2 — Valor vazio.** Decisão: prop `allowEmpty` (padrão `false`). Com `false`, limpar o campo resulta em `0,00` e o valor emitido é `0`. Com `true`, o campo pode ficar vazio e o valor emitido é `null`. Documentar no contrato.

---

## DescriptionList

Localização: `packages/react/src/description-list/description-list.tsx` (labels `copy`, `copyBlocked`).

- [ ] **DL1 — Botão de copiar apenas seleciona o texto.** Causa provável: `navigator.clipboard.writeText` rejeitado (iframe do Storybook sem permissão `clipboard-write`, ou contexto não seguro em `http://devserver.local`) e o fallback cai em seleção. Esperado: (1) tentar `navigator.clipboard.writeText`; (2) em falha, usar `document.execCommand('copy')` sobre uma seleção temporária e restaurar a seleção anterior; (3) só se ambos falharem, mostrar o estado `copyBlocked`. Após sucesso, o botão troca o glifo para `check` por 1500ms e anuncia "Copiado" via `aria-live`. Adicionar `allow="clipboard-write"` ao iframe de preview do Storybook (`apps/storybook-*/.storybook/preview-head.html` ou `manager`). O botão é parte interna (R2).
- [ ] **DL2 — Placeholder `-` para valor vazio.** Esperado: usar `—` (em dash, U+2014) em `--slotted-text-muted`, com `aria-label` configurável (`labels.empty`, padrão "Sem valor"). Não usar hífen.

---

## Dialog

Localização: `packages/styles/src/dialog/dialog.css`, `packages/core/src/dismissable-layer`, `packages/core/src/presence`.

- [x] **DG1 — Clique no backdrop não fecha.** Verificar `dismissable-layer.ts`: o listener de `pointerdown` fora deve considerar o backdrop como "fora" do painel. Verificar se o backdrop tem `pointer-events: none` ou se está fora da árvore observada. Esperado: `closeOnBackdrop` (padrão `true`) fecha no `pointerup` no backdrop quando o `pointerdown` também ocorreu no backdrop (evita fechar ao arrastar seleção de texto para fora). Testar também `Escape` e o botão de fechar. Story com os três modos e uma story `closeOnBackdrop={false}`.
- [ ] **DG2 — Botão de tela cheia.** Esperado: prop `fullscreenToggle` (padrão `false`) que renderiza uma parte interna `[data-part='fullscreen']` (R2) no cabeçalho, alternando `data-fullscreen` no root. Em `data-fullscreen`, o painel ocupa `inset: 0`, sem raio, com transição em `transform`/`opacity` (não em `width`/`height`). Prop controlada `fullscreen` e evento `onFullscreenChange`.
- [x] **DG3 — Animações ausentes.** Fato verificado: `dialog.css:172-181` e `268-292` já declaram transições de `opacity` no backdrop e no painel condicionadas a `[data-open]`. O sintoma indica que `data-open` é aplicado no mesmo frame em que o elemento é montado, sem frame inicial em `opacity: 0`. Esperado: `createPresence` em `presence.ts` deve garantir um frame em `entering` antes de `open` (`requestAnimationFrame` duplo ou `getComputedStyle` forçando reflow). Aplicar R7. Testar em `presence.test.ts` que o status passa por `entering` e que o elemento recebe `data-open` apenas após o primeiro frame. (MAOC — `Drawer`, `Popover`, `Menu`, `Select`, `Combobox`, `Tooltip`, `Toast`)

---

## Drawer

Localização: `packages/styles/src/drawer/drawer.css`.

- [x] **DR1 — `#Dialog:1`.** Mesma causa em `dismissable-layer`.
- [x] **DR2 — `#Dialog:3`.** Mesma causa em `presence`.
- [x] **DR3 — Backdrop e painel aparecem sem transição.** Coberto por DR2 e R7: painel entra com `translateX(100%)→0` (lado `end`), `translateX(−100%)→0` (lado `start`), `translateY(100%)→0` (lado `bottom`).
- [ ] **DR4 — Borda lateral clara demais em `dark`.** Esperado: a borda do painel usa `--slotted-border-subtle` do esquema `dark`, não um valor fixo. Verificar em `drawer.css` se a borda usa token de esquema ou literal. Em `dark`, a separação entre painel e backdrop deve vir da sombra de elevação nível 3, com borda de 1px em `--slotted-border-subtle` a no máximo 12% de contraste sobre a superfície do painel.
- [ ] **DR5 — Redimensionamento sem desempenho e visualmente inadequado.** Referência de comportamento: SAP Fundamental Styles Splitter (https://sap.github.io/fundamental-styles/?path=/docs/sap-design-btp-splitter--docs). Esperado:
  - Alça de 4px (`[data-part='resizer']`) na borda interna, com área de captura de 12px via `::before`. Em repouso, a alça é invisível; em `hover` ou durante o arraste, mostra linha de 2px em `accent-border`. Sem cabo, sem pontos, sem ícone.
  - Durante o arraste, o painel atualiza `inline-size` (ou `block-size`) via `style` direto a cada `pointermove`, sem transição CSS ativa e com `will-change: inline-size` aplicado apenas durante o arraste. Sem `transition` em `inline-size` fora do arraste.
  - `pointer-capture` na alça, `cursor: col-resize`/`row-resize` no `body` durante o arraste, `user-select: none` no documento durante o arraste.
  - Limites `minSize`/`maxSize` em px ou `%`. Duplo clique na alça restaura o tamanho padrão.
  - Teclado: alça focável, setas ajustam em passos de 16px, `Shift+seta` em 64px, `Home`/`End` vão aos limites.
  - Critério de aceite: arraste contínuo mantém ≥ 55 fps no profiler do Chrome com painel contendo 200 itens de lista.
- [ ] **DR6 — Modo `inline` transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante DG3, sem alteração de layout: na cena `inline-open`, o `main` mede 94px dentro de 32px disponíveis nos três esquemas. Esperado: em largura estreita o conteúdo ao lado do painel inline não fica abaixo de zero de largura; o painel cede (`min-inline-size: 0` no `main` ou colapso do painel) e nada transborda o palco.

---

## Field

- [x] **F1 — Mensagens de descrição e erro.** Esperado: mensagem de descrição sem glifo, apenas texto em `--slotted-text-muted`, tamanho `--slotted-font-size-xs`. Mensagem de erro com glifo `circle-alert` (R4, R5) de `1em`, texto em `--slotted-tone-danger-text` com `font-weight: 500`. Mensagem de sucesso segue o padrão de erro com tom `success`. Aplicar em `packages/styles/src/field/field.css`.

---

## InlineMessage

- [x] **IM1 — Avaliar remoção.** O componente sobrepõe `Alert` (variante `subtle`, sem título) e `Field` (mensagem). Decisão pendente após F1 e AL1: se `Alert` com `size="sm"` e sem título cobre o caso de uso, remover `InlineMessage` do contrato, dos pacotes e das docs, com registro em `docs/decisions/`. Se mantido, redesenhar segundo R5 e reutilizar o CSS de `Alert` por composição.

---

## Kbd

- [ ] **K1 — Altura varia com o símbolo.** Causa: `line-height` derivado do glifo (símbolos como `⌘` e `⇧` têm ascendente diferente). Esperado: `block-size` fixa por densidade (`1.25rem` em `md`), `line-height: 1`, conteúdo centralizado por `display: inline-grid; place-items: center`, `font-variant-numeric: tabular-nums`. Testar com `⌘`, `⇧`, `Enter`, `A`, `↑` na mesma linha: todas as caixas com a mesma altura (diferença 0px).

---

## ListItem

Localização: `packages/styles/src/list-item/list-item.css`, `docs/superpowers/specs/2026-09-04-list-and-list-item-self-assessment.md`.

Componente inteiro requer passada de polimento. Ordem de execução: LI1 → LI2 → LI3.

- [x] **LI1 — Rails laterais.** Ver R1. Remover `[data-current]::after` e variáveis associadas. `current` passa a usar superfície `secondary-subtle`; `selected` usa `accent-subtle` mais texto `accent-text`.
- [ ] **LI2 — Checkbox desalinhado.** Dependente de CK1. Após CK1, o checkbox da linha alinha pelo centro vertical da primeira linha de texto (`align-self: start` mais `margin-block-start: calc((var(--_line-height) * var(--_font-size) - var(--_size)) / 2)`). A coluna do controle tem largura fixa igual ao tamanho do controle mais `--slotted-space-2`.
- [ ] **LI4 — Linha transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G2, sem alteração de layout (reproduz no HEAD anterior): na cena `anatomy`, `li[data-ui='list-item']` e o `ul` mede 266px em 240px nos três esquemas. Esperado: mesma regra de `#Alert:2` — a linha cede (`min-inline-size: 0` no conteúdo, `actions` quebra para a própria linha) e nada transborda o palco.
- [ ] **LI3 — Passada de consistência.** Verificar contra a lista: altura de linha por densidade (32px `dense`, 36px `default`, 40px `comfortable`, 28px `compact`); padding inline único por densidade; ícone inicial em `--slotted-control-icon-size-<densidade>` monocromático (sem círculo tintado); texto secundário em `--slotted-text-muted` na linha abaixo com `gap` de 2px; ações à direita como partes internas (R2); separador entre linhas de 1px em `--slotted-border-subtle` apenas quando `divided`. Cinco aparências distintas em cada linha interativa: `hover`, `focus-visible`, `active`, `selected`, `disabled`. `hover` e `selected` com superfícies diferentes.

---

## Listbox

Localização: `packages/styles/src/listbox/listbox.css`.

- [x] **LB1 — Rail lateral no estado `selected`.** Ver R1. Remover a barra dentro de `[data-part='option'][data-selected]` (`listbox.css:416`). Estado `selected` usa superfície `accent-subtle`, texto `accent-text` e o `[data-part='indicator']` já existente (`listbox.css:499`).
- [x] **LB2 — Múltiplos itens selecionados colados formam ondulação nas laterais.** Causa: cada opção tem `border-radius` próprio e as superfícies adjacentes não se fundem. Esperado: opções com `border-radius` apenas nas extremidades de um bloco contíguo de seleção, via seletores `[data-selected] + [data-selected]` (remove raio superior do segundo) e `:has(+ [data-selected])` (remove raio inferior do primeiro). Alternativa quando `:has` não é aceitável: `gap` de 2px entre opções e raio em todas, evitando a fusão. Escolher a primeira. Verificar em `Select`, `Combobox` e `Menu` múltiplos. (MAOC)

---

## Menu

- [ ] **M1 — Animação de abertura.** Aplicar R7. Submenus entram com `translateX(−4px)→0` (na direção de abertura lateral), com a mesma duração.
- [ ] **M2 — Submenus abertos por padrão e sem separação.** Esperado: submenu fechado até `hover` com atraso de 150ms ou `ArrowRight`/`Enter` no item pai. Ao abrir, o submenu é posicionado pelo positioner com `offset` de 4px em relação à borda do menu pai (não colado) e sobreposição vertical alinhada ao item pai (o primeiro item do submenu alinha com o item que o abriu). Verificar nas stories se `defaultOpen` está sendo passado apenas para demonstração; se sim, mover para uma story dedicada `SubmenuOpen` e manter as demais fechadas.

---

## Popover

- [x] **P1 — Largura igual ao controle desalinhada.** Relacionado a `#Select:1` (positioner). Causa provável: largura medida por `offsetWidth` do controle enquanto a posição usa `getBoundingClientRect().left` com borda incluída, ou o `transform` de entrada (`#Select:2`) aplica deslocamento horizontal residual. Esperado: `matchWidth` usa `getBoundingClientRect().width` do âncora e a posição `x` usa `getBoundingClientRect().left` do mesmo retângulo, na mesma leitura. Teste em `positioner.test.ts`: com `matchWidth`, `overlay.left === anchor.left` e `overlay.width === anchor.width`, tolerância 0px.
- [ ] **P2 — Harness transborda a 240px.** Observado por `tools/harness/audit.mjs` durante SL1, sem alteração de CSS: nas cenas `width` e `content` o painel mede 248px dentro de um palco de 240px. Esperado: o painel respeita `--slotted-positioner-available-width` e a largura do palco em todos os esquemas.

---

## Slider

- [ ] **SR1 — Borda da trilha preenchida.** Esperado: a trilha vazia tem borda de 1px em `--slotted-border-strong` (borda de input); a trilha preenchida (`[data-part='range']`) tem fundo `accent-solid` e borda de 1px em `accent-solid` (ou `border: none` com a trilha preenchida sobrepondo a borda da vazia por 1px em cada lado via `inset: -1px`). O polegar (`thumb`) sobrepõe as duas. Verificar em `packages/styles/src/slider/slider.css`.

---

## Stepper

Localização: `packages/styles/src/stepper/stepper.css`, `docs/superpowers/specs/2026-09-03-breadcrumb-pagination-stepper-self-assessment.md`.

- [ ] **ST1 — Verificação funcional.** Escrever ou completar testes de story cobrindo: navegação por clique em passo concluído, bloqueio de passo futuro quando `linear`, estados `completed`/`current`/`upcoming`/`error`/`disabled`, teclado (`ArrowLeft`/`ArrowRight`/`Home`/`End`), `aria-current="step"` no passo atual. Ambos os frameworks.
- [ ] **ST3 — Itens transbordam o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: nas cenas `content` (155px em 120px), `statuses` (191px em 144px), `panels` e `placement` (335px em 240px), `li[data-part='item']` transborda nos três esquemas. Esperado: mesma regra de `#Alert:2` — `min-inline-size: 0` na coluna e quebra do rótulo dentro da largura do palco.
- [ ] **ST2 — Variante `compact` com conectores descentralizados.** Esperado: o conector (`[data-part='connector']`) é uma linha de 1px a 2px posicionada em `top: calc(var(--_indicator-size) / 2)` com `transform: translateY(-50%)`, estendendo-se entre o centro de um indicador e o centro do próximo. Em `compact`, o indicador reduz para 20px e o rótulo vai para baixo do indicador ou some (`labelPlacement="hidden"`); o conector recalcula pelo novo tamanho do indicador. Testar `getBoundingClientRect()` do conector contra o centro do indicador (diferença ≤ 0.5px).

---

## Switch

- [ ] **SW1 — Espaço entre controle e rótulo.** Esperado: `gap` de `--slotted-control-gap-<densidade>` (8px em `md`), o mesmo valor usado por `Checkbox` e `Radio`, para que os três alinhem em um formulário.

---

## Tabs

- [ ] **T2 — Painel transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: na cena `content`, `[data-part='panel']` mede 599px em 222px nos três esquemas. Esperado: mesma regra de `#Alert:2`.
- [x] **T1 — `IconButton` de overflow/scroll desalinhado e grande.** Ver R2. Esperado: partes internas `[data-part='scroll-start']` e `[data-part='scroll-end']` com altura igual à altura da aba, largura de 24px a 28px, glifo `chevron-left`/`chevron-right` em `--slotted-control-icon-size-<densidade>`, sem borda, fundo com gradiente para a superfície da barra de abas (máscara de fade de 16px) e `hover` em `secondary-subtle-hover`. Visíveis apenas quando há overflow no respectivo lado, calculado por `scrollLeft` e `scrollWidth`.
- [ ] **T3 — Trilho vazio do controle de paginação oculto.** Introduzido por T1: o controle de paginação de um lado sem overflow fica `visibility: hidden` e mantém a coluna de 24px, para a lista não se mover sob o ponteiro (mesma escolha do MUI `TabScrollButton`); na cena `dismissible` do harness a lista começa 24px mais o gap depois da borda enquanto está no início. Decidir entre manter o trilho ou colapsar a coluna (`display: none`) aceitando o deslocamento da lista na primeira rolagem.

---

## Tag

- [ ] **TG1 — Cena `group` do harness colapsa a 0px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: `div[data-ui='tag'][data-part='group']` mede 0px de altura nos três esquemas a 420px e 720px, embora a captura mostre as tags. Verificar se o grupo é `display: contents` ou se o audit mede o elemento errado; se o grupo não tem caixa própria, o audit deve medir os filhos.

---

## TextField, Textarea, NumberField, CurrencyField

- [x] **TF1 — Botões de limpar e ícones internos.** Ver R2 e `#Select:3`. Aplicar a mesma parte interna e as mesmas medidas em todos os campos. Os quatro componentes devem compartilhar o CSS de `Field` para adorno inicial/final (`[data-part='adornment-start']`, `[data-part='adornment-end']`) e para o botão de limpar.

---

## Toast

- [x] **TO1 — `#Alert:1`.** Aplicar R5.
- [x] **TO2 — Conteúdo transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G3, sem alteração de layout: na cena `content`, `[data-part='content']` mede 183px dentro de 149px disponíveis nos três esquemas. Esperado: mesma regra de `#Alert:2`.

---

## Tooltip

- [ ] **TT1 — Tooltips abertos ao carregar a página de docs.** URL de referência: `http://devserver.local:6006/?path=/docs/components-tooltip--reference&globals=scheme:dark;density:dense`. Verificar se as stories passam `open` ou `defaultOpen` para fins de captura visual. Se sim, a página de docs deve renderizar essas stories com `open` apenas quando a story está isolada (`viewMode === 'story'`), ou a story com `open` deve ser marcada `parameters.docs.disable`. Se não houver `open` nas stories, é um defeito: `presence` ou o positioner está montando a camada no `mount` sem `pointerenter`. Testar em `tooltip.stories.test` que nenhuma camada existe após o mount da página de docs sem interação.

---

## Ordem de execução recomendada

1. `(S) SL1` e `P1` — positioner. Bloqueia `Select`, `Combobox`, `Menu`, `Popover`, `Tooltip`.
2. `DG3` — presence. Bloqueia todas as animações (R7).
3. `DG1`/`DR1` — dismissable-layer.
4. `R3` — anel de foco.
5. `R4` — geração de glifos.
6. `R1` — remoção de rails (`LI1`, `LB1`, `LB2`).
7. `R2` — partes internas em vez de `Button` (`G1`, `BC1`, `T1`, `TF1`, `SL3`).
8. `R5` — ícone de status (`AL1`, `TO1`, `F1`, `IM1`).
9. `CK1`–`CK5` — checkbox e radio; depois `C1` e `LI2`.
10. `R6`/`CB6` — componente de destaque.
11. Demais itens por componente.
