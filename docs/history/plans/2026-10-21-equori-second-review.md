# Segunda revisão do equori — triagem e plano

Fonte: 33 findings do projeto consumidor equori (`/home/dreco/findings`), recebidos em 2026-10-21 sobre
`@slotted/react` `0.1.0-beta.9`. Os findings 12 e 18 do ficheiro (tom `info`) são o mesmo; a tabela
conta 32. Base do trabalho: `4fb7c5b5`. Uma fatia fecha até três itens. Cada defeito leva o teste
que falha antes da mudança. React e Angular recebem a mesma mudança de contrato. Verificação
restrita à superfície alterada. Sem subagentes. O conteúdo de `tools/agent-docs/content/` muda
(itens 4, 5, 14, 18): o próximo release corre `pnpm eval:agent-docs` antes de publicar.

## Triagem

| #   | Área                              | Tipo        |
| --- | --------------------------------- | ----------- |
| 1   | build React (`light-dark()`)      | defeito     |
| 2   | dialog, alert-dialog (foco)       | defeito     |
| 3   | core glyph (offsets ópticos)      | melhoria    |
| 4   | agent-docs async-feedback AF-07   | melhoria    |
| 5   | agent-docs waiting-states         | melhoria    |
| 6   | page-header (progress com tabs)   | defeito     |
| 7   | styles (`aria-busy` de ancestral) | defeito     |
| 8   | progress-indicator (compositor)   | melhoria    |
| 9   | data-grid (loading sem linhas)    | melhoria    |
| 10  | empacotamento CSS por família     | melhoria    |
| 11  | chart (slot por fatia na pie)     | funcionalidade |
| 12  | theme (tom `info`)                | funcionalidade |
| 13  | theme (offset do anel de campo)   | melhoria    |
| 14  | agent-docs theme-app (recipe)     | melhoria    |
| 15  | theme (matiz da borda/texto dark) | defeito     |
| 16  | theme (escada de superfícies dark)| melhoria    |
| 17  | theme (data slots seguem o accent)| melhoria    |
| 18  | form (espaço entre campos)        | docs        |
| 19  | text-field e afins (autofill)     | defeito     |
| 20  | button (`ButtonLink` render)      | defeito     |
| 21  | prompt-composer (flash do anel)   | defeito     |
| 22  | prompt-composer (`emphasis`)      | funcionalidade |
| 23  | inline-message (ações)            | funcionalidade |
| 24  | theme (`--slotted-data-N-on`)     | funcionalidade |
| 25  | sparkline (transição de `d`)      | defeito     |
| 26  | entity-picker (virtualização)     | melhoria    |
| 27  | link, list-item (render props)    | defeito     |
| 28  | progress-indicator (reinício)     | defeito     |
| 29  | dialog, drawer (entrada montada)  | defeito     |
| 30  | avatar (fundo atrás da imagem)    | defeito     |
| 31  | entity-picker (docs renderOption) | docs        |
| 32  | entity-picker (spellcheck)        | defeito     |

## Fatias

1. 1, 2, 32.
2. 20, 27, 21.
3. 7, 6, 28.
4. 8, 9, 25.
5. 15, 16, 17.
6. 12, 24, 13.
7. 19, 30, 3.
8. 29, 23, 11.
9. 31, 26, 18.
10. 22, 4, 5.
11. 14, 10.

## Resultado

