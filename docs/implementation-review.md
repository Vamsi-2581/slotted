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

Limite de alcance — onde um glifo de tom não entra. R5 diz como um glifo se compõe com um título; estas três faixas dizem onde ele não deve existir.

1. Um glifo de tom cabe onde há um título e a mensagem é um evento isolado na página: `Alert`, `Toast`, `AlertDialog`.
2. Um glifo de tom não cabe numa região pequena e repetível. A mensagem de um `Field` aparece sob cada campo de um formulário; dez campos com erro dão dez ícones de `1em` empilhados na vertical, e o que era para chamar atenção vira textura. O tom ali é dito pela cor e pelo peso do texto, que F1 assentou, e por mais nada. Isto revoga a metade de F1 que fez `messageMark: "glyph"` o padrão de `field` e de `field-group`.
3. Um glifo de tom não cabe sozinho numa superfície vazia como assinatura de um estado. Um triângulo ou uma exclamação de 16 a 48px pousado acima de um título, sem relação geométrica com nada, é o padrão que R5 existe para proibir. A avaliação que esta regra mandava fazer em `ResultState` está feita: o glifo sai. Um estado vazio é título mais descrição mais ação; se precisar de imagem, é uma ilustração desenhada para o espaço, não um ícone de tom ampliado.

Critério de aceite: captura nos três esquemas mostra o glifo opticamente alinhado à primeira linha do título e com o mesmo peso visual do texto, onde a primeira faixa o admite.

### R6 — Destaque de texto (match de filtro) é um componente compartilhado

Ver `#Combobox:6`. O componente resultante deve ser usado por `Combobox`, `Select` com filtro, `Listbox` com filtro, `Menu` com busca e qualquer futuro campo de busca.

### R7 — Movimento