| #   | Estado |
| --- | ------ |
| 1   | Corrigido: `build.cssTarget` do React (`chrome123`, `edge123`, `firefox128`, `safari17.5`) mantém `light-dark()` e `:dir()` nativos (`styles.css` 1 585 089 → 1 562 982 B). `package-boundary.verify.mjs` falha quando `styles.css` lê `--lightningcss-*` (falha com o bundle da beta.9, passa depois). `segmented-control.browser.test.tsx`: indicador não transparente em light e dark. Angular já mantinha `light-dark()`. |
| 2   | Já corrigido na beta.9 (item 2 da revisão anterior). Teste de regressão em `dialog.browser.test.tsx` (Dialog e AlertDialog, "Duplicated" com `onOpenChange` inline): falha com `dialog-parts.tsx` da beta.8, passa na base. |
| 32  | Corrigido: o input do entity-picker sai com `spellcheck="false"` e `autocorrect="off"`; React `spellCheck`, Angular input `spellcheck` ligam a verificação. Testes React e Angular; contrato atualizado. |
| 20  | Corrigido com o 27: `@slotted/core/selector-key` exporta `DefinedProps<Props>` (membros que admitem `undefined` passam a opcionais sem `undefined`) e `definedProps()` (remove os membros `undefined`). Toda superfície `render` que recebe um link de router usa os dois: `ButtonLink`, `Link`, `ListItemLink`, `BreadcrumbLink`, `CardLink`, `TagLink`, `TableOfContentsLink`, `SideNavigationLink`, `NavigationMenuLink`, `TopNavigationHome`/`Link`/`Action`/`Help`, `PageHeaderBack`. `src/render-props.test.tsx`: as 14 superfícies espalham as props num link tipado `{ href?: string; target?: string; 'data-current'?: string }` (17 erros de tipo antes, 0 depois) e o teste de execução não encontra chave `undefined` (falha antes). `keyedProps` mantém a assinatura: a inferência dos handlers depende dela. |
| 27  | Ver 20. |
| 21  | Corrigido: a raiz do prompt-composer deixa de transicionar `outline-color`; o anel aparece na sua cor no primeiro quadro, como em todo controle com moldura. Teste de estilo falha antes, passa depois. |
| 7   | Corrigido. A chave de seletor da beta.9 já tirava o custo de seletor: `aria-busy` num ancestral de um data-grid de 70 linhas custa 0,1 ms (340 ms relatados na beta.8). O `aria-busy` da própria grade custava 9 ms, 8 deles do `pointer-events: none` herdado no corpo; data-grid e data-list recusam o toque por um véu (`::after` absoluto sobre o corpo/lista), 2,3 ms. `busy.perf.browser.test.tsx` (orçamento 20 ms nos dois toggles), testes de estilo (falham antes) e `data-grid.browser.test.tsx` (o ponto de uma célula ocupada não acerta a célula). As regras `aria-busy` de page-header e event-calendar ficam: medidas em 0,1 ms. |
| 6   | Corrigido no CSS (as duas bindings): o frame do progress tem `order: 1` (última linha, hairline da raiz); com controls sobre tabs, as tabs passam a `order: 2` e o frame fica na linha da pílula. A posição deixa de depender da ordem escrita. `page-header.browser.test.tsx` (duas ordens, com e sem pílula) falha antes, passa depois. Docs, contrato e comentários atualizados. |
| 28  | Corrigido: `paint` conta as pinturas após uma retirada; o indicador do ProgressBar e do ProgressCircle é chaveado por ele (React `key`, Angular `@for … track`), e a varredura recomeça no início. Testes React e Angular falham antes. |
| 8   | Corrigido no CSS (as duas bindings): a barra indeterminada simples ocupa a pista inteira e anima só `translate` e `scale` (keyframes `glide` e `glide-rtl`, origem na borda inicial), com a mesma curva; a barra ondulada mantém os números registados. Movimento reduzido e cores forçadas mantêm as suas regras. `progress-indicator.browser.test.tsx`: as propriedades animadas são todas de compositor e o `currentTime` avança mais de 400 ms durante um bloqueio de 500 ms (16 ms antes). As pontas arredondadas da barra a meio da pista passam a retas, como no MDC. |
| 9   | Feito: `loading: boolean \| 'initial' \| 'refresh'` (`DataGridLoading`, React e Angular). `true` é `initial` enquanto a última resposta desenhada não for vazia e `refresh` depois de um estado vazio: o vazio fica, sem esqueleto, com `aria-busy`. Linhas esvaziadas pelo consumidor ao iniciar um load continuam no esqueleto. Testes React (falham antes) e Angular; docs e contrato. |
| 25  | Corrigido: a transição de `d` só existe sob `[data-animate]` e `prefers-reduced-motion: no-preference`; as bindings escrevem `data-animate` só no render cujo `data` mudou com a caixa igual (React por ref do último desenho, Angular por `linkedSignal`). A raiz tem `min-inline-size: var(--slotted-sparkline-min-inline-size, 6rem)`. Testes de estilo, browser React e spec Angular; o de redimensionamento falha antes. |
| 15  | Corrigido: as derivações dark de `--slotted-tone-accent-border` e `-text` perdem `h: -10`/`h: -13`; os pisos de contraste ficam. Default: `#60a5fa` → `#75a0fc`, `#93c5fd` → `#a2c0ff` (desvios registados em `reproduction.test.mjs` e `docs/token-foundation.md`). Teste de receita: matiz derivado a ≤ 3° para 30/150/230/283° e matiz no ecrã a ≤ 3° para `#7c6cff`; falha antes. Matizes fora de sRGB a essa luminância são recortados pelo ecrã, o que nenhum offset corrige. |
| 16  | Corrigido: dark `surface` 0,188 → 0,155, `surface-sunken` 0,155 → 0,13, `raised` 0,205; `border-subtle` 0,303 → 0,275, `control-border-color` 0,378 → 0,36; tetos de croma pela luminância. `checkScheme` e `themeConformance` exigem raised ≥ surface + 0,04 no dark. Tabela e fronteira em `docs/token-foundation.md`. |
| 17  | Feito, com uma escolha diferente da proposta: a escada `--slotted-data-1..8` é derivada do seed `accent` (slot 1 no matiz do accent, os outros a −45° cada), mas em dois degraus de luminância alternados (light 0,42/0,6, dark 0,82/0,6, HC 0,3/0,5), não num só: numa luminância única, deuteranopia e protanopia juntam vizinhos (ΔE 0,3 medido). Croma pedido 0,14–0,15, limitado ao sRGB por matiz (`fitGamut`, série de Fourier; `c: { max, gamut }` em `SeedDerivation`; CSS sem funções trigonométricas). Para todo matiz de accent (passo de 15°): vizinhos ≥ ΔE 8 sob as duas deficiências, dentro de sRGB, ≥ 3:1 (4,5:1 HC) em todas as superfícies para toda a grelha de seeds. CSS conferido no Chromium contra `evaluateRecipe` (96 valores, ≤ 0,002 OKLab). Default perde os literais Tailwind; docs atualizadas. |
| 12  | Feito: seed `info` (default `oklch(0.6 0.15 255)`) e os nove papéis `--slotted-tone-info-*` em todos os esquemas, com as regras do accent no seed `info` e sem desvio de matiz; `checkScheme` e `themeConformance` incluem o tom (texto sobre superfície, borda a 3:1). Eixo `tone` com `info` nas 20 famílias que têm `danger` como tom de estado (alert, avatar, badge, button, chart, dialog, icon, inline-message, list-item, message, notification-center, progress-indicator, rating, sparkline, split-button, stat-card, tag, timeline, toast, typography) e button-group: CSS, contratos (`TONES` partilhado), tipos React e Angular, glifo `circle-info`, sem prefixo falado, docs, stories e harness. A paleta `tone="auto"` do avatar não inclui `info`. `standard.ts` volta a ser gerado por `scripts/calibrate-standard-recipe.mjs`, que passou a conter também o tom neutral e os estados do inverso (antes editados à mão) e os itens 15–17. |
| 24  | Feito: `--slotted-data-{1..8}-on` por esquema (grupo `data-on`): a tinta neutra clara ou escura que fica mais longe do degrau do slot no pior matiz; `checkScheme` exige ≥ 3:1 para todo seed da grelha. Tabelas e texto em `docs/token-foundation.md`. |
| 13  | Feito: `--slotted-control-focus-ring-offset` (default `var(--slotted-focus-ring-offset)`) lido pelo contorno de foco da raiz de text-field, select, textarea, number-field, combobox, multi-select, cascader, currency-field, date-field, datetime-field, time-field, otp-input, prompt-composer, tags-input e entity-picker, inválido incluído; o anel interno do `plain` e os controles internos mantêm o token partilhado. `focus-ring.browser.test.tsx`: −1px no campo e 2px no botão; falha antes. |
| 19  | Corrigido em text-field, combobox, entity-picker, multi-select, tags-input e otp-input: a moldura pinta a tinta do autofill (`:has(input:autofill)`), sob a borda e dentro do canto; o input repinta o fundo do browser na mesma cor e, onde sobrepõe a borda, para nela (`clip-path: inset(border 0)`); as regras de hover dos variants `subtle`/`plain` não substituem a tinta. No otp-input o input fica sobre as caixas: o fundo do browser é retido por uma transição que nunca começa (exceção nomeada em `motion.test.mjs`) e as caixas levam a tinta (antes a sombra cobria as caixas e os dígitos). `autofill.test.mjs` (6 casos) falha antes. Sem teste de browser: `:autofill` não é provocável no Chromium de teste. |
| 30  | Corrigido: um avatar carregado não pinta o tom (`--_ground: transparent` em `data-status="loaded"`); prop `surface: 'tone' \| 'none' \| 'plate'` (React e Angular, contrato), `plate` com `--slotted-avatar-plate-surface` (branco) e `--slotted-avatar-plate-color`; `Entity.avatar.surface` no entity-picker. `avatar.browser.test.tsx`: fundo transparente depois de carregar e placa branca no esquema dark; falham antes. |
| 3   | Feito: o offset de um glifo é a correção óptica que põe a forma principal no centro; uma entrada do manifesto nomeia o seu `body` (índices dos elementos) e o gerador centra esse corpo, contido na caixa de 24 (`opticalOffset` em `glyph-ink.mjs`). Auditoria: `calendar` [0, −1] (anéis), `trash` [0, −1] (asa), `pin` [0, 1] (agulha, limitado pela caixa); `bell` e `lock` ficam pela tinta inteira (o badalo e a argola são metade da silhueta); os `file-*` não têm protrusão. `glyph-optical.browser.test.tsx`: centro da página do calendário a ≤ 0,25px do centro da caixa de caps do rótulo (0,67px antes). |
| 29  | Corrigido: `@slotted/core/presence` ganha `onEnterComplete` (o fim da entrada, medido como o da saída: evento ou duração declarada; também para uma entrada saltada, ao receber o nó). React Dialog/AlertDialog e Drawer montados com `open` começam em `entering` (`skipInitialAnimation: false`) e entram do estilo fechado; `onOpenChangeComplete(open)` (React) e `(openChangeComplete)` (Angular, que já entrava animado por começar em `present: false`) dizem quando a entrada e a saída terminaram. Testes: core (2), React browser (primeiro quadro sem `data-open`, `[true]` e depois `[true, false]`; falham antes), Angular spec. Docs e contratos. |
| 23  | Feito: `InlineMessageActions` (React) e `[slInlineMessageActions]` (Angular): `div data-part="actions"` depois da frase, em quebra sob ela; com ações a raiz é `div role="group"` nomeada pela frase, o papel vivo passa para a frase e os botões levam o tamanho da mensagem pelos defaults do button. CSS, harness, contrato, docs. Testes React e Angular. |
| 11  | Feito: `ChartSeries.slotField` e `toneField` para a pizza; o modelo atribui a cor de cada fatia a partir do registo (slot 1–8 ou tom), e legenda, tooltip, tabela e motor leem essa cor; o que não nomeia nada leva o próximo slot livre. Teste do modelo (slots 5, 2, 7, livre 1 e um tom). Corrigidas as fixtures de tema do chart-echarts que o tom `info` (fatia 6) deixara sem `info` no typecheck do core. |
| 31  | Feito: partes de opção exportadas — React `EntityPickerOptionLabel`/`Description`/`Meta`/`Media`, Angular `slEntityPickerOptionLabel`/`Description`/`Meta`/`Media` — que escrevem `data-part` e a chave de seletor; os exemplos de composição e a linha `renderOption`/`slEntityPickerOption` usam-nas e dizem como uma opção traz a sua face com `media="none"`. `entity-picker.browser.test.tsx`: o nome fica na coluna 2 (com `<span data-part="label">` à mão fica `auto`). |
| 26  | Feito nas duas bindings: acima de 100 opções numa lista sem cabeçalhos de secção só se desenham as visíveis e 6 de cada lado, entre dois espaçadores dimensionados pelas linhas medidas (`estimatedRowHeight`, 48, até medir); opções com `aria-posinset`/`aria-setsize`; um destaque fora da janela rola a lista até ele. `virtualize` força ou desliga. Lista com cabeçalhos desenha-se inteira (decisão: a janela por grupo partiria `role="group"`/`aria-labelledby`). Teste de browser React: 500 registos, uma letra, < 60 opções, ArrowDown chega ao último (500 opções antes); spec Angular. |
| 18  | Feito: o `form` afasta dois `field`/`field-group` consecutivos, filhos diretos, por `--slotted-form-field-gap` (space-6); um layout da página mantém o seu. Nota do exemplo mínimo nas duas bindings, regra FM-17 em `guidelines/forms.md`, contrato. `form.browser.test.tsx`: distância > 0 entre dois campos (0 antes). |
| 22  | Feito: `emphasis: 'none' \| 'ring'` em PromptComposer e nos defaults (React e Angular). Com `ring` a raiz escreve `data-emphasis="ring"` e a binding desenha duas marcas `aria-hidden`: `ring` (banda de `--slotted-prompt-composer-ring-width` recortada de um gradiente cónico de `--slotted-prompt-composer-ring-colors`, slots 1, 3, 5, 2) e `glow` (o mesmo gradiente desfocado e recortado ao exterior, opacidade `-ring-glow-opacity`/`-focus`/`-busy`); cada uma gira um quadrado por `transform` em `--slotted-prompt-composer-ring-duration` (loop-slow), velocidade constante. Substitui borda, contorno de foco e sombra; os botões mantêm o seu anel. Movimento reduzido pára; cores forçadas removem as marcas e repõem borda e contorno. Browser React: animação a correr sobre `transform`, ação focada com contorno sólido; specs; contrato, docs, harness. |
| 4   | Feito: AF-07 reescrito (a espera é da página: parte `progress` do `page-header` sobre a linha de fecho; o botão não desenha indicador e uma segunda pressão não inicia nada); AF-03 exclui um controle que recarrega a página inteira; `page-header` nas famílias do guideline; linha AF-07 no varrimento do `review-screen`. `pnpm eval:agent-docs` fica para o release. |
| 5   | Feito: a tabela de `waiting-states` ganha a segunda linha "dados já no ecrã relidos para a página inteira → parte `progress` do `page-header`; a região mantém os itens e nenhum controle desenha indicador". |