- Entrada de overlays ancorados (`Select`, `Combobox`, `Menu`, `Popover`, `Tooltip`): `opacity 0→1` mais `translateY(−4px)→0` quando o overlay abre para baixo; `translateY(4px)→0` quando abre para cima. Nunca deslocamento horizontal. Duração `--slotted-duration-short` na saída e `--slotted-duration-medium` na entrada, easing `--slotted-easing-enter`/`--slotted-easing-exit`.
- Nenhuma transição anima escala numa caixa que contém texto ou que hospeda layout. Escalar uma caixa de texto reamostra o texto e todo o movimento: as letras tremem e a composição parece deslocar-se. Escala continua sem texto dentro — um anel de pulso, um ponto, um polegar —, e é essa a distinção que CK6 já aplicou ao revogar o `scale` da marca do checkbox e manter o do ponto do radio. Onde a escala era o único sinal de um estado, o substituto é `opacity`, `translate` ou mudança de superfície; nenhum estado fica sem sinal.
- Entrada de `Dialog`: backdrop `opacity 0→1`; painel `opacity 0→1`, sem transform nenhum. Um painel centrado não tem de onde vir, e uma caixa de texto movida por fração de pixel é reamostrada em cada frame — o mesmo defeito que a escala causava, medido em DG4: onze dos doze frames do percurso caíam em posição fracionária. Os overlays ancorados mantêm o passo de 4px: são caixas pequenas cujo movimento diz de que lado a camada abriu.
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
- [x] **G6 — `pnpm typecheck` falha na primeira execução após `turbo run verify`.** Observado em DG3, G2 e LB2: logo após `turbo run verify` (build do React), `tsc --build tsconfig.base.json` reporta erros circulares em toda `*.stories.tsx` (`referenceScenes` implicitly any, `Story` circularly references itself) e a segunda execução passa sem alteração. Causa provável: estado incremental (`.tsbuildinfo`) escrito pelo build do React com `dist` como saída e lido pelo typecheck da raiz. Esperado: `pnpm check` determinístico após qualquer build; separar os `tsbuildinfo` dos dois modos ou excluir `dist` das referências do typecheck.
- [x] **G5 — `tools/harness/audit.mjs` conta `script` e `style` como parte colapsada.** Observado durante G4, sem alteração de layout: nas cenas `states` de `Checkbox` e `Collapsible` e `track`/`variant` de `Tabs`, o audit reporta `collapsed 0px inside a 446px stage` para elementos `script` e `style` do fragmento. Esperado: o audit ignora elementos não renderizados (`script`, `style`, `template`) ao medir o palco.
- [x] **G7 — `tools/harness/audit.mjs` mede o eixo do glifo contra a caixa das palavras, não contra a primeira linha.** Observado durante AL1, sem alteração de layout: em `alert` e `toast` o irmão com texto do `[data-part='icon']` é o `content` (título mais descrição), e `Range.getClientRects()` sobre esse elemento devolve a caixa inteira do título (39px quando quebra em duas linhas), não a sua primeira linha; o audit reporta `off-axis 9.75px` para um glifo que a sonda `tools/harness/out/review-loop/al1/probe.mjs` (Range sobre o primeiro nó de texto) mede a 0.25px do centro da primeira linha. Em `result-state` a reach `section`/`page` põe o glifo acima do título por desenho e o audit reporta o mesmo achado. Esperado: `firstLineOf` desce até o primeiro nó de texto do irmão e mede a primeira linha dele; um glifo em linha própria acima do texto (`grid-row` distinta) não é medido.
- [x] **G8 — `overflow-clip-margin` não aceita `calc()` com `var()` no Chrome.** Observado durante CK3, sem alteração de layout: em Chrome 150, `overflow-clip-margin: calc((var(--_halo-size) - var(--_size)) / 2)` resolve para `0px` e `CSS.supports('overflow-clip-margin: calc(8px)')` devolve `false`, enquanto `overflow-clip-margin: var(--_halo-size)` resolve; além disso, com `overflow: clip`, o transbordo de um pseudo-elemento posicionado dentro da margem de recorte continua a contar como overflow rolável do ancestral. Esperado: nenhuma folha depende de `overflow-clip-margin` para conter um pseudo-elemento que pende para fora (checkbox e radio-group ancoram o alvo para não pender); registrar a limitação em `docs/token-foundation.md` ou na folha que a reencontrar.
- [x] **G9 — Superfície `accent-subtle` a menos de 1.5:1 do fundo da página em todos os esquemas.** Observado durante B6, sem alteração de tema: `--slotted-tone-accent-subtle-active` (= `--slotted-tone-accent-surface` em `light` e `dark`) mede 1.22:1 contra `--slotted-surface` em `light` (#dbeafe/#ffffff), 1.08:1 em `dark` (#181b22/#131316) e 1.33:1 em `high-contrast` (#d3e0fa/#ffffff); o limiar de 1.5:1 que B6 pede entre a superfície de um toggle ligado e a de um desligado não é alcançável com os tokens que o item nomeia, e o estado é carregado pela aresta `accent-border` (5.17:1, 7.29:1 e 21:1 contra a página) e pelo texto `accent-text`. O mesmo token é a superfície de `selected` em card, list-item, listbox e menu (R1). Esperado: decidir no tema se a superfície de seleção sobe para ≥ 1.5:1 contra a página (em `light` exige L ≤ 0.65, cerca de `#b3d4fc`, mantendo `accent-text` ≥ 4.5:1 sobre ela) — o que move badge, tag e alert, que leem `accent-surface` — ou se o critério de 1.5:1 passa a medir aresta e superfície juntas; registrar em `docs/token-foundation.md`.
- [x] **G10 — `tools/harness/audit.mjs` conta a caixa girada de um elemento em rotação como transbordo.** Observado durante B2 e B4, sem alteração de layout: na cena `states` de `button` em `compact`, o audit reporta `overflows 17px out of 14px` para `span[data-part='start']` e `span[data-part='icon']`, que hospedam o anel de `loading` (14px, `animation: rotate(1turn)`); a caixa envolvente de um quadrado de 14px girado mede até 19.8px na diagonal e o audit a lê como conteúdo maior que o slot. Aconteceu com o anel de borda anterior e com o glifo mascarado de B4. Esperado: o audit ignora o transbordo de um elemento cuja `transform` computada é uma rotação (ou mede a caixa sem transform via `offsetWidth`), como já ignora `script` e `style` (G5).
- [x] **G14 — Camadas abertas para a captura em `popover` e `select`.** A outra metade de G11, que fechou para `menu` e `combobox`. Medido no fim dessa passagem: `popover` mantém 7 `defaultOpen` em `packages/react/src/popover/popover.stories.tsx` e 8 `[open]="true"` em `packages/angular/popover/src/popover.stories.ts`; `select` mantém 9 e 9. Esperado: o mesmo caminho — `isolated(context)` alimentando `defaultOpen` em React e um prop `pictured` alimentando `[open]` em Angular — mais o par de testes de story que `menu` e `combobox` já têm (aberta na story isolada, nenhuma camada montada em `docs`).
- [x] **G12 — `tools/harness/audit.mjs` conta uma tecla de `Kbd` como parte colapsada.** Observado na varredura de G5/G7/G10, sem alteração de layout: 126 achados `collapsed` em `kbd.html`, `kbd[data-ui='kbd'][data-part='root']` medido a 29–37px num palco de 446px. Uma tecla é pequena por desenho, e o piso de 96px do audit pressupõe que um filho do palco é uma demonstração. É o maior bloco de achados que resta depois dos três. Esperado: decidir entre um piso que a cena declara (`data-collapse-floor` no `section` do fragmento), medir o transbordo do conteúdo em vez da largura da caixa (uma caixa que não é menor que o seu conteúdo não colapsou), ou uma lista de famílias intrinsecamente estreitas; escrever o caso em `audit.test.mjs` seja qual for a escolha.
- [x] **G13 — `tools/harness/audit.mjs` conta um descendente posicionado para pender como transbordo.** Observado na varredura de G5/G7/G10, sem alteração de layout: 894 achados `overflows` sobrevivem à correção de G10, 693 deles em `slider`. Sondado: `[data-part='thumb']` reporta `27px out of 16px` porque contém `[data-part='bubble']`, 39px de largura, `position: absolute` com `translate: -50%` sobre um polegar de 16px — pendurado de propósito, como o `[data-ui='badge'][data-part='anchor']` sobre um avatar (51 achados). G10 retirou o transbordo que uma rotação explica; este é o mesmo tipo com uma translação. Esperado: decidir se um descendente fora do fluxo posicionado em relação à caixa é conteúdo que saiu dela ou colocação deliberada, e medir o que sobra; um painel absoluto que escapa do seu contentor tem de continuar a ser reportado.
- [x] **CL1 — Indicador de `Collapsible` e `Accordion` fora do eixo do rótulo.** Descoberto ao limpar o ruído de G7: 87 achados `off-axis` (66 em `collapsible`, 21 em `accordion`), `span[data-part='indicator']` a 9.75px abaixo da linha que anota, nos três esquemas e nas três larguras. Sondado em `collapsible.html`, cena `sizes` a 240px: a marca ocupa 10264.75–10278.75 e a primeira linha do rótulo 10255–10270, ambas na mesma `grid-row` do gatilho, com 9.25px entre os centros. Não é artefato de medição — as duas caixas sobrepõem-se. Esperado: o indicador alinha pelo centro da primeira linha do rótulo, pela regra de R5, e não pelo centro da linha da grelha; medir `getBoundingClientRect()` do indicador contra a primeira linha do rótulo nas três densidades.
- [x] **SI1 — Ponto de `StatusIndicator` 1.25px abaixo da linha do rótulo.** Descoberto ao limpar o ruído de G7: 18 achados `off-axis` em `status-indicator.html`, cena `bare` e outras. Sondado: o ponto ocupa 5150–5159 (9px) e a primeira linha do rótulo 5145.75–5160.75 (15px), centros a 5154.5 e 5153.25 — 1.25px, contra a tolerância de 1px do audit. É o menor desvio que o audit reporta e está no limiar. Esperado: decidir entre corrigir o alinhamento (o ponto centra no meio da banda de caixa alta e da banda de x, como `docs/build-briefing.md` fixa uma marca ao lado de uma linha) ou registar que 1.25px num ponto de 9px está dentro do que a assimetria de uma fonte explica, e medir qual dos dois.
- [x] **G11 — Camadas abertas para a captura também na página de referência das outras famílias.** Fechado para `menu` e `combobox`; `popover` e `select` seguem em G14. Observado durante TT1, sem alteração: as stories de `menu` (todas), `combobox` (`Playground`, `Filtering`, `Autocomplete`, `CustomValue`, `Async`, `Groups`), `popover` (`Playground`, `Sizes`, `Anchor`, `Scrolling`, `Nested`) e `select` montam a camada aberta (`defaultOpen`/`[open]="true"`) para a captura, e a página de referência (`viewMode=docs`) as renderiza abertas ao carregar, como TT1 descreveu para `tooltip`. Esperado: as stories que abrem uma camada para a captura passam a abri-la por `isolated(context)` de `@slotted/storybook-workbench` (TT1), nos dois frameworks, com o mesmo teste de stories (nenhuma camada aberta em `docs`; aberta na story isolada).
- [x] **G16 — Escala animada em caixa com texto.** Ver R7. Varredura de todas as ocorrências de `scale` em `packages/styles/src`, cada uma julgada pela regra e não pela lista: onde a caixa contém texto ou hospeda layout, a escala sai e o estado ganha outro sinal; onde não contém, fica. Ocorrências que saem: `dialog.css` (o painel, `0.98`→`1`, com título, corpo e botões dentro — é o defeito relatado), `toast.css` (a pilha, escala por índice a `0.04`, e as torradas contêm texto), `avatar-group.css` (o realce de hover a `1.06`, e o avatar carrega iniciais), `stepper.css` (o marcador no press, `0.94`, e carrega o número do passo). Ocorrências que ficam: `slider.css` (o polegar a `1.15`), `status-indicator.css` (o anel de pulso a `2.2`), `radio-group.css` (o ponto, `0.6`→`1`, mantido por CK6), `menu.css` (o ponto do item de rádio, tamanho estático), `tabs.css` (a barra do indicador, pseudo-elemento sem texto) e os `scale: -1 1` de `icon`, `link`, `pagination` e `menu`, que são espelhamento em RTL e não movimento. Critério de aceite: guarda em `packages/styles/src` que falhe se uma transição ou animação incluir `scale` numa caixa que contém texto, com as exceções decorativas nomeadas uma a uma, como `focus-ring.test.mjs` e `state-rail.test.mjs` nomeiam as suas; mais a medição no `Dialog` — nenhum frame com a caixa do título em posição fracionária, e a entrada com pelo menos um frame em `opacity: 0`, que `presence` garante desde DG3.
- [x] **G15 — Um glifo mascarado desaparece em `forced-colors`.** (MAOC) Observado durante BC2, medido com `tools/harness/out/review-loop/bc2/forced.mjs`: um glifo desenhado como máscara é pintado por `background-color`, e `forced-colors: active` substitui todo fundo pelo do sistema. A parte `clear` de `text-field` cobre 9.61% da própria caixa com tinta em modo normal e **0.00%** com `forced-colors: active`; `breadcrumb` e `toolbar` mediam o mesmo antes de BC2 acrescentar `forced-color-adjust: none` às suas duas máscaras. O mesmo idioma — `background-color: currentcolor` mais `mask-image` — é usado por `text-field` (`clear`, `reveal`), `checkbox`, `radio-group`, `select`, `listbox`, `combobox`, `menu`, `alert`, `toast`, `result-state` e `field`. Esperado: `forced-color-adjust: none` no pseudo-elemento (ou elemento) que pinta a máscara em toda família que desenha um glifo, e uma guarda em `packages/styles/src` que rejeite uma regra com `mask-image` cuja tinta não seja preservada nesse modo. Medir a percentagem de tinta antes e depois em pelo menos três famílias.

---

## Button e ButtonGroup

- [x] **B1 — Feedback de clique (`:active`).** Estado atual: apenas escurecimento de fundo. Esperado: `transform: translateY(1px)` combinado com remoção da sombra (`--slotted-control-shadow` → `none`) na variante `solid`; nas variantes `outline` e `ghost`, apenas a mudança de superfície para `*-active`. Duração da transição de `:active` igual a 0 na entrada (resposta imediata ao press) e `--slotted-duration-short` na saída. Referências para comparação: Primer (`transform: translateY(1px)` no press), Radix Themes (`filter: brightness` sem deslocamento). Escolher a primeira.
- [x] **B2 — Hover por escurecimento.** Estado atual: `hover` escurece a superfície da variante `solid`. Esperado: `solid` clareia em 4% a 6% de luminosidade (`color-mix(in oklch, var(--tone-solid), white 6%)`) em `light` e clareia em 8% em `dark`; `outline` e `ghost` recebem superfície `secondary-subtle-hover`. A mudança é apenas de `background-color`, 120ms, `ease-out`. Os tokens `--slotted-tone-*-solid-hover` em `theme.json` devem ser recalculados por esta regra, não ajustados por componente.
- [x] **B3 — Variante `unavailable` idêntica a `solid secondary`.** Esperado: `unavailable` usa superfície `secondary-subtle` (não `solid`), texto em `--slotted-text-muted`, borda `1px` em `--slotted-border-subtle`, `cursor: not-allowed`, sem sombra e sem resposta a `hover`. A diferença para `disabled` é o texto permanecer legível (contraste ≥ 4.5:1) e o controle permanecer focável.
- [x] **B4 — Spinner do `IconButton` em `loading`.** Estado atual: traço fino e desproporcional. Esperado: spinner com `stroke-width` de 2px a 2.5px, diâmetro igual a `--slotted-control-icon-size-<densidade>`, arco de 270° com `stroke-linecap: round`, rotação de 1s linear. O mesmo spinner é usado por `Button` em `loading`. Definir uma vez em `packages/styles/src/button/button.css` ou extrair para `packages/styles/src/spinner` se `Select`/`Combobox` (`#Select:6`) passarem a usá-lo.
- [x] **B5 — Remover a prop `separation`/`gap` de `ButtonGroup`.** Localização: `specs/components/button-group/contract.json:52`, `packages/react/src/button-group/button-group.tsx:47`, `packages/angular/button-group/src/button-group-defaults.ts`, testes correspondentes (`button-group.test.tsx:80`, `button-group.spec.ts:113`) e `packages/styles/src/button-group/button-group.css` (`[data-gap]`). O grupo passa a ter um único modo: botões colados com bordas internas colapsadas e raio apenas nas extremidades. Atualizar `contract.test.mjs`, docs e stories.
- [x] **B6 — Toggle button sem diferença perceptível entre estados.** Esperado: estado `pressed` (`aria-pressed="true"`) usa superfície `accent-subtle`, texto `accent-text` e borda `accent-border`; estado não pressionado é a variante `outline` ou `ghost` normal. Contraste entre as duas superfícies ≥ 1.5:1. `hover` sobre o estado pressionado usa `accent-subtle-hover`, nunca a mesma superfície do `hover` não pressionado.

---

## Alert

- [x] **AL1 — Ícone solto na superfície.** Ver R5. Aplicar em `packages/styles/src/alert/alert.css` (`[data-part='icon']`, grid `auto minmax(0, 1fr) auto`). Afeta `Toast` (`#Toast:1`), `ResultState`, `AlertDialog`, `InlineMessage`, `Field` (`#Field:1`).
- [x] **AL2 — Conteúdo transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G3, sem alteração de layout: na cena `content`, `[data-part='content']` mede 156px dentro de 149px disponíveis nos três esquemas. Esperado: o conteúdo quebra dentro da largura do palco (`min-inline-size: 0` na coluna do grid e `overflow-wrap: anywhere` em título e descrição); nada transborda o palco.

---

## Avatar

- [x] **AV1 — Avatar interativo transborda a própria caixa em 4px.** Observado por `tools/harness/audit.mjs` durante G15, sem alteração de folha (reproduz byte a byte no HEAD anterior): na cena `interactive`, `a[data-ui='avatar'][data-part='root']` mede 24px dentro de 20px em `compact`, nos três esquemas e nas três larguras — 9 achados. Esperado: o alvo de 24px do avatar interativo vem de um pseudo-elemento transparente (a regra de R2), não do crescimento da própria caixa, e a caixa mede o tamanho que a densidade pede.

---

## AvatarGroup

- [x] **AG1 — Avatar em `hover` sem destaque.** Estado atual: apenas deslocamento vertical. Esperado: o avatar sob o ponteiro recebe `z-index` acima dos vizinhos, `outline` de 2px na cor `--slotted-surface` (anel de separação) mais `box-shadow` de elevação nível 1, e `transform: translateY(−2px) scale(1.06)`. Transição de 150ms `ease-out` em `transform` e `box-shadow`. Os vizinhos não se movem. Em `prefers-reduced-motion`, manter apenas `z-index` e `outline`.

---

## Badge

- [x] **BD1 — Offset configurável quando ancorado.** Esperado: tokens `--slotted-badge-anchor-offset-x` e `--slotted-badge-anchor-offset-y` (padrão `0`) aplicados via `translate` no modo ancorado. Expor como prop `offset` (`{ x, y }` em px) no contrato (`specs/components/badge/contract.json`) para React e Angular. Story demonstrando badge sobre `Avatar` circular com offset `{ x: -2, y: 2 }` e sobre `IconButton` quadrado com offset `0`.

---

## Breadcrumb

- [x] **BC1 — Controle de expansão (ellipsis) desalinhado.** Causa: uso de `IconButton` (R2). Esperado: parte interna `[data-part='expand']` com a mesma altura de linha dos itens do breadcrumb, glifo `ellipsis` do Lucide em `--slotted-control-icon-size-<densidade>`, sem borda, `hover` com superfície `secondary-subtle-hover` e raio `--slotted-radius-xs`. Alinhamento vertical pela linha de base dos itens, não `align-items: center` sobre um botão mais alto.
- [x] **BC2 — Glifo `ellipsis` do Lucide no controle de expansão.** BC1 pede o glifo `ellipsis` do Lucide; `theme.json` não tem `--slotted-icon-ellipsis` e o token não pôde ser adicionado na sessão de G1 (theme e tokens reservados a outra sessão). O controle segue desenhando U+2026 como texto no tamanho do trail (decisão registrada em `breadcrumb.css`), o que é o que o alinha à linha de base. Esperado: adicionar `ellipsis` a `packages/themes/default/src/glyphs.json` (R4), trocar o texto pela máscara em `--_icon-size` em `breadcrumb.css` e em `toolbar.css` (`[data-part='overflow']`, mesma decisão), e atualizar `breadcrumb.styles.test.mjs` e `toolbar.styles.test.mjs`. Decidir antes se a regra 3 de `docs/token-foundation.md` (U+2026 não é ícone) é mantida.

---

## Card

- [x] **C1 — Variantes com `Checkbox`/`Radio` mal posicionadas.** Dependente de `#Checkbox:1` e `#Checkbox:5`. Após a refatoração dos controles, o card selecionável deve alinhar o controle à primeira linha do título (mesma regra de R5) e usar `gap` de `--slotted-space-3`. O card inteiro é o alvo de clique; o controle é apenas o indicador. Estado `selected` do card usa borda `accent-border` de 1px mais superfície `accent-subtle`, sem rail (R1).

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
- [x] **CK2 — Espaço entre label e descrição na variante card.** Esperado: `--_description-gap` igual a `--slotted-space-1` (4px) na variante card. Verificar em `checkbox.css:74` o cálculo `max(0px, var(--slotted-space-3) - var(--_label-slack))`, que em `card` produz espaço acumulado com o padding do card.
- [x] **CK3 — Controles curtos demais em densidade baixa.** Em `compact` e `dense`, a caixa não deve ficar abaixo de 14px. A altura da linha do label define a altura do item; a caixa mantém 14px a 16px e o alvo de toque de 24px vem do halo, não da redução da caixa.
- [x] **CK4 — Centralização do glifo variando por densidade.** Causa provável: arredondamento de `calc()` com valores em `rem` produzindo subpixel. Esperado: glifo posicionado por `inset` percentual dentro de uma caixa de tamanho inteiro em px; testar `getBoundingClientRect()` do glifo contra o da caixa em todas as densidades (diferença de centro ≤ 0.5px).
- [x] **CK5 — Redesenho do radio.** Esperado: círculo de 16px em `md` (14px `sm`, 18px `lg`), borda 1.5px em `--slotted-border-strong`; `checked`: borda 5px a 6px em `accent-solid` (o ponto interno é o fundo da superfície visto pelo furo, sem elemento extra) ou ponto interno de 8px em `accent-solid` sobre fundo da superfície. Mesmo halo de `hover`, mesmo anel de foco, mesma transição de CK1. Alinhamento label/descrição idêntico ao checkbox.

- [x] **CK6 — Marca do checkbox: desenho, ancoragem e movimento de entrada.** As duas marcas (check e traço de indeterminado) estão mal desenhadas, mal posicionadas e mal alinhadas dentro da caixa, e a transição de entrada tem defeito visível. A decisão de CK1 ("o glifo entra com `transform: scale(0.6)→1`") fica revogada: `scale` faz a marca crescer a partir do centro geométrico da caixa e não do traço, e o erro de posicionamento fica evidente durante o movimento. Esperado: movimento que percorre o traço — `stroke-dashoffset` do path do check e escala no eixo inline apenas para o traço de indeterminado — ou opacidade pura quando o percurso não couber no orçamento de movimento do tema. Reancorar as duas marcas no mesmo centro óptico, com a mesma folga até a borda da caixa, nas quatro densidades e nos dois estados. Critério de aceite: centro do bounding box da marca contra o centro da caixa com diferença ≤ 0.5px nas quatro densidades, para `checked` e `indeterminate`; nenhum frame da transição com a marca ultrapassando a caixa; `prefers-reduced-motion: reduce` mantém apenas a opacidade. Medir e registrar os números.
- [x] **CK7 — Halo de hover visível apenas em `light`.** A sombra circular atrás da caixa, introduzida por CK1 como tinta em `box-shadow` de um pseudo-elemento, é invisível no esquema `dark` e provavelmente também em `high-contrast`. Causa provável: a cor sai de um token de tom que não separa do fundo em `dark`; a correção é na origem (tom/tema), não uma exceção por esquema na folha. Critério de aceite: contraste medido entre o halo e a superfície sob ele em `light`, `dark` e `high-contrast`, com o mesmo gesto perceptível nos três; capturas dos três esquemas em `hover`. (MAOC — `RadioGroup`)

- [x] **CK8 — Trecho `radio-group-theming` cita dois tokens removidos.** Observado durante CK6, sem alteração de layout: `packages/react/src/radio-group/radio-group.docs.ts` e `packages/angular/radio-group/src/radio-group.docs.ts` mostram `--slotted-radio-group-checked-background` e `--slotted-radio-group-mark-inset`, que CK5 retirou da folha e do contrato; `radio-group.tokens.json` só declara as variantes `tile-*` do primeiro. Um leitor que copie o trecho não muda nada. Esperado: o trecho cita tokens que a folha lê (por exemplo `--slotted-radio-group-checked-border-color` e `--slotted-radio-group-halo-color`), e uma guarda compara os tokens citados nos trechos `*-theming` com `<família>.tokens.json`.
- [x] **CK9 — Tinta dos glifos não centrada no viewBox.** Observado durante CK6, medido: a tinta do `--slotted-icon-check` (Lucide `check`, `stroke-width` 3, tampas redondas) ocupa y de 4.5 a 18.5 nas 24 unidades do viewBox, com centro a 11.5 e não a 12 — meia unidade acima do meio, que no checkbox é 0.208 | 0.250 | 0.292px nos três passos e é todo o resto da medição de CK6. O mesmo glifo é o indicador de `select`, `listbox`, `combobox` e `menu`, onde a máscara é centrada na caixa da mesma maneira. Esperado: o gerador de R4 (`scripts/generate-icon-glyphs.mjs`) centra a caixa da tinta de cada glifo no viewBox antes de emitir o data URI, e `scripts/verify-token-foundation.test.mjs` passa a comparar a tinta centrada e não o SVG bruto do Lucide. Decidir antes se centrar altera o alinhamento óptico de algum glifo que hoje depende do enquadramento do Lucide. (MAOC)

Critério de aceite para a seção: story de comparação lado a lado `Checkbox` e `Radio` em quatro densidades e três esquemas, com estados `default`, `hover`, `focus-visible`, `checked`, `indeterminate`, `disabled`, `invalid`.

---

## Select

Localização: `packages/styles/src/select/select.css`, `packages/react/src/select`, `packages/angular/select/src`, `packages/core/src/positioner/positioner.ts`.

- [x] **SL1 (S) — Overlay desloca para a direita continuamente ao passar o mouse pelas opções.** Reproduz quando o `Select` está em contêiner sem padding. Causa raiz está em `packages/core/src/positioner` (`createPositioner`), compartilhado por `Combobox`, `Menu`, `Popover`, `Tooltip`. Hipóteses a testar, nesta ordem:
  1. O positioner lê `getBoundingClientRect()` do overlay já transformado (`translate`) e soma o deslocamento anterior ao novo cálculo (acumulação). Correção: medir com `transform: none` ou usar `offsetWidth`/`offsetHeight` mais posição do âncora.
  2. `hover` altera a largura de uma opção (por exemplo, `font-weight` ou scrollbar), disparando `ResizeObserver` do overlay, que reposiciona com base na largura já deslocada.
  3. O `Popover` de largura igual ao controle (`#Popover:1`) mede a largura do controle incluindo borda em um caso e excluindo em outro.
     Ação obrigatória: escrever teste em `positioner.test.ts` que simula 10 reposicionamentos consecutivos com o mesmo âncora e verifica que o resultado é idêntico em cada iteração (`x`, `y` estáveis). O teste falha antes da correção e passa depois. Verificar depois nos quatro componentes consumidores.
- [x] **SL2 — Direção da animação de abertura.** Estado atual: entrada horizontal (esquerda para direita). Esperado: ver R7 (vertical, na direção da abertura). Corrigir em `select.css` e no ponto de origem compartilhado se a animação vier de `popover.css` ou de `presence`. (MAOC)
- [x] **SL3 — Ícones à direita (clear, chevron) pequenos em `compact` e `dense`.** Esperado: o glifo usa `--slotted-control-icon-size-<densidade>` com piso de 14px. Em `compact` o controle pode ter 24px de altura e o glifo 14px; nunca abaixo disso. Relacionado a R2 (o botão de clear é parte interna). (MAOC — `Combobox`, `TextField`, `NumberField`, `CurrencyField`)
- [x] **SL4 — Prévia de múltipla seleção "Apple +1".** Esperado: renderizar os valores selecionados como `Tag` compactas (altura igual a `--slotted-control-icon-size-<densidade>` + 4px) dentro do controle, com overflow calculado por `ResizeObserver`: as tags que não cabem colapsam em uma única tag `+N`. Cada tag tem botão interno de remoção (R2). Fallback textual "N selecionados" apenas quando o controle está abaixo de 120px de largura. (MAOC — `Combobox` múltiplo)
- [x] **SL5 — Variante `plain` com sombra.** Localização: `select.css:359` (`[data-variant='plain']`). Esperado: `plain` sem `box-shadow`, sem borda, sem fundo em repouso; `hover` com superfície `secondary-subtle-hover`; `focus-visible` com anel R3. Verificar se `TextField`, `Combobox` e `NumberField` têm a mesma variante e aplicar a mesma regra. (MAOC)
- [x] **SL6 — Estado `loading`.** Decisão: não usar `Loader`/`LoaderScene` com superfície dentro do overlay. Esperado: spinner inline de B4 no lugar do chevron enquanto carrega; dentro do overlay, três linhas de `Skeleton` com a altura de uma opção. (MAOC — `Combobox`)
- [x] **SL8 — Altura da tag no controlo é 24px, não `--slotted-control-icon-size-<densidade>` + 4px.** Introduzido por SL4, medido: a tag da prévia mede 94.31 × 24.00px nas três densidades, porque `tag.css` põe o chão da caixa em `--slotted-target-min` (24px) para o seu botão de remoção continuar a ser um alvo, e `docs/token-foundation.md` nomeia esse botão como o caso que um tema não pode corrigir por conta da família. O item SL4 pede 20 | 18 | 17px. Esperado: decidir entre manter os 24px (o alvo manda) ou descer a caixa para a altura pedida e devolver o alvo por um pseudo-elemento transparente de 24px em `tag.css` (a regra de R2), o que move `tag` inteiro. Medir o alvo resultante nas três densidades.
- [x] **TG2 — Botão de remoção da tag mede 22px na vertical.** Observado durante SL4, medido em `select` com tags `sm`: `[data-part='remove']` mede 24.00 × 22.00px. A largura vem de `max(--slotted-target-min, glifo + 2 × espaço)`; a altura vem de esticar dentro da caixa de conteúdo da tag, que é `--_block-size` (24px) menos duas bordas de 1px. O alvo de WCAG 2.5.8 é 24 × 24. Esperado: a caixa da tag passa a `min-block-size: calc(--slotted-target-min + 2 × --_edge-width)` ou o botão de remoção ganha o alvo por um pseudo-elemento transparente (R2), e `tag.styles.test.mjs` mede os dois eixos. Vale para as três dimensões e as três variantes.
- [x] **SL7 — Indicador desalinhado em opção de duas linhas.** Observado por `tools/harness/audit.mjs` durante SL1, sem alteração de CSS: na cena `long-content`, `[data-part='indicator']` fica 39.25px acima da linha que anota (centralizado no bloco de duas linhas mais descrição). Esperado: indicador alinhado à primeira linha do label, pela mesma regra de R5. (MAOC — `Combobox`)
- [x] **SL9 — A prévia de múltipla seleção está sobreposta aos controlos e sem ar entre as tags.** Sintoma: com vários valores escolhidos, as tags passam por baixo do botão de limpar e do chevron, e encostam umas nas outras. Localização: `packages/styles/src/select/select.css` (`[data-part='tags']`), `packages/react/src/select/select-tags.tsx`, `packages/angular/select/src/select-value.ts`. Estado atual, de SL4 (commit `f545386`): `[data-part='tags']` é irmão do trigger, posicionado sobre a caixa de conteúdo dele com `pointer-events: none` na fila. É esse padrão que produz o defeito — uma fila que paira sobre a caixa não reserva espaço. Esperado: as tags entram no fluxo do controlo, alinhadas ao início, dividindo a linha com o texto; os controlos finais (limpar, chevron, spinner de `loading`) ocupam uma coluna própria e a fila de tags termina onde essa coluna começa, nunca sob ela. Espaço entre tags de um passo da escala do tema, medido, nunca zero. A altura do controlo não muda com o número de seleções: a linha é uma só. O colapso em `+N` que `createCollapse` já entrega fica; o que muda é onde a fila vive. O botão de remoção da tag já está na medida certa desde SL8 e TG2 e sob a guarda `packages/styles/src/inner-control.test.mjs` — não redesenhar a tag, só o arranjo. Critério de aceite: com seis valores escolhidos, nas três densidades e nos três esquemas, nenhuma tag intersecta a caixa dos controlos finais (medido por `getBoundingClientRect`, interseção zero), o espaço entre tags é o valor nomeado, e a altura do controlo é a mesma de um `Select` simples.
- [x] **SL10 — Largura da camada com tags, e a faixa das escolhas dentro do overlay.** Duas correções que vêm com SL9. Sintoma 1: o overlay abre mais estreito que o controlo quando há tags. A largura da camada é a do âncora desde SL1 (`matchWidth`, em `packages/core/src/positioner`), logo o que falha é o que está a ser medido no lugar da raiz do controlo; localização provável em `packages/react/src/select/select-parts.tsx` e `packages/angular/select/src/select.ts`, onde o âncora é escolhido. Critério de aceite: com e sem tags, a largura da camada é a do controlo, diferença ≤ 0.5px. Sintoma 2: com muitas seleções, o que já foi escolhido fica escondido atrás de um `+N` e só é alcançável alargando o controlo. Esperado: os valores escolhidos passam a ter também uma faixa dentro do overlay, no topo, com todas as tags escolhidas e rolagem quando não couberem (altura máxima em torno de duas linhas de tags). A faixa é parte nova no contrato (`specs/components/select/contract.json`), some quando nada está escolhido, e a rolagem é a da faixa e não a da lista de opções. Critério de aceite: com doze valores escolhidos, a faixa rola e a lista de opções continua a rolar de forma independente; a camada mantém a largura do controlo. Desenho, para os dois itens: as tags são as da folha partilhada de `tag`, no passo pequeno; a faixa é separada da lista por uma régua da própria escala de bordas, não por sombra; nada de rail lateral (R1) e nada de animar largura ou altura (R7).

---

## Combobox

Localização: `packages/styles/src/combobox/combobox.css`, `packages/react/src/combobox`, `packages/angular/combobox/src`.

- [x] **CB1 — `#Select:1`.** Mesma causa raiz no positioner.
- [x] **CB2 — `#Select:2`.**
- [x] **CB3 — `#Select:3`.**
- [x] **CB4 — `#Select:4`.** Fechado sem código: o contrato de `combobox` declina `multiple` (`declined.multiple`, defere para `multi-select`), logo não há várias seleções para pré-visualizar nesta família. Registado em `docs/implementation-review-log.md` na entrada de SL4.
- [x] **CB5 — `#Select:6`.**
- [x] **CB6 — Destaque do match do filtro.** Localização: `combobox.css:665` (`[data-part='match']`): `font-weight: 600`, `padding-inline: 0.1em`, `border-radius: 2px`, fundo `accent-surface`. O peso e o padding alteram a métrica da palavra e o trecho destacado parece deslocado. Esperado, extraído para um componente compartilhado (`packages/styles/src/highlight/highlight.css`, parte `[data-ui='highlight']` ou `[data-part='match']` global), consumido por `Combobox`, `Select` com filtro, `Listbox` com filtro e `Menu` com busca (R6):
  - `font-weight: inherit`. `padding: 0`. `border-radius: 0`. `letter-spacing: inherit`.
  - `color: var(--slotted-tone-accent-text)`.
  - `background-color: var(--slotted-tone-accent-surface)` com `box-decoration-break: clone`.
  - Sublinhado de 1px em `accent-border` via `text-decoration: underline` com `text-underline-offset: 2px` e `text-decoration-thickness: 1px`, ou `box-shadow: inset 0 -1px 0 var(--slotted-tone-accent-border)`.
  - Em `data-disabled`: fundo transparente, cor `inherit`, sublinhado mantido.
  - `forced-colors`: `Mark`/`MarkText`, já implementado; preservar.
    Critério de aceite: a largura da string com e sem `<mark>` difere em 0px (testar via `getBoundingClientRect().width` do label com e sem `matchRanges`). (MAOC)
- [x] **CB7 — Valor livre não validado.** Esperado: prop `allowCustomValue` (padrão `false`). Com `false`, ao perder o foco (`blur`) com texto que não corresponde a nenhum item, o campo volta ao último valor válido (ou vazio) e emite `onInputReset`. Com `true`, o texto é aceito como valor. Documentar no contrato e nas stories dos dois frameworks.
- [x] **CB8 — Criação de novo valor.** Esperado: prop `onCreate` (ou `creatable`) que, quando presente e a query não corresponde a nenhum item, renderiza uma opção final `Criar "<query>"` no listbox. Selecioná-la chama `onCreate(query)` e o consumidor decide se adiciona o item à coleção. Modo múltiplo integra com as tags de `#Select:4`. Story obrigatória: input de tags com criação.
- [x] **CB9 — `#Select:7`.**
- [x] **CB10 — Fundo da marca de match invisível em `dark` e `high-contrast`.** Observado durante CB6, medido: `--slotted-tone-accent-surface`, que R6 nomeia como fundo da marca, mede 1.014:1 contra `--slotted-surface-raised` em `dark` e 1.000:1 em `high-contrast` (1.220:1 em `light`); a marca é carregada pela cor do texto (5.49 | 9.56 | 10.00:1 contra o próprio fundo) e pela regra sublinhada (4.24 | 6.78 | 21.00:1), e a banda de tinta não existe em dois dos três esquemas. Mesma causa de CK7: um tom `*-surface` é um fundo e não separa da superfície em que assenta. Esperado: decidir no tema se o fundo da marca passa a um tom que separa nos três esquemas (por exemplo `accent-text` a uma fração de opacidade, como CK7 fez com o halo) ou se a marca assume que a cor e a regra a carregam e o fundo sai da folha `highlight`. Medir o contraste da banda contra `--slotted-surface-raised` nos três esquemas. (MAOC — a folha é partilhada por `combobox`, `select`, `listbox` e `menu`)
- [x] **CB11 (S) — Clicar numa opção não seleciona enquanto se digita.** Sintoma: com texto no campo, clicar numa opção não escolhe nada; só `Enter` escolhe. É defeito grave: o clique é a interação primária da família. Localização provável: `packages/react/src/combobox/combobox-parts.tsx` e `packages/angular/combobox/src/combobox.ts` (`onBlur`), mais `packages/react/src/combobox/combobox-items.tsx` e `packages/angular/combobox/src/combobox-items.ts` (a opção não recusa o press). Causa provável, a confirmar antes de corrigir: o `pointerdown` na opção tira o foco do input, e a resolução de `blur` que CB7 introduziu (commit `0909d09`) resolve o texto contra a coleção e fecha a camada antes de o `click` chegar. Há máquina para isto no repositório — DG1 (commit `b7da057`) fez a pilha da `dismissable-layer` registar onde o `pointerdown` começou, justamente para uma camada que decide no `click` não tratar como press de fora um clique cujo press nasceu dentro do conteúdo, e `packages/react/src/listbox/listbox-parts.tsx` já recusa o press na opção pela razão de `aria-activedescendant`. Reaproveitar um desses caminhos, nunca escrever um terceiro. Esperado: um press numa opção não move o foco para fora do controlo, e o `click` que o segue escolhe. Critério de aceite: clicar numa opção seleciona com a query digitada, em modo simples e múltiplo, nos dois vínculos, com teste que falhe contra o HEAD anterior. Verificar `Select` e `Listbox` pela mesma via.

---

## CurrencyField

Localização: `packages/core/src/number/number.ts`, `packages/react/src/currency-field/currency-field.tsx`, `packages/angular/currency-field/src`.

- [x] **CF1 — Digitação com cursor à esquerda produz `20,00` em vez de `0,02`.** Decisão: o campo opera em modo calculadora. Os dígitos entram sempre pela direita, deslocando o valor para a esquerda (`0,00` → digita `2` → `0,02` → digita `5` → `0,25`). A posição do cursor é ignorada para inserção; o cursor fica sempre no fim. `Backspace` remove o último dígito à direita. Colar substitui o valor inteiro após parse. Escrever testes em `number.test.ts` e `currency-field.test.tsx` cobrindo: cursor no início, cursor no meio, seleção parcial, colar `1.234,56` e `1234.56`.
- [x] **CF2 — Valor vazio.** Decisão: prop `allowEmpty` (padrão `false`). Com `false`, limpar o campo resulta em `0,00` e o valor emitido é `0`. Com `true`, o campo pode ficar vazio e o valor emitido é `null`. Documentar no contrato.

---

## DescriptionList

Localização: `packages/react/src/description-list/description-list.tsx` (labels `copy`, `copyBlocked`).

- [x] **DL1 — Botão de copiar apenas seleciona o texto.** Causa provável: `navigator.clipboard.writeText` rejeitado (iframe do Storybook sem permissão `clipboard-write`, ou contexto não seguro em `http://devserver.local`) e o fallback cai em seleção. Esperado: (1) tentar `navigator.clipboard.writeText`; (2) em falha, usar `document.execCommand('copy')` sobre uma seleção temporária e restaurar a seleção anterior; (3) só se ambos falharem, mostrar o estado `copyBlocked`. Após sucesso, o botão troca o glifo para `check` por 1500ms e anuncia "Copiado" via `aria-live`. Adicionar `allow="clipboard-write"` ao iframe de preview do Storybook (`apps/storybook-*/.storybook/preview-head.html` ou `manager`). O botão é parte interna (R2).
- [x] **DL2 — Placeholder `-` para valor vazio.** Esperado: usar `—` (em dash, U+2014) em `--slotted-text-muted`, com `aria-label` configurável (`labels.empty`, padrão "Sem valor"). Não usar hífen.

---

## Dialog

Localização: `packages/styles/src/dialog/dialog.css`, `packages/core/src/dismissable-layer`, `packages/core/src/presence`.

- [x] **DG1 — Clique no backdrop não fecha.** Verificar `dismissable-layer.ts`: o listener de `pointerdown` fora deve considerar o backdrop como "fora" do painel. Verificar se o backdrop tem `pointer-events: none` ou se está fora da árvore observada. Esperado: `closeOnBackdrop` (padrão `true`) fecha no `pointerup` no backdrop quando o `pointerdown` também ocorreu no backdrop (evita fechar ao arrastar seleção de texto para fora). Testar também `Escape` e o botão de fechar. Story com os três modos e uma story `closeOnBackdrop={false}`.
- [x] **DG2 — Botão de tela cheia.** Esperado: prop `fullscreenToggle` (padrão `false`) que renderiza uma parte interna `[data-part='fullscreen']` (R2) no cabeçalho, alternando `data-fullscreen` no root. Em `data-fullscreen`, o painel ocupa `inset: 0`, sem raio, com transição em `transform`/`opacity` (não em `width`/`height`). Prop controlada `fullscreen` e evento `onFullscreenChange`.
- [x] **DG3 — Animações ausentes.** Fato verificado: `dialog.css:172-181` e `268-292` já declaram transições de `opacity` no backdrop e no painel condicionadas a `[data-open]`. O sintoma indica que `data-open` é aplicado no mesmo frame em que o elemento é montado, sem frame inicial em `opacity: 0`. Esperado: `createPresence` em `presence.ts` deve garantir um frame em `entering` antes de `open` (`requestAnimationFrame` duplo ou `getComputedStyle` forçando reflow). Aplicar R7. Testar em `presence.test.ts` que o status passa por `entering` e que o elemento recebe `data-open` apenas após o primeiro frame. (MAOC — `Drawer`, `Popover`, `Menu`, `Select`, `Combobox`, `Tooltip`, `Toast`)
- [x] **DG4 — A entrada do painel borra o texto, e o backdrop entra seco.** Relatado pelo revisor sobre a folha que G16 deixou (o servidor do Storybook serve esta folha, verificado no módulo servido): durante a entrada, o texto do painel perde definição — o mesmo tipo de defeito que a escala causava, agora com o `translate` de 4px —, e o backdrop aparece de uma vez, sem transição. Duas causas a medir antes de corrigir: um `translate` contínuo põe a camada composta em posições fracionárias e o texto é reamostrado em cada frame; e a camada fechada é `content-visibility: hidden` (`dialog.css`, regra `:not([data-open])`), o que faz o browser saltar a renderização da subárvore — uma subárvore saltada não corre transições, e a sonda de G16 só conseguiu medir a entrada depois de forçar `content-visibility: visible`. Esperado: a entrada do painel não reamostra o texto em nenhum frame, e o backdrop percorre `opacity 0→1` na abertura, medido pela mesma sequência que o produto executa (nó inserido fechado, estilo forçado, `data-open` no frame seguinte). Critério de aceite: ≥ 1 frame do backdrop com `opacity` entre 0 e 1 exclusive na abertura, nos três esquemas; e nenhum frame do painel com a caixa do título deslocada em fração de pixel dentro da composição.

---

## Drawer

Localização: `packages/styles/src/drawer/drawer.css`.

- [x] **DR1 — `#Dialog:1`.** Mesma causa em `dismissable-layer`.
- [x] **DR2 — `#Dialog:3`.** Mesma causa em `presence`.
- [x] **DR3 — Backdrop e painel aparecem sem transição.** Coberto por DR2 e R7: painel entra com `translateX(100%)→0` (lado `end`), `translateX(−100%)→0` (lado `start`), `translateY(100%)→0` (lado `bottom`).
- [x] **DR4 — Borda lateral clara demais em `dark`.** Esperado: a borda do painel usa `--slotted-border-subtle` do esquema `dark`, não um valor fixo. Verificar em `drawer.css` se a borda usa token de esquema ou literal. Em `dark`, a separação entre painel e backdrop deve vir da sombra de elevação nível 3, com borda de 1px em `--slotted-border-subtle` a no máximo 12% de contraste sobre a superfície do painel.
- [x] **DR5 — Redimensionamento sem desempenho e visualmente inadequado.** Referência de comportamento: SAP Fundamental Styles Splitter (https://sap.github.io/fundamental-styles/?path=/docs/sap-design-btp-splitter--docs). Esperado:
  - Alça de 4px (`[data-part='resizer']`) na borda interna, com área de captura de 12px via `::before`. Em repouso, a alça é invisível; em `hover` ou durante o arraste, mostra linha de 2px em `accent-border`. Sem cabo, sem pontos, sem ícone.
  - Durante o arraste, o painel atualiza `inline-size` (ou `block-size`) via `style` direto a cada `pointermove`, sem transição CSS ativa e com `will-change: inline-size` aplicado apenas durante o arraste. Sem `transition` em `inline-size` fora do arraste.
  - `pointer-capture` na alça, `cursor: col-resize`/`row-resize` no `body` durante o arraste, `user-select: none` no documento durante o arraste.
  - Limites `minSize`/`maxSize` em px ou `%`. Duplo clique na alça restaura o tamanho padrão.
  - Teclado: alça focável, setas ajustam em passos de 16px, `Shift+seta` em 64px, `Home`/`End` vão aos limites.
  - Critério de aceite: arraste contínuo mantém ≥ 55 fps no profiler do Chrome com painel contendo 200 itens de lista.
- [x] **DR6 — Modo `inline` transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante DG3, sem alteração de layout: na cena `inline-open`, o `main` mede 94px dentro de 32px disponíveis nos três esquemas. Esperado: em largura estreita o conteúdo ao lado do painel inline não fica abaixo de zero de largura; o painel cede (`min-inline-size: 0` no `main` ou colapso do painel) e nada transborda o palco.

---

## Field

- [x] **F2 — Mensagem de `field` e de `field-group` volta a não desenhar marca.** Ver R5, segunda faixa do limite de alcance. O contrato de `inline-message` hoje só admite `mark` `["glyph", "dot"]`; acrescentar a terceira opção e fazer dela o padrão que o campo pede, começando por `specs/components/inline-message/contract.json` e `specs/components/field/contract.json` com os seus `contract.test.mjs`, depois estilos, React, Angular, stories e docs. A cor de tom e o peso 500 que F1 deu a erro e sucesso ficam — é o que passa a dizer o tom sozinho. `mark='dot'` e `mark='glyph'` continuam disponíveis para quem os peça na página. Critério de aceite: capturas dos três esquemas de um formulário com quatro campos em erro, zero glifos de tom.
- [x] **F1 — Mensagens de descrição e erro.** Esperado: mensagem de descrição sem glifo, apenas texto em `--slotted-text-muted`, tamanho `--slotted-font-size-xs`. Mensagem de erro com glifo `circle-alert` (R4, R5) de `1em`, texto em `--slotted-tone-danger-text` com `font-weight: 500`. Mensagem de sucesso segue o padrão de erro com tom `success`. Aplicar em `packages/styles/src/field/field.css`.

---

## InlineMessage

- [x] **IM1 — Avaliar remoção.** O componente sobrepõe `Alert` (variante `subtle`, sem título) e `Field` (mensagem). Decisão pendente após F1 e AL1: se `Alert` com `size="sm"` e sem título cobre o caso de uso, remover `InlineMessage` do contrato, dos pacotes e das docs, com registro em `docs/decisions/`. Se mantido, redesenhar segundo R5 e reutilizar o CSS de `Alert` por composição.

---

## Kbd

- [x] **K1 — Altura varia com o símbolo.** Causa: `line-height` derivado do glifo (símbolos como `⌘` e `⇧` têm ascendente diferente). Esperado: `block-size` fixa por densidade (`1.25rem` em `md`), `line-height: 1`, conteúdo centralizado por `display: inline-grid; place-items: center`, `font-variant-numeric: tabular-nums`. Testar com `⌘`, `⇧`, `Enter`, `A`, `↑` na mesma linha: todas as caixas com a mesma altura (diferença 0px).

---

## ListItem

Localização: `packages/styles/src/list-item/list-item.css`, `docs/superpowers/specs/2026-09-04-list-and-list-item-self-assessment.md`.

Componente inteiro requer passada de polimento. Ordem de execução: LI1 → LI2 → LI3.

- [x] **LI1 — Rails laterais.** Ver R1. Remover `[data-current]::after` e variáveis associadas. `current` passa a usar superfície `secondary-subtle`; `selected` usa `accent-subtle` mais texto `accent-text`.
- [x] **LI2 — Checkbox desalinhado.** Dependente de CK1. Após CK1, o checkbox da linha alinha pelo centro vertical da primeira linha de texto (`align-self: start` mais `margin-block-start: calc((var(--_line-height) * var(--_font-size) - var(--_size)) / 2)`). A coluna do controle tem largura fixa igual ao tamanho do controle mais `--slotted-space-2`.
- [x] **LI4 — Linha transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G2, sem alteração de layout (reproduz no HEAD anterior): na cena `anatomy`, `li[data-ui='list-item']` e o `ul` mede 266px em 240px nos três esquemas. Esperado: mesma regra de `#Alert:2` — a linha cede (`min-inline-size: 0` no conteúdo, `actions` quebra para a própria linha) e nada transborda o palco.
- [x] **LI3 — Passada de consistência.** Verificar contra a lista: altura de linha por densidade (32px `dense`, 36px `default`, 40px `comfortable`, 28px `compact`); padding inline único por densidade; ícone inicial em `--slotted-control-icon-size-<densidade>` monocromático (sem círculo tintado); texto secundário em `--slotted-text-muted` na linha abaixo com `gap` de 2px; ações à direita como partes internas (R2); separador entre linhas de 1px em `--slotted-border-subtle` apenas quando `divided`. Cinco aparências distintas em cada linha interativa: `hover`, `focus-visible`, `active`, `selected`, `disabled`. `hover` e `selected` com superfícies diferentes.

---

## Listbox

Localização: `packages/styles/src/listbox/listbox.css`.

- [x] **LB1 — Rail lateral no estado `selected`.** Ver R1. Remover a barra dentro de `[data-part='option'][data-selected]` (`listbox.css:416`). Estado `selected` usa superfície `accent-subtle`, texto `accent-text` e o `[data-part='indicator']` já existente (`listbox.css:499`).
- [x] **LB2 — Múltiplos itens selecionados colados formam ondulação nas laterais.** Causa: cada opção tem `border-radius` próprio e as superfícies adjacentes não se fundem. Esperado: opções com `border-radius` apenas nas extremidades de um bloco contíguo de seleção, via seletores `[data-selected] + [data-selected]` (remove raio superior do segundo) e `:has(+ [data-selected])` (remove raio inferior do primeiro). Alternativa quando `:has` não é aceitável: `gap` de 2px entre opções e raio em todas, evitando a fusão. Escolher a primeira. Verificar em `Select`, `Combobox` e `Menu` múltiplos. (MAOC)

---

## Menu

- [x] **M1 — Animação de abertura.** Aplicar R7. Submenus entram com `translateX(−4px)→0` (na direção de abertura lateral), com a mesma duração.
- [x] **M2 — Submenus abertos por padrão e sem separação.** Esperado: submenu fechado até `hover` com atraso de 150ms ou `ArrowRight`/`Enter` no item pai. Ao abrir, o submenu é posicionado pelo positioner com `offset` de 4px em relação à borda do menu pai (não colado) e sobreposição vertical alinhada ao item pai (o primeiro item do submenu alinha com o item que o abriu). Verificar nas stories se `defaultOpen` está sendo passado apenas para demonstração; se sim, mover para uma story dedicada `SubmenuOpen` e manter as demais fechadas.
- [x] **M3 — Cena `scrolling` do harness colapsada.** Observado por `tools/harness/audit.mjs` durante SL2, sem alteração de layout: na cena `scrolling` de `menu.harness.html` a raiz `[data-ui='menu']` mede 91px (`comfortable`) e 81px (`compact`) dentro de um palco de 446px, abaixo do piso de 96px do audit; o menu é `inline-size: max-content` e os rótulos da cena (`Inbox`, `Archive`, `Drafts`) são curtos. Esperado: decidir entre um `min-inline-size` de família para o menu (as demais cenas medem acima do piso) ou rótulos mais longos na cena; registrar a escolha.

---

## Popover

- [x] **P1 — Largura igual ao controle desalinhada.** Relacionado a `#Select:1` (positioner). Causa provável: largura medida por `offsetWidth` do controle enquanto a posição usa `getBoundingClientRect().left` com borda incluída, ou o `transform` de entrada (`#Select:2`) aplica deslocamento horizontal residual. Esperado: `matchWidth` usa `getBoundingClientRect().width` do âncora e a posição `x` usa `getBoundingClientRect().left` do mesmo retângulo, na mesma leitura. Teste em `positioner.test.ts`: com `matchWidth`, `overlay.left === anchor.left` e `overlay.width === anchor.width`, tolerância 0px.
- [x] **P2 — Harness transborda a 240px.** Observado por `tools/harness/audit.mjs` durante SL1, sem alteração de CSS: nas cenas `width` e `content` o painel mede 248px dentro de um palco de 240px. Esperado: o painel respeita `--slotted-positioner-available-width` e a largura do palco em todos os esquemas.

---

## ResultState

- [ ] **RS1 — `ResultState` deixa de desenhar o glifo de tom.** Ver R5, terceira faixa do limite de alcance. `packages/styles/src/result-state/result-state.css` mapeia um glifo por estado (`inbox`, `search-x`, `circle-question`, `circle-alert`, `lock`, `cloud-off`, `circle-check`), pintado por `mask-image`. Tirar o glifo e reconstruir o estado como título, descrição e ação, com o espaço vertical redistribuído — não deixar o buraco onde o ícone estava. A prop de mídia que a folha já expõe (`--slotted-result-state-media`) continua a ser o caminho de quem quiser pôr uma ilustração própria; documentar isso como o substituto. Critério de aceite: capturas dos três esquemas com zero glifos de tom e nenhuma faixa de espaço vazio deixada pela remoção.

---

## Slider

- [x] **SR1 — Borda da trilha preenchida.** Esperado: a trilha vazia tem borda de 1px em `--slotted-border-strong` (borda de input); a trilha preenchida (`[data-part='range']`) tem fundo `accent-solid` e borda de 1px em `accent-solid` (ou `border: none` com a trilha preenchida sobrepondo a borda da vazia por 1px em cada lado via `inset: -1px`). O polegar (`thumb`) sobrepõe as duas. Verificar em `packages/styles/src/slider/slider.css`.
- [x] **SR2 — A banda transborda 20px da raiz.** Descoberto ao fechar G13, sem alteração de folha: `[data-part='control']` é `inline-size: 100%` com `box-sizing: content-box` e `padding-inline: calc(var(--_thumb-size) / 2)`, logo mede 260px dentro de uma raiz de 240px — 262px em `lg` — nas três larguras e em todas as cenas horizontais (`tools/harness/out/review-loop/g13/control-probe.txt`). A sobra atravessa `[data-ui='stack']` e `[data-ui='field']` até o palco, que rola 8px. É a única causa dos 279 achados que restam em `slider` depois de G13, e o maior bloco que sobra na varredura. Esperado: a banda cabe na raiz — `box-sizing: border-box` no `control`, ou o recuo do polegar fora da largura — e `tools/harness/audit.mjs` fecha `slider.html` em 0 achados nas três densidades.

---

## Stepper

Localização: `packages/styles/src/stepper/stepper.css`, `docs/superpowers/specs/2026-09-03-breadcrumb-pagination-stepper-self-assessment.md`.

- [x] **ST1 — Verificação funcional.** Escrever ou completar testes de story cobrindo: navegação por clique em passo concluído, bloqueio de passo futuro quando `linear`, estados `completed`/`current`/`upcoming`/`error`/`disabled`, teclado (`ArrowLeft`/`ArrowRight`/`Home`/`End`), `aria-current="step"` no passo atual. Ambos os frameworks.
- [x] **ST3 — Itens transbordam o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: nas cenas `content` (155px em 120px), `statuses` (191px em 144px), `panels` e `placement` (335px em 240px), `li[data-part='item']` transborda nos três esquemas. Esperado: mesma regra de `#Alert:2` — `min-inline-size: 0` na coluna e quebra do rótulo dentro da largura do palco.
- [x] **ST2 — Variante `compact` com conectores descentralizados.** Esperado: o conector (`[data-part='connector']`) é uma linha de 1px a 2px posicionada em `top: calc(var(--_indicator-size) / 2)` com `transform: translateY(-50%)`, estendendo-se entre o centro de um indicador e o centro do próximo. Em `compact`, o indicador reduz para 20px e o rótulo vai para baixo do indicador ou some (`labelPlacement="hidden"`); o conector recalcula pelo novo tamanho do indicador. Testar `getBoundingClientRect()` do conector contra o centro do indicador (diferença ≤ 0.5px).

---

## Switch

- [x] **SW1 — Espaço entre controle e rótulo.** Esperado: `gap` de `--slotted-control-gap-<densidade>` (8px em `md`), o mesmo valor usado por `Checkbox` e `Radio`, para que os três alinhem em um formulário.
- [x] **SW2 — Linha do Switch mais alta que a de Checkbox e Radio.** Observado durante SW1, sem alteração de layout: `switch.css` mantém `min-block-size: 24px` na raiz e na label mais a folga `--_label-slack`, o modelo que CK3 retirou de checkbox e radio; uma linha de Switch de uma linha mede 24px e as de Checkbox e Radio 19.5px em `md` (Storybook React, `--sizes`), e no harness (cena `sizes`, com descrição) 28.5–30px. Esperado: a linha é a altura da linha da label (a pílula de 22px define a linha quando é mais alta que o texto), o alvo de 24px é o `control` esticado sobre a pílula, e a descrição fica a `--slotted-space-3` da label como em checkbox.

---

## Tabs

- [x] **T2 — Painel transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: na cena `content`, `[data-part='panel']` mede 599px em 222px nos três esquemas. Esperado: mesma regra de `#Alert:2`.
- [x] **T1 — `IconButton` de overflow/scroll desalinhado e grande.** Ver R2. Esperado: partes internas `[data-part='scroll-start']` e `[data-part='scroll-end']` com altura igual à altura da aba, largura de 24px a 28px, glifo `chevron-left`/`chevron-right` em `--slotted-control-icon-size-<densidade>`, sem borda, fundo com gradiente para a superfície da barra de abas (máscara de fade de 16px) e `hover` em `secondary-subtle-hover`. Visíveis apenas quando há overflow no respectivo lado, calculado por `scrollLeft` e `scrollWidth`.
- [x] **T3 — Trilho vazio do controle de paginação oculto.** Introduzido por T1: o controle de paginação de um lado sem overflow fica `visibility: hidden` e mantém a coluna de 24px, para a lista não se mover sob o ponteiro (mesma escolha do MUI `TabScrollButton`); na cena `dismissible` do harness a lista começa 24px mais o gap depois da borda enquanto está no início. Decidir entre manter o trilho ou colapsar a coluna (`display: none`) aceitando o deslocamento da lista na primeira rolagem.

---

## Tag

- [x] **TG1 — Cena `group` do harness colapsa a 0px.** Observado por `tools/harness/audit.mjs` durante G4, sem alteração de layout: `div[data-ui='tag'][data-part='group']` mede 0px de altura nos três esquemas a 420px e 720px, embora a captura mostre as tags. Verificar se o grupo é `display: contents` ou se o audit mede o elemento errado; se o grupo não tem caixa própria, o audit deve medir os filhos.

---

## TextField, Textarea, NumberField, CurrencyField

- [x] **TF1 — Botões de limpar e ícones internos.** Ver R2 e `#Select:3`. Aplicar a mesma parte interna e as mesmas medidas em todos os campos. Os quatro componentes devem compartilhar o CSS de `Field` para adorno inicial/final (`[data-part='adornment-start']`, `[data-part='adornment-end']`) e para o botão de limpar.

---

## Toast

- [x] **TO1 — `#Alert:1`.** Aplicar R5.
- [x] **TO2 — Conteúdo transborda o palco a 240px.** Observado por `tools/harness/audit.mjs` durante G3, sem alteração de layout: na cena `content`, `[data-part='content']` mede 183px dentro de 149px disponíveis nos três esquemas. Esperado: mesma regra de `#Alert:2`.

---

## Tooltip

- [x] **TT1 — Tooltips abertos ao carregar a página de docs.** URL de referência: `http://devserver.local:6006/?path=/docs/components-tooltip--reference&globals=scheme:dark;density:dense`. Verificar se as stories passam `open` ou `defaultOpen` para fins de captura visual. Se sim, a página de docs deve renderizar essas stories com `open` apenas quando a story está isolada (`viewMode === 'story'`), ou a story com `open` deve ser marcada `parameters.docs.disable`. Se não houver `open` nas stories, é um defeito: `presence` ou o positioner está montando a camada no `mount` sem `pointerenter`. Testar em `tooltip.stories.test` que nenhuma camada existe após o mount da página de docs sem interação.

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

---

## FIM

Todos os itens deste documento estão `[x]`. Nenhum ficou `[!]`.

O que a revisão registrou ao longo das suas sessões e continua aberto — nada disto é um item, e nada disto é resolvível por esta máquina:

- **O Storybook Angular (porta 6007) não respondeu em nenhuma sessão.** Toda a verificação Angular da revisão veio de spec, contrato e `turbo run verify`; nenhuma página Angular foi vista. Registrado em 48 entradas de `docs/implementation-review-log.md`.
- **O servidor do Storybook React (porta 6006) serve uma transformação em cache de `packages/styles`.** Medido em DL1 e outra vez em DR5: `?direct` devolve o texto em disco e o módulo que a página importa devolve o anterior. Enquanto o servidor não for reiniciado, a página de referência mostra a folha antiga; as imagens novas da revisão foram verificadas no harness, que é construído a partir do ficheiro. Reiniciar é do revisor.
- **Os dois Storybooks precisam de reinício para ver o que esta revisão acrescentou:** dois glifos novos em `packages/themes/default` (`--slotted-icon-maximize`, `--slotted-icon-minimize`), a parte `[data-part='fullscreen']` de `Dialog` e a folha nova de `Drawer`.
- **Nada foi verificado com leitor de ecrã, com um ecrã real ou com um dispositivo de toque.** Os nomes acessíveis, a ordem de foco e os alvos de ponteiro estão medidos por teste e por geometria; nenhum deles está ouvido.
